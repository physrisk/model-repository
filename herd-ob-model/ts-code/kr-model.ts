/* fixedNumber Array util class */
class fixedNumberArray {
    public stored:number;// number of stored elements
    public capacity:number;// number of storable elements
    public vals:number[];// array to store elements in
    // object constructor -----------------------------------------------------
    constructor(defaultFiller:number=-1,capacity:number=100) {
        let i:number=0;
        this.stored=0;
        this.capacity=capacity;
        this.vals=new Array(capacity);
        for(;i<capacity;i+=1) {
            this.vals[i]=defaultFiller;
        }
    }
    // public methods ---------------------------------------------------------
    public add(val:number):void {// add new element
        if(this.stored>=this.capacity) {
            throw Error(`fixedNumberArray.add: overflow(${this.stored},${this.capacity})`);
        }
        this.vals[this.stored]=val;
        this.stored+=1;
    }
    public removeById(id:number):void {// remove element by id
        if(id<0 || this.stored<id) {
            throw Error(`fixedNumberArray.rem: overflow(${id},${this.stored})`);
        }
        this.stored-=1;
        this.vals[id]=this.vals[this.stored];
    }
    public removeByValue(val:number):void {// remove element by value
        this.removeById(this.find(val));
    }
    public find(val:number):number {// find first occurence of value
        let i:number=0;
        for(;i<this.stored;i+=1) {
            if(this.vals[i]==val) {
                return i;
            }
        }
        return -1;
    }
}

/* Specify order book */
class askSide{
    public quotes:number[];
    public owners:number[];
    public stored:number;
    private capacity:number;
    constructor(maxCapacity:number) {
        let i:number=0;
        this.capacity=maxCapacity;
        this.quotes=new Array(this.capacity);
        this.owners=new Array(this.capacity);
        for(i=0;i<this.capacity;i+=1) {
            this.quotes[i]=-1;
            this.owners[i]=-1;
        }
        this.stored=0;
    }
    public get(order:1|-1=1):number[] {
        if(order>0) {// default ordering
            return this.quotes.slice(0,this.stored);
        }
        return this.quotes.slice(0,this.stored).reverse();
    }
    public add(quote:number, ownerId:number, orderIds:number[]):void {
        let i:number=0;
        let j:number=0;
        let jm:number=0;
        if(this.stored>=this.capacity) {
            throw "Add overflow!";
        }
        for(i=0;i<this.stored;i+=1) {
            if(this.quotes[i]>quote) {
                break;
            }
        }
        if(i<this.stored) {
            for(j=this.stored;j>i;j-=1) {
                jm=j-1;
                this.quotes[j]=this.quotes[jm];
                this.owners[j]=this.owners[jm];
                orderIds[this.owners[j]]=j;
            }
            this.quotes[i]=quote;
            this.owners[i]=ownerId;
            orderIds[ownerId]=i;
            this.stored+=1;
        } else {
            this.quotes[i]=quote;
            this.owners[i]=ownerId;
            orderIds[ownerId]=i;
            this.stored+=1;
        }
    }
    public cancel(orderId:number, orderIds:number[]):void {
        let i:number=0;
        let im:number=0;
        if(orderId>=this.stored) {
            throw "Cancel overflow!";
        }
        orderIds[this.owners[orderId]]=-1;
        for(i=orderId+1;i<this.stored;i+=1) {
            im=i-1;
            this.quotes[im]=this.quotes[i];
            this.owners[im]=this.owners[i];
            orderIds[this.owners[i]]=im;
        }
        this.stored-=1;
    }
    public revise(orderId:number, quote:number, orderIds:number[]):void {
        let i:number=0;
        if(orderId>=this.stored) {
            throw "Revise overflow!";
        }
        if(this.quotes[orderId]>quote) {
            this.quotes[orderId]=quote;
            for(i=orderId-1;i>-1;i-=1) {
                if(this.quotes[i+1]>this.quotes[i]) {
                    break;
                }
                this.swap(i,i+1,orderIds);
            }
        } else {
            this.quotes[orderId]=quote;
            for(i=orderId+1;i<this.stored;i+=1) {
                if(this.quotes[i-1]<this.quotes[i]) {
                    break;
                }
                this.swap(i,i-1,orderIds);
            }
        }
    }
    public wouldMarket(quote:number):boolean {
        if(this.stored==0) {
            return false;
        }
        return this.quotes[0]<quote;
    }
    private swap(i1:number, i2:number, orderIds:number[]):void {
        let swapQuote:number=this.quotes[i1];
        let swapOwner:number=this.owners[i1];
        this.quotes[i1]=this.quotes[i2];
        this.owners[i1]=this.owners[i2];
        this.quotes[i2]=swapQuote;
        this.owners[i2]=swapOwner;
        orderIds[this.owners[i1]]=i1;
        orderIds[this.owners[i2]]=i2;
    }
}

class bidSide{
    public quotes:number[];
    public owners:number[];
    public stored:number;
    private capacity:number;
    constructor(maxCapacity:number) {
        let i:number=0;
        this.capacity=maxCapacity;
        this.quotes=new Array(this.capacity);
        this.owners=new Array(this.capacity);
        for(i=0;i<this.capacity;i+=1) {
            this.quotes[i]=-1;
            this.owners[i]=-1;
        }
        this.stored=0;
    }
    public get(order:1|-1=1):number[] {
        if(order>0) {// default ordering
            return this.quotes.slice(0,this.stored);
        }
        return this.quotes.slice(0,this.stored).reverse();
    }
    public add(quote:number, ownerId:number, orderIds:number[]):void {
        let i:number=0;
        let j:number=0;
        let jm:number=0;
        if(this.stored>=this.capacity) {
            throw "Add overflow!";
        }
        for(i=0;i<this.stored;i+=1) {
            if(this.quotes[i]<quote) {
                break;
            }
        }
        if(i<this.stored) {
            for(j=this.stored;j>i;j-=1) {
                jm=j-1;
                this.quotes[j]=this.quotes[jm];
                this.owners[j]=this.owners[jm];
                orderIds[this.owners[j]]=j;
            }
            this.quotes[i]=quote;
            this.owners[i]=ownerId;
            orderIds[ownerId]=i;
            this.stored+=1;
        } else {
            this.quotes[i]=quote;
            this.owners[i]=ownerId;
            orderIds[ownerId]=i;
            this.stored+=1;
        }
    }
    public cancel(orderId:number, orderIds:number[]):void {
        let i:number=0;
        let im:number=0;
        if(orderId>=this.stored) {
            throw "Cancel overflow!";
        }
        orderIds[this.owners[orderId]]=-1;
        for(i=orderId+1;i<this.stored;i+=1) {
            im=i-1;
            this.quotes[im]=this.quotes[i];
            this.owners[im]=this.owners[i];
            orderIds[this.owners[i]]=im;
        }
        this.stored-=1;
    }
    public revise(orderId:number, quote:number, orderIds:number[]):void {
        let i:number=0;
        if(orderId>=this.stored) {
            throw "Revise overflow!";
        }
        if(this.quotes[orderId]<quote) {
            this.quotes[orderId]=quote;
            for(i=orderId-1;i>-1;i-=1) {
                if(this.quotes[i+1]<this.quotes[i]) {
                    break;
                }
                this.swap(i,i+1,orderIds);
            }
        } else {
            this.quotes[orderId]=quote;
            for(i=orderId+1;i<this.stored;i+=1) {
                if(this.quotes[i-1]>this.quotes[i]) {
                    break;
                }
                this.swap(i,i-1,orderIds);
            }
        }
    }
    public wouldMarket(quote:number):boolean {
        if(this.stored==0) {
            return false;
        }
        return this.quotes[0]>quote;
    }
    private swap(i1:number, i2:number, orderIds:number[]):void {
        let swapQuote:number=this.quotes[i1];
        let swapOwner:number=this.owners[i1];
        this.quotes[i1]=this.quotes[i2];
        this.owners[i1]=this.owners[i2];
        this.quotes[i2]=swapQuote;
        this.owners[i2]=swapOwner;
        orderIds[this.owners[i1]]=i1;
        orderIds[this.owners[i2]]=i2;
    }
}

class orderBook{
    public ask:askSide;
    public bid:bidSide;
    constructor(maxCapacity:number) {
        this.ask=new askSide(maxCapacity);
        this.bid=new bidSide(maxCapacity);
    }
    public wouldExecute():boolean {
        return this.ask.quotes[0]<this.bid.quotes[0];
    }
    public best():number[] {
        let price:number=(this.ask.quotes[0]+this.bid.quotes[0])/2.0;
        let ownerA:number=this.ask.owners[0];
        let ownerB:number=this.bid.owners[0];
        return [price,ownerA,ownerB];
    }
}

/* Specify agent */
enum AgentStates {
    FUNDAMENTALIST, CHARTIST
}

interface Agent {
    cHalfSpread:number;// half of the spread used in chartistic logic
    cValuation:number;// valuation used in chartistic logic
    state:AgentStates;// see consts below
}

export class model {
    private rng:any;// random number generator
    // time tracking ----------------------------------------------------------
    private time:number;// internal clock
    private reportAt:number;// at what time the next report should be submitted
    private reportTick:number;// reporting interval
    // price tracking ---------------------------------------------------------
    private price:number;// price after current event (price to be observed in future)
    public lastPrice:number;// last observed price
    public lastChars:number;// last observed number of chartists
    public lastMood:number;// last observed average mood
    public tradeEvents:number;// total trade events
    private priceFundamental:number;// fundamental price
    // agents -----------------------------------------------------------------
    public nAgents:number;// total number of agents
    private nFunds:number;// number of fundamentalists
    private nChars:number;// number of chartists
    private agents:Agent[];// array with individual agent parameters
    private fundIds:fixedNumberArray;// array with ids of fundamentalists
    private charIds:fixedNumberArray;// array with ids of chartists
    private askOrderIds:number[];// agent id is key, order id is value
    private bidOrderIds:number[];// agent id is key, order id is value
    private cMood:number;// average mood of chartists
    private alpha:number;// lambda scenario parameter
    private lambdaZero:number;// lambda scenario parameter
    // event rates ------------------------------------------------------------
    private laEvent:number;// base event rate
    private epsilonF:number;// idiosyncratic transition rate to fundamentalists (relative to laEvent)
    private epsilonC:number;// idiosyncratic transition rate to chartists (relative to laEvent)
    private eventProbs:number[];// cumulative probabilities of switching events
    private laTradeChar:number;// single chartist trading rate (relative to laEvent)
    private probBid:number;// probability that chartist will bid
    private laTradeFund:number;// base single fundamentalist trading rate (relative to laEvent)
    private laMoodChange:number;// mood change rate
    private laTotal:number;// total event rate
    // order book -------------------------------------------------------------
    private lob:orderBook;
    // object constructor -----------------------------------------------------
    constructor(reportTick:number=1,price:number=1000,
            priceFundamental:number=1000) {
        this.rng=new Random();
        this.resetTime(reportTick);
        this.resetPrice(price,priceFundamental);
        this.eventProbs=new Array(5);
    }
    // various resets ---------------------------------------------------------
    private resetTime(reportTick:number=1):void {
        this.time=0;
        this.reportAt=0;
        this.reportTick=reportTick;
    }
    private resetPrice(price:number=1000,priceFundamental:number=1000) {
        this.lastPrice=price;
        this.price=price;
        this.priceFundamental=priceFundamental;
        this.tradeEvents=0;
    }
    public resetAgents(nFunds:number=100,nChars:number=100,
            laE:number=0.001,laTC:number=1.0,laTF:number=1.0,laM:number=0.1,
            eF:number=2,eC:number=2,a:number=0,laZero:number=0.005,
            cMood:number=1,cSpreadShape:number=4,cSpreadScale:number=15.5):void {
        let i:number=0;
        this.nAgents=nFunds+nChars;
        this.nFunds=0;// will be set to correct later
        this.nChars=0;// will be set to correct later
        // initialize agents
        this.agents=new Array(this.nAgents);
        this.fundIds=new fixedNumberArray(-1,this.nAgents);
        this.charIds=new fixedNumberArray(-1,this.nAgents);
        this.askOrderIds=new Array(this.nAgents);
        this.bidOrderIds=new Array(this.nAgents);
        for(i=0;i<this.nAgents;i+=1) {
            // reset order owner id arrays
            this.askOrderIds[i]=-1;
            this.bidOrderIds[i]=-1;
            // generate agents
            this.agents[i]={
                cHalfSpread: this.rng.gamma(cSpreadShape,cSpreadScale)/2.0,
                cValuation: this.price,
                state: (i<nFunds) ? AgentStates.FUNDAMENTALIST : AgentStates.CHARTIST,
            };
            if(this.agents[i].state==AgentStates.FUNDAMENTALIST) {
                this.fundIds.add(i);
            } else {
                this.charIds.add(i);
            }
        }
        this.nFunds=this.fundIds.stored;
        this.nChars=this.charIds.stored;
        this.lastChars=this.nChars;
        // reset order book
        this.resetOrderBook();
        // set common agent parameters
        this.epsilonF=eF;
        this.epsilonC=eC;
        this.alpha=a;
        this.lambdaZero=laZero;
        this.cMood=cMood;
        this.lastMood=this.cMood;
        // reset event rates
        this.laEvent=laE;
        this.laTradeChar=laTC;
        this.laTradeFund=laTF;
        this.laMoodChange=laM;
        this.updateEventRates();
    }
    private resetOrderBook() {
        let i:number=0;
        this.lob=new orderBook(this.nAgents);
        for(i=0;i<this.nChars;i+=1) {
            this.charLimitAdd(this.charIds.vals[i]);
        }
    }
    // event rates ------------------------------------------------------------
    private updateEventRates():void {
        let baseRate:number=this.laEvent*this.lambdaScenario();
        let laTC:number=baseRate*this.laTradeChar*this.nChars;
        this.probBid=(1.0+this.cMood)/2.0;
        let laTF:number=baseRate*this.laTradeFund*this.nFunds*Math.abs(
                            Math.log(this.price/this.priceFundamental));
        //let laMood:number=baseRate*this.laMoodChange;
        let laMood:number=this.laEvent*this.laMoodChange;
        let laFtoC:number=baseRate*this.nFunds*(this.epsilonC+this.nChars);
        let laCtoF:number=baseRate*this.nChars*(this.epsilonF+this.nFunds);
        this.laTotal=laTC+laTF+laMood+laFtoC+laCtoF;
        /* events structure:
           0 - chartist trade event
           1 - fundamentalist trade event
           2 - mood swing event
           3 - f->c event
           4 - c->f event
        */
        this.eventProbs[0]=laTC/this.laTotal;
        this.eventProbs[1]=this.eventProbs[0]+laTF/this.laTotal;
        this.eventProbs[2]=this.eventProbs[1]+laMood/this.laTotal;
        this.eventProbs[3]=this.eventProbs[2]+laFtoC/this.laTotal;
        this.eventProbs[4]=1.0;
    }
    private lambdaScenario():number {
        if(this.alpha==0) {
            return this.lambdaZero+1.0;
        }
        let y:number=1.0;
        if(this.nFunds==0) {
            y=2.0*this.nChars;
        } else {
            y=this.nChars/this.nFunds;
        }
        if(this.alpha==1) {
            return this.lambdaZero+y;
        } else if(this.alpha==2) {
            return this.lambdaZero+y*y;
        } else {
            return this.lambdaZero+Math.pow(y,this.alpha);
        }
    }
    // step by step execution of the model ------------------------------------
    public step():void {
        this.reportAt+=this.reportTick;
        while(this.time<this.reportAt) {
            this.lastChars=this.nChars;
            this.lastMood=this.cMood;
            this.lastPrice=this.price;
            this.eventStep();
        }
    }
    private eventStep():void {
        let dt:number=this.rng.exponential(this.laTotal);
        let r:number=this.rng.random();
        let eventCode:number=-1;
        if(r<this.eventProbs[0]) {
            eventCode=0;
            this.eventTradeChartist();
        } else if(r<this.eventProbs[1]) {
            eventCode=1;
            this.eventTradeFundamentalist();
        } else if(r<this.eventProbs[2]) {
            eventCode=2;
            this.eventMoodChange();
        } else if(r<this.eventProbs[3]) {
            eventCode=3;
            this.eventSwitchFtoC();
        } else {
            eventCode=4;
            this.eventSwitchCtoF();
        }
        this.time+=dt;
    }
    // triggered events -------------------------------------------------------
    private eventTradeChartist():void {
        this.charMarket(this.getRandomChartist());
        this.fundClearMarket();
        this.charRequote();
        this.updateEventRates();
    }
    private eventTradeFundamentalist():void {
        this.fundMarket();
        this.fundClearMarket();
        this.charRequote();
        this.updateEventRates();
    }
    private eventMoodChange():void {
        this.cMood=-this.cMood;
    }
    private eventSwitchFtoC() {
        this.moveFtoC();
        this.updateEventRates();
    }
    private eventSwitchCtoF() {
        this.moveCtoF();
        this.updateEventRates();
    }
    // operations on agent lists ----------------------------------------------
    private getRandomFundamentalist():number {
        return this.fundIds.vals[Math.floor(this.rng.random()*this.fundIds.stored)];
    }
    private moveFtoC(agentId?:number):void {
        // pick random agent if not picked
        if(typeof agentId=="undefined") {
            agentId=this.getRandomFundamentalist();
        }
        // remove him from Ids array
        this.fundIds.removeByValue(agentId);
        this.nFunds-=1;
        // add him to chartists' Ids array
        this.charIds.add(agentId);
        this.nChars+=1;
        // update his internal state
        this.agents[agentId].state=AgentStates.CHARTIST;
        // submit his limit orders
        this.charLimitAdd(agentId);
    }
    private getRandomChartist():number {
        return this.charIds.vals[Math.floor(this.rng.random()*this.charIds.stored)];
    }
    private moveCtoF(agentId?:number):void {
        // pick random agent if not picked
        if(typeof agentId=="undefined") {
            agentId=this.getRandomChartist();
        }
        // remove him from Ids array
        this.charIds.removeByValue(agentId);
        this.nChars-=1;
        // add him to fundamentalists' Ids array
        this.fundIds.add(agentId);
        this.nFunds+=1;
        // update his internal state
        this.agents[agentId].state=AgentStates.FUNDAMENTALIST;
        // cancel his limit orders
        this.charLimitCancel(agentId);
    }
    // chartist's interaction with LOB ----------------------------------------
    private charLimitAdd(agentId:number):void {
        if(this.askOrderIds[agentId]==-1) {// if no orders
            // either both orders are present or neither is
            // so check only ask side
            this.lob.ask.add(
                this.agents[agentId].cValuation+this.agents[agentId].cHalfSpread,
                agentId,
                this.askOrderIds
            );
            this.lob.bid.add(
                this.agents[agentId].cValuation-this.agents[agentId].cHalfSpread,
                agentId,
                this.bidOrderIds
            );
        } else {
            console.log("charLimitAdd: order present");
        }
    }
    private charLimitRevise(agentId:number):void {
        if(this.askOrderIds[agentId]>-1) {// if orders present
            // either both orders are present or neither is
            // so check only ask side
            this.lob.ask.revise(
                this.askOrderIds[agentId],
                this.agents[agentId].cValuation+this.agents[agentId].cHalfSpread,
                this.askOrderIds
            );
            this.lob.bid.revise(
                this.bidOrderIds[agentId],
                this.agents[agentId].cValuation-this.agents[agentId].cHalfSpread,
                this.bidOrderIds
            );
        } else {
            console.log("charLimitRevise: no order present");
        }
    }
    private charLimitCancel(agentId:number):void {
        this.lob.ask.cancel(this.askOrderIds[agentId],this.askOrderIds);
        this.lob.bid.cancel(this.bidOrderIds[agentId],this.bidOrderIds);
    }
    private charMarket(agentId:number):void {
        let agentId2:number=-1;
        let quote:number=-1;
        if(this.rng.random()<this.probBid) {
            agentId2=this.lob.ask.owners[0];
            quote=this.lob.ask.quotes[0];
            if(agentId2==agentId) {
                agentId2=this.lob.ask.owners[1];
                quote=this.lob.ask.quotes[1];
            }
        } else {
            agentId2=this.lob.bid.owners[0];
            quote=this.lob.bid.quotes[0];
            if(agentId2==agentId) {
                agentId2=this.lob.bid.owners[1];
                quote=this.lob.bid.quotes[1];
            }
        }
        if(agentId2>-1) {
            this.price=quote;
            this.tradeEvents+=1;
        }
    }
    private charRequote():void {
        let i:number=0;
        for(i=0;i<this.nAgents;i+=1) {
            this.agents[i].cValuation=this.price;
            if(this.agents[i].state==AgentStates.CHARTIST) {
                this.charLimitRevise(i);
            }
        }
    }
    // fundamentalist's interaction with LOB ----------------------------------
    private fundMarket():void {
        if(this.lob.bid.wouldMarket(this.priceFundamental)) {
            this.price=this.lob.bid.quotes[0];
            this.tradeEvents+=1;
            return ;
        }
        if(this.lob.ask.wouldMarket(this.priceFundamental)) {
            this.price=this.lob.ask.quotes[0];
            this.tradeEvents+=1;
            return ;
        }
    }
    private fundClearMarket():void {
        if(this.price<10) {
            this.lastPrice=this.priceFundamental;
            this.price=this.priceFundamental;
            this.tradeEvents+=1;
        }
    }
}

