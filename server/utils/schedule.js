const DAY_ALIASES = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

export function timeToMinutes(hhmm) {
  const [h, m] = String(hhmm).split(":").map((x) => Number(x));
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
}

export function parseSlot(slot) {
  const raw = String(slot || "").trim();
  const [dayPart, timePart] = raw.split(/\s+/, 2);
  if (!dayPart || !timePart) return null;

  const day = dayPart.slice(0, 3).toLowerCase();
  const [startStr, endStr] = timePart.split("-");
  const start = timeToMinutes(startStr);
  const end = timeToMinutes(endStr);

  if (!DAY_ALIASES.includes(day) || start === null || end === null || end <= start) return null;

  return { day, start, end, label: raw };
}

export function isWithinDoctorSlots(dateObj, availableSlots = []) {
  const day = DAY_ALIASES[dateObj.getDay()];
  const mins = dateObj.getHours() * 60 + dateObj.getMinutes();

  const parsed = availableSlots.map(parseSlot).filter(Boolean);
  const todays = parsed.filter((s) => s.day === day);
  const ok = todays.some((s) => mins >= s.start && mins < s.end);

  return { ok, parsedSlots: parsed };
}

export function findNextAvailableSlot(dateObj, availableSlots = [], lookAheadDays = 45) {
  const parsed = availableSlots.map(parseSlot).filter(Boolean);
  if (parsed.length === 0) return null;

  for (let offset = 0; offset <= lookAheadDays; offset += 1) {
    const candidate = new Date(dateObj);
    candidate.setDate(candidate.getDate() + offset);

    const day = DAY_ALIASES[candidate.getDay()];
    const mins = candidate.getHours() * 60 + candidate.getMinutes();
    const slotsForDay = parsed
      .filter((s) => s.day === day)
      .sort((a, b) => a.start - b.start);

    if (slotsForDay.length === 0) continue;

    const slot =
      offset === 0
        ? slotsForDay.find((s) => mins >= s.start && mins < s.end) || slotsForDay.find((s) => s.start >= mins)
        : slotsForDay[0];

    if (!slot) continue;

    const next = new Date(candidate);
    const hours = Math.floor(slot.start / 60);
    const minutes = slot.start % 60;
    next.setHours(hours, minutes, 0, 0);

    return { date: next, slot };
  }

  return null;
}
