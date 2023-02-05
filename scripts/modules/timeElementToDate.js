function timeElementToDate(timeElement) {
    const [hh, mm, ss] = timeElement.split(":");
    const date = new Date();
    
    date.setHours(hh, mm, ss);
    return date;
}

export default timeElementToDate;