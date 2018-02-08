class CristelliModel{
    constructor(markOrderProb=0.33,k=4,tau=400,steps=10,priceTick=1) {
        this.time=0;
        this.markOrderProb=markOrderProb;
        this.k=k;
        this.tau=tau;
        this.steps=steps;
        this.priceTick=priceTick;
        this.obAsk=[];// sell
        this.obBid=[];// buy
        this.lastOrderPrice=0;
        this.lastSpread=-1;
        this.initializeBook();
    }
    initializeBook(spread=2,deals=100) {
        var i, delta, until;
        for(i=0;i<deals;i+=1) {
            until=i+this.tau;
            delta=Math.floor(spread*this.k*Math.random()+1)*this.priceTick;
            this.placeBid(delta,until);
            if(i>0) {
                this.sortBid();
            }
            delta=Math.floor(spread*this.k*Math.random()+1)*this.priceTick;
            this.placeAsk(delta,until);
            if(i>0) {
                this.sortAsk();
            }
        }
        this.lastSpread=this.obAsk[0][0]-this.obBid[0][0];
        this.lastOrderPrice=this.getCurrentPrice();
    }
    step() {
        var i;
        for(i=0;i<this.steps;i+=1) {
            this.internalStep();
            this.sortBid();
            this.sortAsk();
            this.tickClock();
        }
        return this.getCurrentPrice();
    }
    internalStep() {
        var buyer=(Math.random()>0.5);
        var markOrder=(Math.random()<this.markOrderProb);
        if(markOrder) {// market order
            if(buyer) {// buy (bid) market order
                return this.doMarketBuy();
            } else {// sell (ask) market order
                return this.doMarketSell();
            }
        } else {// limit order
            var until=this.time+this.tau;
            var delta=1.0;
            if(this.lastSpread>0) {
                delta=Math.random()*(this.k*this.lastSpread)+this.priceTick;
            }
            // each order has two fields: price and time until which order is valid
            if(buyer) {
                this.placeBid(delta,until);
            } else {
                this.placeAsk(delta,until);
            }
            return false;
        }
    }
    placeBid(delta,until) {
        var reference=this.lastOrderPrice;
        if(this.obAsk.length>0) {
            reference=this.obAsk[0][0];
        }
        this.obBid.push([reference-delta,until]);
    }
    placeAsk(delta,until) {
        var reference=this.lastOrderPrice;
        if(this.obBid.length>0) {
            reference=this.obBid[0][0];
        }
        this.obAsk.push([reference+delta,until]);
    }
    canMarketBuy() {
        if(this.obAsk.length==0) return false;//there are no sellers
        return true;// there are sellers
    }
    canMarketSell() {
        if(this.obBid.length==0) return false;//there are no buyers
        return true;// there are buyers
    }
    doMarketBuy() {
        if(!this.canMarketBuy()) return false;//there are no sellers
        this.lastOrderPrice=this.obAsk.shift()[0];
        return true;
    }
    doMarketSell() {
        if(!this.canMarketSell()) return false;//there are no buyers
        this.lastOrderPrice=this.obBid.shift()[0];
        return true;
    }
    sortBid() {
        this.obBid=this.obBid.sort((x1,x2) => x2[0]-x1[0]).slice(0);
    }
    sortAsk() {
        this.obAsk=this.obAsk.sort((x1,x2) => x1[0]-x2[0]).slice(0);
    }
    tickClock() {
        this.time+=1;
        this.lastSpread=-1;
        if(this.obBid.length>0 && this.obAsk.length>0) {
            this.lastSpread=this.obAsk[0][0]-this.obBid[0][0];
        }
        this.cancelOrders();
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
