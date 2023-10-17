const pollutantWidgetEls = document.querySelectorAll(".pollutant-widget");

for(const pollutantWidgetEl of pollutantWidgetEls) {
    const pollutantWidgetToggleEl = pollutantWidgetEl.querySelector(".pollutant-widget__toggle-btn");

    pollutantWidgetToggleEl.addEventListener("click", function() {    
        if(pollutantWidgetToggleEl.getAttribute("aria-expanded") == "false") {
            pollutantWidgetEl.classList.add("pollutant-widget--expanded");
            pollutantWidgetToggleEl.setAttribute("aria-expanded", "true");
        } else {
            pollutantWidgetEl.classList.remove("pollutant-widget--expanded");
            pollutantWidgetToggleEl.setAttribute("aria-expanded", "false");
        }
    });
}