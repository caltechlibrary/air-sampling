(function() {
    let headerEl = document.querySelector(".header");
    let widgetsContainer = document.querySelector(".widgets-container");
    let metricWidgetEls = document.querySelectorAll(".metric-widget");
    let continuedReadingWidgetEl = document.querySelector(".continued-reading-widget");
    let header = Header(headerEl);

    let mainController = (function() {

        let onResize = function() {
            if(window.innerWidth >= 768 && widgetsContainer.childElementCount == 2) {
                let wrapperDiv = document.createElement("div");
                wrapperDiv.classList.add("widgets-container__widget");
                wrapperDiv.appendChild(continuedReadingWidgetEl);
                widgetsContainer.appendChild(wrapperDiv);
            } else if(window.innerWidth < 768 && widgetsContainer.childElementCount == 3) {
                let wrapperDiv = continuedReadingWidgetEl.parentElement;
                let lastMetricWidget = metricWidgetEls[metricWidgetEls.length - 1];
                lastMetricWidget.after(continuedReadingWidgetEl);
                widgetsContainer.removeChild(wrapperDiv);
            }
        };

        return {
            onResize
        };
        
    })();

    header.init();
    for(let metricWidgetEl of metricWidgetEls) MetricWidget(metricWidgetEl);
    mainController.onResize();
    window.addEventListener("resize", mainController.onResize);
})();