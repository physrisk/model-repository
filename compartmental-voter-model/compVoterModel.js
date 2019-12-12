class compVoterModel {
    constructor(nAgents=[13,13],nTypes=2,epsilon=[2,2],nComps=100,
                capacity=30) {
        let i,j;
        // translate input parameters into a more numerical tractable form
        this.nTypes=nTypes;
        this.nComps=nComps;
        this.capacity=capacity;
        this.nAgents=[];// number of agents within each compartment belonging
                        // to each type
        this.pops=new Array(this.nComps);// total number of agents within each
                                         // compartment
        for(i=0;i<this.nTypes;i+=1) {
            for(j=0;j<this.nComps;j+=1) {
                this.nAgents.push(nAgents[i]);
                if(i==0) {
                    this.pops[j]=0;
                }
                this.pops[j]+=nAgents[i];
            }
        }
        this.epsilon=new Array(this.nTypes);
        for(i=0;i<this.nTypes;i+=1) {
            // we allow for epsilons specified in 0.01
            // this somewhat helps with numerical errors
            this.epsilon[i]=parseInt(Math.round(epsilon[i]/0.01));
        }
        // create clock and observables
        this.time=0;
        this.reportTime=0;
        this.setObservables();
        // create internal variables to speed up simulation
        this.rng=new Random();
        this.nElems=this.nComps*this.nTypes;
        this.setTransitionRateMatrix();
    }
    step(dt) {
        this.reportTime+=dt;
        while(this.time<this.reportTime) {
            this.setObservables();
            this.gillespieStep();
        }
        return this.obs;
    }
    gillespieStep() {
        let dt,q,from,to;

        if(this.totalSum<1e-14) {
            this.time+=1e3;
            return;
        }

        dt=this.rng.exponential(this.totalSum);
        q=this.rng.uniform(0,this.totalSum);

        from=this.rowSum.findIndex(function(x){
            q-=x;
            return q<0;
        });
        q+=this.rowSum[from];
        to=this.matrix[from].findIndex(function(x){
            q-=x;
            return q<0;
        });

        this.nAgents[from]-=1;
        this.nAgents[to]+=1;

        this.updatePopulation(from,-1);
        this.updatePopulation(to,1);

        this.updateTransitionRateMatrix(from % this.nComps);
        this.updateTransitionRateMatrix(to % this.nComps);

        this.time+=dt;
    }
    setTransitionRateMatrix() {
        let i,j,tmp;
        this.matrix=[];
        this.rowSum=[];
        this.totalSum=0;
        for(i=0;i<this.nElems;i+=1) {
            this.rowSum[i]=0;
            tmp=new Array(this.nElems);
            for(j=0;j<this.nElems;j+=1) {
                tmp[j]=this.getTransitionRate(i,j);
                this.rowSum[i]+=tmp[j];
            }
            this.matrix.push(tmp);
            this.totalSum+=this.rowSum[i];
        }
    }
    updateTransitionRateMatrix(compId) {
        let i,j,m;
        for(i=0;i<this.nTypes;i+=1) {
            for(j=0;j<this.nElems;j+=1) {
                m=compId+i*this.nComps;

                this.totalSum-=this.matrix[m][j];
                this.rowSum[m]-=this.matrix[m][j];
                this.matrix[m][j]=this.getTransitionRate(m,j);
                this.rowSum[m]+=this.matrix[m][j];
                this.totalSum+=this.matrix[m][j];

                this.totalSum-=this.matrix[j][m];
                this.rowSum[j]-=this.matrix[j][m];
                this.matrix[j][m]=this.getTransitionRate(j,m);
                this.rowSum[j]+=this.matrix[j][m];
                this.totalSum+=this.matrix[j][m];
            }
        }
    }
    getTransitionRate(from,to) {
        // self looping transitions are forbidden
        if(from==to) {
            return 0;
        }
        // it is forbidden to change type
        let typeFrom=parseInt(Math.floor(from/this.nComps));
        let typeTo=parseInt(Math.floor(to/this.nComps));
        if(typeFrom!=typeTo) {
            return 0;
        }
        // it is forbidden to go over capacity
        if(this.getPopulation(to)>=this.capacity) {
            return 0;
        }
        // calculate rate based on homophily formula
        return this.nAgents[from]*(this.epsilon[typeFrom]+100*this.nAgents[to]);
    }
    getPopulation(i) {
        return this.pops[i % this.nComps];
    }
    updatePopulation(i,u) {
        this.pops[i % this.nComps]+=u;
    }
    setObservables() {
        let model=this;
        this.obs=this.nAgents.slice().map(function(v,i) {
            let pop=model.pops[i % model.nComps];
            if(pop==0) {
                return 0;
            }
            return v/pop;
        });
    }
}
