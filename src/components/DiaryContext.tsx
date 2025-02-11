import { api, getCookie, last7Days } from '@/helpers';
import { createContext, useEffect, useState, useTransition } from 'react';

type Context = {
    token?: string
    uid?: string
    week: string[]
    data: (Nutrition | null)[]
    settings: Settings | null
    isLoading: boolean
}

export const DiaryContext = createContext<Context>({} as Context);

type Props = {
    children: React.ReactNode
}

export function DiaryContextProvider({ children }: Props) {
    const token = getCookie("tz_uatoken") || getCookie('tr_uatoken');
    const uid = getCookie("tz_uid");
    const week = last7Days(1);

    const [isLoading, startTransition] = useTransition();
    const [settings, setSettings] = useState<Settings | null>(null);
    const [data, setData] = useState<(Nutrition | null)[]>([]);

    useEffect(() => {
        startTransition(async () => {
            try {
                const settings = await getSettings();
                const requests = week.map(getDailyNutrition);

                const logs = await Promise.allSettled<Nutrition>(requests);

                if (logs.some(l => l.status === 'rejected' && l.reason.status === 401)) {
                    alert('Please sign in again.');
                    window.location.href = `${window.location.origin}/app/login`;
                    return;
                }

                const data = logs.map(result => {
                    if (result.status === 'fulfilled') {
                        return result.value;
                    } else {
                        return null;
                    }
                });

                setSettings(settings);
                setData(data);
            } catch (e) {
                if ((e as ErrorWithStatus).status === 401) {
                    alert('Please sign in again.');
                    window.location.href = `${window.location.origin}/app/login`;
                } else {
                    alert('Something went wrong. Please try again.');
                    document.querySelector('.tpe-print-button')?.removeAttribute('disabled');
                }
                return;
            }
        });

    }, []);

    function getDailyNutrition(date: string) {
        return api<Nutrition>('v03/dailyNutrition/get', {
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
        });
    }
    function getSettings() {
        return api<Settings>('v03/user/getSettings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ userid: uid })
        });
    }

    return (
        <DiaryContext.Provider value={{
            settings,
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