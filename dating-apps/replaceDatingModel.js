class ReplaceDatingModel {
    constructor(
        n_agents = 100,
        distribution = 1,
        diff_method = 1,
        pickiness = 7,
        match_threshold = 5
    ) {
        this.normal_mean = 0.5;
        this.normal_sigma = 0.25;

        this.rng = new Random();
        this.n_agents = n_agents;
        this.distribution = distribution;
        this.diff_method = diff_method;
        this.pickiness = pickiness;
        this.match_threshold = match_threshold;

        this.attractiveness = Array(this.n_agents)
            .fill(0)
            .map(() => this.generate_attractiveness())
            .sort((a, b) => a > b);
        this.popularity = Array(this.n_agents)
            .fill(null)
            .map(() => Array(this.n_agents).fill(0));
        this.matched_pairs = [];
    }
    generate_attractiveness() {
        if (this.distribution == 1) {
            return this.rng.random();
        }
        return Math.min(
            Math.max(this.rng.normal(this.normal_mean, this.normal_sigma), 0),
            1
        );
    }
    step() {
        const interacting_pair = this.pick_pair();
        this.put_like(...interacting_pair);
        return true;
    }
    pick_pair() {
        return [
            Math.floor(this.rng.uniform(0, this.n_agents)),
            Math.floor(this.rng.uniform(0, this.n_agents)),
        ];
    }
    put_like(sender_id, recepient_id) {
        if (sender_id == recepient_id) {
            return;
        }
        let x_i = this.attractiveness[sender_id];
        let x_j = this.attractiveness[recepient_id];
        let reaction = this.get_reaction(x_i, x_j);
        this.popularity[sender_id][recepient_id] =
            this.popularity[sender_id][recepient_id] + reaction;
        if (this.is_matched(sender_id, recepient_id)) {
            this.remove_pair(sender_id, recepient_id);
        }
    }
    remove_pair(sender_id, recepient_id) {
        this.matched_pairs.push([
            this.attractiveness[sender_id],
            this.attractiveness[recepient_id],
        ]);
        this.remove_single(sender_id);
        this.introduce_single();
        this.remove_single(recepient_id);
        this.introduce_single();
    }
    remove_single(id) {
        this.attractiveness.splice(id, 1);
        this.popularity.splice(id, 1);
        this.popularity = this.popularity.map((v) => {
            let tmp = v.slice();
            tmp.splice(id, 1);
            return tmp;
        });
    }
    introduce_single() {
        let cur_agents = this.attractiveness.length;
        let attractiveness = this.generate_attractiveness();
        let insert_pos = 0;
        for (; insert_pos < cur_agents; insert_pos += 1) {
            if (attractiveness < this.attractiveness[insert_pos]) {
                break;
            }
        }
        this.attractiveness.splice(insert_pos, 0, attractiveness);
        this.popularity.splice(insert_pos, 0, Array(cur_agents).fill(0));
        this.popularity = this.popularity.map((v) => {
            let tmp = v.slice();
            tmp.splice(insert_pos, 0, 0);
            return tmp;
        });
    }
    get_reaction(x_i, x_j) {
        let diff = 0;
        if (this.diff_method == 1) {
            diff = Math.abs(x_j - x_i);
        } else {
            diff = x_j - x_i;
        }
        let prob = Math.min(1, Math.exp(-this.pickiness * diff));
        return this.rng.random() < prob ? 1 : -1;
    }
    get_max_popularity() {
        const get_max = (a) =>
            Math.max(...a.map((e) => (Array.isArray(e) ? get_max(e) : e)));
        return get_max(this.popularity);
    }
    get_min_popularity() {
        const get_min = (a) =>
            Math.min(...a.map((e) => (Array.isArray(e) ? get_min(e) : e)));
        return get_min(this.popularity);
    }
    get_matches(i) {
        let matches = 0;
        for (let j = 0; j < this.n_agents; j += 1) {
            matches = matches + this.is_matched(i, j);
        }
        return matches;
    }
    is_matched(i, j) {
        return (
            this.popularity[i][j] > this.match_threshold &&
            this.popularity[j][i] > this.match_threshold
        );
    }
}
