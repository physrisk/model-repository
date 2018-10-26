class QIVoterModel {
    constructor(height=100,width=200,q=2,pI=0.5,pUp=0.5,cg=true) {
        this.width=width;
        this.height=height;
        this.q=q;
        this.pIndependence=pI;
        this.globalSpin=0;
        this.initializeSpinArray(pUp);
        this.completeGraph=cg;
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
        let x,y,spinZero,qi,united;
        // pick random agent
        x=Math.floor(Math.random()*this.width);
        y=Math.floor(Math.random()*this.height);
        // check if the agent will act independently
        if(Math.random()<this.pIndependence) {
            if(Math.random()<0.5) {
                this.globalSpin-=this.spinArray[y][x];
                this.spinArray[y][x]=-this.spinArray[y][x];
                this.globalSpin+=this.spinArray[y][x];
            }
        } else {
            // check if neighbors are united in opinion
            united=true;
            spinZero=this.getSpin(x,y,this.getRandomDirection());
            for(qi=1;(qi<this.q) && (united);qi+=1) {
                united=(spinZero==this.getSpin(x,y,this.getRandomDirection()));
            }
            this.globalSpin-=this.spinArray[y][x];
            if(united) {
                // if they are united, then adopt their opinion
                this.spinArray[y][x]=spinZero;
            }
            this.globalSpin+=this.spinArray[y][x];
        }
    }
    getRandomDirection() {
        let r,x,y;
        if(this.completeGraph) {
            x=Math.floor(Math.random()*this.width);
            y=Math.floor(Math.random()*this.height);
            while(x==0 && y==0) {
                x=Math.floor(Math.random()*this.width);
                y=Math.floor(Math.random()*this.height);
            }
            return [x,y];
        }
        r=Math.floor(4*Math.random());
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
    getSpin(x,y,dir=[0,0]) {
        let nx,ny;
        nx=x+dir[0]+this.width;
        ny=y+dir[1]+this.height;
        return this.spinArray[(ny) % this.height][(nx) % this.width];
    }
    getCriticals(q=-1,cg=null) {
        if(q<0) {
            q=this.q;
        }
        if(cg===null) {
            cg=this.completeGraph;
        }
        if(!cg) {
            return "?";
        }
        return (q-1)/(q-1+Math.pow(2,q-1));
    }
}
