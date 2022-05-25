let AqiWidget = function(root, value, mapping) {

    let valueEl = root.querySelector(".aqi-widget__value");
    let descriptionEl = root.querySelector(".aqi-widget__description-value");
    let meterEl = root.querySelector(".aqi-widget__meter");
    let inidicatorEl = root.querySelector(".aqi-widget__meter-indicator");
    let maxAqiValue = parseInt(meterEl.getAttribute("aria-valuemax"));

    if(value) {
        valueEl.textContent = value;

        for(let i = 0; i < mapping.length; i++) {
            let level = mapping[i]
            if(value < level.max || i == mapping.length - 1) {
                descriptionEl.textContent = level.label;
                break;
            }
        }

        meterEl.setAttribute("aria-valuenow", value);
        inidicatorEl.style.left = `${(value / maxAqiValue) * 100}%`;
    } else {
        root.classList.add("aqi-widget--data-unavailble");
        valueEl.textContent = "Not available";
        meterEl.setAttribute("aria-valuetext", "Not available");
    }

};