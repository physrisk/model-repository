class AttendanceModel {
    constructor(nSessions=250,nAgents=100,eOn=0.1,eOff=0.1,herd=0.01,
                pOn=1,pOff=0) {
        // save the parameters
        this.nSessions = nSessions;
        this.nAgents = nAgents;
        this.pOn = pOn;
        this.pOff = pOff;
        this.sOn = eOn*herd;
        this.sOff = eOff*herd;
        this.herd = herd;

        // initialize history
        this.history = Array.from(Array(this.nSessions),
            () => Array.from(Array(this.nAgents), () => 0));
        let prob = (this.sOn + 1e-6) / (this.sOn + this.sOff + 2e-6);
        this.history[this.nSessions-1] = this.history[this.nSessions-1].map(() => {
            return (Math.random()<prob) ? 1 : 0;
        });
        this.last = this.history[this.nSessions-1].slice();
        this.nAttending = this.last.reduce((c,v) => c+v, 0);
    }
    step() {
        // take a copy of the last state as input
        let state = this.last.slice();

        // compute fraction of attending agents
        let x = this.nAttending/this.nAgents;

        // estimate the transition probabilities
        let prob01 = this.sOn + this.herd*x;
        let prob10 = this.sOff + this.herd*(1-x);

        // update state in sync
        state = state.map(v => {
            let prob = (v==0) ? prob01 : prob10;
            return (Math.random()<prob) ? 1-v : v;
        });
        
        // update the number of attending agents
        this.nAttending = state.reduce((c,v) => c+v, 0);
        
        // add the new state to history
        this.last = state.slice();
        this.history = this.history.slice(1);
        this.history.push(this.observe(state));
    }
    observe(state) {
        return state.map(v => {
                let prob = this.pOff;
                if(v==1) {
                    prob = this.pOn;
                }
                return (Math.random() < prob) ? 1 : 0;
            });
    }
}
