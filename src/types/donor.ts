export interface DonationHistoryItem {
  id: string;
  donatedAt: string;
  location: string;
  units: number;
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
  eligibility: DonorEligibility;
  history: DonationHistoryItem[];
}

export interface RegisterDonorPayload {
  bloodGroup: string;
  city: string;
}
