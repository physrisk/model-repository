class VVoterModel {
    constructor(height=100,width=200,pUp=0.5) {
        this.width=width;
        this.height=height;
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
        let x,y,spinZero;
        // pick random agent
        x=Math.floor(Math.random()*this.width);
        y=Math.floor(Math.random()*this.height);
        // pick random neighbor
        spinZero=this.getSpin(x,y,this.getRandomDirection());
        // if agent and neighbor have same opinion
        if(this.spinArray[y][x]==spinZero) {
            // select another neighbor
            spinZero=this.getSpin(x,y,this.getRandomDirection());
        }
        // if agent and either of neighbors have different opinions
        if(this.spinArray[y][x]!=spinZero) {
            // adopt the new opinion
            this.spinArray[y][x]=spinZero;
            this.globalSpin+=(2*spinZero);
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
    getSpin(x,y,dir=[0,0]) {
        let nx,ny;
        nx=x+dir[0]+this.width;
        ny=y+dir[1]+this.height;
        return this.spinArray[(ny) % this.height][(nx) % this.width];
    }
}
