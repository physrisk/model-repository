class SznajdModel {
    constructor(height=100,width=200,pUp=0.5,uRule=true,dRule=true) {
        this.width=width;
        this.height=height;
        this.globalSpin=0;
        this.initializeSpinArray(pUp);
        this.unitedRule=uRule;
        this.dividedRule=dRule;
    }
    initializeSpinArray(pUp) {
        let i,j,tmp;
        this.spinArray=[];
        for(i=0;i<this.height;i+=1) {
            tmp=[];
            for(j=0;j<this.width;j+=1) {
                if(Math.random()<pUp) {
                    tmp.push(1);
                    this.globalSpin+=1;
                } else {
                    tmp.push(-1);
                    this.globalSpin-=1;
                }
            }
            this.spinArray.push(tmp);
        }
    }
    step(nSteps) {
        let i;
        for(i=0;i<nSteps;i+=1) {
            this.singleStep();
        }
        return this.globalSpin;
    }
    singleStep() {
        let x,y,r,dx,dy,dspin;
        dspin=0;
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
            // apply united we stand rule
            if(this.unitedRule) {
                dspin=this.setNeighborsSpin(x,y,1);
                dspin+=this.setNeighborsSpin(x+dx,y+dy,1);
            }
        } else {
            // apply divided we fall rule
            if(this.dividedRule) {
                dspin=this.setNeighborsSpin(x,y,-1);
                dspin+=this.setNeighborsSpin(x+dx,y+dy,-1);
            }
        }
        this.globalSpin+=dspin;
    }
    getSpin(x,y) {
        let nx,ny;
        nx=x+this.width;
        ny=y+this.height;
        return this.spinArray[(ny) % this.height][(nx) % this.width];
    }
    setNeighborsSpin(x,y,s=1) {
        let nx,ny,spin,dspin;
        nx=x+this.width;
        ny=y+this.height;
        spin=s*this.spinArray[(ny) % this.height][(nx) % this.width];
        dspin=0;
        dspin-=this.spinArray[((ny-1) % this.height)][(nx) % this.width];
        dspin-=this.spinArray[((ny+1) % this.height)][(nx) % this.width];
        dspin-=this.spinArray[(ny) % this.height][((nx-1) % this.width)];
        dspin-=this.spinArray[(ny) % this.height][((nx+1) % this.width)];
        this.spinArray[((ny-1) % this.height)][(nx) % this.width]=spin;
        this.spinArray[((ny+1) % this.height)][(nx) % this.width]=spin;
        this.spinArray[(ny) % this.height][((nx-1) % this.width)]=spin;
        this.spinArray[(ny) % this.height][((nx+1) % this.width)]=spin;
        dspin+=(4*spin);
        return dspin;
    }
}
