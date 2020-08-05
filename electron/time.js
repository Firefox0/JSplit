export function get_hours(time, add_zero = true) {
    let hours =  Math.floor((time % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (add_zero) {
        hours = insert_zeros(hours);
    }
    return hours;
}

export function get_minutes(time, add_zero = true) {
    let minutes =  Math.floor((time % (1000 * 60 * 60)) / (1000 * 60));
    if (add_zero) {
        minutes = insert_zeros(minutes);
    }
    return minutes;
}

export function get_seconds(time, add_zero = true) {
    let seconds = Math.floor((time % (1000 * 60)) / 1000);
    if (add_zero) {
        seconds = insert_zeros(seconds);
    }
    return seconds;
}

export function get_milliseconds(time, add_zero = true) {
    let milliseconds = Math.floor(time % 1000);
    if (add_zero) {
        milliseconds = insert_zeros(milliseconds, 3);
    }
    return milliseconds;
}

export function insert_zeros(num, length = 2) {
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

export function time_to_ms(time) {

    let new_parsed_times = [];
    let first_parse = time.split(":");

    // if at least minutes is existent
    if (first_parse.length > 1) {
        // if hours and minutes exist
        if (first_parse.length == 3) {
            new_parsed_times[0] = parseInt(first_parse[0]);
            new_parsed_times[1] = parseInt(first_parse[1]);
        }
        else {
            // if hours dont exist, minutes do though
            new_parsed_times[0] = 0;
            new_parsed_times[1] = parseInt(first_parse[0]);
        }
        // get seconds and ms
        // -1 to get last part (doesnt matter if hours doesnt exist)
        let second_parse = first_parse[first_parse.length - 1].split(".")
        new_parsed_times[2] = parseInt(second_parse[0]);
        new_parsed_times[3] = parseInt(second_parse[1]);
    }
    else {
        // hours and minutes are non existent, so 0
        new_parsed_times[0] = 0;
        new_parsed_times[1] = 0;
        
        // only seconds and ms exist, so split from original var
        let second_parse = time.split(".");
        new_parsed_times[2] = parseInt(second_parse[0]);
        new_parsed_times[3] = parseInt(second_parse[1]);
    }

    // total time in ms
    return new_parsed_times[0] * 3600000 + new_parsed_times[1] * 60000 
    + new_parsed_times[2] * 1000 + new_parsed_times[3];
    
}

export function ms_to_time(ms) {
    let h = Math.floor(ms/1000/60/60);
    let m = Math.floor((ms/1000/60/60 - h)*60);
    let s = Math.floor(((ms/1000/60/60 - h)*60 - m)*60);
    let ms_ = ms % 1000;

    h = insert_zeros(h, 2);
    m = insert_zeros(m, 2);
    s = insert_zeros(s, 2);
    ms_ = insert_zeros(ms_, 3);

    return h + ":" + m + ":" + s + "." + ms_;
}

export function remove_time_bloat(time) {
    let parsed = time.split(":");
    let h = parsed[0];
    let m = parsed[1];
    let s_ms = parsed[2];
    let final_time = "";

    if (h != "00") {
        f_time = h < 10 ? h.substring(1) : h;
        final_time += ":";
    }

    if (final_time) {
        final_time += m + ":";
    }
    else {
        if (m != "00") {
            final_time = (m < 10 ? m.substring(1) : m) + ":";
        }
    }

    if (final_time) {
        final_time += s_ms;
    }
    else {
        final_time = s_ms < 10 ? s_ms.substring(1) : s_ms;
    }

    return final_time;
}

export function time_difference(time1, time2) {
    // convert times to ms
    let time1_ms = time_to_ms(time1);
    let time2_ms = time_to_ms(time2);

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
    let time_diff = ms_to_time(final_time_ms);
    let clear_time = remove_time_bloat(time_diff);
    return sign + clear_time;
}