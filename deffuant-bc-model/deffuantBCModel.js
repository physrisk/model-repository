class DeffuantBCModel {
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
        let agent1Id, agent2Id, diff;
        // pick random agents
        agent1Id=Math.floor(this.nAgents*Math.random());
        agent2Id=Math.floor(this.nAgents*Math.random());
        if(agent1Id==agent2Id) {
            return false;
        }
        // compare the opinions
        diff=this.opinions[agent1Id]-this.opinions[agent2Id];
        if(Math.abs(diff)<this.epsilon) {// influence
            this.opinions[agent1Id]-=this.mu*diff;
            this.opinions[agent2Id]+=this.mu*diff;
            if(diff>this.sense) {
                return true;
            } else {
                return false;
            }
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
