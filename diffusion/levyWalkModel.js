class levyWalkModel {
    constructor(gamma,rng) {
        this.gamma = gamma;
        this.rng = rng;
        this.pos = 0;
        this.time = 0;
        this.velo = 0;
        this.nextTime = 0;
        this.nextPos = 0;
        this.generateNext();
    }
    generateNext() {
        let waitingTime = 0.01*(this.rng.pareto(this.gamma) -1);
        this.time = this.nextTime;
        this.pos = this.nextPos;
        this.velo = this.randomVelocity();
        this.nextTime = this.time + waitingTime;
        this.nextPos = this.pos + this.velo*waitingTime;
    }
    randomVelocity() {
        return this.rng.random()<0.5 ? -1 : 1;
    }
    interp(t) {
        return this.pos + this.velo*(t-this.time);
    }
    get(t) {
        while(t>this.nextTime) {
            this.generateNext();
        }
        return this.interp(t);
    }
}
