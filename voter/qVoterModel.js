class QVoterModel {
    constructor(height=100,width=200,q=2,epsi=0,pUp=0.5) {
        this.width=width;
        this.height=height;
        this.q=q;
        this.epsilon=epsi;
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
        let x,y,spinZero,qi,united;
        x=Math.floor(Math.random()*this.width);
        y=Math.floor(Math.random()*this.height);
        united=true;
        spinZero=this.getSpin(x,y,this.getRandomDirection());
        for(qi=1;(qi<this.q) && (united);qi+=1) {
            united=(spinZero==this.getSpin(x,y,this.getRandomDirection()));
        }
        this.globalSpin-=this.spinArray[y][x];
        if(united) {
            this.spinArray[y][x]=spinZero;
        } else if(Math.random()<this.epsilon) {
            this.spinArray[y][x]=-this.spinArray[y][x];
        }
        this.globalSpin+=this.spinArray[y][x];
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
    getSpin(x,y,dir=[0,0]) {
        let nx,ny;
        nx=x+dir[0]+this.width;
        ny=y+dir[1]+this.height;
        return this.spinArray[(ny) % this.height][(nx) % this.width];
    }
    getCriticals(q=-1) {
        let e1,e2;
        if(q<0) {
            q=this.q;
        }
        if(q<=1) {
            return ["?","?"];
        }
        e1=(q-1)/(Math.pow(2,q)-2);
        e2=(q*(17/3+q*(q/3-2))-4)/(Math.pow(2,q+2)-2*(4+q*(q-1)));
        if(e1<e2) {
            return [e1,e2];
        }
        return [e2,e1];
    }
}
