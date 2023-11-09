function parseBands(bands) {
    const parsedBands = [];

    for(const band of bands) {
        const [time, lower, upper] = band;

        parsedBands.push({
            time: time * 1000,
            lower,
            upper
        })
    }

    return parsedBands;
};

export default parseBands;