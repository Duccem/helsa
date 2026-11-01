import type { Therapist, TherapistRate } from "../../therapist/domain/types";
import type { Modality } from "./availability";

/** Id of the rate used when the therapist has not set up a price list. */
export const DEFAULT_RATE_ID = "default";

/** How many days ahead the page offers. */
export const HORIZON_DAYS = 28;

export type BookingRate = {
  id: string;
  name: string;
  minutes: number;
  priceUsd: number | null;
  modality: Modality | null;
};

/** Active rates in the therapist's order, or one default session. */
export function bookingRates(therapist: Therapist, rates: TherapistRate[]): BookingRate[] {
  const active = rates.filter((rate) => rate.is_active);
  if (active.length > 0) {
    return active.map((rate) => ({
      id: rate.id,
      name: rate.name,
      minutes: rate.duration_minutes,
      priceUsd: Number(rate.price_usd),
      modality: rate.modality,
    }));
  }
  return [
    {
      id: DEFAULT_RATE_ID,
      name: "Sesión individual",
      minutes: therapist.default_session_minutes,
      priceUsd: therapist.default_price_usd === null ? null : Number(therapist.default_price_usd),
      modality: null,
    },
  ];
}

/** Modalities a rate can be booked in: what the therapist offers, narrowed by the rate. */
export function rateModalities(therapist: Therapist, rate: BookingRate): Modality[] {
  const offered = (therapist.modalities.length ? therapist.modalities : ["video"]) as Modality[];
  return rate.modality ? offered.filter((modality) => modality === rate.modality) : offered;
}

/** Slots depend only on the length of the session and the modality. */
export function slotKey(minutes: number, modality: Modality) {
  return `${minutes}:${modality}`;
}
