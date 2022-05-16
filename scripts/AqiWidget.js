let AqiWidget = function(root, value) {

    let valueEl = root.querySelector(".aqi-widget__value");
    let meterEl = root.querySelector(".aqi-widget__meter");
    let inidicatorEl = root.querySelector(".aqi-widget__meter-indicator");
    let maxAqiValue = parseInt(meterEl.getAttribute("aria-valuemax"));

    valueEl.textContent = value;
    meterEl.setAttribute("aria-valuenow", value);
    inidicatorEl.style.left = `${(value / maxAqiValue) * 100}%`;

};