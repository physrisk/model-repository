class cobwebABM{
    constructor(aDem=1,aSup=1,beta=1,eqPrice=0,eqQnt=1000,dt=1){
        this.priceLimit=1e4;
        this.alphaDemand=aDem;
        this.alphaSupply=aSup;
        this.beta=beta;
        this.equilibriumQnt=eqQnt;
        this.equilibriumPrice=eqPrice;
        this.reportTick=dt;
        this.currentPrice=this.randomPrice();
        this.lastDeals=0;
        this.lastSupply=0;
        this.lastEstimatedDemand=0;
        this.badDemand=false;
    }
    step() {
        let tau=0;
        let internalTime=0;
        let intendedSupply=this.inverseSupplyLaw(this.currentPrice)/this.reportTick;
        let currentSupply=Math.round(intendedSupply);
        let currentDemand=this.inverseDemandLaw(this.currentPrice);
        let estimatedDemand=0;
        let deals=0;

        // run trading
        if(currentDemand>0) {
            while(internalTime<this.reportTick && currentSupply>0) {
                tau=-Math.log(Math.random())/currentDemand;
                internalTime+=tau;
                deals+=1;
                currentSupply-=1;
            }
            if(internalTime>this.reportTick) {
                deals-=1;
                currentSupply+=1;
            }
        }
        
        // update the price based on trading
        estimatedDemand=deals/internalTime;
        if(!isFinite(estimatedDemand)) {
            estimatedDemand=0;
            this.badDemand=true;
        }
        this.currentPrice=Math.round(this.limitPrice(this.updatePrice(intendedSupply,estimatedDemand)));
        this.lastDeals=deals;
        this.lastSupply=currentSupply;
        this.lastEstimatedDemand=estimatedDemand;
    }
    limitQuantity(q) {
        return Math.max(q,0);
    }
    limitPrice(p) {
        return Math.max(Math.min(p,this.equilibriumPrice+this.priceLimit),this.equilibriumPrice-this.priceLimit);
    }
    demandLaw(q) {
        return -this.alphaDemand*(this.limitQuantity(q)-this.equilibriumQnt)+this.equilibriumPrice;
    }
    supplyLaw(q) {
        return this.alphaSupply*(this.limitQuantity(q)-this.equilibriumQnt)+this.equilibriumPrice;
    }
    inverseDemandLaw(p) {
        return this.limitQuantity(-(p-this.equilibriumPrice)/this.alphaDemand+this.equilibriumQnt);
    }
    inverseSupplyLaw(p) {
        return this.limitQuantity((p-this.equilibriumPrice)/this.alphaSupply+this.equilibriumQnt);
    }
    randomPrice() {
        let maxPrice=this.demandLaw(0);
        let minPrice=this.supplyLaw(0);
        return Math.round((maxPrice-minPrice)*Math.random()+minPrice);
    }
    updatePrice(intendedSupply,estimatedDemand) {
        let excessDemand=estimatedDemand-intendedSupply;
        return this.currentPrice+this.beta*excessDemand;
    }
    isStable(as=null,ad=null,cr=null) {
        if(as===null) {
            as=this.alphaSupply;
        }
        if(ad===null) {
            ad=this.alphaDemand;
        }
        if(cr===null) {
            cr=this.beta;
        }
        let coef=1-(as+ad)/(as*ad)*cr;
        return Math.abs(coef)<1;
    }
}
