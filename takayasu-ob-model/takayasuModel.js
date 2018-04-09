class takayasuModel{
    constructor(nAgents=100,spreadShape=4,spreadScale=15.5,trendFollowSens=6,trendFollowSatur=7.5,trendFollowStd=3.8,sdeTick=0.01,reportTick=1) {
        this.rng=new Random();
        // universal time tracking variables
        this.time=0;// internal clock
        this.reportAt=0;// report clock
        this.reportTick=reportTick;// report tick
        this.sdeTick=sdeTick;// tick for which sde is solved
        // universal price tracking variables
        this.lastPrice=0;// price at current time
        this.previousPrice=0;// price prior to current time
        // model specific variables
        this.currentDrift=0;// drift induced by the last change of price
        this.spreadShape=spreadShape;// shape of the agent spread distribution (empirically estimated)
        this.spreadScale=spreadScale;// scape of the agent spread distribution (empirically estimated)
        this.c=trendFollowSens;// trend-follow sensitivity
        this.dpStar=trendFollowSatur;// trend-follow saturation
        this.sigma=trendFollowStd;// trend-follow variance
        this.nAgents=nAgents;// number of agents
        // order book specific variables
        this.obAsk=null;// sell/ask side
        this.obBid=null;// buy/bid side
        this.obAskWho=null;// who placed the order (order => agent ids)
        this.obBidWho=null;// who placed the order (order => agent ids)
        this.obAskWhich=null;// which orders agent placed (agent => order ids)
        this.obBidWhich=null;// which orders agent placed (agent => order ids)
        this.initOrderBook();
    }
    getCTilde() {
        return Math.sqrt((this.spreadShape-1)*(this.spreadShape-2)/(2*this.nAgents))*(this.c*this.spreadScale)/(this.sigma*this.sigma);
    }
    // Order-book specific functions
    initOrderBook() {
        var i, agentMidPrice, agentSpread;
        this.obAsk=new Array(this.nAgents);
        this.obBid=new Array(this.nAgents);
        this.obAskWho=new Array(this.nAgents);
        this.obBidWho=new Array(this.nAgents);
        this.obAskWhich=new Array(this.nAgents);
        this.obBidWhich=new Array(this.nAgents);
        for(i=0;i<this.nAgents;i+=1) {
            agentMidPrice=this.previousPrice+this.rng.normal(0,0.1);
            agentSpread=this.rng.gamma(this.spreadShape,this.spreadScale);
            this.obAsk[i]=agentMidPrice+agentSpread/2.0;
            this.obBid[i]=agentMidPrice-agentSpread/2.0;
            this.obAskWho[i]=i;
            this.obBidWho[i]=i;
            this.obAskWhich[i]=i;
            this.obBidWhich[i]=i;
        }
        this.doSortOrderBook();
    }
    // sort whole OB or bubble individual orders
    doSortOrderBook(whom=-1) {
        if(whom<0) {
            this.doSortAskSide();
            this.doSortBidSide();
        } else {
            this.doBubbleAsk(whom);
            this.doBubbleBid(whom);
        }
    }
    // individual order bubbling functions
    doBubbleAsk(whom) {
        var i;
        var wo=this.obAskWhich[whom];
        for(i=wo+1;i<this.nAgents;i+=1) {
            if(this.obAsk[i-1]>this.obAsk[i]) {
                this.doSwapAskOrders(i,i-1);
            } else {
                break;
            }
        }
        wo=i-1;
        for(i=wo-1;-1<i;i-=1) {
            if(this.obAsk[i]>this.obAsk[i+1]) {
                this.doSwapAskOrders(i,i+1);
            } else {
                break;
            }
        }
    }
    doBubbleBid(whom) {
        var i;
        var wo=this.obBidWhich[whom];
        for(i=wo+1;i<this.nAgents;i+=1) {
            if(this.obBid[i-1]<this.obBid[i]) {
                this.doSwapBidOrders(i,i-1);
            } else {
                break;
            }
        }
        wo=i-1;
        for(i=wo-1;-1<i;i-=1) {
            if(this.obBid[i]<this.obBid[i+1]) {
                this.doSwapBidOrders(i,i+1);
            } else {
                break;
            }
        }
    }
    // sorting whole sides of OB
    doSortAskSide() {
        var i,j;
        for(i=0;i<this.nAgents;i+=1) {
            for(j=i+1;j<this.nAgents;j+=1) {
                if(this.obAsk[i]>this.obAsk[j]) {
                    this.doSwapAskOrders(i,j);
                }
            }
        }
    }
    doSortBidSide() {
        var i,j;
        for(i=0;i<this.nAgents;i+=1) {
            for(j=i+1;j<this.nAgents;j+=1) {
                if(this.obBid[i]<this.obBid[j]) {
                    this.doSwapBidOrders(i,j);
                }
            }
        }
    }
    // swap two orders in all OB views
    doSwapAskOrders(i,j) {
        // swap orders
        var swap=this.obAsk[i];
        this.obAsk[i]=this.obAsk[j];
        this.obAsk[j]=swap;
        // swap order => agent
        swap=this.obAskWho[i];
        this.obAskWho[i]=this.obAskWho[j];
        this.obAskWho[j]=swap;
        // swap agent => order
        this.obAskWhich[this.obAskWho[i]]=i;
        this.obAskWhich[this.obAskWho[j]]=j;
    }
    doSwapBidOrders(i,j) {
        // swap oders
        var swap=this.obBid[i];
        this.obBid[i]=this.obBid[j];
        this.obBid[j]=swap;
        // swap order => agent
        swap=this.obBidWho[i];
        this.obBidWho[i]=this.obBidWho[j];
        this.obBidWho[j]=swap;
        // swap agent => order
        this.obBidWhich[this.obBidWho[i]]=i;
        this.obBidWhich[this.obBidWho[j]]=j;
    }
    // getting ordered sides as well as best quotes
    getOrderedAsk(dir=1) {
        if(dir>0) {// default ordering
            return this.obAsk;
        }
        return this.obAsk.slice(0).reverse();
    }
    getBestAsk(dir=1) {
        if(dir>0) {// default best
            return this.obAsk[0];
        }
        return this.obAsk[this.nAgents-1];
    }
    getOrderedBid(dir=-1) {
        if(dir<0) {// default ordering
            return this.obBid;
        }
        return this.obBid.slice(0).reverse();
    }
    getBestBid(dir=-1) {
        if(dir<0) {// default best
            return this.obBid[0];
        }
        return this.obBid[this.nAgents-1];
    }
    // get bid and ask of certain agent
    getQuotes(i) {
        var askId=this.obAskWhich[i];
        var bidId=this.obBidWhich[i];
        return [this.obBid[askId],this.obAsk[bidId]];
    }
    // transaction functions
    canDeal() {// check if deal is possible
        return this.getBestAsk()<=this.getBestBid();
    }
    doDeal(asker,bidder) {// execute deal and its consequences
        var priceDelta=0;
        var price=(this.obAsk[this.obAskWhich[asker]]+this.obBid[this.obBidWhich[bidder]])/2.0;
        this.doRequote(asker,price);
        this.doRequote(bidder,price);
        this.previousPrice=this.lastPrice;
        this.lastPrice=price;
        priceDelta=this.lastPrice-this.previousPrice;
        this.currentDrift=this.c*Math.tanh(priceDelta/this.dpStar);
        return price;
    }
    doRequote(i,price) {// move the center of agent's spread to the price location
        var askId=this.obAskWhich[i];
        var bidId=this.obBidWhich[i];
        var agentShift=(this.obAsk[askId]-this.obBid[bidId])/2.0;
        this.obAsk[askId]=price+agentShift;
        this.obBid[bidId]=price-agentShift;
    }
    // motion of all bids
    doMoveAllBids(dt) {
        var i, r;
        var macroDrift=this.currentDrift*dt;
        var microDiffC=this.sigma*Math.sqrt(dt);
        for(i=0;i<this.nAgents;i+=1) {
            this.obAsk[i]+=macroDrift;
            this.obBid[i]+=macroDrift;
            r=microDiffC*this.rng.normal(0,1);
            this.obAsk[this.obAskWhich[i]]+=r;
            this.obBid[this.obBidWhich[i]]+=r;
        }
    }
    // Model specific functions
    step() {
        this.reportAt+=this.reportTick;
        if(this.time>this.reportAt) {
            return this.previousPrice;
        }
        while(this.time<this.reportAt) {
            this.internalStep();
        }
        return this.previousPrice;
    }
    internalStep() {
        var timeTick=this.sdeTick;
        this.doMoveAllBids(timeTick);
        this.doSortOrderBook();
        if(this.canDeal()) {
            var asker=this.obAskWho[0];
            var bidder=this.obBidWho[0];
            this.doDeal(asker,bidder);
            this.doSortOrderBook(asker);
            this.doSortOrderBook(bidder);
            this.doSortOrderBook(asker);
            this.doSortOrderBook(bidder);
        }
        this.time+=timeTick;
        return true;
    }
}
