import { useContext, useEffect } from "react";
import Summary from "./Summary";
import { DiaryContext, DiaryContextProvider } from "./DiaryContext";
import DailyEntries from "./Entries";

export function Report() {
    const { isLoading, data, settings } = useContext(DiaryContext);

    useEffect(() => {
        if (!isLoading && data && settings) {
            setTimeout(() => {
                if (process.env.NODE_ENV === 'production') {
                    window.print();
                }
            }, 500);
        }
    }, [isLoading, data, settings]);


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