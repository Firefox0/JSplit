class Timer {

    running = false;
    timer_time = null;

    start_timer() {
        this.running = true;
        let start = new Date().getTime();
        console.log("running is: " + this.running);
        setInterval(function(){
            if (!this.running) {
                return;
            }
            let now = new Date().getTime();
            let difference = now - start;

            let hours = this.get_hours(difference);
            let minutes = this.get_minutes(difference);
            let seconds = this.get_seconds(difference);

            // display new time
            this.timer_time.innerHTML = hours + ":" + minutes + ":" + seconds;
        }.bind(this));
    }

    stop_timer() {
        this.running = false;
        this.timer_time.innerHTML = "00:00:00";
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
        // function(){} so js doesnt call the function
        start_button.onclick = function(){this.start_timer()}.bind(this);
        let stop_button = document.getElementById("stop-button");
        stop_button.onclick = function(){this.stop_timer()}.bind(this);
        console.log("Main");
    }
}

window.addEventListener("load", new Timer().main());