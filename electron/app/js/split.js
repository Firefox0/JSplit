import * as common from "./common.js";

class Split {
    
    splits_selected = 0;

    reset() {
        this.delete_button.disabled = true;
        this.insert_above_button.disabled = true;
        this.insert_below_button.disabled = true;
        this.reset_button.disabled = true;
        this.append_button.disabled = false;
        
        this.user_input.value = "";
        this.delete_splits();
        
        this.current_row = 0;
        this.splits_selected = 0;
    
        if (this.current_game.style.visibility != "hidden") {
            this.current_game.style.visibility = "hidden";
        }
    }

    delete_splits() {
        while (this.splits.rows.length) {
            this.splits.deleteRow(0);
        }
        // prevent black spot
        this.splits.style.background = "transparent";
    }

    set_game() {
        if (this.current_game.style.visibility == "hidden") {
            this.current_game.style.visibility = "";
        }
        this.current_game.innerText = this.user_input.value; 
        this.user_input.value = "";
        this.user_input.focus();

        this.reset_button.disabled = false;
    }
    
    add_split(row_index = -1) {
        let content = this.user_input.value;
        if (content) {
            // add row and keep count of splits
            let row = this.splits.insertRow(row_index);
            row.onclick = (() => this.select_row(row)).bind(this);
            let split_name = row.insertCell(common.SPLIT_NAME);
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
        this.reset_splits_color();
        this.set_transparent_background();

        this.reset_button.disabled = false;
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
        if (!common.splits_exist(this.splits)) {
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

    reset_splits_color() {
        for (let i = 0; i < this.splits.rows.length; i++) {
            this.splits.rows[i].style.color = "";
        }
        this.splits_selected = 0;
        this.insert_above_button.disabled = true;
        this.insert_below_button.disabled = true;
    }

    select_row(e) {
        if (e.style.color != "black") {
            e.style.color = "black";
            this.splits_selected++;
        }
        else {
            e.style.color = "";
            this.splits_selected--;
        }
        if (this.splits_selected > 0) {
            if (this.splits_selected == 1) {
                this.insert_above_button.disabled = false;
                this.insert_below_button.disabled = false;
            }
            else {
                this.insert_above_button.disabled = true;
                this.insert_below_button.disabled = true;
            }   
            this.delete_button.disabled = false;
        }
        else {
            this.insert_above_button.disabled = true;
            this.insert_below_button.disabled = true;
            this.delete_button.disabled = true;
        }
    }

    set_transparent_background() {
        // set background when there is atleast one split (prevent black spot)
        if (common.splits_exist(this.splits)) {
            if (this.splits.style.background == "transparent") {
                this.splits.style.background = "rgba(0, 0, 0, 0.25)";
            }
        }
    }

    get_splits() {
        ipc_send("request-splits", "");
    }

    start_ipc() {
        ipc_receive("request-splits-response", (arg => {
            common.load_split(arg, this.splits, this.current_game, this, false);
            try {
                if (common.splits_exist(this.splits)) {
                    common.set_transparent_background(this.splits);
                }
            }
            catch {};
        }).bind(this));
        ipc_receive("set-loaded-splits", arg => {
            common.load_split(arg, this.splits, this.current_game, this, true);
        })
    }

    save() {
        ipc_send("edited-splits", common.table_to_dict(this.current_row, this.splits, this.current_game));
    }

    key_listener() {
        document.addEventListener("keydown", event => {
            if (event.key === "Enter") {
            this.add_split();
            }
        });
    }

    main() {
        this.splits = document.getElementById("table");
        this.splits.style.background = "transparent";

        this.user_input = document.getElementById("user-input");

        this.append_button = document.getElementById("append-button");
        this.append_button.onclick = (() => this.add_split()).bind(this);

        this.delete_button = document.getElementById("delete-button");
        this.delete_button.onclick = this.delete_split.bind(this);
        this.delete_button.disabled = true;

        this.insert_above_button = document.getElementById("insert-above-button");
        this.insert_above_button.onclick = (() => this.insert_split()).bind(this);
        this.insert_above_button.disabled = true;

        this.insert_below_button = document.getElementById("insert-below-button");
        this.insert_below_button.onclick = (() => this.insert_split(1)).bind(this);
        this.insert_below_button.disabled = true;

        this.reset_button = document.getElementById("reset-button");
        this.reset_button.onclick = this.reset.bind(this);

        this.split_elements = document.getElementsByClassName("split-buttons");

        this.current_game = document.getElementById("game");
        this.current_game.style.visibility = "hidden";

        this.set_game_button = document.getElementById("set-game-button");
        this.set_game_button.onclick = this.set_game.bind(this);

        this.save_button = document.getElementById("save-button");
        this.save_button.onclick = this.save.bind(this);

        this.splits = document.getElementById("table");
        this.splits.style.background = "transparent";

        this.start_ipc();
        this.get_splits();
        this.key_listener();
    }
}

const split = new Split();
window.addEventListener("load", split.main());