class rcdVoterModel {
    constructor(nAgents=100,convince=0.1,doubt=0.1,repel=0.5) {
        this.time=0;
        this.nAgents=nAgents;
        this.p00=doubt*convince;
        this.p01=convince;
        this.p10=repel*convince;
        this.p11=doubt*repel*convince;
        let counts=[0,0,0];
        this.states=(new Array(this.nAgents)).fill(null).map(v => {
            let s=Math.floor(3*Math.random())-1;
            counts[s+1]+=1;
            return s;
        });
        this.counts=counts.slice();
        this.rng=new Random();
    }
    step() {
        let imcs, speaker, listener, r;
        for(imcs=0;imcs<this.nAgents;imcs+=1) {
            speaker=Math.floor(this.rng.uniform(0,this.nAgents));
            listener=Math.floor(this.rng.uniform(0,this.nAgents));
            if(this.states[speaker]==0) {// speaker should have opinion
                continue;
            }
            r=this.rng.uniform(0,1);
            this.counts[this.states[listener]+1]-=1;
            if(this.states[listener]==0) {// if listener has no opinion
                if(r<this.p01) { // convince
                    this.states[listener]=this.states[speaker];
                } else { // repel
                    r-=this.p01;
                    if(r<this.p10) {
                        this.states[listener]=-this.states[speaker];
                    }
                }
            }
            if(this.states[listener]==-this.states[speaker]) {// different opinions
                if(r<this.p00) { // doubt and convince
                    this.states[listener]=0;
                }
            }
            if(this.states[listener]==this.states[speaker]) {// same opinions
                if(r<this.p11) { // doubt and repel
                    this.states[listener]=0;
                }
            }
            this.counts[this.states[listener]+1]+=1;
        }
        this.time+=1;
        return [this.time,...this.counts.map(v=>v/this.nAgents)];
    }
}
