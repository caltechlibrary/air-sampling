function onToggle(e) {
    const toggleBtn = e.currentTarget;
    const pollutantWidgetEl = toggleBtn.closest(".pollutant-widget");

    if(toggleBtn.getAttribute("aria-expanded") == "false") {
        pollutantWidgetEl.classList.add("pollutant-widget--expanded");
        toggleBtn.setAttribute("aria-expanded", "true");
    } else {
        pollutantWidgetEl.classList.remove("pollutant-widget--expanded");
        toggleBtn.setAttribute("aria-expanded", "false");
    }
}

const pollutantWidgetEls = document.querySelectorAll(".pollutant-widget");

for(const pollutantWidgetEl of pollutantWidgetEls) {
    const toggleBtn = pollutantWidgetEl.querySelector(".pollutant-widget__toggle-btn");
    toggleBtn.addEventListener("click", onToggle);
}