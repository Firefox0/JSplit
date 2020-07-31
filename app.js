class Timer {

    running = false;
    timer_time = null;
    user_input = null;
    table = null;
    current_row = 0;
    amount_splits = 0;

    start_button = null;
    stop_button = null;
    pause_button = null;

    // time when timer started
    start_time = null;
    // time when pause started
    pause_time = null;

    start_timer() {
        // if timer is already running, ignore further start presses
        this.stop_button.disabled = false;
        this.pause_button.disabled = false;

        this.running = true;
        this.start_button.disabled = true;

        // if start time null then initialize (from stop)
        if (!this.start_time) {
            this.start_time = new Date().getTime();
        }
        else if (this.pause_time) {
            this.start_time += new Date().getTime() - this.pause_time;
            this.pause_time = null;
        }

        setInterval(function() {

            // if stop button was pressed
            if (!this.running) {
                return;
            }
            // get current time
            let now = new Date().getTime();
            let difference = now - this.start_time;

            let hours = this.get_hours(difference);
            let minutes = this.get_minutes(difference);
            let seconds = this.get_seconds(difference);
            let milliseconds = this.get_milliseconds(difference);

            // display new time
            this.timer_time.innerHTML = hours + ":" + minutes + ":" + seconds + "." + milliseconds;

        }.bind(this));
    }

    stop_timer() {
        this.start_button.disabled = false;
        this.stop_button.disabled = true;
        this.pause_button.disabled = true;
        this.running = false;
        this.start_time = null;
        this.timer_time.innerHTML = "00:00:00.000";
    }

    pause_timer() {
        this.start_button.disabled = false;
        this.pause_button.disabled = true;
        this.running = false;
        this.pause_time = new Date().getTime();
        setInterval(function() {
            if (this.running) {
                return;
            }
            else {

            }
        }.bind(this));
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
        if (content) {
            // add row and keep count of splits
            let row = this.table.insertRow(-1);
            let split_name = row.insertCell(0);
            split_name.innerHTML = content;
            row.insertCell(1);
            this.amount_splits++;
            // clear form
            this.user_input.value = "";
        }
        // focus after add was pressed
        this.user_input.focus();
    }

    split() {
        this.table.rows[this.current_row].cells[1].innerHTML = this.timer_time.innerHTML;
        this.current_row++;
        // pause when all splits are done
        if (this.current_row == this.amount_splits) {
            this.pause_timer();
        }
    }

    main() {
        this.timer_time = document.getElementById("time");
        this.start_button = document.getElementById("start-button");
        // function(){} so js doesnt call the function, also bind it to class so it can 
        // access class attributes
        this.start_button.onclick = function(){this.start_timer()}.bind(this);

        this.stop_button = document.getElementById("stop-button");
        this.stop_button.onclick = function(){this.stop_timer()}.bind(this);
        this.stop_button.disabled = true;

        this.pause_button = document.getElementById("pause-button");
        this.pause_button.onclick = function(){this.pause_timer()}.bind(this);
        this.pause_button.disabled = true;

        this.table = document.getElementById("table");
        this.user_input = document.getElementById("user-input");

        let add_button = document.getElementById("add-button");
        add_button.onclick = function(){this.add_split()}.bind(this);

        let split_button = document.getElementById("split-button");
        split_button.onclick = function(){this.split()}.bind(this);

    }
}

window.addEventListener("load", new Timer().main());