class Split {

    splits = [];

    dict_to_table(dict) {
        let splits = JSON.parse(dict);
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
    }

    get_splits() {
        ipc_send("request-splits", "");
    }

    start_ipc() {
        ipc_receive("request-splits-response", arg => {
            this.splits = this.dict_to_table(arg);
        });
    }

    main() {
        this.start_ipc();
        this.get_splits();
    }
}

const split = new Split();
window.addEventListener("load", split.main());