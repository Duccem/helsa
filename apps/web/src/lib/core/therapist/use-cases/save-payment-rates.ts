import type { BetterUser } from "@helsa/auth";
import { TherapistRepository } from "../adapters/therapist-repository";
import { TherapistNotFound } from "../domain/errors";
import type { Therapist } from "../domain/types";
import { EnsureTherapist } from "./ensure-therapist";

type PaymentMethods = "pago_movil" | "zelle" | "binance_usdt" | "transferencia_bs" | "efectivo_usd" | "efectivo_bs" | "tarjeta" | "otro"

type SavePaymentRatesInput = {
  paymentInstructions: string | null;
  paymentMethods: PaymentMethods[]
  rates: {
    id?: string;
    name: string;
    durationMinutes: number;
    priceUsd: number;
    modality: "in_person" | "video" | "phone" | null;
    isActive: boolean;
  }[]
}

export class SavePaymentRates {

  private repository = new TherapistRepository();
  private ensurer = new EnsureTherapist();

  async execute(data: SavePaymentRatesInput, user: BetterUser) {
    await this.ensurer.execute(user);
    const therapist = await this.repository.getById(user.id);

    if (!therapist) {
      throw new TherapistNotFound();
    }

    const updatedTherapist = this.updateTherapist(data, therapist);

    await this.repository.update(updatedTherapist);

    const rates = data.rates.map((rate, position) => ({
      therapist_id: user.id,
      id: rate.id ?? "",
      name: rate.name,
      duration_minutes: rate.durationMinutes,
      price_usd: rate.priceUsd.toFixed(2),
      modality: rate.modality,
      is_active: rate.isActive,
      position,
      created_at: new Date(),
      updated_at: new Date(),
    }))

    await this.repository.saveRates(rates, user.id);
  }

  private updateTherapist(data: SavePaymentRatesInput, therapist: Therapist) {
    const main = data.rates.find((rate) => rate.isActive) ?? data.rates[0];
    return {
      ...therapist,
      default_price_usd: main ? main.priceUsd.toFixed(2) : null,
      payment_methods: data.paymentMethods,
      payment_instructions: data.paymentInstructions,
    }
  }
}