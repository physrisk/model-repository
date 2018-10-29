class MarkModel {
    constructor(nAgents=100,interactionRate=1000,memory=1) {
        this.time=0;
        this.reportAt=memory;
        this.nAgents=nAgents;
        this.memory=memory;
        this.rate=interactionRate;
        this.initializeTables();
    }
    step(tick=1) {
        while(this.time<this.reportAt) {
            this.singleStep();
            this.time+=-Math.log(Math.random())/this.rate;
        }
        this.reportAt+=tick;
    }
    singleStep() {
        let agent1Id, agent2Id, facts, eFactId;
        // pick random agents
        agent1Id=this.getAgent();
        agent2Id=this.getAgent(this.interactionT[agent1Id]);
        // forget facts
        this.forgetFacts(agent1Id);
        this.forgetFacts(agent2Id);
        // pick facts to be expressed
        facts=this.getUnionFacts(agent1Id,agent2Id);
        eFactId=Math.floor(Math.random()*(facts.length+1));
        if(eFactId<facts.length) {
            eFactId=facts[eFactId];
        } else {
            eFactId=this.addFact();
        }
        // express facts
        this.informationT[eFactId][agent1Id]=1;
        this.informationT[eFactId][agent2Id]=1;
        this.expressionT[eFactId][agent1Id]=this.time+this.memory;
        this.expressionT[eFactId][agent2Id]=this.time+this.memory;
        // update interaction table rows
        this.updateInteraction([agent1Id,agent2Id]);
    }
    initializeTables() {
        this.informationT=[];
        this.expressionT=[];
        this.interactionT=[];
        this.initializeInteraction();
        this.addFact(1,this.memory);
        this.updateInteraction();
    }
    initializeExpression() {
        let i,tmp;
        tmp=[];
        for(i=0;i<this.nAgents;i+=1) {
            tmp.push(this.memory-Math.random());
        }
        this.expressionT.push(tmp);
    }
    initializeInteraction() {
        let i,j,tmp;
        this.interactionT=[];
        for(i=0;i<this.nAgents;i+=1) {
            tmp=[];
            for(j=0;j<this.nAgents;j+=1) {
                if(i==j) {
                    tmp.push(1);
                } else {
                    tmp.push(0);
                }
            }
            this.interactionT.push(tmp);
        }
    }
    updateInteraction(which=null) {
        let i,j,tmp,total,cf;
        for(i=0;i<this.nAgents;i+=1) {
            if(which!==null) {
                if(which.indexOf(i)==-1) {
                    continue;
                }
            }
            tmp=[];
            total=0;
            for(j=0;j<this.nAgents;j+=1) {
                cf=this.getIntersectionFacts(i,j).length;
                tmp.push(cf);
                total+=cf;
            }
            for(j=0;j<this.nAgents;j+=1) {
                tmp[j]/=total;
            }
            this.interactionT[i]=tmp.slice(0);
        }
    }
    getAgent(probs=null) {
        if(probs==null) {
            return Math.floor(Math.random()*this.nAgents);
        }
        let r,cum,i;
        r=Math.random();
        cum=0;
        for(i=0;i<this.nAgents;i+=1) {
            cum+=probs[i];
            if(r<cum) {
                return i;
            }
        }
        return this.nAgents-1;
    }
    addFact(iValue=0,eValue=0) {
        let i,iTmp,eTmp;
        iTmp=[];
        eTmp=[];
        for(i=0;i<this.nAgents;i+=1) {
            iTmp.push(iValue);
            eTmp.push(eValue);
        }
        this.informationT.push(iTmp);
        this.expressionT.push(eTmp);
        return this.informationT.length-1;
    }
    clearFacts() {
        let i,j,knows;
        i=0;
        while(i<this.informationT.length) {
            knows=false;
            for(j=0;j<this.nAgents;j+=1) {
                if(this.informationT[i][j]>0) {
                    knows=true;
                    break;
                }
            }
            if(!knows) {
                this.informationT.splice(i,1);
                this.expressionT.splice(i,1);
            } else {
                i+=1;
            }
        }
    }
    getFacts(agent1Id,agent2Id,cb) {
        let i,rez;
        rez=[];
        for(i=0;i<this.informationT.length;i+=1) {
            if(cb(i,agent1Id,agent2Id)) {
                rez.push(i);
            }
        }
        return rez;
    }
    getUnionFacts(agent1Id,agent2Id) {
        return this.getFacts(agent1Id,agent2Id,(i,a1,a2) => {
                return this.informationT[i][a1]>0 || this.informationT[i][a2]>0;
            });
    }
    getIntersectionFacts(agent1Id,agent2Id) {
        return this.getFacts(agent1Id,agent2Id,(i,a1,a2) => {
                return this.informationT[i][a1]>0 && this.informationT[i][a2]>0;
            });
    }
    forgetFacts(agentId) {
        let i;
        for(i=0;i<this.expressionT.length;i+=1) {
            if(this.informationT[i][agentId]>0) {
                if(this.expressionT[i][agentId]<this.time) {
                    this.informationT[i][agentId]=0;
                    this.expressionT[i][agentId]=0;
                }
            }
        }
    }
}
