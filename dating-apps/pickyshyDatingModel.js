class PickyshyDatingModel {
    constructor(
        n_agents = 100,
        beta_max = 10,
        beta_min = 4,
        match_threshold = 5
    ) {
        this.normal_mean = 0.5;
        this.normal_sigma = 0.25;

        this.rng = new Random();
        this.n_agents = n_agents;
        this.beta_max = Math.max(beta_max, beta_min);
        this.beta_min = Math.min(beta_min, beta_max);
        this.match_threshold = match_threshold;

        this.attractiveness = Array(this.n_agents)
            .fill(0)
            .map(() => this.generate_attractiveness())
            .sort((a, b) => a > b);
        this.picky_type = Array(this.n_agents)
            .fill(null)
            .map(() => this.generate_pickiness());

        this.popularity = Array(this.n_agents)
            .fill(null)
            .map(() => Array(this.n_agents).fill(0));
        this.matched = {
            attractiveness: [],
            deltas: [],
            types: [],
        };
    }
    generate_pickiness() {
        return this.rng.random() < 0.5;
    }
    generate_attractiveness() {
        return this.rng.random();
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
        let reaction = this.get_reaction(sender_id, recepient_id);
        this.popularity[sender_id][recepient_id] =
            this.popularity[sender_id][recepient_id] + reaction;
        if (this.is_matched(sender_id, recepient_id)) {
            this.remove_pair(sender_id, recepient_id);
        }
    }
    remove_pair(sender_id, recepient_id) {
        this.matched.attractiveness.push([
            this.attractiveness[sender_id],
            this.attractiveness[recepient_id],
        ]);
        this.matched.deltas.push(
            Math.abs(
                this.attractiveness[sender_id] -
                    this.attractiveness[recepient_id]
            )
        );
        let match_type = match_type_mixed;
        if (this.picky_type[sender_id] && this.picky_type[recepient_id]) {
            match_type = match_type_picky;
        } else if (
            !this.picky_type[sender_id] &&
            !this.picky_type[recepient_id]
        ) {
            match_type = match_type_shy;
        }

        this.matched.types.push(match_type);
        this.remove_single(sender_id);
        this.introduce_single();
        this.remove_single(recepient_id);
        this.introduce_single();
    }
    remove_single(id) {
        this.attractiveness.splice(id, 1);
        this.picky_type.splice(id, 1);
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
        let picky_type = this.generate_pickiness();
        let insert_pos = 0;
        for (; insert_pos < cur_agents; insert_pos += 1) {
            if (attractiveness < this.attractiveness[insert_pos]) {
                break;
            }
        }
        this.attractiveness.splice(insert_pos, 0, attractiveness);
        this.picky_type.splice(insert_pos, 0, picky_type);
        this.popularity.splice(insert_pos, 0, Array(cur_agents).fill(0));
        this.popularity = this.popularity.map((v) => {
            let tmp = v.slice();
            tmp.splice(insert_pos, 0, 0);
            return tmp;
        });
    }
    get_reaction(i, j) {
        let prob = 0;
        const diff = this.attractiveness[j] - this.attractiveness[i];
        if (this.picky_type) {
            if (diff < 0) {
                prob = Math.min(1, Math.exp(this.beta_max * diff));
            } else {
                prob = Math.min(1, Math.exp(-this.beta_min * diff));
            }
        } else {
            if (diff < 0) {
                prob = Math.min(1, Math.exp(this.beta_min * diff));
            } else {
                prob = Math.min(1, Math.exp(-this.beta_max * diff));
            }
        }

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
    is_matched(i, j) {
        return (
            this.popularity[i][j] > this.match_threshold &&
            this.popularity[j][i] > this.match_threshold
        );
    }
}
