class Timer {

    running = false;
    timer_time = null;

    start_timer() {
        // if timer is already running, ignore further start presses
        if (this.running) {
            return;
        }
        this.running = true;
        let start = new Date().getTime();
        setInterval(function(){
            // if stop button was pressed
            if (!this.running) {
                return;
            }

            // get current time
            let now = new Date().getTime();
            let difference = now - start;

            let hours = this.get_hours(difference);
            let minutes = this.get_minutes(difference);
            let seconds = this.get_seconds(difference);
            let milliseconds = this.get_milliseconds(difference);

            // display new time
            this.timer_time.innerHTML = hours + ":" + minutes + ":" + seconds + "." + milliseconds;

        }.bind(this));
    }

    stop_timer() {
        this.running = false;
        this.timer_time.innerHTML = "00:00:00.000";
    }

    get_hours(time, add_zero = true) {
        let hours =  Math.floor((time % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        if (add_zero) {
            hours = this.expand_single_digit(hours);
        }
        return hours;
    }

    get_minutes(time, add_zero = true) {
        let minutes =  Math.floor((time % (1000 * 60 * 60)) / (1000 * 60));
        if (add_zero) {
            minutes = this.expand_single_digit(minutes);
        }
        return minutes;
    }

    get_seconds(time, add_zero = true) {
        let seconds = Math.floor((time % (1000 * 60)) / 1000);
        if (add_zero) {
            seconds = this.expand_single_digit(seconds);
        }
        return seconds;
    }

    get_milliseconds(time, add_zero = true) {
        let milliseconds = Math.floor(time % 1000);
        if (add_zero) {
            milliseconds = this.expand_single_digit(milliseconds);
        }
        return milliseconds;
    }

    expand_single_digit(num) {
        // check if num is single digit and then insert 0 if that's the case
        if (num < 10) {
            num = "0" + num;
        }
        return num;
    }

    main() {
        this.timer_time = document.getElementById("time");
        let start_button = document.getElementById("start-button");
        // function(){} so js doesnt call the function, also bind it to class so it can 
        // access class attributes
        start_button.onclick = function(){this.start_timer()}.bind(this);
        let stop_button = document.getElementById("stop-button");
        stop_button.onclick = function(){this.stop_timer()}.bind(this);
        console.log("Main");
    }
}

window.addEventListener("load", new Timer().main());