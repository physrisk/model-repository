class PartisanModel {
    constructor(height=100,width=200,epsi=0,pExtUp=0.5,pIntUp=0.5,invDt=2) {
        this.nAgents=width*height;
        this.invDt=invDt;
        this.epsilon=epsi;
        this.globalExt=0;
        this.globalInt=0;
        this.disonant=0;
        this.disR=0;
        this.disB=0;
        this.initializeArrays(pExtUp,pIntUp);
    }
    initializeArrays(pExtUp,pIntUp) {
        let i,extTmp,intTmp;
        this.type=[0,0,0,0];
        this.extArray=[];
        this.intArray=[];
        for(i=0;i<this.nAgents;i+=1) {
            extTmp=0;
            intTmp=0;
            if(Math.random()<pExtUp) {
                extTmp=1;
                this.globalExt+=1;
            } else {
                extTmp=-1;
                this.globalExt-=1;
            }
            if(Math.random()<pIntUp) {
                intTmp=1;
                this.globalInt+=1;
            } else {
                intTmp=-1;
                this.globalInt-=1;
            }
            if(extTmp*intTmp<0) {
                this.disonant+=1;
                if(intTmp<0) {
                    this.disB+=1;
                } else {
                    this.disR+=1;
                }
            }
            this.extArray.push(extTmp);
            this.intArray.push(intTmp);
            this.type[this.typeId(extTmp,intTmp)]+=1;
        }
    }
    step(nSteps) {
        let i;
        for(i=0;i<nSteps;i+=1) {
            this.singleStep();
        }
        return this.globalExt;
    }
    singleStep() {
        let x,y,meOp,miOp,nOp,rate,dDis,dDisR,dDisB;
        // pick random agent
        x=Math.floor(Math.random()*this.nAgents);
        meOp=this.extArray[x];
        miOp=this.intArray[x];
        // get random neighbor's external opinion
        y=Math.floor(Math.random()*this.nAgents);
        nOp=this.extArray[y];
        // if external opinions match, do nothing
        if(meOp==nOp) {
            return ;
        }
        // otherwise determine flipping rate 
        rate=1;
        dDis=0;
        dDisR=0;
        dDisB=0;
        if(miOp==nOp) {// if internal opinion matches
            rate+=this.epsilon;
            dDis=-1;
            if(miOp<0) {
                dDisB=-1;
            } else {
                dDisR=-1;
            }
        } else {// if internal opinion doesn't match
            rate-=this.epsilon;
            dDis=1;
            if(miOp<0) {
                dDisB=1;
            } else {
                dDisR=1;
            }
        }
        // translate into flipping probability and execute
        if(this.invDt*Math.random()<rate) {
            this.globalExt-=this.extArray[x];
            this.type[this.typeId(meOp,miOp)]-=1;
            this.extArray[x]=-this.extArray[x];
            this.type[this.typeId(this.extArray[x],miOp)]+=1;
            this.globalExt+=this.extArray[x];
            this.disonant+=dDis;
            this.disB+=dDisB;
            this.disR+=dDisR;
        }
    }
    typeId(e,i) {
        return 2*(1+e)/2+(1+i)/2;
    }
}
