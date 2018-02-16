class EmmModel{
    constructor(marketBuyRate=1,marketSellRate=1,sameSideProb=0.5,reportTick=1) {
        this.setRates(marketBuyRate,marketSellRate);
        this.sameSideProb=sameSideProb;
        this.time=0;
        this.reportAt=0;
        this.reportTick=reportTick;
        this.bestSell=0;
        this.lastPrice=-0.5;
    }
    setRates(marketBuyRate=1,marketSellRate=1) {
        this.totalMarketRate=marketBuyRate+marketSellRate;
        this.totalBuyProb=marketBuyRate/this.totalMarketRate;
    }
    step() {
        this.reportAt+=this.reportTick;
        if(this.time>this.reportAt) {
            return this.lastPrice;
        }
        while(this.time<this.reportAt) {
            this.internalStep();
        }
        return this.lastPrice;
    }
    internalStep() {
        var timeTick=-Math.log(Math.random())/this.totalMarketRate;
        var direction=0;
        if(Math.random()<this.sameSideProb) {
            direction=Math.random()<this.totalBuyProb ? +1 : -1;
        }
        this.bestSell+=direction;
        this.lastPrice=this.bestSell-0.5;
        this.time+=timeTick;
        return true;
    }
}
