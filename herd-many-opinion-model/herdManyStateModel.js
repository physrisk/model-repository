class HerdManyStateModel {
    constructor(nAgents=100,nStates=4,epsilonMatrix=null,reportStep=1) {
        this.time=0;
        this.reportAt=reportStep;
        this.reportStep=reportStep;
        this.nAgents=nAgents;
        this.nStates=nStates;
        if(epsilonMatrix===null) {
            this.initializeDefaultEpsilon();
        } else {
            this.epsilonMatrix=epsilonMatrix;
        }
        this.initializeStates();
        this.initializeEventRates();
    }
    initializeDefaultEpsilon() {
        let i,j,tmp;
        this.epsilonMatrix=[];
        for(i=0;i<this.nStates;i+=1) {
            tmp=[];
            for(j=0;j<this.nStates;j+=1) {
                if(i==j) {
                    tmp.push(0);
                } else {
                    tmp.push(1);
                }
            }
            this.epsilonMatrix.push(tmp);
        }
    }
    initializeStates() {
        let i;
        this.states=new Array(this.nAgents);
        this.totals=new Array(this.nStates);
        for(i=0;i<this.nStates;i+=1) {
            this.totals[i]=0;
        }
        for(i=0;i<this.nAgents;i+=1) {
            this.states[i]=Math.floor(Math.random()*this.nStates);
            this.totals[this.states[i]]+=1;
        }
    }
    initializeEventRates() {
        let i, j, tmp;
        this.lambdaMatrix=[];
        this.lambdaTotal=0;
        for(i=0;i<this.nStates;i+=1) {
            tmp=[];
            for(j=0;j<this.nStates;j+=1) {
                tmp.push(0);
            }
            this.lambdaMatrix.push(tmp);
        }
        this.updateEventRates();
    }
    updateEventRates() {
        let i, j, tmp;
        this.lambdaTotal=0;
        for(i=0;i<this.nStates;i+=1) {
            for(j=0;j<this.nStates;j+=1) {
                if(i==j) {
                    tmp=0;
                } else {
                    tmp=this.totals[i]*(this.epsilonMatrix[i][j]+this.totals[j]);
                }
                this.lambdaMatrix[i][j]=tmp;
                this.lambdaTotal+=tmp;
            }
            this.lambdaMatrix.push(tmp);
        }
    }
    step() {
        while(this.time<this.reportAt) {
            this.time+=-Math.log(Math.random())/this.lambdaTotal;
            this.singleStep();
            this.updateEventRates();
        }
        this.reportAt+=this.reportStep;
        return this.totals;
    }
    singleStep() {
        let e;
        e=this.pickEvent();
        this.totals[e[0]]-=1;
        this.totals[e[1]]+=1;
    }
    pickEvent() {
        let i,j,r,v;
        r=Math.random()*this.lambdaTotal;
        v=0;
        for(i=0;i<this.nStates;i+=1) {
            for(j=0;j<this.nStates;j+=1) {
                v+=this.lambdaMatrix[i][j];
                if(r<v) {
                    return [i,j];
                }
            }
        }
    }
}
