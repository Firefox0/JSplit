export const SPLIT_NAME = 0;
export const SPLIT_TIME = 1;
export const COMPARISON = 2;
export const PB_TIME = 3;
export const BS_TIME = 4;

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