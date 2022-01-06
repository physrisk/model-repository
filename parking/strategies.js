function strategy_meek(states, walk_cost, drive_cost) {
    // park at first available free space
    // or switch to prudent strategy if the last space is occupied
    let res = find_end(states);
    if(res >= states.length-1) {
        return strategy_prudent(states, walk_cost, drive_cost);
    }
    let pos = res + 1;
    let cost = drive_cost*(states.length - pos) + walk_cost*pos;
    return [pos, cost];
}

function strategy_prudent(states, walk_cost, drive_cost) {
    // park at first available space of the first gap between parked cars
    let cost = 0;
    let line_end = find_end(states);
    let pos = line_end;
    if(pos < 1) {
        pos = pos + 1;
        cost = drive_cost*(states.length - pos) + walk_cost*pos;
        return [pos, cost];
    }
    pos = pos - 1; // last parked car
    pos = find_next_empty(states, pos);
    if(pos == -1) {
        pos = line_end + 1;
        // cost is higher, because the driver had to backtrack until current
        // position
        cost = drive_cost*(states.length + pos) + walk_cost*pos;
        return [pos, cost];
    }
    pos = find_local_first_empty(states, pos);
    cost = drive_cost*(states.length - pos) + walk_cost*pos;
    return [pos, cost];
}

function strategy_optimist(states, walk_cost, drive_cost) {
    // park as close to the goal as possible
    let pos = find_global_first_empty(states);
    // cost is higher, because the driver had to backtrack until current
    // position
    let cost = drive_cost*(states.length + pos) + walk_cost*pos;
    return [pos, cost];
}

function strategy_half(states, walk_cost, drive_cost) {
    let line_end = find_end(states);
    let half = Math.ceil(line_end / 2);
    let pos = find_next_empty(states, half);
    if(pos == -1) {
        return strategy_optimist(states, walk_cost, drive_cost);
    }
    pos = find_local_first_empty(states, pos);
    let cost = drive_cost*(states.length - pos) + walk_cost*pos;
    return [pos, cost];
}

function find_global_first_empty(states) {
    return states.findIndex(v => v==0);
}

function find_end(states) {
    return states.map(v => v>0).lastIndexOf(true);
}

function find_next_empty(states, pos) {
    let ppos = pos;
    while(ppos >= 0 && states[ppos]>0) {
        ppos = ppos - 1;
    }
    return ppos;
}

function find_local_first_empty(states, pos) {
    let ppos = pos;
    while(ppos >= 0 && states[ppos]==0) {
        ppos = ppos - 1;
    }
    return ppos + 1;
}
