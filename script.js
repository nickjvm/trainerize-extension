function last7Days(offset = 0) {
    var result = [];
    for (var i = offset; i < 7 + offset; i++) {
        var d = new Date();
        d.setDate(d.getDate() - i);
        result.push(d.toISOString().split('T')[0])
    }

    return result.toReversed()
}

function formatDate(dateStr, options = {}) {
    return new Date(dateStr).toLocaleDateString('en-US', {
        ...options,
        timeZone: options.timeZone || 'UTC'
    })
}
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}


(async function () {
    const week = last7Days(1)
    const token = getCookie('tz_uatoken')
    const uid = getCookie('tz_uid')

    if (!token || !uid) {
        return alert('Please sign in again.')
    }

    function getPhoto(photoId, mealId, size = "full") {
        return fetch(`https://api.trainerize.com/v03/dailyNutrition/getMealPhoto?mealPhotoID=${photoId}&mealGuid=${mealId}&size=${size}`, {
            headers: {
                Authorization: `Bearer ${getCookie('tz_uatoken')}`
            }
        }).then(r => r.blob()).then(r => URL.createObjectURL(r)).catch(e => {
            console.log('error fetching image')
        })
    }

    function getPhotos() {
        const photos = document.querySelectorAll('.meal--image[data-photo-id]')

        const requests = Array.from(photos).map(container => {
            return getPhoto(container.dataset.photoId, container.dataset.mealId).then(r => {
                delete container.dataset.photoId
                delete container.dataset.mealId

                const img = document.createElement('img')
                img.src = r
                img.alt = 'meal photo'

                container.insertAdjacentElement('afterbegin', img)
            })
        })

        return Promise.allSettled(requests)
    }

    function macroGoal(macro) {
        return {
            label: `${Math.round((macro.grams / macro.goal) * 100)}%`,
            average: `${Math.round(macro.grams / week.length)}g`,
            percentage: (macro.grams / macro.goal) * 100,
        }
    }


    function getSettings() {
        return fetch('https://api.trainerize.com/v03/user/getSettings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ userid: uid })
        }).then(r => r.json()).catch(e => { })
    }

    try {

        const requests = week.map(date => fetch('https://api.trainerize.com/v03/dailyNutrition/get', {
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
            .then(response => {
                if (!response.ok) {
                    switch (response.status) {
                        // Check if the response is not OK (status code not in the range 200-299)
                        case 401: {
                            throw new Error('Please sign in again.')
                        }
                        default: {
                            throw new Error('Something went wrong. Please try again.')
                        }
                    }
                }

                return response.json(); // Assuming the response is JSON
            })
            .catch(e => {
                alert(e.message)
            }
            ))
        const logs = await Promise.allSettled(requests)
        const settings = await getSettings()
        const macros = logs.reduce((acc, { value: data }) => {
            acc.calories += data.nutrition.calories
            acc.caloricGoal += data.nutrition.goal.caloricGoal
            acc.protein.grams += data.nutrition.proteinGrams
            acc.protein.percent += data.nutrition.proteinPercent
            acc.protein.goal += data.nutrition.goal.proteinGrams
            acc.carbs.grams += data.nutrition.carbsGrams
            acc.carbs.percent += data.nutrition.carbsPercent
            acc.carbs.goal += data.nutrition.goal.carbsGrams
            acc.fat.grams += data.nutrition.fatGrams
            acc.fat.percent += data.nutrition.fatPercent
            acc.fat.goal += data.nutrition.goal.fatGrams
            acc.fiber += data.nutrition.nutrients.find(n => n.nutrNo === 291)?.nutrVal
            return acc
        }, {
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
        })

        const summary = `
            <div class="section">
                <h1>${settings.stats.firstName} ${settings.stats.lastName}'s Meal Report (${formatDate(week[0])} - ${formatDate(week[week.length - 1])})</h1>
                <h2>Macro distribution</h2>
                <div class="bar-container">
                    <div class="bar">
                        <div class="protein" style="width: ${(macros.protein.percent * 100) / week.length}%"></div>
                        <div class="carbs" style="width: ${(macros.carbs.percent * 100) / week.length}%"></div>
                        <div class="fat" style="width: ${(macros.fat.percent * 100) / week.length}%"></div>
                    </div>
                    <div class="legend">
                        <div class="label">
                            <div class="icon protein"></div>Protein (${Math.round((macros.protein.percent * 100) / week.length)}%)
                        </div>
                        <div class="label">
                            <div class="icon carbs"></div>Carbs (${Math.round((macros.carbs.percent * 100) / week.length)}%)
                        </div>
                        <div class="label">
                            <div class="icon fat"></div>Fat (${Math.round((macros.fat.percent * 100) / week.length)}%)
                        </div>
                    </div>
                </div>
            </div>
            <div class="section">
                <h2>Goals</h2>
                <div class="bar-container">
                    <div class="bar">
                        <div class="calories" style="width: ${(macros.calories / macros.caloricGoal) * 100}%"></div>
                    </div>
                    <div class="legend">
                        <div class="label">Calories ${Math.round(macros.caloricGoal / week.length)}</div>
                        <div class="label">${Math.round((macros.calories / macros.caloricGoal) * 100)}% (avg ${Math.round(macros.calories / week.length)})</div>
                    </div>
                </div>
                ${['protein', 'carbs', 'fat'].map(macro => `
                    <div class="bar-container">
                        <div class="bar">
                            <div class="${macro}" style="width: ${macroGoal(macros[macro]).percentage}%"></div>
                        </div>
                        <div class="legend">
                            <div class="label">${macro} ${Math.round(macros[macro].goal / week.length)}g</div>
                            <div class="label">${macroGoal(macros[macro]).label} (avg ${macroGoal(macros[macro]).average})</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `
        document.body.classList.add('custom-trainerize-export-active')
        document.body.insertAdjacentHTML('afterbegin', '<div id="custom-trainerize-export"></div>')
        document.querySelector('#custom-trainerize-export').insertAdjacentHTML('afterbegin', summary)

        logs.map(({ value: data }) => {
            const entryTemplate = `
                <div class="pagebreak"></div>
                <section class="daily-entry">
                    <header>
                        <h2>${formatDate(data.nutrition.date, {
                weekday: "short",
                year: "numeric",
                month: "long",
                day: "numeric",
            })}</h2>
                    </header>
                    <div class="bar-container">
                        <div class="bar">
                            <div class="protein" style="width: ${data.nutrition.proteinPercent * 100}%"></div>
                            <div class="carbs" style="width: ${data.nutrition.carbsPercent * 100}%"></div>
                            <div class="fat" style="width: ${data.nutrition.fatPercent * 100}%"></div>
                        </div>
                        <div class="legend">
                            <div class="label">
                                <!-- ${Math.round(data.nutrition.nutrients.find(n => n.nutrNo === 291)?.nutrVal)}g fiber -->
                                <div class="icon protein"></div>Protein ${Math.round(data.nutrition.proteinGrams)}g (${Math.round(data.nutrition.proteinPercent * 100)}%)
                            </div>
                            <div class="label">
                                <div class="icon carbs"></div>Carbs ${Math.round(data.nutrition.carbsGrams)}g (${Math.round(data.nutrition.carbsPercent * 100)}%)
                            </div>
                            <div class="label">
                                <div class="icon fat"></div>Fat ${Math.round(data.nutrition.fatGrams)}g (${Math.round(data.nutrition.fatPercent * 100)}%)
                            </div>
                        </div>
                    </div>
                    <div class="bar-container">
                        <div class="bar">
                            <div class="calories" style="width: ${(data.nutrition.calories / data.nutrition.goal.caloricGoal) * 100}%"></div>
                        </div>
                        <div class="legend">
                        <div class="label">
                            <span class="icon calories"></span>Calories ${Math.round(data.nutrition.calories)}
                        </div>
                            <div class="label">${data.nutrition.goal.caloricGoal - data.nutrition.calories} remaining</div>
                        </div>
                    </div>
                    ${data.nutrition.meals.map(meal => `
                        <div class="meal">
                            ${meal.hasImage ? `<div class="meal--image" data-photo-id="${data.nutrition.mealPhoto.id}" data-meal-id="${meal.mealGuid}"></div>` : ''}
                            <div class="meal--details">
                                <h3>
                                    <span class="meal--timestamp">${new Date(meal.mealTime).toLocaleString('en-US', { hour: '2-digit', hour12: true, minute: '2-digit' })}</span>
                                    <span class="meal--type">${meal.name}</span>
                                    <span class="meal--calories">${Math.round(meal.caloriesSummary)} Calories</span>
                                </h3>
                                <div class="bar-container">
                                    <div class="bar">
                                        <div class="protein" style="width: ${meal.proteinPercent}%"></div>
                                        <div class="carbs" style="width: ${meal.carbsPercent}%"></div>
                                        <div class="fat" style="width: ${meal.fatPercent}%"></div>
                                    </div>
                                    <div class="legend">
                                        <div class="label">
                                            <div class="icon protein"></div>Protein ${Math.round(meal.proteinSummary)} (${Math.round(meal.proteinPercent)}%)
                                        </div>
                                        <div class="label">
                                            <div class="icon carbs"></div>Carbs ${Math.round(meal.carbsSummary)} (${Math.round(meal.carbsPercent)}%)
                                        </div>
                                        <div class="label">
                                            <div class="icon fat"></div>Fat ${Math.round(meal.fatSummary)} (${Math.round(meal.fatPercent)}%)
                                        </div>
                                    </div>
                                </div>
                                <ul class="meal-items">
                                    ${meal.foods.map(food => `
                                        <li class="meal-item">
                                            <div>
                                                <p class="meal-item--name">${food.name}</p>
                                                <p class="meal-item--size">${food.amount} ${food.unit}</p>
                                            </div>
                                            <div class="meal-item--calories">
                                            ${Math.round(food.calories)} cal
                                            </div>
                                        </li>
                                    `).join('')}
                                </ul>
                            </div>
                        </div>
                    `).join('')}
                </section>
            `
            document.body.querySelector('#custom-trainerize-export').insertAdjacentHTML('beforeend', entryTemplate)
        })

        await getPhotos()

        window.onafterprint = async function () {

            // Message sender
            await chrome.runtime.sendMessage({
                status: 'complete'
            });
            // console.log("Print dialog closed or printing finished.");
            // document.querySelector('#custom-trainerize-export')?.remove()
            // document.body.classList.remove('custom-trainerize-export-active')
        };

        window.print()

    } catch (e) {
        console.log(e)

        document.body.classList.remove('custom-trainerize-export-active')
        document.querySelector('#custom-trainerize-export')?.remove()
    }
})()
