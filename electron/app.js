class Timer {

    // timer running
    running = false;
    // current row while splitting
    current_row = 0;
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
        if (this.table.rows.length > 0) {
            for (let i = 0; i < this.table.rows.length; i++) {
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
                if (this.table.rows.length > 0) {
                    var split_names = [], split_times = [];
                    for (let i = 0; i < this.table.rows.length; i++) {
                        split_names[i] = this.table.rows[i].cells[0].innerHTML;
                        split_times[i] = this.table.rows[i].cells[1].innerHTML;
                    }
                    let dict = {};
                    dict.split_names = split_names;
                    dict.split_times = split_times;
                    write_file(this.current_game.innerText + ".txt", JSON.stringify(dict), "utf-8");
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
            // placeholder for comparison
            row.insertCell(2);
            // placeholder for saved time
            row.insertCell(3);
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

    time_to_ms(time) {
        // for format 00:00:00.000

        var new_parsed_times = [];
        // get hours and minutes
        let first_parse = time.split(":");
        for (let i = 0; i < 2; i++) {
            new_parsed_times[i] = parseInt(first_parse[i]);
        }
        // get seconds and milliseconds
        let second_parse = first_parse[2].split(".");
        new_parsed_times[2] = parseInt(second_parse[0]);
        new_parsed_times[3] = parseInt(second_parse[1]);
        // total time in ms
        return new_parsed_times[0] * 3600000 + new_parsed_times[1] * 60000 
                + new_parsed_times[2] * 1000 + new_parsed_times[3];
    
    }

    ms_to_time(ms) {
        let h = Math.floor(ms/1000/60/60);
        let m = Math.floor((ms/1000/60/60 - h)*60);
        let s = Math.floor(((ms/1000/60/60 - h)*60 - m)*60);
        let ms_ = ms % 1000;

        h = h < 10 ? "0" + h : h;
        m = m < 10 ? "0" + m : m;
        s = s < 10 ? "0" + s : s;

        return h + ":" + m + ":" + s + "." + ms_;
    }

    remove_time_bloat(time) {
        let parsed = time.split(":");
        let h = parsed[0];
        let m = parsed[1];
        var final_time = parsed[2];
        if (m !== "00") {
            final_time = m + ":" + final_time;
            if (h !== "00") {
                final_time = h + ":" + final_time;
            }
        }
        return final_time;
    }

    time_difference(time1, time2) {

        // convert times to ms
        let time1_ms = this.time_to_ms(time1);
        let time2_ms = this.time_to_ms(time2);

        var sign = "-";
        var final_time_ms = null;
        if (time1_ms < time2_ms) {
            // time saved, dont change sign
            final_time_ms = time2_ms - time1_ms;
        }
        else {
            // time loss, change sign
            sign = "+";
            final_time_ms = time1_ms - time2_ms;
        }

        let time_diff = this.ms_to_time(time1_ms - time2_ms);
        let clear_time = this.remove_time_bloat(time_diff); 
        return sign + clear_time;
    }

    split() {
        // save current split time
        this.table.rows[this.current_row].cells[1].innerHTML = this.timer_time.innerHTML;
        // calculate time difference
        let diff_cell = this.table.rows[this.current_row].cells[2];
        diff_cell.innerText = this.time_difference(this.table.rows[this.current_row].cells[1].innerText, 
                                        this.table.rows[this.current_row].cells[3].innerText);
        diff_cell.style.color = diff_cell.innerText.includes("+") ? "red" : "green";

        this.current_row++;
        // pause when all splits are done
        if (this.current_row == this.table.rows.length) {
            this.split_button.disabled = true;
            this.pause_timer();
        }
    }

    delete_split() {
        for (let i = 0; i < this.table.rows.length; i++) {
            if (this.table.rows[i].style.color == "black") {
                this.table.deleteRow(i);
                // decrement to make sure that you iterate through all elements (otherwise skip after deletion)
                i--;
            }
        }
        this.delete_button.disabled = true;
    }

    insert_above() {
        for (let i = 0; i < this.table.rows.length; i++) {
            if (this.table.rows[i].style.color == "black") {
                this.add_split(i);
                return;
            }
        }
    }

    insert_below() {
        for (let i = 0; i < this.table.rows.length; i++) {
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
        this.reset_splits();
        this.stop_button.disabled = true;
        this.pause_button.disabled = true;
        this.delete_button.disabled = true;
        this.insert_above_button.disabled = true;
        this.insert_below_button.disabled = true;

        this.user_input.value = "";
    }
    
    toggle_buttons() {
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

    key_listener() {

        // key listener
        document.addEventListener("keydown", event => {
            // so you can add listened keys to split names without starting the timer
            const key = event.key;
            if (key === "Enter") {
                this.add_split();
            }
            else if (this.user_input !== document.activeElement) {
                switch (key) {
                    case ("1"): 
                        if (this.running) {
                            if (this.table.rows.length > 0) {
                                this.split();
                            }
                            else {
                                this.pause_timer();
                            }
                        }
                        else {
                            this.start_timer();
                        }
                        break;
                    case ("2"):
                        this.toggle_buttons();
                        break;
                    case ("3"):
                        this.stop_timer();
                        break;
                    case ("5"):
                        this.pause_timer();
                        break;
                    case ("Enter"):
                        this.add_split();
                        break;
                    default:
                        console.log(key);
                }
            }
        });
    }
    
    set_game() {
        this.current_game.innerHTML = this.user_input.value; 
        this.user_input.value = "";
        this.user_input.focus();
    }

    reset_splits() {
        while (this.table.rows.length) {
            this.table.deleteRow(0);
        }
    }

    load_split(splits_json) {
        if (splits_json) {
            this.split_button.disabled = false;
            this.reset_splits();
            let splits = JSON.parse(splits_json);
            for (let i = 0; i < splits["split_names"].length; i++) {
                let row = this.table.insertRow(-1);
                row.onclick = (() => this.select_row(row)).bind(this);
                row.insertCell(0).innerHTML = splits["split_names"][i];
                // placeholder for future split times
                row.insertCell(1).innerHTML = "-";
                // placeholder for comparison
                row.insertCell(2).innerHTML = "-";
                row.insertCell(3).innerHTML = splits["split_times"][i];
            }
        }
    }

    start_ipc() {
        // request context menu item state
        setInterval(() => ipc_send("get-load-split", ""), 10);
        ipc_receive("get-load-split-response", this.load_split.bind(this));
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

        // start inter process communication
        this.start_ipc();
        // start listening to keys after everything was loaded
        this.key_listener();
    }
}

const jsplit = new Timer();
window.addEventListener("load", jsplit.main());