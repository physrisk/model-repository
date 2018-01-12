class MaslovModel{
    constructor(limOrderProb=0.5,deltaMax=1,maxOrders=1000,steps=10) {
        var i;
        this.limOrderProb=limOrderProb;
        this.deltaMax=deltaMax;
        this.maxOrders=maxOrders;
        this.steps=steps;
        this.obAsk=[];// sell
        this.obBid=[];// buy
        this.currentPrice=0;
        this.lastBestBid=this.currentPrice;
        this.lastBestAsk=this.currentPrice;
    }
    step() {
        var i;
        for(i=0;i<this.steps;i+=1) {
            this.internalStep();
        }
        this.updateBests();
        return this.currentPrice;
    }
    internalStep() {
        var buyer=(Math.random()>0.5);
        var limOrder=(Math.random()<this.limOrderProb);
        if(!limOrder) {// market order
            if(buyer) {// buy (bid) market order
                return this.doMarketBuy();
            } else {// sell (ask) market order
                return this.doMarketSell();
            }
        } else {// limit order
            var delta=Math.random()*this.deltaMax;
            var price=this.currentPrice;
            if(buyer) {
                price-=delta;
                if(this.doMarketBuy(price)) {
                    return true;
                } else {
                    this.obBid.push(price);
                    this.sortBid();
                }
            } else {
                price+=delta;
                if(this.doMarketSell(price)) {
                    return true;
                } else {
                    this.obAsk.push(price);
                    this.sortAsk();
                }
            }
            this.trimBook();
            return false;
        }
        return false;// should not be reached
    }
    canMarketBuy(price=null) {
        if(this.obAsk.length==0) return false;//there are no sellers
        if(price===null) return true;// there are sellers
        if(this.obAsk[0]<price) return true;// there are sellers at given price
        return false;
    }
    canMarketSell(price=null) {
        if(this.obBid.length==0) return false;//there are no buyers
        if(price===null) return true;// there are buyers
        if(this.obBid[0]>price) return true;// there are buyers at given price
        return false;
    }
    doMarketBuy(price=null) {
        if(!this.canMarketBuy(price)) return false;//there are no sellers
        this.currentPrice=this.obAsk.shift();
        return true;
    }
    doMarketSell(price=null) {
        if(!this.canMarketSell(price)) return false;//there are no buyers
        this.currentPrice=this.obBid.shift();
        return true;
    }
    sortBid() {
        var i, swap;
        for(i=this.obBid.length-1;i>-1;i-=1) {
            if(this.obBid[i]>this.obBid[i-1]) {
                swap=this.obBid[i];
                this.obBid[i]=this.obBid[i-1];
                this.obBid[i-1]=swap;
            } else {
                return;
            }
        }
    }
    sortAsk() {
        var i, swap;
        for(i=this.obAsk.length-1;i>-1;i-=1) {
            if(this.obAsk[i]<this.obAsk[i-1]) {
                swap=this.obAsk[i];
                this.obAsk[i]=this.obAsk[i-1];
                this.obAsk[i-1]=swap;
            } else {
                return;
            }
        }
    }
    trimBook() {
        if(this.obAsk.length>=this.maxOrders) {
            this.obAsk.splice(-1,1);
        }
        if(this.obBid.length>=this.maxOrders) {
            this.obBid.splice(-1,1);
        }
    }
    updateBests() {
        if(this.obAsk.length>0) {
            this.lastBestAsk=this.obAsk[0];
        }
        if(this.obBid.length>0) {
            this.lastBestBid=this.obBid[0];
        }
    }
}
