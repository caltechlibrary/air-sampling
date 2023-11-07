function createDataTable(data, labels) {
    const table = document.createElement("table");
    const header = document.createElement("tr");
    const columns = [];

    table.classList.add("data-table");

    // Create columns
    for(const key in data[0]) {
        columns.push(key);
    }

    // Create header
    for(const column of columns) {
        const headerCell = document.createElement("th");

        headerCell.classList.add("data-table__cell", "data-table__cell--header");
        headerCell.setAttribute("scope", "col");
        headerCell.innerText = labels[column];
        
        header.appendChild(headerCell);
    }

    table.append(header);

    // Create rows
    for(const datum of data) {
        const row = document.createElement("tr");

        for(const column of columns) {
            const cell = document.createElement("td");
            const content = datum[column]

            cell.classList.add("data-table__cell");

            if(column === "time") {
                cell.innerText = content.toLocaleTimeString();
            } else {
                cell.innerText = content;
            }

            row.appendChild(cell)
        }

        table.appendChild(row)
    }

    return table;
}

export default createDataTable;