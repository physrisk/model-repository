class abmThreeType {
    constructor() {}
    setParams(params) {
        // get parameter values 
        this.a1=params.a1;
        this.a2=params.a2;
        this.b1=params.b1;
        this.b2=params.b2;
        this.c1=params.c1;
        this.c2=params.c2;
        this.h1=1;
        this.h2=params.H;
        this.dt=params.T;
        // set default values
        this.kappa=0.3;
        this.N=100;
        this.Nmin=1;
        this.resetState();
    }
    resetState() {
        this.Nfund=Math.floor(Math.random()*this.N/2.0);
        this.Npes=Math.floor((this.N-this.Nfund)/2.0);
        this.Nopt=this.N-this.Nfund-this.Npes;
    }
    getRealization(points) {
        var i;
        var rez=Array(points);
        for(i=0;i<points;i+=1) {
            rez[i]=this.step();
        }
        return rez;
    }
    step() {
        var whileDt, probs;
        var t=0;
        var logPrice=(this.Nopt-this.Npes)/this.Nfund;
        while(t<this.dt) {
            probs=[this.piPesFund(),this.piOptFund(),this.piFundPes(),
                   this.piOptPes(),this.piFundOpt(),this.piPesOpt()];
            whileDt=this.variableDt(probs);
            if(t+whileDt>this.T) {
                whileDt=this.T-t;
            }
            this.singleJump(Math.random()/whileDt,probs);
            t+=whileDt;
        }
        return Math.abs((this.Nopt-this.Npes)/this.Nfund-logPrice);
    }
    singleJump(rnd,probs) {
        rnd-=probs[0];
        if(rnd<0) {// pes->fund
            if(this.Npes>this.Nmin) {
                this.Npes-=1;
                this.Nfund+=1;
            }
        } else {
            rnd-=probs[1];
            if(rnd<0) {// opt->fund
                if(this.Nopt>this.Nmin) {
                    this.Nopt-=1;
                    this.Nfund+=1;
                }
            } else {
                rnd-=probs[2];
                if(rnd<0) {// fund->pes
                    if(this.Nfund>this.Nmin) {
                        this.Nfund-=1;
                        this.Npes+=1;
                    }
                } else {
                    rnd-=probs[3];
                    if(rnd<0) {// opt->pes
                        if(this.Nopt>this.Nmin) {
                            this.Nopt-=1;
                            this.Npes+=1;
                        }
                    } else {
                        rnd-=probs[4];
                        if(rnd<0) {// fund->opt
                            if(this.Nfund>this.Nmin) {
                                this.Nfund-=1;
                                this.Nopt+=1;
                            }
                        } else {
                            rnd-=probs[5];
                            if(rnd<0) {// pes->opt
                                if(this.Npes>this.Nmin) {
                                    this.Npes-=1;
                                    this.Nopt+=1;
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    variableDt(probs) {
        return this.kappa/(probs[0]+probs[1]+probs[2]+probs[3]+probs[4]+probs[5]);
    }
    // transition rates
    // a->b
    piPesFund() {
        return this.Npes*(this.a1+this.h1*this.Nfund);
    }
    piOptFund() {
        return this.Nopt*(this.a2+this.h1*this.Nfund);
    }
    piFundPes() {
        return this.Nfund*(this.c1+this.h1*this.Npes);
    }
    piOptPes() {
        return this.Nopt*(this.c2+this.h2*this.Npes);
    }
    piFundOpt() {
        return this.Nfund*(this.b1+this.h1*this.Nopt);
    }
    piPesOpt() {
        return this.Npes*(this.b2+this.h2*this.Nopt);
    }
}
