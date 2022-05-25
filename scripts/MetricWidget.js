let MetricWidget = function(root, value, levelObj) {

    let toggleBtn = root.querySelector(".metric-widget__toggle-btn");
    let qualityLabel = root.querySelector(".metric-widget__quality-label");
    let valueLabel = root.querySelector(".metric-widget__value-label");
    let previewSnippet = root.querySelector(".metric-widget__preview-snippet");
    let contentPanel = root.querySelector(".metric-widget__panel");

    let togglePanel = function() {
        if(toggleBtn.getAttribute("aria-expanded") == "false") {
            previewSnippet.classList.add("metric-widget__preview-snippet--hidden");
            contentPanel.classList.remove("metric-widget__panel--collapsed");
            toggleBtn.setAttribute("aria-expanded", "true");
        } else {
            previewSnippet.classList.remove("metric-widget__preview-snippet--hidden");
            contentPanel.classList.add("metric-widget__panel--collapsed");
            toggleBtn.setAttribute("aria-expanded", "false");
        }
    };

    if(value) {
        valueLabel.textContent = value;
        qualityLabel.textContent = levelObj.label;
        previewSnippet.textContent = levelObj.snippet;
    } else {
        valueLabel.textContent = "Not available";
    }
    
    toggleBtn.addEventListener("click", togglePanel);

};