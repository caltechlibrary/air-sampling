function aggreageData(data) {
    const timeToValues = {};

    for(const [name, dataSet] of Object.entries(data)) {
        for(const entry of dataSet) {
            const time = entry.time.getTime();
        
            if(!timeToValues.hasOwnProperty(time)) {
                timeToValues[time] = {};
            }
        
            timeToValues[time][name] = entry.value;
        }
    }

    const dataAggregated = [];

    for(const [time, entry] of Object.entries(timeToValues)) {
        const timeDate = new Date(parseInt(time))

        dataAggregated.push({ time: timeDate, ...entry });
    }

    return dataAggregated.sort((a, b) => a.time - b.time);
}

export default aggreageData;