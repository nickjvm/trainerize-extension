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

(function () {
    const week = last7Days(1)
    const token = getCookie('tz_uatoken')
    const uid = getCookie('tz_uid')
    if (!token || !uid) {
        return alert('Please sign in again.')
    }

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
        }))

    Promise.all(requests).then((logs) => {
        const macros = logs.reduce((acc, data) => {
            acc.calories += data.nutrition.calories
            acc.protein += data.nutrition.proteinGrams
            acc.carbs += data.nutrition.carbsGrams
            acc.fat += data.nutrition.fatGrams
            acc.fiber += data.nutrition.nutrients.find(n => n.nutrNo === 291)?.nutrVal
            return acc
        }, {
            calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0
        })

        const averageTable = `
            <table class="table summary">
                <tr>
                    <th colspan="4"><h2>Weekly Meal Log (${formatDate(week[0])} - ${formatDate(week[week.length - 1])})</h2></th>
                </tr>
                <tr>
                    <th colspan="4">Macro averages:</th>
                <tr>
                    <td>${Math.round(macros.calories / week.length)} Calories</td>
                    <td>${Math.round(macros.protein / week.length)}g Protein</td>
                    <td>${Math.round(macros.carbs / week.length)}g Carbs (${Math.round(macros.fiber / week.length)}g fiber)</td>
                    <td>${Math.round(macros.fat / week.length)}g Fat</td>
                </tr>
            </table>
        `

        document.body.classList.add('custom-trainerize-export-active')
        document.body.insertAdjacentHTML('afterbegin', '<div id="custom-trainerize-export"></div>')
        document.querySelector('#custom-trainerize-export').insertAdjacentHTML('afterbegin', averageTable)

        logs.map(data => {
            const template = `
            <table class="table day" cellspacing="0" cellpadding="0" >
              <thead>
              <tr>
                <td colspan="5" style="width: 200px !important;">${formatDate(data.nutrition.date, {
                weekday: "short",
                year: "numeric",
                month: "long",
                day: "numeric",
            })}</td>
              </tr>
              <tr>
                  <td colspan="5">
                    ${Math.round(data.nutrition.calories)} cals, ${Math.round(data.nutrition.proteinGrams)}g P, ${Math.round(data.nutrition.carbsGrams)}g C (${Math.round(data.nutrition.nutrients.find(n => n.nutrNo === 291)?.nutrVal)}g fiber), ${Math.round(data.nutrition.fatGrams)}g F
                  </td>
              </thead>
              <tbody>
                <tr>
                <td colspan="5">
                  ${data.nutrition.meals.map(meal => `
                    <table class="table meal" style="margin-bottom: 4px;">
                      <tr>
                        <td colspan="2"><strong>${new Date(meal.mealTime).toLocaleTimeString()} - ${meal.name} - ${Math.round(meal.caloriesSummary)} cal, ${Math.round(meal.proteinSummary)}P, ${Math.round(meal.carbsSummary)}C, ${Math.round(meal.fatSummary)}F</strong></td>
                      </tr>
                      ${meal.foods.map(food => `
                        <tr>
                          <td style="white-space: nowrap; width: 100px;">${food.amount} ${food.unit}</td>
                          <td>${food.name}</td>
                        </tr>
                      `).join('')}
                    </table>
                  `).join('')}
                  
                </td>
                </tr>
              </tbody>
            </table>`

            document.body.querySelector('#custom-trainerize-export').insertAdjacentHTML('beforeend', template)
        })
        window.print()

    })

    window.onafterprint = async function () {

        // Message sender
        await chrome.runtime.sendMessage({
            status: 'complete'
        });
        // console.log("Print dialog closed or printing finished.");
        // document.querySelector('#custom-trainerize-export')?.remove()
        // document.body.classList.remove('custom-trainerize-export-active')
    };
})()
