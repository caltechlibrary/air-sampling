(function() {
    let headerEl = document.querySelector(".header");
    let widgetsContainer = document.querySelector(".widgets-container");
    let metricWidgetEls = document.querySelectorAll(".metric-widget");
    let continuedReadingWidgetEl = document.querySelector(".continued-reading-widget");

    let mainController = (function() {

        let onResize = function() {
            if(window.innerWidth >= 1100 && widgetsContainer.childElementCount == 2) {
                let container = continuedReadingWidgetEl.parentElement;
                while(container.classList.length > 0) container.classList.remove(container.classList.item(0));
                container.classList.add("widgets-container__widget");
                widgetsContainer.appendChild(container);
            } else if(window.innerWidth < 1100 && widgetsContainer.childElementCount == 3) {
                let container = continuedReadingWidgetEl.parentElement;
                while(container.classList.length > 0) container.classList.remove(container.classList.item(0));
                container.classList.add("continued-reading-widget-container");
                metricWidgetEls[metricWidgetEls.length - 1].after(container);
            }
        };

        return {
            onResize
        };
        
    })();

    // Initialize components
    Header(headerEl);
    for(let metricWidgetEl of metricWidgetEls) MetricWidget(metricWidgetEl);

    mainController.onResize();
    window.addEventListener("resize", mainController.onResize);
})();