import { useContext, useEffect } from "react";
import Summary from "./Summary";
import { DiaryContext, DiaryContextProvider } from "./DiaryContext";
import DailyEntries from "./Entries";

export function Report() {
    const { isLoading } = useContext(DiaryContext);

    useEffect(() => {
        document.body.classList.add('custom-trainerize-export-active');
        return () => {
            document.body.classList.remove('custom-trainerize-export-active');
        };
    });

    if (isLoading) {
        return <h2>Loading...</h2>;
    }

    return (
        <>
            <Summary />
            <DailyEntries />
        </>
    );
}

export default function App() {
    return (
        <DiaryContextProvider>
            <Report />
        </DiaryContextProvider>
    );
};