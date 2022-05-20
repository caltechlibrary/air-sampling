let MetricWidget = function(root, value) {

    let toggleBtn = root.querySelector(".metric-widget__toggle-btn");
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
    } else {
        valueLabel.textContent = "Not available";
    }
    
    toggleBtn.addEventListener("click", togglePanel);

};