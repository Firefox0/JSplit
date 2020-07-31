class Timer {

    // timer running
    running = false;
    // current row while splitting
    current_row = 0;
    // total amount of splits
    amount_splits = 0;
    // splits selected
    amount_selected = 0;

    start_timer() {
        // if timer is already running, ignore further start presses
        this.stop_button.disabled = false;
        this.pause_button.disabled = false;
        this.append_button.disabled = true;
        this.insert_above_button.disabled = true;
        this.insert_below_button.disabled = true;

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

        setInterval((() => {

            // if stop button was pressed
            if (!this.running) {
                this.append_button.disabled = false;
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

        }).bind(this));
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
        setInterval((() => {
            if (this.running) {
                return;
            }
            else {

            }
        }).bind(this));
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
            milliseconds = this.insert_zeros(milliseconds, 3);
        }
        return milliseconds;
    }

    insert_zeros(num, length = 2) {
        // insert zeros to the beginning of num until length reached
        let num_length = num.toString().length;
        let difference = length - num_length;
        if (difference > 0) {
            for (let i = 0; i < difference; i++) {
                num = "0" + num;
            }
        }
        return num;
    }

    add_split(row_index = -1) {
        this.split_button.disabled = false;
        let content = this.user_input.value;
        if (content) {
            // add row and keep count of splits
            let row = this.table.insertRow(row_index);
            row.onclick = (() => this.select_row(row)).bind(this);
            let split_name = row.insertCell(0);
            split_name.innerHTML = content;
            // placeholder for split time
            row.insertCell(1);
            this.amount_splits++;
            // clear form
            this.user_input.value = "";
        }
        // focus after add was pressed
        this.user_input.focus();
    }

    select_row(e) {
        // default color is empty even though it looks white
        if (e.style.color != "black") {
            e.style.color = "black";
            this.amount_selected++;
        }
        else {
            e.style.color = "white";
            this.amount_selected--;
        }
        // enable/disable delete button
        if (this.amount_selected > 0) {
            if (!this.running) {
                if (this.amount_selected == 1) {
                    this.insert_above_button.disabled = false;
                    this.insert_below_button.disabled = false;
                }
                else {
                    this.insert_above_button.disabled = true;
                    this.insert_below_button.disabled = true;
                }   
            }
            this.delete_button.disabled = false;
        }
        else {
            this.delete_button.disabled = true;
        }
    }

    split() {
        this.table.rows[this.current_row].cells[1].innerHTML = this.timer_time.innerHTML;
        this.current_row++;
        // pause when all splits are done
        if (this.current_row == this.amount_splits) {
            this.split_button.disabled = true;
            this.pause_timer();
        }
    }

    delete_split() {
        for (let i = 0; i < this.amount_splits; i++) {
            if (this.table.rows[i].style.color == "black") {
                this.table.deleteRow(i);
                this.amount_splits--;
                // decrement to make sure that you iterate through all elements (otherwise skip after deletion)
                i--;
            }
        }
        this.delete_button.disabled = true;
    }

    insert_above() {
        for (let i = 0; i < this.amount_splits; i++) {
            if (this.table.rows[i].style.color == "black") {
                this.add_split(i);
                return;
            }
        }
    }

    insert_below() {
        for (let i = 0; i < this.amount_splits; i++) {
            if (this.table.rows[i].style.color == "black") {
                this.add_split(i + 1);
                return;
            }
        }
    }

    reset() {
        this.running = false;
        this.current_row = 0;
        this.amount_selected = 0;
        for (let i = 0; i < this.amount_splits; i++) {
            this.table.deleteRow(0);
        }
        this.amount_splits = 0;

        this.stop_button.disabled = true;
        this.pause_button.disabled = true;
        this.delete_button.disabled = true;
        this.insert_above_button.disabled = true;
        this.insert_below_button.disabled = true;
    }

    main() {
        this.timer_time = document.getElementById("time");
        this.start_button = document.getElementById("start-button");
        // function(){} so js doesnt call the function, also bind it to class so it can 
        // access class attributes
        this.start_button.onclick = (() => this.start_timer()).bind(this);

        this.stop_button = document.getElementById("stop-button");
        this.stop_button.onclick = (() => this.stop_timer()).bind(this);
        this.stop_button.disabled = true;

        this.pause_button = document.getElementById("pause-button");
        this.pause_button.onclick = (() => this.pause_timer()).bind(this);
        this.pause_button.disabled = true;

        this.table = document.getElementById("table");
        this.user_input = document.getElementById("user-input");

        this.append_button = document.getElementById("append-button");
        this.append_button.onclick = (() => this.add_split()).bind(this);

        this.split_button = document.getElementById("split-button");
        this.split_button.onclick = (() => this.split()).bind(this);
        this.split_button.disabled = true;

        this.delete_button = document.getElementById("delete-button");
        this.delete_button.onclick = (() => this.delete_split()).bind(this);
        this.delete_button.disabled = true;

        this.insert_above_button = document.getElementById("insert-above-button");
        this.insert_above_button.onclick = (() => this.insert_above()).bind(this);
        this.insert_above_button.disabled = true;

        this.insert_below_button = document.getElementById("insert-below-button");
        this.insert_below_button.onclick = (() => this.insert_below()).bind(this);
        this.insert_below_button.disabled = true;

        this.reset_button = document.getElementById("reset-button");
        this.reset_button.onclick = (() => this.reset()).bind(this);
    }
}

window.addEventListener("load", new Timer().main());