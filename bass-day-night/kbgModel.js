class kbgModel {
    constructor(nAgents=100,sigma=0.01,herding=0.275,wakeupRate=0.1,sleepRate=0.1,
                wakeupFrom=360,sleepFrom=1020) {
        this.time=0;
        this.reportAt=0;
        this.customers=0;
        this.awakeCustomers=0;
        this.agents=nAgents;
        this.totalAgents=nAgents;
        this.awakeAgents=0;
        this.sigma=sigma;
        this.herding=herding;
        this.wakeupRate=wakeupRate;
        this.sleepRate=sleepRate;
        this.wakeupFrom=wakeupFrom;
        this.sleepFrom=sleepFrom;
        this.updateState();
        this.updateRates();
    }
    updateState() {
        this.lastState=[this.customers,this.awakeCustomers,this.agents,this.awakeAgents];
    }
    updateRates() {
        let dayTime=this.time % 1440;
        this.laAC=this.awakeAgents*(this.sigma+this.herding*this.awakeCustomers/this.totalAgents); // agent to customer
        this.laWC=0;
        this.laWA=0;
        this.laSC=0;
        this.laSA=0;
        if(this.wakeupFrom<dayTime && dayTime<this.sleepFrom) {
            this.laWC=this.wakeupRate*(this.customers-this.awakeCustomers); // wake customer
            this.laWA=this.wakeupRate*(this.agents-this.awakeAgents); // wake agent
        } else {
            this.laSC=this.sleepRate*this.awakeCustomers; // sleep customer
            this.laSA=this.sleepRate*this.awakeAgents; // sleep agent
        }
        this.laTotal=this.laAC+this.laWC+this.laWA+this.laSC+this.laSA;
        this.eventProbs=[
                this.laAC/this.laTotal,
                this.laWC/this.laTotal,
                this.laWA/this.laTotal,
                this.laSC/this.laTotal,
                this.laSA/this.laTotal,
            ];
        this.eventProbs[1]+=this.eventProbs[0];
        this.eventProbs[2]+=this.eventProbs[1];
        this.eventProbs[3]+=this.eventProbs[2];
        this.eventProbs[4]=1;
    }
    step() {
        this.reportAt+=15;
        while(this.time<this.reportAt) {
            this.updateState();
            this.internalStep();
            this.updateRates();
        }
        return this.lastState;
    }
    internalStep() {
        let timeTick=15;
        if(this.laTotal>0) {
            timeTick=-Math.log(Math.random())/this.laTotal;
        }
        this.time+=timeTick;
        if(this.laTotal<=0) {
            return;
        }
        let rnd=Math.random();
        if(rnd<this.eventProbs[0]) { // agent becmes customer
            this.agents-=1;
            this.awakeAgents-=1;
            this.customers+=1;
            this.awakeCustomers+=1;
        } else if(rnd<this.eventProbs[1]) { // customer wakes up
            this.awakeCustomers+=1;
        } else if(rnd<this.eventProbs[2]) { // agent wakes up
            this.awakeAgents+=1;
        } else if(rnd<this.eventProbs[3]) { // customer goes to sleep
            this.awakeCustomers-=1;
        } else if(rnd<this.eventProbs[4]) { // agent goes to sleep
            this.awakeAgents-=1;
        }
    }
}
