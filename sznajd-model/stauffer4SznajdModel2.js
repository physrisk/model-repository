class Stauffer4SznajdModel {
    constructor(height=100,width=200,pUp=[0.5,0.625,0.75,0.875,1]) {
        this.empty=-100;
        this.width=width;
        this.height=height;
        this.globalSpin=[0,0,0,0,0];
        this.initializeSpinArray(pUp);
    }
    initializeSpinArray(pUp) {
        let i,j,tmp,r;
        this.spinArray=[];
        for(i=0;i<this.height;i+=1) {
            tmp=[];
            for(j=0;j<this.width;j+=1) {
                r=Math.random();
                if(r<pUp[0]) {
                    tmp.push(this.empty);
                } else if(r<pUp[1]) {
                    tmp.push(1);
                    this.globalSpin[1]+=1;
                } else if(r<pUp[2]) {
                    tmp.push(2);
                    this.globalSpin[2]+=1;
                } else if(r<pUp[3]) {
                    tmp.push(3);
                    this.globalSpin[3]+=1;
                } else {
                    tmp.push(4);
                    this.globalSpin[4]+=1;
                }
            }
            this.spinArray.push(tmp);
        }
    }
    step(nSteps) {
        let i;
        for(i=0;i<nSteps;i+=1) {
            this.diffusionStep();
            this.opinionStep();
        }
        return this.globalSpin;
    }
    diffusionStep() {
        let x,y,tmp,empties,spin;
        // pick random agent
        x=Math.floor(Math.random()*this.width);
        y=Math.floor(Math.random()*this.height);
        spin=this.getSpin(x,y);
        while(spin==this.empty) {
            x=Math.floor(Math.random()*this.width);
            y=Math.floor(Math.random()*this.height);
            spin=this.getSpin(x,y);
        }
        // get available spaces
        empties=[];
        if(this.getSpin(x+1,y)==this.empty) {
            empties.push([x+1,y]);
        }
        if(this.getSpin(x-1,y)==this.empty) {
            empties.push([x-1,y]);
        }
        if(this.getSpin(x,y+1)==this.empty) {
            empties.push([x,y+1]);
        }
        if(this.getSpin(x,y-1)==this.empty) {
            empties.push([x,y-1]);
        }
        if(empties.length==0) {// no available
            return false;
        }
        // move to random space
        tmp=Math.floor(Math.random()*empties.length);
        this.setSpin(x,y,this.empty);
        this.setSpin(empties[tmp][0],empties[tmp][1],spin);
        return true;
    }
    opinionStep() {
        let x,y,r,dx,dy;
        // pick random agent
        x=Math.floor(Math.random()*this.width);
        y=Math.floor(Math.random()*this.height);
        // pick random neighbor
        r=Math.floor(4*Math.random());
        dx=1;dy=0;
        if(r==1) {
            dx=-1;dy=0;
        } else if(r==2) {
            dx=0;dy=-1;
        } else if(r==3) {
            dx=0;dy=1;
        }
        if(this.getSpin(x,y)==this.getSpin(x+dx,y+dy)) {
            this.setNeighborsSpin(x,y);
            this.setNeighborsSpin(x+dx,y+dy);
        }
    }
    getSpin(x,y) {
        let nx,ny;
        nx=x+this.width;
        ny=y+this.height;
        return this.spinArray[(ny) % this.height][(nx) % this.width];
    }
    setSpin(x,y,val) {
        let nx,ny;
        nx=x+this.width;
        ny=y+this.height;
        this.spinArray[(ny) % this.height][(nx) % this.width]=val;
    }
    setNeighborsSpin(x,y) {
        let spin,spin2;
        spin=this.getSpin(x,y);
        spin2=this.getSpin(x+1,y);
        if(Math.abs(spin-spin2)<2) {
            this.setSpin(x+1,y,spin);
            this.globalSpin[spin2]-=1;
            this.globalSpin[spin]+=1;
        }
        spin2=this.getSpin(x-1,y);
        if(Math.abs(spin-spin2)<2) {
            this.setSpin(x-1,y,spin);
            this.globalSpin[spin2]-=1;
            this.globalSpin[spin]+=1;
        }
        spin2=this.getSpin(x,y+1);
        if(Math.abs(spin-spin2)<2) {
            this.setSpin(x,y+1,spin);
            this.globalSpin[spin2]-=1;
            this.globalSpin[spin]+=1;
        }
        spin2=this.getSpin(x,y-1);
        if(Math.abs(spin-spin2)<2) {
            this.setSpin(x,y-1,spin);
            this.globalSpin[spin2]-=1;
            this.globalSpin[spin]+=1;
        }
    }
}
