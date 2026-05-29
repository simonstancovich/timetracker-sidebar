import { useState } from "react";
import { isOnCurrent } from "./date";

export type HistoryScale = "day" | "week" | "month";

export function useHistoryScale() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [historyScale, setHistoryScale] = useState<HistoryScale>("week");

  const stepHistoryDate = (dir: 1 | -1) => {
    if (historyScale === "day") {
      setSelectedDate((d) => {
        const n = new Date(d);
        n.setDate(n.getDate() + dir);
        return n;
      });
    } else if (historyScale === "week") {
      setSelectedDate((d) => {
        const n = new Date(d);
        n.setDate(n.getDate() + 7 * dir);
        return n;
      });
    } else {
      setSelectedDate((d) => new Date(d.getFullYear(), d.getMonth() + dir, 1));
    }
  };

  const historyIsOnCurrent = isOnCurrent(historyScale, selectedDate);
  const jumpHistoryToCurrent = () => setSelectedDate(new Date());

  return {
    selectedDate, setSelectedDate,
    historyScale, setHistoryScale,
    stepHistoryDate,
    historyIsOnCurrent,
    jumpHistoryToCurrent,
  };
}
