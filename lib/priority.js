/**
 * Priority Engine
 * Converts raw task/deadline data into a priority score and display label.
 * Score: 0-100. Higher = more urgent.
 */

const PRIORITY_WEIGHTS = {
  P0: 100,
  P1: 70,
  P2: 40,
  P3: 15,
};

/**
 * Calculate days until deadline (negative = overdue)
 */
export function daysUntil(deadline) {
  if (!deadline) return 999;
  const now = new Date();
  const due = new Date(deadline);
  const diff = due - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * Deadline urgency score (0-100)
 */
function deadlineScore(deadline) {
  const days = daysUntil(deadline);
  if (days <= 0) return 100;   // Overdue
  if (days <= 1) return 95;    // Due today
  if (days <= 3) return 80;    // Due within 3 days
  if (days <= 7) return 60;    // Due within a week
  if (days <= 14) return 40;   // Due within 2 weeks
  if (days <= 30) return 20;   // Due within a month
  return 10;                   // Later
}

/**
 * Calculate overall priority score for a task
 */
export function calculatePriorityScore(task) {
  const urgency = deadlineScore(task.deadline) * 0.4;
  const importance = (PRIORITY_WEIGHTS[task.priority] || 15) * 0.3;
  const energy = task.energyLevel === 'HIGH' ? 10 : task.energyLevel === 'MEDIUM' ? 7 : 4;
  const dependencyBonus = task.dependencies?.length > 0 ? 10 : 0;

  return Math.min(100, urgency + importance + energy + dependencyBonus);
}

/**
 * Get display label from score
 */
export function getPriorityLabel(score) {
  if (score >= 80) return { label: 'DO NOW', emoji: '🔥', code: 'DO_NOW' };
  if (score >= 60) return { label: 'DO SOON', emoji: '⚡', code: 'DO_SOON' };
  if (score >= 40) return { label: 'PLAN', emoji: '📌', code: 'PLAN' };
  return { label: 'BACKLOG', emoji: '🗂️', code: 'BACKLOG' };
}

/**
 * Get deadline color category
 */
export function getDeadlineCategory(deadline) {
  const days = daysUntil(deadline);
  if (days <= 0) return { label: 'OVERDUE', color: 'var(--red)', emoji: '🔴' };
  if (days <= 1) return { label: 'TODAY', color: 'var(--red)', emoji: '🔴' };
  if (days <= 3) return { label: 'VERY SOON', color: 'var(--orange)', emoji: '🟠' };
  if (days <= 7) return { label: 'THIS WEEK', color: 'var(--yellow)', emoji: '🟡' };
  return { label: 'LATER', color: 'var(--blue)', emoji: '🔵' };
}

/**
 * Sort tasks by priority score descending
 */
export function sortByPriority(tasks) {
  return [...tasks].sort((a, b) => {
    const scoreA = calculatePriorityScore(a);
    const scoreB = calculatePriorityScore(b);
    return scoreB - scoreA;
  });
}

/**
 * Get top N most important tasks (MITs)
 */
export function getMITs(tasks, n = 3) {
  const active = tasks.filter(t => t.status !== 'DONE' && t.status !== 'CANCELLED');
  return sortByPriority(active).slice(0, n);
}

/**
 * Priority badge color
 */
export function getPriorityColor(priority) {
  switch (priority) {
    case 'P0': return 'var(--red)';
    case 'P1': return 'var(--orange)';
    case 'P2': return 'var(--blue)';
    case 'P3': return 'var(--text-muted)';
    default: return 'var(--text-muted)';
  }
}
