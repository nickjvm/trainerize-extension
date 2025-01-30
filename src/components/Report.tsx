import { useEffect } from "react";
import Summary from "./Summary";
import { DiaryContextProvider } from "./DiaryContext";
import DailyEntries from "./Entries";

export default function Report() {

    useEffect(() => {
        document.body.classList.add('custom-trainerize-export-active');
        return () => {
            document.body.classList.remove('custom-trainerize-export-active');
        };
    });
    return (
        <DiaryContextProvider>
            <Summary />
            <DailyEntries />
        </DiaryContextProvider>
    );
}