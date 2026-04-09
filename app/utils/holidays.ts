export const getIndianHoliday = (date: Date) => {
  const m = date.getMonth();
  const d = date.getDate();
  if (m === 0 && d === 26) return "Republic Day (India)";
  if (m === 7 && d === 15) return "Independence Day (India)";
  if (m === 9 && d === 2) return "Gandhi Jayanti (India)";
  return null;
};
