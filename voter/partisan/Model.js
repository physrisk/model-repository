class PartisanModel {
    constructor(height=100,width=200,epsi=0,pExtUp=0.5,pIntUp=0.5,invDt=2) {
        this.width=width;
        this.height=height;
        this.invDt=invDt;
        this.epsilon=epsi;
        this.globalExt=0;
        this.globalInt=0;
        this.disonant=0;
        this.initializeArrays(pExtUp,pIntUp);
    }
    initializeArrays(pExtUp,pIntUp) {
        let i,j,extTmp,intTmp;
        this.extArray=[];
        this.intArray=[];
        for(i=0;i<this.height;i+=1) {
            extTmp=[];
            intTmp=[];
            for(j=0;j<this.width;j+=1) {
                if(Math.random()<pExtUp) {
                    extTmp.push(1);
                    this.globalExt+=1;
                } else {
                    extTmp.push(-1);
                    this.globalExt-=1;
                }
                if(Math.random()<pIntUp) {
                    intTmp.push(1);
                    this.globalInt+=1;
                } else {
                    intTmp.push(-1);
                    this.globalInt-=1;
                }
                if(extTmp[extTmp.length-1]*intTmp[intTmp.length-1]<0) {
                    this.disonant+=1;
                }
            }
            this.extArray.push(extTmp);
            this.intArray.push(intTmp);
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
        let x,y,meOp,miOp,nOp,rate,dDis;
        // pick random agent
        x=Math.floor(Math.random()*this.width);
        y=Math.floor(Math.random()*this.height);
        meOp=this.getExtSpin(x,y);
        miOp=this.getIntSpin(x,y);
        // get random neighbor's external opinion
        nOp=this.getExtSpin(x,y,this.getRandomDirection());
        // if external opinions match, do nothing
        if(meOp==nOp) {
            return ;
        }
        // otherwise determine flipping rate 
        rate=1;
        dDis=0;
        if(miOp==nOp) {// if internal opinion matches
            rate+=this.epsilon;
            dDis=-1;
        } else {// if internal opinion doesn't match
            rate-=this.epsilon;
            dDis=1;
        }
        // translate into flipping probability and execute
        if(this.invDt*Math.random()<rate) {
            this.globalExt-=this.extArray[y][x];
            this.extArray[y][x]=-this.extArray[y][x];
            this.globalExt+=this.extArray[y][x];
            this.disonant+=dDis;
        }
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
    getSpin(x,y,spinArray,dir=[0,0]) {
        let nx,ny;
        nx=x+dir[0]+this.width;
        ny=y+dir[1]+this.height;
        return spinArray[(ny) % this.height][(nx) % this.width];
    }
    getExtSpin(x,y,dir=[0,0]) {
        return this.getSpin(x,y,this.extArray,dir);
    }
    getIntSpin(x,y,dir=[0,0]) {
        return this.getSpin(x,y,this.intArray,dir);
    }
}
