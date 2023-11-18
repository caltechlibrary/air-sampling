import parseTime from "./parseTime.js";

function parseBands(bands) {
    const parsedBands = [];

    for(const band of bands) {
        const [time, lower, upper] = band;

        parsedBands.push({
            time: parseTime(time),
            lower,
            upper
        })
    }

    // Bug: last element is a duplicate "00:00:00". Convert to "24:00:00"
    parsedBands[parsedBands.length - 1].time.setHours(24);

    return parsedBands;
};

export default parseBands;