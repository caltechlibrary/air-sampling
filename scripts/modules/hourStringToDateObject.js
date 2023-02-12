import * as luxon from "https://cdn.jsdelivr.net/npm/luxon@3.2.1/+esm"

/**
 * Converts hour string to JS Date object. Assumes hour string is 
 * the time at the current day Los Angeles time.
 * 
 * @param {string} hourString Hour string in HH:MM:SS format
 * @returns {Date} Date object
 */
function hourStringToDateObject(hourString) {
    const [hh, mm, ss] = hourString.split(":");
    const dateLuxon = luxon.DateTime.fromObject(
        { hour: hh, minute: mm, second: ss },
        { zone: "America/Los_Angeles" }
    )

    return dateLuxon.toJSDate()
}

export default hourStringToDateObject;