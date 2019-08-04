class talentModel {
    constructor(size=[50,40],nAgents=1000,nEvents=500,pLuck=0.5,tDist=[3,3]) {
        let i,g1,g2;
        
        this.rng=new Random();
        this.time=0;
        this.dt=0.5;
        
        this.size=size;// grid size in both dimensions
        this.nAgents=nAgents;// number of agents
        this.nEvents=nEvents;// number of events
        this.pLuck=pLuck;// lucky event probability
        this.tDist=tDist;// talent distribution parameters (beta distribution)

        // agent capital
        this.cap=new Array(nAgents);
        this.cap.fill(1);

        this.talent=[];// agent talent
        this.locAgent=[];// agent location
        for(i=0;i<this.nAgents;i+=1) {
            g1=this.rng.gamma(this.tDist[0],1);
            g2=this.rng.gamma(this.tDist[1],1);
            this.talent.push(g1/(g1+g2));
            // two agents are allowed to share location
            this.locAgent.push([
                Math.floor(this.rng.uniform(0,this.size[0])),
                Math.floor(this.rng.uniform(0,this.size[1]))
            ]);
        }

        // number of lucky events happened
        this.histLuck=new Array(nAgents);
        this.histLuck.fill(0);

        this.luck=[];// event lucky or not
        this.locEvent=[];// event location
        for(i=0;i<this.nEvents;i+=1) {
            this.luck.push(this.rng.random()<this.pLuck);
            // two events are allowed to share location
            this.locEvent.push([
                Math.floor(this.rng.uniform(0,this.size[0])),
                Math.floor(this.rng.uniform(0,this.size[1]))
            ]);
        }

        this.nMoves=2;// number of times each event moves
        this.factor=2;// factor by which capital is multiplied (luck) or divided (unluck)
    }
    step() {
        let i,j,m;
        // move events
        for(i=0;i<this.nEvents;i+=1) {
            for(j=0;j<this.nMoves;j+=1) {
                m=this.getRandomDirection();
                this.locEvent[i][0]=(this.locEvent[i][0]+m[0]+this.size[0]) % this.size[0];
                this.locEvent[i][1]=(this.locEvent[i][1]+m[1]+this.size[1]) % this.size[1];
            }
        }
        // trigger events
        for(i=0;i<this.nEvents;i+=1) {
            for(j=0;j<this.nAgents;j+=1) {
                if(this.locEvent[i][0]==this.locAgent[j][0] &&
                   this.locEvent[i][1]==this.locAgent[j][1]) {
                    if(this.luck[i]) {
                        if(this.rng.random()<this.talent[j]) {
                            this.cap[j]*=this.factor;
                        }
                        this.histLuck[j]+=1;
                    } else {
                        this.cap[j]/=this.factor;
                        this.histLuck[j]-=1;
                    }
                }
            }
        }
        this.time+=this.dt;
    }
    getRandomDirection() {
        let r=Math.floor(4*Math.random());
        if(r==0) {
            return [1,0];
        }
        if(r==1) {
            return [-1,0];
        }
        if(r==2) {
            return [0,-1];
        }
        if(r==3) {
            return [0,1];
        }
        return [0,0];
    }
}
