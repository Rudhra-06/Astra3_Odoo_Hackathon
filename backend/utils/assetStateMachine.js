const VALID_TRANSITIONS = {
  AVAILABLE: ['ALLOCATED', 'RESERVED', 'UNDER_MAINTENANCE', 'LOST', 'RETIRED'],
  ALLOCATED: ['AVAILABLE', 'UNDER_MAINTENANCE', 'LOST'],
  RESERVED: ['AVAILABLE', 'ALLOCATED'],
  UNDER_MAINTENANCE: ['AVAILABLE', 'RETIRED', 'DISPOSED'],
  LOST: ['AVAILABLE', 'DISPOSED'],
  RETIRED: ['DISPOSED'],
  DISPOSED: [],
};

function canTransition(currentStatus, newStatus) {
  if (!VALID_TRANSITIONS[currentStatus]) return false;
  return VALID_TRANSITIONS[currentStatus].includes(newStatus);
}

module.exports = { canTransition, VALID_TRANSITIONS };