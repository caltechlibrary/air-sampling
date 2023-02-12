import * as luxon from "https://cdn.jsdelivr.net/npm/luxon@3.2.1/+esm"

function hourStringToDateObject(hourString) {
    const [hh, mm, ss] = hourString.split(":");
    const dateLuxon = luxon.DateTime.fromObject(
        { hour: hh, minute: mm, second: ss },
        { zone: "America/Los_Angeles" }
    )

    return dateLuxon.toJSDate()
}

export default hourStringToDateObject;