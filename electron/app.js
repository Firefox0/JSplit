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

        this.stop_button.disabled = false;
        this.pause_button.disabled = false;
        this.append_button.disabled = true;
        this.insert_above_button.disabled = true;
        this.insert_below_button.disabled = true;
        this.start_button.disabled = true;
        this.running = true;

        // reset style colors in case rows are still select
        // (prevent issue where insert buttons only enable/disable when selection is done, 
        // but not when paused/stopped even though this would be valid)
        if (this.amount_splits > 0) {
            for (let i = 0; i < this.amount_splits; i++) {
                this.table.rows[i].style.color = "";
            }
        }

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
                // save times
                if (this.amount_splits > 0) {
                    var split_names = [], split_times = [];
                    for (let i = 0; i < this.table.rows.length; i++) {
                        split_names[i] = this.table.rows[i].cells[0].innerHTML;
                        split_times[i] = this.table.rows[i].cells[1].innerHTML;
                    }
                    let dict = {};
                    dict.split_names = split_names;
                    dict.split_times = split_times;
                    write_file(this.current_game + ".txt", JSON.stringify(game), "utf-8");
                }
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
            e.style.color = "";
            this.amount_selected--;
        }

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

        this.user_input.value = "";
    }

    key_listener() {
        // key listener
        document.addEventListener("keydown", event => {
            const key = event.key;
            if (key == "1") {
                if (this.running) {
                    this.split();
                }
                else {
                    this.start_timer();
                }
            }
            // toggle
            else if (key == "2") {
                let visible = this.split_elements[0].style.visibility == "hidden" ? false : true;
                for (let i = 0; i < this.split_elements.length; i++) {
                    if (visible) {
                        this.split_elements[i].style.visibility = "hidden";
                    }
                    else {
                        this.split_elements[i].removeAttribute("style");
                    }
                }
            }
            else if (key == "3") {
                this.stop_timer();
            }
            else if (key == "5") {
                this.pause_timer();
            }
            else if (key == "Enter") {
                this.add_split();
            }
        });
    }
    
    set_game() {
        this.current_game.innerHTML = this.user_input.value; 
        this.user_input.value = "";
        this.user_input.focus();
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

        this.split_elements = document.getElementsByClassName("splits");

        this.current_game = document.getElementById("game");
        this.set_game_button = document.getElementById("set-game-button");
        this.set_game_button.onclick = (() => this.set_game()).bind(this);

        // start listening to keys after everything was loaded
        this.key_listener();
    }
}

const jsplit = new Timer();
window.addEventListener("load", jsplit.main());