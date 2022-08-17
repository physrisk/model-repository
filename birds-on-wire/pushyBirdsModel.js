class pushyBirdsModel {
    constructor(spaces = 510, tolerance = 1, hole_fade_time = 10) {
        this.rng = new Random();

        this.tolerance = tolerance;
        this.hole_fade_time = hole_fade_time;

        this.spaces = spaces;
        this.states = Array(this.spaces).fill(0);
        this.time = 1;
        this.birds = 0;
    }
    is_bad_location(loc) {
        return loc < 0 || loc >= this.spaces;
    }
    is_location_empty(loc) {
        if (this.is_bad_location(loc)) {
            return null;
        }
        return this.states[loc] <= 0;
    }
    pick_location() {
        let location = Math.floor(this.rng.uniform(0, this.spaces));
        while (!this.is_location_empty(location)) {
            location = Math.floor(this.rng.uniform(0, this.spaces));
        }
        return location;
    }
    empty_location(loc) {
        if (this.is_bad_location(loc) || this.is_location_empty(loc)) {
            return;
        }
        this.states[loc] = -this.hole_fade_time;
        this.birds = this.birds - 1;
    }
    occupy_location(loc) {
        if (this.is_bad_location(loc) || !this.is_location_empty(loc)) {
            return;
        }
        this.states[loc] = this.time;
        this.birds = this.birds + 1;
    }
    trigger_neighbors(loc) {
        for (let dist = 1; dist <= this.tolerance; dist += 1) {
            this.empty_location(loc - dist);
            this.empty_location(loc + dist);
        }
    }
    fade_holes() {
        if (this.hole_fade_time <= 0) {
            return;
        }
        this.states = this.states.map((v) => {
            if (v < 0) {
                return v + 1;
            }
            return v;
        });
    }
    step() {
        let location = this.pick_location();

        this.occupy_location(location);
        this.trigger_neighbors(location);

        this.fade_holes();

        this.time = this.time + 1;

        return null;
    }
    get_gaps() {
        let cur_gap = 0;
        let all_gaps = [];
        for (let loc = 0; loc < this.spaces; loc += 1) {
            if (!this.is_location_empty(loc)) {
                if (cur_gap > 0) {
                    all_gaps.push(cur_gap);
                }
                cur_gap = 0;
            } else {
                cur_gap = cur_gap + 1;
            }
        }
        if (cur_gap > 0) {
            all_gaps.push(cur_gap);
        }
        return all_gaps;
    }
}
