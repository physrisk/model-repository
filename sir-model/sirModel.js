class sirModel {
    constructor(beta0=1,beta1=0.3,gamma=0.3,isolation=false,nAgents=1000,nInfected=1) {
        this.beta0=beta0;
        this.beta1=beta1;
        this.gamma=gamma;
        this.isolation=isolation; // isolation flag
        this.nAgents=nAgents; // total number of agents in the simulation
        this.nSus=nAgents-nInfected; // number of suspectible agents
        this.nInf=nInfected; // number of infected agents
        this.nSick=0; // number of all who got sick
        this.nRec=0; // number of recovered agents
        this.time=0; // internal clock
    }
    getBeta() {
        if(this.isolation) {
            return this.beta1;
        }
        return this.beta0;
    }
    simulate(toTime) {
        while(this.time<toTime) {
            this.step(toTime);
        }
    }
    step(toTime) {
        // rate at which suspectibles become infected
        let rateSI=this.getBeta()*this.nSus*this.nInf/this.nAgents;
        // rate at which infected become recovered
        let rateIR=this.gamma*this.nInf;
        // total event rate
        let totalRate=rateSI+rateIR;

        // quit if no event is possible
        if(totalRate < 1e-4) {
            this.time=toTime;
            return;
        }
        
        // generate increment
        let timeTick=-Math.log(Math.random())/this.totalRate;
        // pick event
        let eventId=this.pickEvent(totalRate,rateSI,rateIR);
        // execute event
        this.executeEvent(eventId);

        // update time
        this.time=this.time+timeTick;
    }
    pickEvent(totalRate,rateSI,rateIR) {
        let r=Math.random()*totalRate;
        if(r<rateIR) {
            return 1;// I -> R
        }
        return 0;// S -> I
    }
    executeEvent(id) {
        if(id==0) {// S -> I
            this.nSus=this.nSus-1;
            this.nInf=this.nInf+1;
            this.nSick=this.nSick+1;
        } else {// I -> R
            this.nInf=this.nInf-1;
            this.nRec=this.nRec+1;
        }
    }
}
