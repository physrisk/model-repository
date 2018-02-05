class BakOBModel{
    constructor(nAgents=100,bookSize=21,steps=1) {
        this.nAgents=nAgents;
        this.nHalf=Math.floor(this.nAgents/2);
        this.nAgents=2*this.nHalf;
        this.maxPrice=bookSize;
        this.minPrice=0;
        this.zeroPrice=Math.floor(bookSize/2);
        this.steps=steps;
        this.obAsk=Array(this.nHalf);// sell
        this.obBid=Array(this.nHalf);// buy
        this.currentPrice=this.zeroPrice;
        this.initializeBook();
    }
    initializeBook() {
        var i;
        for(i=0;i<this.nHalf;i+=1) {
            this.obAsk[i]=Math.floor(Math.random()*(this.maxPrice-this.zeroPrice)+this.zeroPrice+1);
            this.obBid[i]=Math.floor(Math.random()*(this.zeroPrice-this.minPrice)+this.minPrice);
        }
        this.sortAsk();
        this.sortBid();
    }
    step() {
        var i;
        for(i=0;i<this.steps;i+=1) {
            this.internalStep();
        }
        return this.getPrice();
    }
    getPrice() {
        return this.currentPrice-this.zeroPrice;
    }
    internalStep() {
        var ri, dir;
        ri=Math.floor(Math.random()*this.nHalf);// get id of order to move
        dir=Math.random()<0.5 ? -1 : 1;// in which direction
        // decide on order type
        if(Math.random()<0.5) { // move ask order
            this.obAsk[ri]+=dir;
            if(this.obAsk[ri]>this.maxPrice) {// do not allow to escape bounds
                this.obAsk[ri]=this.maxPrice;
            }
            this.sortAsk();
        } else { // move bid order
            this.obBid[ri]+=dir;
            if(this.obBid[ri]<this.minPrice) {// do not allow to escape bounds
                this.obBid[ri]=this.minPrice;
            }
            this.sortBid();
        }
        this.execute();
    }
    // order execution
    execute() {
        if(this.obBid[0]>=this.obAsk[0]) {
            // set current price
            this.currentPrice=this.obAsk[0];
            // reset orders
            this.obAsk[0]=this.maxPrice;
            this.obBid[0]=this.minPrice;
            this.sortAsk();
            this.sortBid();
        }
    }
    // sorting order book sides
    sortBid() {
        this.obBid=this.obBid.sort((x1,x2) => x2-x1).slice(0);
    }
    sortAsk() {
        this.obAsk=this.obAsk.sort((x1,x2) => x1-x2).slice(0);
    }
}
