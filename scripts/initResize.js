function onResize() {
    const resourceWidgetEl = document.querySelector(".resources-widget");
    const resourceWidgetContainerEl = resourceWidgetEl.parentElement;
    const layoutBreakpoint = 1100;

    const shiftToDesktop = window.innerWidth >= layoutBreakpoint && resourceWidgetContainerEl.classList.contains("page__resources-widget-container");
    const shiftToMobile = window.innerWidth < layoutBreakpoint && resourceWidgetContainerEl.classList.contains("top-container__item");
    
    if(shiftToDesktop) {
        const topContainerEl = document.querySelector(".top-container");
        resourceWidgetContainerEl.classList.remove("page__resources-widget-container");
        resourceWidgetContainerEl.classList.add("top-container__item");
        topContainerEl.appendChild(resourceWidgetContainerEl);
    } else if(shiftToMobile) {
        const mainContainerEl = document.querySelector("main");
        resourceWidgetContainerEl.classList.remove("top-container__item");
        resourceWidgetContainerEl.classList.add("page__resources-widget-container");
        mainContainerEl.appendChild(resourceWidgetContainerEl);
    }
}

onResize();

window.addEventListener("resize", onResize);