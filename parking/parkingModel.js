class parkingModel {
    constructor(spaces=508, arrival_rate=250, departure_rate=1, walk_cost=4, drive_cost=1) {
        this.rng = new Random();

        this.arrival_rate = arrival_rate;
        this.departure_rate = departure_rate;

        this.walk_cost = walk_cost;
        this.drive_cost = drive_cost;

        this.spaces = spaces;
        this.states = Array(this.spaces).fill(0);
        this.costs = Array(this.spaces).fill(0);
        this.n = 0;
        this.time = 0;

        this.prob_arrival = this.arrival_rate / (this.arrival_rate + this.departure_rate*this.n);
    }
    step(strategy) {
        this.time = this.time + 1;
        if(this.rng.random() < this.prob_arrival) {
            return this.event_arrival(strategy);
        }
        this.event_departure();
        return null;
    }
    event_arrival(strategy) {
        if(this.n >= this.spaces) {
            return ;
        }
        let park_at, cost;
        [park_at, cost] = strategy(this.states, this.walk_cost, this.drive_cost);
        this.car_add(park_at, this.time, cost);
        return [park_at, cost];
    }
    event_departure() {
        let departing = Math.floor(this.n * this.rng.random());
        let current = -1;
        let idx = 0;
        while(current < departing) {
            if(this.states[idx] > 0) {
                current = current + 1;
            }
            idx = idx + 1;
        }
        this.car_remove(idx-1);
    }
    car_remove(idx) {
        if(this.states[idx] == 0) {
            return ;
        }
        this.states[idx] = 0;
        this.costs[idx] = 0;
        this.n = this.n - 1;
        this.prob_arrival = this.arrival_rate / (this.arrival_rate + this.departure_rate*this.n);
    }
    car_add(idx, t=1, c=0) {
        if(this.spaces <= idx || this.states[idx] > 0) {
            return ;
        }
        this.states[idx] = t;
        this.costs[idx] = c;
        this.n = this.n + 1;
        this.prob_arrival = this.arrival_rate / (this.arrival_rate + this.departure_rate*this.n);
    }
    get_mean_cost() {
        let reference_cost = this.drive_cost*this.states.length + (this.walk_cost - this.drive_cost)*0.5*(this.n-1);
        return jStat.mean(this.costs.filter(v => v>0))/reference_cost;
    }
}
