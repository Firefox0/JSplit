import * as time from "./time.js";
import * as common from "./common.js";

class Timer {

    timer_running = false;
    current_row = 0;

    start_timer() {

        this.start_button.disabled = true;
        this.stop_button.disabled = false;
        this.pause_button.disabled = false;
        this.timer_running = true;

        if (common.splits_exist(this.splits)) {
            for (let i = 0; i < this.splits.rows.length; i++) {
                this.splits.rows[i].style.color = "";
            }
        }

        if (!this.start_time) {
            this.start_time = new Date().getTime();
        }
        else if (this.pause_time) {
            this.start_time += new Date().getTime() - this.pause_time;
            this.pause_time = null;
        }
        
        let interval_id = setInterval((() => {
            if (!this.timer_running) {
                if (common.splits_exist(this.splits)) {  
                    let gold_exists = 0;
                    for (let i = 0; i < this.splits.rows.length; i++) {
                        let current_comparison_color = this.splits.rows[i].cells[common.COMPARISON].style.color;
                        if (current_comparison_color == common.GOLD) {
                            gold_exists = 1;
                            break;
                        }
                    }
                    if (gold_exists || !this.splits.rows[this.splits.rows.length - 1].cells[common.COMPARISON].innerText.includes("+")) {
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
            this.timer_time.innerText = hours + ":" + minutes + ":" + seconds + "." + milliseconds;
            
        }).bind(this));
    }
    
    split() {
        // save current split time
        let current_time = time.remove_time_bloat(this.timer_time.innerText);
        let current_time_cell = this.splits.rows[this.current_row].cells[common.SPLIT_TIME];
        current_time_cell.innerText = current_time; 

        // calculate time difference, but only if previous times exist
        let previous_time = this.splits.rows[this.current_row].cells[common.PB_TIME];
        if (previous_time.innerText !== "/") {
            let previous_time_diff = time.time_difference(current_time, previous_time.innerText);
            let best_segment = this.splits.rows[this.current_row].cells[common.BS_TIME];
            let best_segment_diff = time.time_difference(current_time, best_segment.innerText);
            let comparison_cell = this.splits.rows[this.current_row].cells[common.COMPARISON];
            // check if faster than best segment
            if (best_segment_diff.includes("-")) {
                comparison_cell.innerText = best_segment_diff;
                // golden color
                comparison_cell.style.color = common.GOLD;
            }
            else {
                comparison_cell.innerText = previous_time_diff;
                comparison_cell.style.color = comparison_cell.innerText.includes("-") ? "green" : "red";
            }
        }
            
        this.current_row++;
        // pause when all splits are done
        if (common.run_completed(this.current_row, this.splits)) {
            this.split_button.disabled = true;
            this.pause_timer();
        }
    }
    
    stop_timer() {
        this.start_button.disabled = false;
        this.stop_button.disabled = true;
        this.pause_button.disabled = true;
        
        this.timer_running = false;
        this.start_time = null;
        this.timer_time.innerText = "00:00:00.000";
        this.current_row = 0;
    }
    
    pause_timer() {
        this.start_button.disabled = false;
        this.pause_button.disabled = true;

        this.timer_running = false;

        this.pause_time = new Date().getTime();
    }
    
    change_background(image_path) {
        if (image_path) {
            this.background.background = image_path;
        }
    }
   
    clear_run() {
        // clear current times
        for (let i = 0; i < this.splits.rows.length; i++) {
            this.splits.rows[i].cells[common.SPLIT_TIME].innerText = "/";
            this.splits.rows[i].cells[common.COMPARISON].innerText = "/";
            this.splits.rows[i].cells[common.COMPARISON].style.color = "";
        }
    }

    move_current_times() {
        if (common.run_completed(this.current_row, this.splits)) {
            // move the current times to the previous times
            for (let i = 0; i < this.splits.rows.length; i++) {
                // only move valid times
                if (!this.splits.rows[i].cells[common.SPLIT_TIME].innerText.includes("/")) {
                    // copy content of current time to previous time
                    let current_time = this.splits.rows[i].cells[common.SPLIT_TIME].innerText;
                    let comparison_cell = this.splits.rows[i].cells[common.COMPARISON];
                    let best_segment_cell = this.splits.rows[i].cells[common.BS_TIME];
                    // only change best segment if its a gold or empty
                    if (comparison_cell.style.color == common.GOLD || best_segment_cell.innerText == "/") {
                        best_segment_cell.innerText = current_time;
                    }
                    this.splits.rows[i].cells[common.PB_TIME].innerText = current_time;
                    // clear current time and time comparisons
                    this.splits.rows[i].cells[common.SPLIT_TIME].innerText = "/";
                    this.splits.rows[i].cells[common.COMPARISON].innerText = "/";
                }
            }
        }
        else {
            // if run was not completed, then only move golds
            for (let i = 0; i < this.splits.rows.length; i++) {
                let comparison_cell = this.splits.rows[i].cells[common.COMPARISON];
                let best_segment_cell = this.splits.rows[i].cells[common.BS_TIME];
                if (comparison_cell.style.color == common.GOLD || best_segment_cell.innerText == "/") {
                    best_segment_cell.innerText = this.splits.rows[i].cells[common.SPLIT_TIME].innerText;
                }
            }
        }
    }
    
    toggle_element(element) {
        elemen.style.visibility = element.style.visibility == "hidden" ? "" : "hidden";
    }

    toggle_buttons() {
        this.toggle_element(this.user_input);
        for (let i = 0; i < this.split_elements.length; i++) {
            this.toggle_element(this.split_elements[i]);
        }
    }
    
    request_save_split() {
        // request to show dialog
        ipc_send("get-save-split", "");
    }
    
    request_pick_directory() {
        ipc_send("get-directory", "");
    }
    
    save_split(state) {
        if (state == "0") {
            this.request_pick_directory();
        }
        else {
            this.clear_run();
        }
    }
    
    pick_directory(directory) {
        if (directory) {
            if (common.splits_exist(this.splits)) {
                let dict = common.table_to_dict(this.current_row, this.splits);
                write_file(directory, JSON.stringify(dict), "utf-8");
            }
            this.move_current_times();
            this.stop_timer();
            this.clear_run();
        }
    }
    
    load_split(data, json=true) {
        if (data) {
            this.split_button.disabled = false;
            common.delete_splits(this.splits);
            let splits = json ? JSON.parse(data) : data;
            this.current_game.innerText = splits["game_name"];
            this.current_game.style.visibility = "";
            for (let i = 0; i < splits["split_names"].length; i++) {
                let row = this.splits.insertRow(-1);
                row.onclick = (() => this.select_row(row)).bind(this);

                row.insertCell(common.SPLIT_NAME).innerText = splits["split_names"][i];
                row.insertCell(common.SPLIT_TIME).innerText = "/";
                row.insertCell(common.COMPARISON).innerText = "/";                
                row.insertCell(common.PB_TIME).innerText = splits["split_times"][i];
                row.insertCell(common.BS_TIME).innerText = splits["best_segment_times"][i];

                for (let i = 1; i < row.length; i++) {
                    row.cells[i].style.textAlign = "right";
                }
            }
            common.set_transparent_background(this.splits);
        }
    }

    transfer_splits() {
        let dict = common.table_to_dict(this.current_row, this.splits);
        ipc_send("request-splits-response", dict);
    }

    start_ipc() {
        setInterval(() => ipc_send("get-load-split", ""), 10);
        setInterval(() => ipc_send("get-image-path", ""), 10);
        
        ipc_receive("get-load-split-response", this.load_split.bind(this));
        ipc_receive("get-save-split-response", this.save_split.bind(this));
        ipc_receive("get-directory-response", this.pick_directory.bind(this));
        ipc_receive("get-image-path-response", this.change_background.bind(this));
        ipc_receive("request-splits", this.transfer_splits.bind(this));
        ipc_receive("edited-splits", (arg) => {
            this.load_split(arg, false);
        })
    }
    
    key_listener() {
            document.addEventListener("keydown", event => {
            const key = event.key;
            if (key === "Enter") {
                this.add_split();
            }
            else if (this.user_input !== document.activeElement) {
                switch (key) {
                    case ("1"): 
                        if (this.timer_running) {
                            common.splits_exist(this.splits) ?  this.split() : this.pause_timer();
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

    main() {
        this.timer_time = document.getElementById("time");

        this.start_button = document.getElementById("start-button");
        this.start_button.onclick = this.start_timer.bind(this);

        this.stop_button = document.getElementById("stop-button");
        this.stop_button.onclick = this.stop_timer.bind(this);
        this.stop_button.disabled = true;

        this.pause_button = document.getElementById("pause-button");
        this.pause_button.onclick = this.pause_timer.bind(this);
        this.pause_button.disabled = true;

        this.split_button = document.getElementById("split-button");
        this.split_button.onclick = this.split.bind(this);
        this.split_button.disabled = true;

        this.background = document.getElementById("background-image");

        this.splits = document.getElementById("table");
        this.splits.style.background = "transparent";
        
        this.current_game = document.getElementById("game");
        this.current_game.style.visibility = "hidden";

        this.start_ipc();
        this.key_listener();
    }
}

const jsplit = new Timer();
window.addEventListener("load", jsplit.main());