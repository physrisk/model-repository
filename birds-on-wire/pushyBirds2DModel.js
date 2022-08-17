class pushyBirds2DModel {
    constructor(size = [25, 20], tolerance = 1, hole_fade_time = 10) {
        this.rng = new Random();

        this.tolerance = tolerance;
        this.hole_fade_time = hole_fade_time;

        this.size = size;
        this.states = Array(this.size[0])
            .fill(null)
            .map((v) => Array(this.size[1]).fill(0));
        this.time = 1;
        this.birds = 0;
    }
    is_bad_location(loc) {
        return (
            loc[0] < 0 ||
            loc[0] >= this.size[0] ||
            loc[1] < 0 ||
            loc[1] >= this.size[1]
        );
    }
    is_location_empty(loc) {
        if (this.is_bad_location(loc)) {
            return null;
        }
        return this.states[loc[0]][loc[1]] <= 0;
    }
    pick_location() {
        let location = [
            Math.floor(this.rng.uniform(0, this.size[0])),
            Math.floor(this.rng.uniform(0, this.size[1])),
        ];
        while (!this.is_location_empty(location)) {
            location = [
                Math.floor(this.rng.uniform(0, this.size[0])),
                Math.floor(this.rng.uniform(0, this.size[1])),
            ];
        }
        return location;
    }
    empty_location(loc) {
        if (this.is_bad_location(loc) || this.is_location_empty(loc)) {
            return;
        }
        this.states[loc[0]][loc[1]] = -this.hole_fade_time;
        this.birds = this.birds - 1;
    }
    occupy_location(loc) {
        if (this.is_bad_location(loc) || !this.is_location_empty(loc)) {
            return;
        }
        this.states[loc[0]][loc[1]] = this.time;
        this.birds = this.birds + 1;
    }
    trigger_neighbors(loc) {
        for (let dx = 0; dx <= this.tolerance; dx += 1) {
            for (let dy = -this.tolerance; dy <= this.tolerance; dy += 1) {
                let true_dist = Math.sqrt(dx * dx + dy * dy);
                if (0 < true_dist && true_dist <= this.tolerance) {
                    this.empty_location([loc[0] - dx, loc[1] + dy]);
                    this.empty_location([loc[0] + dx, loc[1] + dy]);
                }
            }
        }
    }
    fade_holes() {
        if (this.hole_fade_time <= 0) {
            return;
        }
        this.states = this.states.map((v) =>
            v.map((vv) => {
                if (vv < 0) {
                    return vv + 1;
                }
                return vv;
            })
        );
    }
    step() {
        let location = this.pick_location();

        this.occupy_location(location);
        this.trigger_neighbors(location);

        this.fade_holes();

        this.time = this.time + 1;

        return null;
    }
}
