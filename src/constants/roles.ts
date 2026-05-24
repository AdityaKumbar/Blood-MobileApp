import type { UserRole } from "../types/auth";

export const roles: { label: string; value: UserRole }[] = [
  { label: "Donor / User", value: "DONOR" },
  { label: "Hospital", value: "HOSPITAL" },
  { label: "Blood Bank", value: "BLOOD_BANK" },
  { label: "Oxygen Supplier", value: "OXYGEN_SUPPLIER" }
];
