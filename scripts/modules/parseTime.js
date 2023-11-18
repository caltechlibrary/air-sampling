function parseTime(time) {
    const [hh, mm, ss] = time.split(":");
    const parsedTime = new Date();
    parsedTime.setHours(parseInt(hh), parseInt(mm), parseInt(ss));

    return parsedTime;
}

export default parseTime;