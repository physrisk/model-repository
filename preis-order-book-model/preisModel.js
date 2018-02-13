class PreisModel{
    constructor(nAgents=125,limitRate=0.15,marketRate=0.075,cancelRate=0.025,limitBuyP=0.5,marketBuyP=0.5,invDepthRate=100) {
        // relation to Preis (2010) article notation:
        // nAgents - N_a
        this.nAgents=nAgents;
        // limitRate - \alpha
        this.totalLimitRate=nAgents*limitRate;
        // marketRate - \mu
        this.totalMarketRate=nAgents*marketRate;
        // cancelRate - \delta
        this.cancelRate=cancelRate;
        // limitBuyP - q_{provider}
        this.limitBuyP=limitBuyP;
        // marketBuyP - q_{taker}
        this.marketBuyP=marketBuyP;
        // invDepthRate - \lambda_0
        this.invDepthRate=invDepthRate;
        // 1 MCS step is 2 N_a
        this.reportTick=0.1*2*this.nAgents;
        // ------------------------------------------
        // Gillespie algorithm parts:
        this.totalEventRate=this.totalLimitRate+this.totalMarketRate;
        this.limitProb=this.totalLimitRate/this.totalEventRate;
        // ------------------------------------------
        this.time=0;
        this.reportAt=0;
        this.obAsk=[];// sell
        this.obBid=[];// buy
        this.lastOrderPrice=0;
        this.lastPrice=0;
        this.initializeBook();
    }
    initializeBook(spread=6,deals=50) {
        var i;
        this.time=-deals;
        for(i=0;i<deals;i+=1) {
            this.time+=1;
            if(Math.random()<this.limitBuyP) {
                this.placeBid();
            } else {
                this.placeAsk();
            }
        }
        this.cancelOrders();
        this.lastOrderPrice=this.getCurrentPrice();
        this.lastPrice=this.getCurrentPrice();
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
        this.lastPrice=this.getCurrentPrice();
        // using Gillespie algorithm
        // * random time increment
        var timeTick=-Math.log(Math.random())/this.totalEventRate;
        this.time+=timeTick;
        this.cancelOrders();// cancel orders as a part of clock tick
        // * choosing event to happen
        var limitOrder=(Math.random()<this.limitProb);
        // ---------------------------
        var buyer=false;
        if(limitOrder) {// limit order
            buyer=(Math.random()<this.limitBuyP);
            if(buyer) {// buy (bid) limit order
                this.placeBid();
            } else {// sell (ask) market order
                this.placeAsk();
            }
        } else {// market order
            buyer=(Math.random()<this.marketBuyP);
            if(buyer) {// buy (bid) market order
                return this.doMarketBuy();
            } else {// sell (ask) market order
                return this.doMarketSell();
            }
        }
        return false;
    }
    placeBid() {
        var until=this.time+Math.floor(-Math.log(Math.random())/this.cancelRate);
        var reference=this.lastOrderPrice;
        if(this.obAsk.length>0) {
            reference=this.obAsk[0][0];
        }
        var eta=Math.floor(-this.invDepthRate*Math.log(Math.random()));
        var delta=Math.floor(Math.random()*eta);
        this.obBid.push([reference-delta-1,until]);
        if(this.obBid.length>1) {
            this.sortBid();
        }
    }
    placeAsk() {
        var until=this.time+Math.floor(-Math.log(Math.random())/this.cancelRate);
        var reference=this.lastOrderPrice;
        if(this.obBid.length>0) {
            reference=this.obBid[0][0];
        }
        var eta=Math.floor(-this.invDepthRate*Math.log(Math.random()));
        var delta=Math.floor(Math.random()*eta);
        this.obAsk.push([reference+delta+1,until]);
        if(this.obAsk.length>1) {
            this.sortAsk();
        }
    }
    doMarketBuy() {
        if(this.obAsk.length==0) return false;//there are no sellers
        this.lastOrderPrice=this.obAsk.shift()[0];
        return true;
    }
    doMarketSell() {
        if(this.obBid.length==0) return false;//there are no buyers
        this.lastOrderPrice=this.obBid.shift()[0];
        return true;
    }
    sortBid() {
        this.obBid=this.obBid.sort((x1,x2) => x2[0]-x1[0]).slice(0);
    }
    sortAsk() {
        this.obAsk=this.obAsk.sort((x1,x2) => x1[0]-x2[0]).slice(0);
    }
    cancelOrders() {
        this.obAsk=this.obAsk.filter(x=>x[1]>this.time);
        this.obBid=this.obBid.filter(x=>x[1]>this.time);
    }
    getCurrentPrice() {
        if(this.obAsk.length>0 && this.obBid.length>0) {
            return (this.obAsk[0][0]+this.obBid[0][0])/2.0;
        }
        return this.lastOrderPrice;
    }
}
