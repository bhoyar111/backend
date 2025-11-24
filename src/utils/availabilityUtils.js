import moment from "moment";

export const generateMonthlyAvailabilityFromWeekdays = (week_days, monthDate = new Date()) => {
  const startOfMonth = moment(monthDate).startOf("month");
  const endOfMonth = moment(monthDate).endOf("month");

  const days = [];
  for (let d = startOfMonth; d.isBefore(endOfMonth) || d.isSame(endOfMonth, "day"); d.add(1, "day")) {
    const weekday = d.format("ddd").toLowerCase().slice(0, 3); // mon, tue, etc.
    const matchingDay = week_days.find((wd) => wd.day === weekday && wd.is_available);

    if (matchingDay) {
      days.push({
        date: d.toDate(),
        is_available: true,
        slots: [
          {
            start_time: matchingDay.start_time,
            end_time: matchingDay.end_time,
          },
        ],
      });
    }
  }

  return days;
};
