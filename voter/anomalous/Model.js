class VoterModel {
    constructor(epsi1=3, epsi2=3, nAgents=100000, X0=10) {
        this.epsi1 = epsi1;
        this.epsi2 = epsi2;
        // number of agents will be scaled down during simulation to improve speed
        this.maxNAgents = nAgents;
        this.minNAgents = 100; // if nAgents > minNAgents scaling down will be done
        this.switchAt = [100, nAgents-100]; // perform switching at these two values
        this.X0 = X0;
        // apply default reseting procedure
        this.reset();
    }
    reset() {
        this.nAgents = this.maxNAgents;
        this.switchAt = [this.switchAt[0], this.nAgents-this.switchAt[0]];
        this.X = this.X0;
        this.t = 0;
        this.lastX = this.X;
        while((this.X > this.switchAt[0]) && (this.X < this.switchAt[1]) && (this.nAgents > this.minNAgents)) { // force scale down if initial condition is not as extreme as expected by the scaling down algorithm
            this.scaleDown(true);
        }
    }
    step(untilTime) {
        while(this.t < untilTime) {
            this.singleStep();
        }
        return this.lastX/this.nAgents;
    }
    singleStep() {
        let nOthers = this.nAgents - this.X;

        let birthRate = nOthers*(this.epsi1 + this.X);
        let deathRate = this.X*(this.epsi2 + nOthers);
        let totalRate = birthRate + deathRate;

        let dt = jStat.exponential.sample(totalRate);
        
        this.lastX = this.X;
        if( Math.random() < birthRate/totalRate ) {
            this.X = this.X + 1;
        } else {
            this.X = this.X - 1;
        }
        this.t = this.t + dt;

        this.scaleDown();
    }
    scaleDown(force=false) {
        if(force || ((this.X==this.switchAt[0] || this.X==this.switchAt[1]) && this.nAgents>this.minNAgents)) {
            this.X = parseInt(this.X/10);
            this.nAgents = parseInt(this.nAgents/10);
            this.switchAt[1] = this.nAgents-this.switchAt[0];
        }
    }
}
