let MetricWidget = function(root, value, mapping) {

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

        for(let i = 0; i < mapping.length; i++) {
            let level = mapping[i]
            if(value < level.max || i == mapping.length - 1) {
                qualityLabel.textContent = level.label;
                previewSnippet.textContent = level.snippet;
            }
        }

        for(let label in mapping) {
            let {range, snippet} = mapping[label];
            if((range[0] <= value && value <= range[1]) || (range.length == 1 && range[0] <= value)) {
                qualityLabel.textContent = label;
                previewSnippet.textContent = snippet;
            }
        }
    } else {
        valueLabel.textContent = "Not available";
    }
    
    toggleBtn.addEventListener("click", togglePanel);

};