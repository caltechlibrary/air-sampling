let AqiWidget = function(root, value, levelObj) {

    let valueEl = root.querySelector(".aqi-widget__value");
    let descriptionEl = root.querySelector(".aqi-widget__description-value");
    let meterEl = root.querySelector(".aqi-widget__meter");
    let inidicatorEl = root.querySelector(".aqi-widget__meter-indicator");
    let maxAqiValue = parseInt(meterEl.getAttribute("aria-valuemax"));

    if(value) {
        valueEl.textContent = value;
        descriptionEl.textContent = levelObj.label;
        meterEl.setAttribute("aria-valuenow", value);
        inidicatorEl.style.left = `${(value / maxAqiValue) * 100}%`;
    } else {
        root.classList.add("aqi-widget--data-unavailable");
        valueEl.textContent = "Not available";
        meterEl.setAttribute("aria-valuetext", "Not available");
    }

};