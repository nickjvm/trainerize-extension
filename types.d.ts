interface ErrorWithStatus extends Error {
    status?: number
}

type Settings = {
    stats: {
        firstName: string
        lastName: string
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