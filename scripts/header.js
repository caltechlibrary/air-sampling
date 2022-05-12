let Header = function(root) {
    
    let dateEl = root.querySelector(".header__date");
    let date = new Date();
    let time = date.toLocaleTimeString("en-US", { hour12: true, timeStyle: "short" });
    let day = date.toLocaleDateString("en-US", { dateStyle: "medium" })
    let dateTextNode = document.createTextNode(`${day} ${time}`);
    dateEl.appendChild(dateTextNode);

};