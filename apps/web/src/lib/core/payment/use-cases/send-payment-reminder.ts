import type { BetterUser } from "@helsa/auth";
import PaymentReminderEmail from "@helsa/email/templates/payment-reminder";
import { createElement } from "react";
import { usd } from "@/components/dashboard/payments/format";
import {
  type Delivery,
  getLinkSender,
  getMessageSender,
  type MessageChannel,
  MessageNotDelivered,
  whatsappTemplates,
} from "@/lib/infra/messaging";
import { mailer } from "@/services";
import { EnsurePatientAccess } from "../../patient/use-cases/ensure-patient-access";
import { TherapistRepository } from "../../therapist/adapters/therapist-repository";
import { PaymentRepository } from "../adapters/payment-repository";
import { NothingOwed } from "../domain/errors";
import { LoadPatientBalances } from "./load-patient-balances";

type SendPaymentReminderInput = {
  patientId: string;
  channel: MessageChannel;
  /** Written (or edited) by the therapist on the payments page. */
  message: string;
};

/**
 * Reminds a patient of what they owe and logs it. Which provider delivers the
 * message is decided by the messaging adapters, not here.
 */
export class SendPaymentReminder {
  private payments = new PaymentRepository();
  private therapists = new TherapistRepository();
  private access = new EnsurePatientAccess();
  private balances = new LoadPatientBalances();

  async execute(data: SendPaymentReminderInput, user: BetterUser): Promise<Delivery> {
    const patient = await this.access.execute(data.patientId, user);

    const [therapist, balances] = await Promise.all([
      this.therapists.getById(user.id),
      this.balances.execute({ patientId: patient.id }, user),
    ]);
    const balance = balances.patients[0];
    const owed = (balance?.balanceUsd ?? 0) + (balance?.noShowUsd ?? 0);

    if (!balance || owed <= 0) {
      throw new NothingOwed();
    }

    // Helsa's own WhatsApp line needs the patient's opt-in. Without it the
    // therapist still gets the wa.me link to write from their own phone.
    let sender = getMessageSender(data.channel);
    if (sender.automated && data.channel === "whatsapp" && !patient.whatsapp_opt_in) {
      sender = getLinkSender("whatsapp");
    }

    const log = {
      therapist_id: user.id,
      patient_id: patient.id,
      channel: data.channel,
      provider: sender.provider,
      amount_usd: owed.toFixed(2),
      sessions: balance.sessions.length + balance.noShows.length,
    };

    const therapistName = therapist?.display_name ?? user.name;
    const sessions = log.sessions;

    try {
      const delivery = await sender.send({
        channel: data.channel,
        to: {
          name: `${patient.first_name} ${patient.last_name}`.trim(),
          phone: patient.phone_e164,
          email: patient.email,
        },
        subject: `Recordatorio de pago · ${therapistName}`,
        text: data.message,
        // Email from Helsa: the patient's reply (e.g. the receipt) reaches the therapist.
        replyTo: user.email,
        emailTemplate: createElement(PaymentReminderEmail, {
          baseUrl: mailer.baseUrl,
          therapistName,
          message: data.message,
          portalUrl: patient.user_id ? `${mailer.baseUrl}/dashboard/payments` : null,
        }),
        // WhatsApp from Helsa's number only takes an approved template, so the
        // therapist's own wording travels by email and wa.me links only.
        whatsappTemplate: whatsappTemplates.paymentReminder({
          patient_name: patient.preferred_name || patient.first_name,
          therapist_name: therapistName,
          sessions: sessions === 1 ? "1 sesión" : `${sessions} sesiones`,
          amount: usd(owed),
        }),
      });

      await this.payments.createReminder({
        ...log,
        // A handed-off link may or may not get sent; only a provider confirms it.
        status: delivery.status === "sent" ? "sent" : "skipped",
        provider_message_id: delivery.status === "sent" ? delivery.providerMessageId : null,
      });

      return delivery;
    } catch (error) {
      if (error instanceof MessageNotDelivered) {
        await this.payments.createReminder({ ...log, status: "failed", error: error.message });
      }
      throw error;
    }
  }
}
