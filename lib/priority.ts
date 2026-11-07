export type Severity = "critical" | "high" | "medium" | "low";

export function calculatePriority(severity: Severity, category: string) {
  const severityScore: Record<Severity, number> = {
    critical: 100, high: 75, medium: 45, low: 20
  };
  const categoryBoost = /breathing|unconscious|cardiac|severe bleeding/i.test(category) ? 15 : 0;
  const score = Math.min(100, severityScore[severity] + categoryBoost);
  return { score, priority: score >= 90 ? "CRITICAL" : score >= 70 ? "HIGH" : score >= 40 ? "MEDIUM" : "LOW" };
}
