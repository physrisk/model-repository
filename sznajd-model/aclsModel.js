class ACLSModel {
    constructor(height=100,width=200,pToll=0.1,pEco=0.5,pSoc=0.5) {
        this.width=width;
        this.height=height;
        this.pTollerance=pToll;
        this.globalSpin=[0,0,0,0];
        this.initializeSpinArrays(pEco,pSoc);
    }
    initializeSpinArrays(pEco,pSoc) {
        let i,j,tmpE,tmpS,group;
        this.ecoArray=[];
        this.socArray=[];
        for(i=0;i<this.height;i+=1) {
            tmpE=[];
            tmpS=[];
            for(j=0;j<this.width;j+=1) {
                group=0;
                if(Math.random()<pEco) {
                    tmpE.push(1);
                    group+=2;
                } else {
                    tmpE.push(-1);
                }
                if(Math.random()<pSoc) {
                    tmpS.push(1);
                    group+=1;
                } else {
                    tmpS.push(-1);
                }
                this.globalSpin[group]+=1;
            }
            this.ecoArray.push(tmpE);
            this.socArray.push(tmpS);
        }
    }
    step(nSteps) {
        let i;
        for(i=0;i<nSteps;i+=1) {
            this.ecoStep();
            this.socStep();
        }
        return this.globalSpin;
    }
    socStep() {
        let model=this;
        function socFlip(nx,ny,spin) {
            let ideo;

            ideo=model.getIdeology(nx,ny);
            model.globalSpin[ideo]-=1;

            model.setSocSpin(nx,ny,spin);

            ideo=model.getIdeology(nx,ny);
            model.globalSpin[ideo]+=1;
        }

        let x,y,r,dx,dy,spin;
        // pick random agent
        x=Math.floor(Math.random()*this.width);
        y=Math.floor(Math.random()*this.height);
        // pick two random neighbors (second one has (-dx,-dy) coordiantes
        // by default)
        r=Math.floor(4*Math.random());
        dx=1;dy=0;
        if(r==1) {
            dx=-1;dy=0;
        } else if(r==2) {
            dx=0;dy=-1;
        } else if(r==3) {
            dx=0;dy=1;
        }
        if(this.getEcoSpin(x+dx,y+dy)==this.getEcoSpin(x-dx,y-dy)) {
            spin=this.getSocSpin(x+dx,y+dy);
            if(spin==this.getSocSpin(x-dx,y-dy)) {
                socFlip(x,y,spin);
            } else if(Math.random()<0.5) {
                socFlip(x,y,-this.getSocSpin(x,y));
            }
        } else if(Math.random()<this.pTollerance) {
            spin=this.getSocSpin(x+dx,y+dy);
            if(spin==this.getSocSpin(x-dx,y-dy)) {
                socFlip(x,y,spin);
            } else if(Math.random()<0.5) {
                socFlip(x,y,-this.getSocSpin(x,y));
            }
        }
    }
    ecoStep() {
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
        // update economics according to Sznajd model if agreed on social
        // otherwise update economics according to SM with probability of pTollerance
        if(this.getSocSpin(x,y)==this.getSocSpin(x+dx,y+dy)) {
            this.setNeighborsEcoSpin(x,y);
            this.setNeighborsEcoSpin(x+dx,y+dy);
        } else if(Math.random()<this.pTollerance) {
            this.setNeighborsEcoSpin(x,y);
            this.setNeighborsEcoSpin(x+dx,y+dy);
        }
    }
    getIdeology(x,y) {
        let ideo=0;
        if(this.getEcoSpin(x,y)>0) {
            ideo+=2;
        }
        if(this.getSocSpin(x,y)>0) {
            ideo+=1;
        }
        return ideo;
    }
    getEcoSpin(x,y) {
        let nx,ny;
        nx=x+this.width;
        ny=y+this.height;
        return this.ecoArray[(ny) % this.height][(nx) % this.width];
    }
    setEcoSpin(x,y,val) {
        let nx,ny;
        nx=x+this.width;
        ny=y+this.height;
        this.ecoArray[(ny) % this.height][(nx) % this.width]=val;
    }
    getSocSpin(x,y) {
        let nx,ny;
        nx=x+this.width;
        ny=y+this.height;
        return this.socArray[(ny) % this.height][(nx) % this.width];
    }
    setSocSpin(x,y,val) {
        let nx,ny;
        nx=x+this.width;
        ny=y+this.height;
        this.socArray[(ny) % this.height][(nx) % this.width]=val;
    }
    setNeighborsEcoSpin(x,y) {
        let model=this;
        function ecoFlip(nx,ny,spin) {
            let ideo;

            ideo=model.getIdeology(nx,ny);
            model.globalSpin[ideo]-=1;

            model.setEcoSpin(nx,ny,spin);

            ideo=model.getIdeology(nx,ny);
            model.globalSpin[ideo]+=1;
        }

        let spin=this.getEcoSpin(x,y);

        ecoFlip(x-1,y,spin);
        ecoFlip(x+1,y,spin);
        ecoFlip(x,y-1,spin);
        ecoFlip(x,y+1,spin);
    }
}
