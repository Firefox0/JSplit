class Timer {

    running = false;
    timer_time = null;
    user_input = null;
    table = null;
    current_row = 0;

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
            hours = this.insert_zeros(hours);
        }
        return hours;
    }

    get_minutes(time, add_zero = true) {
        let minutes =  Math.floor((time % (1000 * 60 * 60)) / (1000 * 60));
        if (add_zero) {
            minutes = this.insert_zeros(minutes);
        }
        return minutes;
    }

    get_seconds(time, add_zero = true) {
        let seconds = Math.floor((time % (1000 * 60)) / 1000);
        if (add_zero) {
            seconds = this.insert_zeros(seconds);
        }
        return seconds;
    }

    get_milliseconds(time, add_zero = true) {
        let milliseconds = Math.floor(time % 1000);
        if (add_zero) {
            milliseconds = this.insert_zeros(milliseconds, 2);
        }
        return milliseconds;
    }

    insert_zeros(num, expand_by = 1) {
        // check if num is single digit and then insert 0 if that's the case
        let zero_s = "";
        for (let l = 1; l <= expand_by; l++) {
            if (num < Math.pow(10, l)) {
                zero_s += "0";
            }
        }
        return zero_s + num;
    }

    add_split() {
        let content = this.user_input.value;
        let row = this.table.insertRow(-1);
        let split_name = row.insertCell(0);
        split_name.innerHTML = content;
        row.insertCell(1);
        this.user_input.value = "";
    }

    split() {
        this.table.rows[this.current_row].cells[1].innerHTML = this.timer_time.innerHTML;
        this.current_row++;
    }

    main() {
        this.timer_time = document.getElementById("time");
        let start_button = document.getElementById("start-button");
        // function(){} so js doesnt call the function, also bind it to class so it can 
        // access class attributes
        start_button.onclick = function(){this.start_timer()}.bind(this);
        let stop_button = document.getElementById("stop-button");
        stop_button.onclick = function(){this.stop_timer()}.bind(this);

        this.table = document.getElementById("table");

        let add_button = document.getElementById("add-button");
        add_button.onclick = function(){this.add_split()}.bind(this);

        this.user_input = document.getElementById("user-input");

        let split_button = document.getElementById("split-button");
        split_button.onclick = function(){this.split()}.bind(this);
    }
}

window.addEventListener("load", new Timer().main());