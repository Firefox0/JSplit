import * as time from "./time.js";

const SPLIT_NAME = 0;
const SPLIT_TIME = 1;
const COMPARISON = 2;
const PB_TIME = 3;
const BS_TIME = 4;
const GOLD = "rgb(255, 215, 0)";

class Timer {

    timer_running = false;
    current_row = 0;
    splits_selected = 0;

    splits_exist() {
        return this.splits.rows.length > 0;
    }

    run_completed() {
        if (this.splits_exist()) {
            if (this.current_row === this.splits.rows.length) {
                return true;
            }
        }
        return false;
    }

    reset_splits_color() {
        for (let i = 0; i < this.splits.rows.length; i++) {
            this.splits.rows[i].style.color = "";
        }
        this.splits_selected = 0;
        this.insert_above_button.disabled = true;
        this.insert_below_button.disabled = true;
    }

    start_timer() {

        this.stop_button.disabled = false;
        this.pause_button.disabled = false;
        this.append_button.disabled = true;
        this.insert_above_button.disabled = true;
        this.insert_below_button.disabled = true;
        this.reset_button.disabled = false;
        this.start_button.disabled = true;
        this.timer_running = true;

        if (this.splits_exist()) {
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
                if (this.splits_exist()) {  
                    let gold_exists = 0;
                    for (let i = 0; i < this.splits.rows.length; i++) {
                        let current_comparison_color = this.splits.rows[i].cells[COMPARISON].style.color;
                        if (current_comparison_color == GOLD) {
                            gold_exists = 1;
                            break;
                        }
                    }
                    if (gold_exists || !this.splits.rows[this.splits.rows.length - 1].cells[COMPARISON].innerText.includes("+")) {
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
        let current_time_cell = this.splits.rows[this.current_row].cells[SPLIT_TIME];
        current_time_cell.innerText = current_time; 

        // calculate time difference, but only if previous times exist
        let previous_time = this.splits.rows[this.current_row].cells[PB_TIME];
        if (previous_time.innerText !== "/") {
            let previous_time_diff = time.time_difference(current_time, previous_time.innerText);
            let best_segment = this.splits.rows[this.current_row].cells[BS_TIME];
            let best_segment_diff = time.time_difference(current_time, best_segment.innerText);
            let comparison_cell = this.splits.rows[this.current_row].cells[COMPARISON];
            // check if faster than best segment
            if (best_segment_diff.includes("-")) {
                comparison_cell.innerText = best_segment_diff;
                // golden color
                comparison_cell.style.color = GOLD;
            }
            else {
                comparison_cell.innerText = previous_time_diff;
                comparison_cell.style.color = comparison_cell.innerText.includes("-") ? "green" : "red";
            }
        }
            
        this.current_row++;
        // pause when all splits are done
        if (this.run_completed()) {
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

    add_split(row_index = -1) {
        this.split_button.disabled = false;

        let content = this.user_input.value;
        if (content) {
            // add row and keep count of splits
            let row = this.splits.insertRow(row_index);
            row.onclick = (() => this.select_row(row)).bind(this);
            let split_name = row.insertCell(SPLIT_NAME);
            split_name.innerText = content;
            // create cells for current time, comparison and previous time
            for (let i = 1; i <= 4; i++) {
                let new_row = row.insertCell(i);
                new_row.style.textAlign = "right"
                new_row.innerText = "/";
            }
            // clear form
            this.user_input.value = "";
        }
        // focus after add was pressed
        this.user_input.focus();
        this.set_transparent_background();
    }
    
    set_game() {
        if (this.current_game.style.visibility == "hidden") {
            this.current_game.style.visibility = "";
        }
        this.current_game.innerText = this.user_input.value; 
        this.user_input.value = "";
        this.user_input.focus();
    }
    
    reset() {
        this.stop_button.disabled = true;
        this.pause_button.disabled = true;
        this.delete_button.disabled = true;
        this.insert_above_button.disabled = true;
        this.insert_below_button.disabled = true;
        this.reset_button.disabled = true;
        this.start_button.disabled = false;
        this.append_button.disabled = false;
        
        this.user_input.value = "";
        this.timer_time.innerText = "00:00:00.000";
        this.delete_splits();
        
        this.timer_running = false;
        this.start_time = null;
        this.current_row = 0;
        this.splits_selected = 0;

        if (this.current_game.style.visibility != "hidden") {
            this.current_game.style.visibility = "hidden";
        }
    }
    
    delete_split() {
        for (let i = 0; i < this.splits.rows.length; i++) {
            if (this.splits.rows[i].style.color == "black") {
                this.splits.deleteRow(i);
                this.splits_selected--;
                // decrement to make sure that you iterate through all elements (otherwise skip after deletion)
                i--;
            }
        }
        this.delete_button.disabled = true;
        // set transparent background when no splits were created (prevent black spot)
        if (!this.splits_exist()) {
            this.splits.style.background = "transparent";
        }
        if (!this.splits_selected) {
            this.insert_above_button.disabled = true;
            this.insert_below_button.disabled = true;
        }
    }
    
    insert_split(offset = 0) {
        for (let i = 0; i < this.splits.rows.length; i++) {
            if (this.splits.rows[i].style.color == "black") {
            this.add_split(i + offset);
            this.reset_splits_color();
            return;
            }
        }
    }
    
    change_background(image_path) {
        if (image_path) {
            this.background.background = image_path;
        }
    }
    
    set_transparent_background() {
        // set background when there is atleast one split (prevent black spot)
        if (this.splits_exist()) {
            if (this.splits.style.background == "transparent") {
                this.splits.style.background = "rgba(0, 0, 0, 0.25)";
            }
        }
    }

    clear_run() {
        // clear current times
        for (let i = 0; i < this.splits.rows.length; i++) {
            this.splits.rows[i].cells[SPLIT_TIME].innerText = "/";
            this.splits.rows[i].cells[COMPARISON].innerText = "/";
            this.splits.rows[i].cells[COMPARISON].style.color = "";
        }
    }
    
    delete_splits() {
        while (this.splits.rows.length) {
            this.splits.deleteRow(0);
        }
        // prevent black spot
        this.splits.style.background = "transparent";
    }
    
    move_current_times() {
        if (this.run_completed()) {
            // move the current times to the previous times
            for (let i = 0; i < this.splits.rows.length; i++) {
                // only move valid times
                if (!this.splits.rows[i].cells[SPLIT_TIME].innerText.includes("/")) {
                    // copy content of current time to previous time
                    let current_time = this.splits.rows[i].cells[SPLIT_TIME].innerText;
                    let comparison_cell = this.splits.rows[i].cells[COMPARISON];
                    let best_segment_cell = this.splits.rows[i].cells[BS_TIME];
                    // only change best segment if its a gold or empty
                    if (comparison_cell.style.color == GOLD || best_segment_cell.innerText == "/") {
                        best_segment_cell.innerText = current_time;
                    }
                    this.splits.rows[i].cells[PB_TIME].innerText = current_time;
                    // clear current time and time comparisons
                    this.splits.rows[i].cells[SPLIT_TIME].innerText = "/";
                    this.splits.rows[i].cells[COMPARISON].innerText = "/";
                }
            }
        }
        else {
            // if run was not completed, then only move golds
            for (let i = 0; i < this.splits.rows.length; i++) {
                let comparison_cell = this.splits.rows[i].cells[COMPARISON];
                let best_segment_cell = this.splits.rows[i].cells[BS_TIME];
                if (comparison_cell.style.color == GOLD || best_segment_cell.innerText == "/") {
                    best_segment_cell.innerText = this.splits.rows[i].cells[SPLIT_TIME].innerText;
                }
            }
        }
    }

    select_row(e) {
        // default color is empty even though it looks white
        if (e.style.color != "black") {
            e.style.color = "black";
            this.splits_selected++;
        }
        else {
            e.style.color = "";
            this.splits_selected--;
        }
        if (this.splits_selected > 0) {
            if (!this.timer_running) {
                if (this.splits_selected == 1) {
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
        // only if directory was chosen, maybe remember this
        if (directory) {
            this.append_button.disabled = false;
            // save times
            if (this.splits_exist()) {
                let split_names = [];
                let split_times = []; 
                let best_segments = [];
                
                let current_time = null;
                let comparison = null;
                let best_segment = null; 
                
                for (let i = 0; i < this.splits.rows.length; i++) {                    
                    split_names[i] = this.splits.rows[i].cells[SPLIT_NAME].innerText;
                    current_time = this.splits.rows[i].cells[SPLIT_TIME].innerText;

                    if (this.run_completed()) {
                        split_times[i] = current_time;
                    }
                    else {
                        split_times[i] = split_times[i] == "/" ? current_time : this.splits.rows[i].cells[PB_TIME].innerText;
                    }

                    comparison = this.splits.rows[i].cells[COMPARISON];
                    best_segment = this.splits.rows[i].cells[BS_TIME].innerText;
                    best_segments[i] = comparison.style.color == GOLD ? current_time : best_segment;
                }
                
                let dict = {};
                dict["game_name"] = this.current_game.innerText;
                dict["split_names"] = split_names;
                dict["split_times"] = split_times;
                dict["best_segment_times"] = best_segments;
                write_file(directory, JSON.stringify(dict), "utf-8");
            }
            this.move_current_times();
            this.stop_timer();
            this.clear_run();
        }
    }
    
    load_split(splits_json) {
        if (splits_json) {
            this.split_button.disabled = false;
            this.delete_splits();
            let splits = JSON.parse(splits_json);
            this.current_game.innerText = splits["game_name"];
            this.current_game.style.visibility = "";
            for (let i = 0; i < splits["split_names"].length; i++) {
                let row = this.splits.insertRow(-1);
                row.onclick = (() => this.select_row(row)).bind(this);

                row.insertCell(SPLIT_NAME).innerText = splits["split_names"][i];
                row.insertCell(SPLIT_TIME).innerText = "/";
                row.insertCell(COMPARISON).innerText = "/";                
                row.insertCell(PB_TIME).innerText = splits["split_times"][i];
                row.insertCell(BS_TIME).innerText = splits["best_segment_times"][i];

                for (let i = 1; i < row.length; i++) {
                    row.cells[i].style.textAlign = "right";
                }
            }
            this.set_transparent_background();
        }
    }

    start_ipc() {
        setInterval(() => ipc_send("get-load-split", ""), 10);
        setInterval(() => ipc_send("get-image-path", ""), 10);
        
        ipc_receive("get-load-split-response", this.load_split.bind(this));
        ipc_receive("get-save-split-response", this.save_split.bind(this));
        ipc_receive("get-directory-response", this.pick_directory.bind(this));
        ipc_receive("get-image-path-response", this.change_background.bind(this));
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
                            this.splits_exist() ?  this.split() : this.pause_timer();
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

        this.splits = document.getElementById("table");
        this.splits.style.background = "transparent";

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
        this.insert_above_button.onclick = this.insert_split.bind(this);
        this.insert_above_button.disabled = true;

        this.insert_below_button = document.getElementById("insert-below-button");
        this.insert_below_button.onclick = (() => this.insert_split(1)).bind(this);
        this.insert_below_button.disabled = true;

        this.reset_button = document.getElementById("reset-button");
        this.reset_button.onclick = this.reset.bind(this);
        this.reset_button.disabled = true;

        this.split_elements = document.getElementsByClassName("split-buttons");

        this.current_game = document.getElementById("game");
        this.current_game.style.visibility = "hidden";

        this.set_game_button = document.getElementById("set-game-button");
        this.set_game_button.onclick = this.set_game.bind(this);

        this.background = document.getElementById("background-image");

        this.start_ipc();
        this.key_listener();
    }
}

const jsplit = new Timer();
window.addEventListener("load", jsplit.main());