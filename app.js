window.addEventListener("load", main());

function start_timer() {
    let start = new Date().getTime();
    let interval = setInterval(function() {
        let now = new Date().getTime();
        let difference = now - start;

        let hours = get_hours(difference);
        let minutes = get_minutes(difference);
        let seconds = get_seconds(difference);

        // display new time
        document.getElementById("time").innerHTML = hours + ":" + minutes + ":" + seconds;
    }) 
}

function get_hours(time, add_zero = true) {
    let hours =  Math.floor((time % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (add_zero) {
        hours = expand_single_digit(hours);
    }
    return hours;
}

function get_minutes(time, add_zero = true) {
    let minutes =  Math.floor((time % (1000 * 60 * 60)) / (1000 * 60));
    if (add_zero) {
        minutes = expand_single_digit(minutes);
    }
    return minutes;
}

function get_seconds(time, add_zero = true) {
    let seconds = Math.floor((time % (1000 * 60)) / 1000);
    if (add_zero) {
        seconds = expand_single_digit(seconds);
    }
    return seconds;
}

function expand_single_digit(num) {
    // check if num is single digit and then insert 0 if that's the case
    if (num < 10) {
        num = "0" + num;
    }
    return num;
}

function main() {
    var start_button = document.getElementById("start-button");
    start_button.onclick = start_timer;
    console.log("Main");
}
