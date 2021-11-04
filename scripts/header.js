let Header = function(root) {
    
    let dateEl = root.querySelector(".header__date");
    let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    let init = function() {
        let date = new Date();
        let month = date.getMonth();
        let day = date.getDay();
        let year = date.getFullYear();
        let hour = date.getHours();
        let minutes = date.getMinutes();
        let period = (hour >= 12) ? "pm" : "am";
        let dateTextNode = document.createTextNode(`${months[month]} ${day}, ${year} ${hour % 12}:${minutes} ${period}`);
        dateEl.appendChild(dateTextNode);
    };

    return {
        init
    };

};