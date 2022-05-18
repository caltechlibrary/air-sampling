let AqiWidget = function(root, value, mapping) {

    let valueEl = root.querySelector(".aqi-widget__value");
    let descriptionEl = root.querySelector(".aqi-widget__description-value");
    let meterEl = root.querySelector(".aqi-widget__meter");
    let inidicatorEl = root.querySelector(".aqi-widget__meter-indicator");
    let maxAqiValue = parseInt(meterEl.getAttribute("aria-valuemax"));

    valueEl.textContent = value;

    for(let label in mapping) {
        let range = mapping[label];
        if((range[0] <= value && value <= range[1]) || (range.length == 1 && range[0] <= value)) {
            descriptionEl.textContent = label;
        }
    }

    meterEl.setAttribute("aria-valuenow", value);
    inidicatorEl.style.left = `${(value / maxAqiValue) * 100}%`;

};