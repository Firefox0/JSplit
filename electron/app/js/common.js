export const SPLIT_NAME = 0;
export const SPLIT_TIME = 1;
export const COMPARISON = 2;
export const PB_TIME = 3;
export const BS_TIME = 4;
export const GOLD = "rgb(255, 215, 0)";

export function splits_exist(splits) {
    return splits.rows.length > 0;
}

export function run_completed(current_row, splits) {
    if (splits_exist(splits)) {
        if (current_row === splits.rows.length) {
            return true;
        }
    }
    return false;
}

export function delete_splits(splits) {
    while (splits.rows.length) {
        splits.deleteRow(0);
    }
    splits.style.background = "transparent";
}

export function set_transparent_background(splits) {
    // set background when there is atleast one split (prevent black spot)
    if (splits.style.background == "transparent") {
        splits.style.background = "rgba(0, 0, 0, 0.25)";
    }
}

export function table_to_dict(current_row, splits, current_game) {
    let split_names = [];
    let split_times = []; 
    let best_segments = [];
    
    let current_time = null;
    let comparison = null;
    let best_segment = null; 
    
    for (let i = 0; i < splits.rows.length; i++) {                    
        split_names[i] = splits.rows[i].cells[SPLIT_NAME].innerText;
        current_time = splits.rows[i].cells[SPLIT_TIME].innerText;

        if (run_completed(current_row, splits)) {
            split_times[i] = current_time;
        }
        else {
            split_times[i] = split_times[i] == "/" ? current_time : splits.rows[i].cells[PB_TIME].innerText;
        }

        comparison = splits.rows[i].cells[COMPARISON];
        best_segment = splits.rows[i].cells[BS_TIME].innerText;
        best_segments[i] = comparison.style.color == GOLD ? current_time : best_segment;
    }
    
    let dict = {};
    dict["game_name"] = current_game.innerText;
    dict["split_names"] = split_names;
    dict["split_times"] = split_times;
    dict["best_segment_times"] = best_segments;
    return dict;
}

export function load_split(data, table, current_game, instance=null, json=true) {
    if (data) {
        delete_splits(table);
        let splits = json ? JSON.parse(data) : data;
        current_game.innerText = splits["game_name"];
        current_game.style.visibility = "";
        for (let i = 0; i < splits["split_names"].length; i++) {
            let row = table.insertRow(-1);
            if (instance) {
                row.onclick = () => instance.select_row(row);
            }

            row.insertCell(SPLIT_NAME).innerText = splits["split_names"][i];
            row.insertCell(SPLIT_TIME).innerText = "/";
            row.insertCell(COMPARISON).innerText = "/";                
            row.insertCell(PB_TIME).innerText = splits["split_times"][i];
            row.insertCell(BS_TIME).innerText = splits["best_segment_times"][i];

            for (let i = 1; i < row.length; i++) {
                row.cells[i].style.textAlign = "right";
            }
        }
        set_transparent_background(table);
    }
}