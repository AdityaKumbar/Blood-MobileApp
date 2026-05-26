import type { DonorEligibility } from "../types/donor";

export const RECOVERY_DAYS = 90;

export type EligibilityDisplay = {
  message: string;
  progressPercent: number;
  lastLabel: string;
  targetLabel: string;
  showProgress: boolean;
};

const formatShortDate = (date: Date) =>
  date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

const addRecoveryDays = (from: Date) => {
  const next = new Date(from);
  next.setDate(next.getDate() + RECOVERY_DAYS);
  return next;
};

export function resolveLastDonatedAt(
  profileLastDonatedAt: string | null | undefined,
  historyNewestDonatedAt: string | undefined
): string | null {
  if (!profileLastDonatedAt && !historyNewestDonatedAt) {
    return null;
  }
  if (!profileLastDonatedAt) {
    return historyNewestDonatedAt ?? null;
  }
  if (!historyNewestDonatedAt) {
    return profileLastDonatedAt;
  }
  return new Date(historyNewestDonatedAt) > new Date(profileLastDonatedAt)
    ? historyNewestDonatedAt
    : profileLastDonatedAt;
}

export function getEligibilityDisplay(
  eligibility: DonorEligibility | null,
  lastDonatedAt: string | null
): EligibilityDisplay {
  if (!lastDonatedAt) {
    return {
      message: "You have not donated yet. You are eligible to donate whenever you are ready.",
      progressPercent: 0,
      lastLabel: "No donations yet",
      targetLabel: "",
      showProgress: false,
    };
  }

  const last = new Date(lastDonatedAt);
  const nextEligible = eligibility?.nextEligibleDate
    ? new Date(eligibility.nextEligibleDate)
    : addRecoveryDays(last);
  const now = new Date();
  const isEligible = eligibility?.isEligible ?? now >= nextEligible;

  if (isEligible) {
    return {
      message: "You are eligible to donate now.",
      progressPercent: 100,
      lastLabel: `Last: ${formatShortDate(last)}`,
      targetLabel: "Eligible now",
      showProgress: true,
    };
  }

  const daysRemaining = Math.max(1, Math.ceil((nextEligible.getTime() - now.getTime()) / 86400000));
  const totalMs = nextEligible.getTime() - last.getTime();
  const elapsedMs = now.getTime() - last.getTime();
  const progressPercent = Math.min(100, Math.max(0, Math.round((elapsedMs / totalMs) * 100)));

  return {
    message: `You can donate again in ${daysRemaining} day${daysRemaining === 1 ? "" : "s"}.`,
    progressPercent,
    lastLabel: `Last: ${formatShortDate(last)}`,
    targetLabel: `Target: ${formatShortDate(nextEligible)}`,
    showProgress: true,
  };
}
