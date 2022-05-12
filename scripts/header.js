let Header = function(root) {
    
    let dateEl = root.querySelector(".header__date");
    let date = new Date();
    let minutesFormatted = (date.getMinutes() >= 10) ? date.getMinutes(): `0${date.getMinutes()}`;
    let period = (date.getHours() >= 12) ? "pm" : "am";
    let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    let timeString = `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()} ${date.getHours() % 12}:${minutesFormatted} ${period}`;
    let dateTextNode = document.createTextNode(timeString);
    dateEl.appendChild(dateTextNode);

};