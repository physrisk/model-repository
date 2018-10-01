class kbgModel {
    constructor(nAgents=100,sigma=0.01,herding=0.275,wakeupRate=0.1,
                sleepRate=0.1,wakeupFrom=360,sleepFrom=1020) {
        this.time=0;
        this.dayTime=0;
        this.reportAt=0;
        this.commenters=0;
        this.awakeCommenters=0;
        this.agents=nAgents;
        this.totalAgents=nAgents;
        this.awakeAgents=0;
        this.sigma=sigma;
        this.herding=herding;
        this.wakeupRate=wakeupRate;
        this.sleepRate=sleepRate;
        this.wakeupFrom=wakeupFrom;
        this.sleepFrom=sleepFrom;
        if(this.wakeupFrom>=this.sleepFrom) {
            this.wakeupFrom=this.sleepFrom-30;
            this.sleepFrom+=30;
        }
        this.updateState();
        this.updateRates();
    }
    // check whether a given time, or the current time are in the wakeup interval
    isWakeupTime(time=null) {
        if(time===null) {
            return this.wakeupFrom<this.dayTime && this.dayTime<this.sleepFrom;
        }
        time=time % 1440;
        return this.wakeupFrom<time && time<this.sleepFrom;
    }
    // check whether a given time, or the current time are in the sleep interval
    isSleepTime(time=null) {
        return !this.isWakeupTime(time);
    }
    // method to expose the state at the appropriate time
    updateState() {
        this.lastState=[this.commenters,this.awakeCommenters,this.agents,this.awakeAgents];
    }
    // separate method to update wakeup rates
    updateWakeupRates(force=false) {
        this.laWC=0;
        this.laWA=0;
        if(this.isWakeupTime() || force) {
            this.laWC=this.wakeupRate*(this.commenters-this.awakeCommenters); // wake commenter
            this.laWA=this.wakeupRate*(this.agents-this.awakeAgents); // wake agent
        }
    }
    // separate method to update sleep rates
    updateSleepRates(force=false) {
        this.laSC=0;
        this.laSA=0;
        if(this.isSleepTime() || force) {
            this.laSC=this.sleepRate*this.awakeCommenters; // sleep commenter
            this.laSA=this.sleepRate*this.awakeAgents; // sleep agent
        }
    }
    // general method to update all event rates
    updateRates() {
        this.laAC=this.awakeAgents*(this.sigma+this.herding*this.commenters/this.totalAgents); // agent to commenter
        this.updateWakeupRates();
        this.updateSleepRates();
        this.laTotal=this.laAC+this.laWC+this.laWA+this.laSC+this.laSA;
        this.eventProbs=[0,0,0,0,0];
        if(this.laTotal>0) {
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
    }
    // make a fixed size step
    step() {
        this.reportAt+=15;// step interval is 15 minutes
        while(this.time<this.reportAt) {
            this.updateState();
            this.internalStep();
            this.updateRates();
        }
        return this.lastState;
    }
    // make step of variable size
    internalStep() {
        let eventCode=0;
        let rnd=Math.random();// event randomizer
        let timeTick=15;// the main tick size
        let otherTimeTick=0;// tick used in overriding mechanism
        let tmpTick=0;// tick used in overriding mechanism
        if(this.laTotal>0) {// generate random tick if non-zero rate
            timeTick=-Math.log(Math.random())/this.laTotal;
        }
        // set event codes so they could be overriden
        if(rnd<this.eventProbs[0]) { // agent becomes commenter
            eventCode=1;
        } else if(rnd<this.eventProbs[1]) { // commenter wakes up
            eventCode=2;
        } else if(rnd<this.eventProbs[2]) { // agent wakes up
            eventCode=3;
        } else if(rnd<this.eventProbs[3]) { // commenter goes to sleep
            eventCode=4;
        } else if(rnd<this.eventProbs[4]) { // agent goes to sleep
            eventCode=5;
        }
        // may override eventCode and timeTick (because some rates are time dependent)
        if(!this.isWakeupTime(this.time) && this.isWakeupTime(this.time+timeTick)) {
            tmpTick=(this.time % 1440)+timeTick-this.wakeupFrom;
            this.updateWakeupRates(true);
            this.laTotal=this.laWC+this.laWA;
            otherTimeTick=-Math.log(Math.random())/this.laTotal;
            if(otherTimeTick<tmpTick) {// override with wakeup event
                timeTick=otherTimeTick;
                if(rnd<this.laWC/this.laTotal) {
                    eventCode=2;
                } else {
                    eventCode=3;
                }
            }
        } else if(!this.isSleepTime(this.time) && this.isSleepTime(this.time+timeTick)) {
            tmpTick=(this.time % 1440)+timeTick-this.sleepFrom;
            this.updateSleepRates(true);
            this.laTotal=this.laSC+this.laSA;
            otherTimeTick=-Math.log(Math.random())/this.laTotal;
            if(otherTimeTick<tmpTick) {// override with wakeup event
                timeTick=otherTimeTick;
                if(rnd<this.laSC/this.laTotal) {
                    eventCode=4;
                } else {
                    eventCode=5;
                }
            }
        }
        // end override
        this.time+=timeTick;// update clock
        this.dayTime=this.time % 1440;// update time of the day indicator
        // execute event based on its code
        if(eventCode==0) {// nothing happens
            return;
        } else if(eventCode==1) { // agent becomes commenter
            this.agents-=1;
            this.awakeAgents-=1;
            this.commenters+=1;
            this.awakeCommenters+=1;
        } else if(eventCode==2) { // commenter wakes up
            this.awakeCommenters+=1;
        } else if(eventCode==3) { // agent wakes up
            this.awakeAgents+=1;
        } else if(eventCode==4) { // commenter goes to sleep
            this.awakeCommenters-=1;
        } else if(eventCode==5) { // agent goes to sleep
            this.awakeAgents-=1;
        }
    }
}
