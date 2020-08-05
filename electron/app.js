import * as time from "./time.js";

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
        
        let interval_id = setInterval((() => {
            // if stop button was pressed
            if (!this.running) {
                // if splits exist
                if (this.table.rows.length > 0) {
                    // save as long as no time loss (time save or no previous time)
                    if (!this.table.rows[this.table.rows.length - 1].cells[2].innerText.includes("+")) {
                        this.request_save_split();
                    }
                }
                // end interval, so it doesnt repeatedly request if you want to save, also stop looping even if no
                clearInterval(interval_id);
                return;
            }
            // get current time
            let now = new Date().getTime();
            let difference = now - this.start_time;

            let hours = time.get_hours(difference);
            let minutes = time.get_minutes(difference);
            let seconds = time.get_seconds(difference);
            let milliseconds = time.get_milliseconds(difference);

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
        // clear current times
        for (let i = 0; i < this.table.rows.length; i++) {
            this.table.rows[i].cells[1].innerText = "/";
            this.table.rows[i].cells[2].innerText = "/";
            this.table.rows[i].cells[2].style.color = "";
        }
    }

    pause_timer() {
        this.start_button.disabled = false;
        this.pause_button.disabled = true;
        this.running = false;
        this.pause_time = new Date().getTime();
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
        // save current split time
        this.table.rows[this.current_row].cells[1].innerHTML = this.timer_time.innerText;
        // calculate time difference, but only if previous times exist
        let previous_time = this.table.rows[this.current_row].cells[3].innerText;
        if (previous_time !== "/") {
            let diff_cell = this.table.rows[this.current_row].cells[2];
            diff_cell.innerText = time.time_difference(this.table.rows[this.current_row].cells[1].innerText, 
                previous_time);
                diff_cell.style.color = diff_cell.innerText.includes("+") ? "red" : "green";
        }
            
        this.current_row++;
        // pause when all splits are done
        if (this.current_row == this.table.rows.length) {
            this.current_row = 0;
            this.split_button.disabled = true;
            this.pause_timer();
        }
    }

    set_transparent_background() {
        // set background when there is atleast one split (prevent black spot)
        if (this.table.rows.length > 0) {
            if (this.table.style.background == "transparent") {
                this.table.style.background = "rgba(0, 0, 0, 0.25)";
            }
        }
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
            row.insertCell(1).innerText = "/";
            // placeholder for comparison
            row.insertCell(2).innerText = "/";
            // placeholder for saved time
            row.insertCell(3).innerText = "/";
            // clear form
            this.user_input.value = "";
        }
        // focus after add was pressed
        this.user_input.focus();
        this.set_transparent_background();
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
        // set transparent background when no splits were created (prevent black spot)
        if (this.table.rows.length == 0) {
            this.table.style.background = transparent;
        }
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
        this.delete_splits();
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

    delete_splits() {
        while (this.table.rows.length) {
            this.table.deleteRow(0);
        }
        // prevent black spot
        this.table.style.background = "transparent";
    }

    load_split(splits_json) {
        if (splits_json) {
            this.split_button.disabled = false;
            this.delete_splits();
            let splits = JSON.parse(splits_json);
            this.current_game.innerText = splits["game_name"];
            for (let i = 0; i < splits["split_names"].length; i++) {
                let row = this.table.insertRow(-1);
                row.onclick = (() => this.select_row(row)).bind(this);
                row.insertCell(0).innerHTML = splits["split_names"][i];
                // placeholder for future split times
                row.insertCell(1).innerHTML = "/";
                // placeholder for comparison
                row.insertCell(2).innerHTML = "/";
                row.insertCell(3).innerHTML = splits["split_times"][i];
            }
            this.set_transparent_background();
        }
    }

    change_background(image_path) {
        if (image_path) {
            let background = document.getElementById("background-image");
            background.background = image_path;
        }
    }

    start_ipc() {
        // request context menu item state
        setInterval(() => ipc_send("get-load-split", ""), 10);
        // check if image path was chosen 
        setInterval(() => ipc_send("get-image-path", ""), 10);

        // listen on specific message identifies
        ipc_receive("get-load-split-response", this.load_split.bind(this));
        ipc_receive("get-save-split-response", this.save_split.bind(this));
        ipc_receive("get-directory-response", this.pick_directory.bind(this));
        ipc_receive("get-image-path-response", this.change_background.bind(this));
    }
    
    request_save_split() {
        // request to show dialog
        ipc_send("get-save-split", "");
    }
    
    request_pick_directory() {
        ipc_send("get-directory", "");
    }

    save_split(state) {
        // if yes was pressed
        if (state == "0") {
            // request to choose directory
            this.request_pick_directory();
        }
    }

    pick_directory(directory) {
        // only if directory was chosen, maybe remember this
        if (directory) {
            this.append_button.disabled = false;
            // save times
            if (this.table.rows.length > 0) {
                var split_names = [], split_times = [];
                for (let i = 0; i < this.table.rows.length; i++) {                    
                    split_names[i] = this.table.rows[i].cells[0].innerHTML;
                    split_times[i] = this.table.rows[i].cells[1].innerHTML;
                }
                let dict = {};
                dict["game_name"] = this.current_game.innerText;
                dict["split_names"] = split_names;
                dict["split_times"] = split_times;
                write_file(directory, JSON.stringify(dict), "utf-8");
                this.current_times_to_previous();
            }
        }
    }

    current_times_to_previous() {
        // move the current times to the previous times
        for (let i = 0; i < this.table.rows.length; i++) {
            // copy content of current time to previous time
            this.table.rows[i].cells[3].innerText = this.table.rows[i].cells[1].innerText;
            // clear current time and time comparisons
            this.table.rows[i].cells[1].innerText = "/";
            this.table.rows[i].cells[2].innerText = "/";
        }
    }

    main() {
        this.timer_time = document.getElementById("time");
        this.start_button = document.getElementById("start-button");
        // function(){} so js doesnt call the function, also bind it to class so it can 
        // access class attributes
        this.start_button.onclick = this.start_timer.bind(this);

        this.stop_button = document.getElementById("stop-button");
        this.stop_button.onclick = this.stop_timer.bind(this);
        this.stop_button.disabled = true;

        this.pause_button = document.getElementById("pause-button");
        this.pause_button.onclick = this.pause_timer.bind(this);
        this.pause_button.disabled = true;

        this.table = document.getElementById("table");
        this.user_input = document.getElementById("user-input");

        this.append_button = document.getElementById("append-button");
        this.append_button.onclick = (() => this.add_split()).bind(this);

        this.split_button = document.getElementById("split-button");
        this.split_button.onclick = this.split.bind(this);
        this.split_button.disabled = true;

        this.delete_button = document.getElementById("delete-button");
        this.delete_button.onclick = this.delete_split.bind(this);
        this.delete_button.disabled = true;

        this.insert_above_button = document.getElementById("insert-above-button");
        this.insert_above_button.onclick = this.insert_above.bind(this);
        this.insert_above_button.disabled = true;

        this.insert_below_button = document.getElementById("insert-below-button");
        this.insert_below_button.onclick = this.insert_below.bind(this);
        this.insert_below_button.disabled = true;

        this.reset_button = document.getElementById("reset-button");
        this.reset_button.onclick = this.reset.bind(this);

        this.split_elements = document.getElementsByClassName("split-buttons");

        this.current_game = document.getElementById("game");
        this.set_game_button = document.getElementById("set-game-button");
        this.set_game_button.onclick = this.set_game.bind(this);

        // start inter process communication (receiving)
        this.start_ipc();

        // start listening to keys after everything was loaded
        this.key_listener();
    }
}

const jsplit = new Timer();
window.addEventListener("load", jsplit.main());