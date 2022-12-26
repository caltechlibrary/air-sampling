const pollutantWidgetEls = document.querySelectorAll(".pollutant-widget");

pollutantWidgetEls.forEach(pollutantWidgetEl => {
    const toggleBtn = pollutantWidgetEl.querySelector(".pollutant-widget__toggle-btn");

    toggleBtn.addEventListener("click", function(){
        if(toggleBtn.getAttribute("aria-expanded") == "false") {
            pollutantWidgetEl.classList.add("pollutant-widget--expanded");
            toggleBtn.setAttribute("aria-expanded", "true");
        } else {
            pollutantWidgetEl.classList.remove("pollutant-widget--expanded");
            toggleBtn.setAttribute("aria-expanded", "false");
        }
    });
})