class FullSupportModel {
    constructor(sigma0=3, sigma1=3, supp=1, alpha=1, beta=1, X0=500, nAgents=1000) {
        this.sigma0 = sigma0;
        this.sigma1 = sigma1;
        this.herd = Math.pow(nAgents, -alpha);
        this.supp = supp / Math.pow(nAgents, beta);
        this.nAgents = nAgents;
        this.initialize(X0);
    }
    initialize(X0) {
        this.lastX = X0;
        this.X = X0;
        this.t = 0;
    }
    birthRate(X = null) {
        if(X === null) {
            X = this.X;
        }
        let nOthers = this.nAgents - X;
        let herdTerm = this.herd*X;
        let suppTerm = this.supp*nOthers;
        return nOthers*Math.max(this.sigma1 + herdTerm - suppTerm, 0);
    }
    deathRate(X = null) {
        if(X === null) {
            X = this.X;
        }
        let nOthers = this.nAgents - X;
        let herdTerm = this.herd*nOthers;
        let suppTerm = this.supp*X;
        return X*Math.max(this.sigma0 + herdTerm - suppTerm, 0);
    }
    step(untilTime) {
        while(this.t < untilTime) {
            this.singleStep();
        }
        return this.lastX/this.nAgents;
    }
    singleStep() {
        let birthRate = this.birthRate();
        let deathRate = this.deathRate();
        let totalRate = birthRate + deathRate;

        let dt = jStat.exponential.sample(totalRate);
        
        this.lastX = this.X;
        if( Math.random() < birthRate/totalRate ) {
            this.X = this.X + 1;
        } else {
            this.X = this.X - 1;
        }
        this.t = this.t + dt;
    }
}
