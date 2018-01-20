class returnModel {
    constructor() {}
    // set parameter values and other relevant variables (reset the model)
    setParams(sdeParams,noiseParams) {
        // set parameters related to SDE ---------------------------------------
        this.simple=sdeParams.simple;// boolean: simple SDE? otherwise double SDE
        this.lambda=sdeParams.lambda;// double: lambda in the SDEs
        this.epsilon=sdeParams.epsilon;// double: epsilon in the double SDE
        this.doubleEta=Math.round(sdeParams.doubleEta);// int: 2*eta in the SDEs
        this.xmax=sdeParams.xmax;// double: xmax in the SDEs
        // set parameters related to exogeneous noise --------------------------
        this.noiseUse=noiseParams.use;// boolean: is the noise applied?
        this.noiseLambda=noiseParams.lambda;//double: lambda_2 of the noise
        this.noiseR0=noiseParams.r0;// double: {\bar r}_0 of the noise
        // set default parameter values ----------------------------------------
        this.tauSSecond=0.0002/60.0;// double: define second in scaled time
        this.kappaSq=0.001;// double: squared numerical precission parameter
        this.x=1.0;// double: current (initial) value of x
        // set some values for faster evaluation -------------------------------
        this.driftMultiplier=(this.doubleEta-this.lambda)/2.0;
        this.noiseQ=1.0+2.0/this.noiseLambda;
        this.noiseSqR=Math.sqrt((this.noiseQ-1)/(3-this.noiseQ));
    }
    // general function which returns realization
    getRealization(realizationParams) {
        if(!this.simple) {
            return this.doubleRealization(realizationParams);
        }
        return this.simpleRealization(realizationParams);
    }
    //
    // functions solving simple sde ============================================
    //
    // get a realization by solving simple SDE (based on realization parameters)
    simpleRealization(realizationParams) {
        var i;
        var series=Array(realizationParams.points);
        for(i=0;i<realizationParams.points;i+=1) {
            series[i]=this.simpleStep(realizationParams.dt);
        }
        return series;
    }
    // get single discretization step by solving simple SDE
    // implemented method is Euler-Maruyama, but the steps
    // are variable and solutions are integrated
    simpleStep(dt) {
        var whileDt, term, sqTerm;
        var time=0;
        var integrated=0;
        while(time<dt) {
            // term and sqTerm are helper variables
            // we precalculate them to avoid calculating
            // them multiple times
            term=1.0+this.x*this.x;// 1+x^2
            sqTerm=1.0;// is not relevant if doubleEta is 3 or 5
            if(this.doubleEta===4) {// if doubleEta is 4, then calculate it
                sqTerm=Math.sqrt(term);// (1+x^2)^0.5
            }
            // desired variable step
            whileDt=this.simpleVarStep(this.x,term,sqTerm);
            // if desired variable step leads outside desired time step
            if(time+whileDt>dt) {
                whileDt=dt-time;// then adjust to a smaller value
            }
            // update x value
            this.x=this.simpleSolve(this.x,term,sqTerm,whileDt);
            this.x=Math.min(Math.max(this.x,0),this.xmax);
            // integrate
            integrated+=(this.x*whileDt);
            // incremenet time
            time+=whileDt;
        }
        return integrated/dt;
    }
    // solve simple SDE using Euler-Maruyama method for given step dt
    simpleSolve(x,term,sqTerm,dt) {
        return x+this.simpleDrift(x,term,sqTerm,dt)+this.simpleDiffusion(x,term,sqTerm,dt);
    }
    simpleDrift(x,term,sqTerm,dt) {
        var rez=this.driftMultiplier*x*dt;
        switch(this.doubleEta) {
            case 3: // ^0.5
                return rez*sqTerm;
            case 4: // ^1
                return rez*term;
            case 5: // ^1.5
                return rez*term*sqTerm;
            default:
                throw "Bad doubleEta: "+this.doubleEta;
        }
    }
    simpleDiffusion(x,term,sqTerm,dt) {
        var rez=commonFunctions.gaussianRandom();
        switch(this.doubleEta) {
            case 3: // ^3/4
                return rez*term*Math.sqrt(dt/sqTerm);
            case 4: // ^1
                return rez*term*Math.sqrt(dt);
            case 5: // ^5/4
                return rez*term*Math.sqrt(dt*sqTerm);
            default:
                throw "Bad doubleEta: "+this.doubleEta;
        }
    }
    simpleVarStep(x,term,sqTerm) {
        var rez=this.kappaSq;
        switch(this.doubleEta) {
            case 3: // ^0.5
                return rez/sqTerm;
            case 4: // ^1
                return rez/term;
            case 5: // ^1.5
                return rez/(term*sqTerm);
            default:
                throw "Bad doubleEta: "+this.doubleEta;
        }
    }
    //
    // functions solving double sde ============================================
    //
    // get realization by evaluating double model
    doubleRealization(realizationParams) {
        var i;
        var series=Array(realizationParams.points);
        for(i=0;i<realizationParams.points;i+=1) {
            series[i]=this.doubleStep(realizationParams.dt);
        }
        return series;
    }
    // get double model discretization step by solving double SDE
    // and applying exogeneous noise
    // implemented method is Euler-Maruyama, but the steps
    // are variable and solutions are integrated before applying
    // the noise
    doubleStep(dt) {
        var whileDt, term, sqTerm, fracTerm;
        var time=0;
        var integrated=0;
        while(time<dt) {
            // term and sqTerm are helper variables
            // we precalculate them to avoid calculating
            // them multiple times
            term=1.0+this.x*this.x;// 1+x^2
            sqTerm=Math.sqrt(term);// (1+x^2)^0.5
            fracTerm=1+this.epsilon*sqTerm;// 1+e*(1+x^2)^0.5
            // desired variable step
            whileDt=this.doubleVarStep(this.x,term,sqTerm,fracTerm);
            // if desired variable step leads outside desired time step
            if(time+whileDt>dt) {
                whileDt=dt-time;// then adjust to a smaller value
            }
            // update x value
            this.x=this.doubleSolve(this.x,term,sqTerm,fracTerm,whileDt);
            this.x=Math.max(this.x,0);
            // integrate
            integrated+=(this.x*whileDt);
            // incremenet time
            time+=whileDt;
        }
        if(this.noiseUse) {
            return this.addOnNoise(integrated/dt);
        }
        return integrated/dt;
    }
    // solve double SDE using Euler-Maruyama method for given step dt
    doubleSolve(x,term,sqTerm,fracTerm,dt) {
        var sol=x;
        sol+=this.doubleDrift(x,term,sqTerm,fracTerm,dt);
        sol+=this.doubleDiffusion(x,term,sqTerm,fracTerm,dt);
        return sol;
    }
    doubleDrift(x,term,sqTerm,fracTerm,dt) {
        var rez=(this.driftMultiplier-x/this.xmax)*x*dt;
        var fracTermSq=fracTerm*fracTerm;
        rez/=fracTermSq;
        switch(this.doubleEta) {
            case 3: // ^0.5
                return rez*sqTerm;
            case 4: // ^1
                return rez*term;
            case 5: // ^1.5
                return rez*term*sqTerm;
            default:
                throw "Bad doubleEta: "+this.doubleEta;
        }
    }
    doubleDiffusion(x,term,sqTerm,fracTerm,dt) {
        var rez=commonFunctions.gaussianRandom();
        rez/=fracTerm;
        switch(this.doubleEta) {
            case 3: // ^3/4
                return rez*term*Math.sqrt(dt/sqTerm);
            case 4: // ^1
                return rez*term*Math.sqrt(dt);
            case 5: // ^5/4
                return rez*term*Math.sqrt(dt*sqTerm);
            default:
                throw "Bad doubleEta: "+this.doubleEta;
        }
    }
    doubleVarStep(x,term,sqTerm,fracTerm) {
        var rez=this.kappaSq;
        rez*=fracTerm;
        switch(this.doubleEta) {
            case 3: // ^0.5
                return rez/sqTerm;
            case 4: // ^1
                return rez/term;
            case 5: // ^1.5
                return rez/(term*sqTerm);
            default:
                throw "Bad doubleEta: "+this.doubleEta;
        }
    }
    
    // add noise on top of the integrated solution
    addOnNoise(intSol) {
        var sq=this.noiseRR(intSol)*this.noiseSqR;
        return sq*commonFunctions.qGaussianRandom(this.noiseQ,true);
    }
    noiseRR(mar) {
        return 1.0+this.noiseR0*Math.abs(mar);
    }
}
