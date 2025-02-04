import { useContext } from "react";
import { DiaryContext } from "./DiaryContext";
import EntryLog from "./EntryLog";

export default function DailyEntries() {
    const { week, data } = useContext(DiaryContext);

    return week.map((date, i) => <EntryLog date={date} data={data[i]} key={date} />);
}