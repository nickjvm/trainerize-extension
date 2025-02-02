import { api } from "@/helpers";
import { useContext, useEffect, useState } from "react";
import { DiaryContext } from "./DiaryContext";

type Props = {
    meal: Meal
    mealPhotoId?: number
}

export default function Meal({ meal, mealPhotoId }: Props) {
    const [photo, setPhoto] = useState<string | void>();
    const { token } = useContext(DiaryContext);

    function getPhoto(size = "full") {
        return api<Response>(
            `v03/dailyNutrition/getMealPhoto?mealPhotoID=${mealPhotoId}&mealGuid=${meal.mealGuid}&size=${size}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        )
            .then((r) => r.blob())
            .then((r) => URL.createObjectURL(r))
            .catch(() => {
                console.log("error fetching image");
            });
    }

    useEffect(() => {
        if (meal.hasImage) {
            getPhoto().then(setPhoto);
        }
    }, []);

    return (
        <div className="meal">
            {!!photo && (
                <div className="meal--image" data-photo-id="${mealPhotoId}" data-meal-id="${meal.mealGuid}">
                    <img src={photo} alt={meal.name} />
                </div>
            )}
            <div className="meal--details">
                <h3>
                    <span className="meal--timestamp">{new Date(meal.mealTime).toLocaleString('en-US', { hour: '2-digit', hour12: true, minute: '2-digit' })}</span>
                    <span className="meal--type">{meal.name}</span>
                    <span className="meal--calories">{Math.round(meal.caloriesSummary)} Calories</span>
                </h3>
                <div className="bar-container">
                    <div className="bar">
                        <div className="protein" style={{ width: `${meal.proteinPercent}%` }} />
                        <div className="carbs" style={{ width: `${meal.carbsPercent}%` }} />
                        <div className="fat" style={{ width: `${meal.fatPercent}%` }} />
                    </div>
                    <div className="legend">
                        <div className="label">
                            <div className="icon protein"></div>Protein {Math.round(meal.proteinSummary)}g ({Math.round(meal.proteinPercent)}%)
                        </div>
                        <div className="label">
                            <div className="icon carbs"></div>Carbs {Math.round(meal.carbsSummary)}g ({Math.round(meal.carbsPercent)}%)
                        </div>
                        <div className="label">
                            <div className="icon fat"></div>Fat {Math.round(meal.fatSummary)}g ({Math.round(meal.fatPercent)}%)
                        </div>
                    </div>
                </div>
                <ul className="meal-items">
                    {meal.foods.map(food => (
                        <li className="meal-item" key={food.foodId}>
                            <div>
                                <p className="meal-item--name">{food.name}</p>
                                <p className="meal-item--size">{food.amount} {food.unit}</p>
                            </div>
                            <div className="meal-item--calories">
                                {Math.round(food.calories)} cal
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}