class MajorityVoteModel {
    constructor(height=100,width=200,q=0.01,pUp=0.5) {
        this.width=width;
        this.height=height;
        this.q=q;
        this.globalSpin=0;
        this.initializeSpinArray(pUp);
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
        let x,y,nSpin,flip;
        x=Math.floor(Math.random()*this.width);
        y=Math.floor(Math.random()*this.height);
        nSpin=this.getNeighborsSpin(x,y);
        flip=false;
        if(nSpin*this.spinArray[y][x]>0) {
            flip=(Math.random()<this.q);
        } else if(nSpin==0) {
            flip=(Math.random()<0.5);
        } else {
            flip=(Math.random()<1-this.q);
        }
        if(flip) {
            this.globalSpin-=2*this.spinArray[y][x];
            this.spinArray[y][x]=-this.spinArray[y][x];
        }
    }
    getNeighborsSpin(x,y) {
        let nx,ny,spin;
        nx=x+this.width;
        ny=y+this.height;
        spin=0;
        // von Neumann (R=1) neighborhood
        spin+=this.spinArray[((ny-1) % this.height)][x];
        spin+=this.spinArray[((ny+1) % this.height)][x];
        spin+=this.spinArray[y][((nx-1) % this.width)];
        spin+=this.spinArray[y][((nx+1) % this.width)];
        return spin;
    }
}
