class HKBCModel {
    constructor(nAgents=100,mu=0.25,epsilon=0.25) {
        this.time=0;
        this.sense=0.003;
        this.nAgents=nAgents;
        this.mu=mu;
        this.epsilon=epsilon;
        this.initializeOpinions();
    }
    step(tick=1) {
        let i,changes;
        changes=0;
        for(i=0;i<tick;i+=1) {
            if(this.singleStep()) {
                changes+=1;
            }
        }
        this.time+=tick;
        return changes;
    }
    singleStep() {
        let agent1Id, diff, i, ave, sims;
        // pick random agents
        agent1Id=Math.floor(this.nAgents*Math.random());
        // average similar agents
        ave=0;
        sims=0;
        for(i=0;i<this.nAgents;i+=1) {
            diff=Math.abs(this.opinions[agent1Id]-this.opinions[i]);
            if(diff<this.epsilon) {
                ave+=this.opinions[i];
                sims+=1;
            }
        }
        // update using similarity
        ave/=sims;
        diff=this.opinions[agent1Id]-ave;
        this.opinions[agent1Id]=this.opinions[agent1Id]-this.mu*diff;
        if(Math.abs(diff)>this.sense) {
            return true;
        }
        return false;
    }
    initializeOpinions() {
        let i=0;
        this.opinions=new Array(this.nAgents);
        for(i=0;i<this.nAgents;i+=1) {
            this.opinions[i]=Math.random();
        }
    }
}
