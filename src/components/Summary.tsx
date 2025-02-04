import { formatDate } from "@/helpers";
import { useContext } from "react";
import { DiaryContext } from "./DiaryContext";
import cn from 'classnames';

type MacroLabel = 'protein' | 'carbs' | 'fat'
type MicroLabel = 'fiber'

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
    fiber: {
        goal: 0,
        percent: 0,
        grams: 0,
    }
};

export default function Summary() {
    const { week, data, settings } = useContext(DiaryContext);

    const fullName = settings ? `${settings.stats.firstName} ${settings.stats.lastName}` : '';
    const dailyFiberGoal = settings?.stats.mediaSexPreference === 'male' ? 38 : 25;

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

            acc.fiber.grams += data.nutrition.nutrients.find(n => n.nutrNo === 291)?.nutrVal || 0;
            acc.fiber.goal += dailyFiberGoal;
            acc.fiber.percent += acc.fiber.grams / dailyFiberGoal;

        }
        return acc;
    }, { ...baseMacros });

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
                        <div className="label">Calories {Math.round(macros.caloricGoal / week.length)} / {Math.round(macros.calories / week.length)}</div>
                        <div className="label">{Math.round((macros.calories / macros.caloricGoal) * 100)}%</div>
                    </div>
                </div>
                {(['protein', 'carbs', 'fiber', 'fat'] as (MacroLabel | MicroLabel)[]).map((macro: MacroLabel | MicroLabel) =>
                    <div className={cn(
                        'bar-container',
                        macro === 'fiber' && 'bar-micro',
                        macroGoal(macros[macro]).percentage > 100 && 'bar-exceeded'
                    )} key={macro}>
                        <div className="bar">
                            <div className={macro} style={{ width: `${macroGoal(macros[macro]).percentage}%` }} />
                        </div>
                        <div className="legend">
                            <div className="label">{macro} {macroGoal(macros[macro]).average} / {Math.round(macros[macro].goal / week.length)}g</div>
                            <div className="label">{macroGoal(macros[macro]).label}</div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
