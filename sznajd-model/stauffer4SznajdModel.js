class Stauffer4SznajdModel {
    constructor(height=100,width=200,pUp=[0.5,0.625,0.75,0.875,1]) {
        this.width=width;
        this.height=height;
        this.globalSpin=[0,0,0,0,0];
        this.initializeSpinArray(pUp);
    }
    initializeSpinArray(pUp) {
        let i,j,tmp,r,emptyCells;
        emptyCells=[];
        this.spinArray=[];
        for(i=0;i<this.height;i+=1) {
            tmp=[];
            for(j=0;j<this.width;j+=1) {
                r=Math.random();
                if(r<pUp[0]) {
                    emptyCells.push([j,i]);
                    tmp.push(0);
                    this.globalSpin[0]+=1;
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
        while(emptyCells.length>0) {
            tmp=Math.floor(Math.random()*emptyCells.length);
            if(this.copyNonEmpty(emptyCells[tmp][0],emptyCells[tmp][1])) {
                emptyCells.splice(tmp,1);
            }
        }
    }
    copyNonEmpty(x,y) {
        let tmp, nonEmpties, spin;
        if(this.getSpin(x,y)>0) {
            return false;
        }
        nonEmpties=[];
        spin=this.getSpin(x+1,y);
        if(spin>0) {
            nonEmpties.push(spin);
        }
        spin=this.getSpin(x-1,y);
        if(spin>0) {
            nonEmpties.push(spin);
        }
        spin=this.getSpin(x,y+1);
        if(spin>0) {
            nonEmpties.push(spin);
        }
        spin=this.getSpin(x,y-1);
        if(spin>0) {
            nonEmpties.push(spin);
        }
        if(nonEmpties.length==0) {
            return false;
        }
        tmp=Math.floor(Math.random()*nonEmpties.length);
        this.setSpin(x,y,nonEmpties[tmp]);
        this.globalSpin[0]-=1;
        this.globalSpin[nonEmpties[tmp]]+=1;
        return true;
    }
    step(nSteps) {
        let i;
        for(i=0;i<nSteps;i+=1) {
            this.singleStep();
        }
        return this.globalSpin;
    }
    singleStep() {
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
