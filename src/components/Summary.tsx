import { api, formatDate, getCookie } from "@/helpers";
import { useContext, useEffect, useState } from "react";
import { DiaryContext } from "./DiaryContext";

type Settings = {
    stats: {
        firstName: string
        lastName: string
    }
}



type MacroLabel = 'protein' | 'carbs' | 'fat'

type Macro = {
    grams: number
    percent: number
    goal: number
}

const baseMacros = {
    calories: 0,
    caloricGoal: 0,
    protein: {
        goal: 0,
        percent: 0,
        grams: 0,
    },
    carbs: {
        goal: 0,
        percent: 0,
        grams: 0,
    },
    fat: {
        goal: 0,
        percent: 0,
        grams: 0,
    },
    fiber: 0
};

export default function Summary() {
    const [fullName, setFullName] = useState('');


    const { week, data } = useContext(DiaryContext);

    const macros = data.reduce((acc, data) => {
        if (data?.nutrition) {
            acc.calories += data.nutrition.calories;
            acc.caloricGoal += data.nutrition.goal.caloricGoal;
            acc.protein.grams += data.nutrition.proteinGrams;
            acc.protein.percent += data.nutrition.proteinPercent;
            acc.protein.goal += data.nutrition.goal.proteinGrams;
            acc.carbs.grams += data.nutrition.carbsGrams;
            acc.carbs.percent += data.nutrition.carbsPercent;
            acc.carbs.goal += data.nutrition.goal.carbsGrams;
            acc.fat.grams += data.nutrition.fatGrams;
            acc.fat.percent += data.nutrition.fatPercent;
            acc.fat.goal += data.nutrition.goal.fatGrams;
            acc.fiber += data.nutrition.nutrients.find(n => n.nutrNo === 291)?.nutrVal || 0;
        }
        return acc;
    }, { ...baseMacros });


    useEffect(() => {
        const token = getCookie("tz_uatoken");
        const uid = getCookie("tz_uid");

        if (token && uid) {
            getSettings(token, uid);
        }
    }, []);

    function getSettings(token: string, uid: string) {
        return api<Settings>('v03/user/getSettings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ userid: uid })
        }).then(({ stats }) => {
            setFullName(`${stats.firstName} ${stats.lastName}`);
        }).catch(() => {
            console.log('error getting settings');
        });
    }

    function macroGoal(macro: Macro) {
        return {
            label: `${Math.round((macro.grams / macro.goal) * 100)}%`,
            average: `${Math.round(macro.grams / week.length)}g`,
            percentage: (macro.grams / macro.goal) * 100,
        };
    }

    return (
        <>
            <div className="section">
                <h1>{fullName ? `${fullName}'s ` : ''}Meal Report ({formatDate(week[0])} - {formatDate(week[week.length - 1])})</h1>
                <h2>Macro distribution</h2>
                <div className="bar-container">
                    <div className="bar">
                        <div className="protein" style={{ width: `${(macros.protein.percent * 100) / week.length}%` }} />
                        <div className="carbs" style={{ width: `${(macros.carbs.percent * 100) / week.length}%` }} />
                        <div className="fat" style={{ width: `${(macros.fat.percent * 100) / week.length}%` }} />
                    </div>
                    <div className="legend">
                        <div className="label">
                            <div className="icon protein"></div>Protein ({Math.round((macros.protein.percent * 100) / week.length)}%)
                        </div>
                        <div className="label">
                            <div className="icon carbs"></div>Carbs ({Math.round((macros.carbs.percent * 100) / week.length)}%)
                        </div>
                        <div className="label">
                            <div className="icon fat"></div>Fat ({Math.round((macros.fat.percent * 100) / week.length)}%)
                        </div>
                    </div>
                </div>
            </div>
            <div className="section">
                <h2>Goals</h2>
                <div className="bar-container">
                    <div className="bar">
                        <div className="calories" style={{ width: `${(macros.calories / macros.caloricGoal) * 100}%` }}></div>
                    </div>
                    <div className="legend">
                        <div className="label">Calories ${Math.round(macros.caloricGoal / week.length)}</div>
                        <div className="label">{Math.round((macros.calories / macros.caloricGoal) * 100)}% (avg {Math.round(macros.calories / week.length)})</div>
                    </div>
                </div>
                {(['protein', 'carbs', 'fat'] as MacroLabel[]).map((macro: MacroLabel) =>
                    <div className="bar-container" key={macro}>
                        <div className="bar">
                            <div className={macro} style={{ width: `${macroGoal(macros[macro]).percentage}%` }} />
                        </div>
                        <div className="legend">
                            <div className="label">{macro} {Math.round(macros[macro].goal / week.length)}g</div>
                            <div className="label">{macroGoal(macros[macro]).label} (avg {macroGoal(macros[macro]).average})</div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
