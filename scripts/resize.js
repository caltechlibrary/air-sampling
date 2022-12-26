function resize() {
    const topContainerEl = document.querySelector(".top-container");
    const resourceWidgetEl = document.querySelector(".resources-widget");
    const pollutantWidgetEls = document.querySelectorAll(".pollutant-widget");
    const layoutBreakpoint = 1100;

    let shiftToDesktop = window.innerWidth >= layoutBreakpoint && topContainerEl.childElementCount == 2;
    let shiftToMobile = window.innerWidth < layoutBreakpoint && topContainerEl.childElementCount == 3;
    
    if(shiftToDesktop || shiftToMobile) {
        let container = resourceWidgetEl.parentElement;
        while(container.classList.length > 0) container.classList.remove(container.classList.item(0));
        if(shiftToDesktop) {
            container.classList.add("top-container__item");
            topContainerEl.appendChild(container);
        } else if(shiftToMobile) {
            container.classList.add("page__resources-widget-container");
            pollutantWidgetEls[pollutantWidgetEls.length - 1].after(container);
        }
    }
}

resize();
window.addEventListener("resize", resize);