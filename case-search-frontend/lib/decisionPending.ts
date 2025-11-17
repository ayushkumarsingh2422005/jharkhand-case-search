export type DecisionPendingStatus = "Decision pending" | "Partial" | "Completed";

type AccusedLike = {
  status?: string | null;
};

function normalizeStatus(status?: string | null) {
  return (status || "").toString().trim().toLowerCase();
}

export function deriveDecisionPendingStatus(
  accused: AccusedLike[] = [],
  legacyDecisionPending?: boolean
): DecisionPendingStatus {
  if (!accused || accused.length === 0) {
    return legacyDecisionPending ? "Decision pending" : "Completed";
  }

  const normalized = accused.map((acc) => normalizeStatus(acc.status));
  const hasPending = normalized.some((status) => status === "decision pending");

  if (!hasPending) {
    return "Completed";
  }

  const allPending = normalized.every((status) => status === "decision pending");
  return allPending ? "Decision pending" : "Partial";
}

