import type { DonationType } from "../types/donor";

export function formatDonationType(donationType?: DonationType, units?: number): string {
  if (donationType === "PLASMA") return "Plasma Donation";
  if (donationType === "PLATELETS") return "Platelets Donation";
  if (units && units > 1) return `${units} Unit(s) - Whole Blood`;
  return "Whole Blood Donation";
}
