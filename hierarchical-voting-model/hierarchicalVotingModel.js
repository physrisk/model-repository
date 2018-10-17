class HierarchicalVotingModel {
    constructor(levels=8,factor=2,pUp=0.5) {
        this.levels=levels;
        this.factor=factor;
        this.layers=[];
        this.addRandomLayer(Math.pow(factor,levels-1),pUp);
    }
    getLayer(level) {
        let size;
        if(level<1) {
            level=1;
        } else if(level>this.levels) {
            level=this.levels;
        }
        size=this.layers[this.layers.length-1].length;
        while(level>this.layers.length) {
            size/=this.factor;
            this.aggregateLayer(size,this.factor);
        }
        return this.layers[level-1];
    }
    addRandomLayer(size,pUp) {
        let i,j,rlay,rvec;
        rlay=[];
        for(i=0;i<size;i+=1) {
            rvec=[];
            for(j=0;j<size;j+=1) {
                if(Math.random()<pUp) {
                    rvec.push(1);
                } else {
                    rvec.push(-1);
                }
            }
            rlay.push(rvec);
        }
        this.layers.push(rlay);
        return true;
    }
    aggregateLayer(size,factor) {
        let i,j,cl,alay,avec,vote;
        cl=this.layers.length-1;
        if(cl<0 || size<1) {
            return false;
        }
        alay=[];
        for(i=0;i<size;i+=1) {
            avec=[];
            for(j=0;j<size;j+=1) {
                vote=this.getNeighborhoodVote(cl,i,j,factor);
                if(vote>0) {
                    avec.push(1);
                } else {
                    avec.push(-1);
                }
            }
            alay.push(avec);
        }
        this.layers.push(alay);
        return true;
    }
    getNeighborhoodVote(cl,i,j,size) {
        let k,l,vote;
        vote=0;
        for(k=i*size;k<(i+1)*size;k+=1) {
            for(l=j*size;l<(j+1)*size;l+=1) {
                vote+=this.layers[cl][k][l];
            }
        }
        return vote;
    }
}
