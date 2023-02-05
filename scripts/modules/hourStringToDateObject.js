/**
 * Converts hour string to JS Date object. Assumes hour string is 
 * the time at the current day locale time.
 * 
 * @param {string} hourString Hour string in HH:MM:SS format
 * @returns {Date} Date object
 */
function hourStringToDateObject(hourString) {
    const [hh, mm, ss] = hourString.split(":");
    const date = new Date();

    date.setHours(hh, mm, ss);
    return date;
}

export default hourStringToDateObject;