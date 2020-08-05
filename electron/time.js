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
    var final_time = parsed[2];
    if (m !== "00") {
        final_time = m + ":" + final_time;
        if (h !== "00") {
            final_time = h + ":" + final_time;
        }
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