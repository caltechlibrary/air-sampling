import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.7.0/+esm";

/**
 * Converts csv string of format "time,value" to
 * array of { time, value } objects.
 * 
 * @param {string} csvString CSV string of format "time,value"
 * @returns Array of { time, value } objects
 */
function parseTimeValueCSV(csvString) {
    const rows = d3.csvParseRows(csvString, d3.autoType);

    return rows.map(([time, value]) => ({ time, value }));
};

export default parseTimeValueCSV;