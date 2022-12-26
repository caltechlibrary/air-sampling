function timeElementToDate(timeElement) {
    const date = new Date();
    const isoDate = date.toISOString().split("T")[0];
    return new Date(`${isoDate}T${timeElement}`);
}

export default timeElementToDate;