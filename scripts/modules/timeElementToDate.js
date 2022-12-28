function timeElementToDate(timeElement) {
    const date = new Date();
    const [hh, mm, ss] = timeElement.split(":");
    date.setHours(hh, mm, ss, 0);
    return new Date(date);
}

export default timeElementToDate;