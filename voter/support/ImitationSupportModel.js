class ImitationSupportModel {
    constructor(sigma0=3, sigma1=3, supp=1, alpha=1, beta=1, X0=500, nAgents=1000) {
        this.sigma0 = sigma0;
        this.sigma1 = sigma1;
        this.herd = Math.pow(nAgents, -alpha);
        this.supp = supp / Math.pow(nAgents, beta);
        this.nAgents = nAgents;
        this.distParams = [
            (this.sigma1 - this.supp*this.nAgents) / (this.herd + this.supp),
            (this.sigma0 - this.supp*this.nAgents) / (this.herd + this.supp),
        ];
        this.initialize(X0);
    }
    initialize(X0) {
        this.lastX = X0;
        this.X = X0;
        this.t = 0;
    }
    birthRate(X=null) {
        if(X === null) {
            X = this.X;
        }
        let nOthers = this.nAgents - X;
        let herdTerm = this.herd*X;
        let suppTerm = this.supp*nOthers;
        let interactionTerm = Math.max(herdTerm - suppTerm, 0);
        return nOthers*(this.sigma1 + interactionTerm);
    }
    deathRate(X=null) {
        if(X === null) {
            X = this.X;
        }
        let nOthers = this.nAgents - X;
        let herdTerm = this.herd*nOthers;
        let suppTerm = this.supp*X;
        let interactionTerm = Math.max(herdTerm - suppTerm, 0);
        return X*(this.sigma0 + interactionTerm);
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
