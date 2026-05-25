export type DonationType = "WHOLE_BLOOD" | "PLASMA" | "PLATELETS";

export interface DonationHistoryItem {
  id: string;
  donatedAt: string;
  location: string;
  units: number;
  donationType?: DonationType;
}

export interface DonorEligibility {
  isEligible: boolean;
  nextEligibleDate: string | null;
  reason?: string;
}

export interface DonorProfile {
  id: string;
  isRegistered: boolean;
  isAvailable: boolean;
  lastDonatedAt?: string | null;
  eligibility: DonorEligibility;
  history: DonationHistoryItem[];
}

export interface RegisterDonorPayload {
  bloodGroup: string;
  city: string;
}
