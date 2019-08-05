class DeffuantBCModel {
    constructor(nAgents=100,mu=0.25,epsilon=0.25,alpha=0,beta=0,epsilonMin=0.0,probNoise=0.0) {
        let norm;
        this.time=0;
        this.sense=0.003;
        this.nAgents=nAgents;
        this.mu=mu;
        if(alpha==0 && beta==0) {
            this.epsilon=function (i) {
                return epsilonMin+epsilon;
            };
        } else {
            norm=epsilon*Math.pow(alpha,-alpha)*Math.pow(beta,-beta)*Math.pow(alpha+beta,alpha+beta);
            this.epsilon=function (i) {
                let x=this.opinions[i];
                return epsilonMin+Math.pow(x,alpha)*Math.pow(1-x,beta)*norm;
            };
        }
        this.probNoise=probNoise;
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
        let agent1Id, agent2Id, diff, flipped;
        // pick random agents
        agent1Id=Math.floor(this.nAgents*Math.random());
        if(Math.random()<this.probNoise) {
            this.opinions[agent1Id]=Math.random();
            return true;
        }
        agent2Id=Math.floor(this.nAgents*Math.random());
        if(agent1Id==agent2Id) {
            return false;
        }
        flipped=false;
        // compare the opinions
        diff=this.opinions[agent1Id]-this.opinions[agent2Id];
        if(Math.abs(diff)<this.epsilon(agent1Id)) {// influence #1
            this.opinions[agent1Id]-=this.mu*diff;
            flipped=(diff>this.sense);
        }
        if(Math.abs(diff)<this.epsilon(agent2Id)) {// influence #2
            this.opinions[agent2Id]+=this.mu*diff;
            flipped=(diff>this.sense);
        }
        return flipped;
    }
    initializeOpinions() {
        let i=0;
        this.opinions=new Array(this.nAgents);
        for(i=0;i<this.nAgents;i+=1) {
            this.opinions[i]=Math.random();
        }
    }
}
