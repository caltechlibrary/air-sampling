function getAqiCondition(value) {

    const conditions = {
        "Good": [0, 50],
        "Moderate": [51, 100],
        "Unhealthy for Sensitive Groups": [101, 150],
        "Unhealthy": [151, 200],
        "Very Unhealthy": [201, 300],
        "Hazardous": [301, 500]
    }

    for(const [condition, range] of Object.entries(conditions)) {
        if(value >= range[0] && value <= range[1]) {
            return condition;
        }
    }

}

export default getAqiCondition;