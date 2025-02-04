interface ErrorWithStatus extends Error {
    status?: number
}

type Settings = {
    stats: {
        firstName: string
        lastName: string
        mediaSexPreference: "male" | "female"
    }
}

type Nutrition = {
    nutrition: {
        mealPhoto: {
            id: number
        }
        date: string
        calories: number
        proteinGrams: number
        proteinPercent: number
        carbsGrams: number
        carbsPercent: number
        fatGrams: number
        fatPercent: number
        meals: Meal[]
        goal: {
            caloricGoal: number
            proteinGrams: number
            carbsGrams: number
            fatGrams: number
        }
        nutrients: {
            nutrNo: number
            nutrVal: number
        }[]
    }
}


type Meal = {
    hasImage: boolean
    mealGuid: string
    mealTime: string
    name: string
    caloriesSummary: number
    proteinPercent: number
    carbsPercent: number
    fatPercent: number
    proteinSummary: number
    carbsSummary: number
    fatSummary: number
    foods: Food[]
}

type Food = {
    foodId: number
    name: string
    amount: string
    unit: string
    calories: number
}