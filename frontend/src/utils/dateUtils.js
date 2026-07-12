export function formatDate(dateStr) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export function formatDateTime(dateStr) {
  const d = new Date(dateStr);
  return `${formatDate(dateStr)} ${d.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

export function isOverdue(expectedReturnDate) {
  if (!expectedReturnDate) return false;
  return new Date(expectedReturnDate) < new Date();
}

// Two bookings overlap only if one starts before the other ends AND
// ends after the other starts. A booking that starts exactly when another
// ends is NOT an overlap (matches the 9-10 / 10-11 example in the brief).
export function slotsOverlap(startA, endA, startB, endB) {
  const sA = new Date(startA).getTime();
  const eA = new Date(endA).getTime();
  const sB = new Date(startB).getTime();
  const eB = new Date(endB).getTime();
  return sA < eB && eA > sB;
}

export function findOverlap(newStart, newEnd, existingBookings) {
  return existingBookings.find((b) => slotsOverlap(newStart, newEnd, b.start, b.end));
}