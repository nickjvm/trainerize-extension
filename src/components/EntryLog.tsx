import { formatDate } from "@/helpers";
import Meal from "./Meal";
import { useContext } from "react";
import { DiaryContext } from "./DiaryContext";
import cn from 'classnames';

type Props = {
    date: string
    data: Nutrition | null
}
export default function EntryLog({ date, data }: Props) {
    const { settings } = useContext(DiaryContext);

    if (!data) {
        return <>
            <div className="pagebreak" /><h2>No data for {date}</h2>
        </>;
    }

    const dailyFiberGoal = settings?.stats.mediaSexPreference === 'male' ? 38 : 25;
    const dailyFiber = data.nutrition.nutrients.find(n => n.nutrNo === 291)?.nutrVal || 0;

    return (
        <>
            <div className="pagebreak"></div>
            <section className="daily-entry">
                <header>
                    <h2>{formatDate(date, {
                        weekday: "short",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                    })}</h2>
                </header>
                <div className="bar-container">
                    <div className="bar">
                        <div className="protein" style={{ width: `${data.nutrition.proteinPercent * 100}%` }} />
                        <div className="carbs" style={{ width: `${data.nutrition.carbsPercent * 100}%` }} />
                        <div className="fat" style={{ width: `${data.nutrition.fatPercent * 100}%` }} />
                    </div>
                    <div className="legend">
                        <div className="label">
                            <div className="icon protein"></div>Protein {Math.round(data.nutrition.proteinGrams)}g ({Math.round(data.nutrition.proteinPercent * 100)}%)
                        </div>
                        <div className="label">
                            <div className="icon carbs"></div>Carbs {Math.round(data.nutrition.carbsGrams)}g ({Math.round(data.nutrition.carbsPercent * 100)}%)
                        </div>
                        <div className="label">
                            <div className="icon fat"></div>Fat {Math.round(data.nutrition.fatGrams)}g ({Math.round(data.nutrition.fatPercent * 100)}%)
                        </div>
                    </div>
                </div>
                <div className={cn(
                    'bar-container',
                    data.nutrition.calories > data.nutrition.goal.caloricGoal && 'bar-exceeded'
                )} >
                    <div className="bar">
                        <div className="calories" style={{ width: `${(data.nutrition.calories / data.nutrition.goal.caloricGoal) * 100}%` }} />
                    </div>
                    <div className="legend">
                        <div className="label">
                            <span className="icon calories"></span>Calories {Math.round(data.nutrition.calories)}
                        </div>
                        <div className="label">{Math.max(0, Math.round(data.nutrition.goal.caloricGoal - data.nutrition.calories))} remaining</div>
                    </div>
                </div>
                <div className={cn(
                    'bar-container', dailyFiber > dailyFiberGoal && 'bar-exceeded'
                )}>
                    <div className="bar" >
                        <div className="fiber" style={{ width: `${(dailyFiber / dailyFiberGoal) * 100}%` }} />
                    </div>
                    <div className="legend">
                        <div className="label">
                            <span className="icon fiber"></span>Fiber {`${Math.round(dailyFiber)}g / ${dailyFiberGoal}g`}
                        </div>
                        <div className="label">{Math.max(0, Math.round(dailyFiberGoal - dailyFiber))}g remaining</div>
                    </div>
                </div >
                {data.nutrition.meals.map(meal => <Meal mealPhotoId={data.nutrition.mealPhoto?.id} meal={meal} key={meal.mealGuid} />)}
            </section >
        </>
    );
}