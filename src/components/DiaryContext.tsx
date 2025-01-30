import { api, getCookie, last7Days } from '@/helpers';
import { createContext, useEffect, useState, useTransition } from 'react';

type Context = {
    token?: string
    uid?: string
    week: string[]
    data: (Nutrition | null)[]
    isLoading: boolean
}

export const DiaryContext = createContext<Context>({} as Context);

type Props = {
    children: React.ReactNode
}

export function DiaryContextProvider({ children }: Props) {
    const token = getCookie("tz_uatoken");
    const uid = getCookie("tz_uid");
    const week = last7Days(1);

    const [isLoading, startTransition] = useTransition();

    const [data, setData] = useState<(Nutrition | null)[]>([]);
    console.log(isLoading);

    useEffect(() => {
        startTransition(async () => {
            const requests = week.map(date => api<Nutrition>('v03/dailyNutrition/get', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Datetoday: '2025-01-21 09:26:33',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    date,
                    userid: uid
                })
            })
                .catch((e: ErrorWithStatus) => {
                    switch (e.status) {
                        // Check if the response is not OK (status code not in the range 200-299)
                        case 401: {
                            throw new Error('Please sign in again.');
                        }
                        default: {
                            throw new Error('Something went wrong. Please try again.');
                        }
                    }
                })
            );

            const logs = await Promise.allSettled<Nutrition>(requests);

            const data = logs.map(result => {
                if (result.status === 'fulfilled') {
                    return result.value;
                } else {
                    return null;
                }
            });

            setData(data);
        });

    }, []);


    return (
        <DiaryContext.Provider value={{
            isLoading,
            data,
            token,
            uid,
            week,
        }}>
            {children}
        </DiaryContext.Provider>
    );
}