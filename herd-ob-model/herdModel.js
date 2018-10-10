var herdModel = /** @class */ (function () {
    /* fixedNumber Array util class */
    var fixedNumberArray = /** @class */ (function () {
        // object constructor -----------------------------------------------------
        function fixedNumberArray(defaultFiller, capacity) {
            if (defaultFiller === void 0) { defaultFiller = -1; }
            if (capacity === void 0) { capacity = 100; }
            var i = 0;
            this.stored = 0;
            this.capacity = capacity;
            this.vals = new Array(capacity);
            for (; i < capacity; i += 1) {
                this.vals[i] = defaultFiller;
            }
        }
        // public methods ---------------------------------------------------------
        fixedNumberArray.prototype.add = function (val) {
            if (this.stored >= this.capacity) {
                throw Error("fixedNumberArray.add: overflow(" + this.stored + "," + this.capacity + ")");
            }
            this.vals[this.stored] = val;
            this.stored += 1;
        };
        fixedNumberArray.prototype.removeById = function (id) {
            if (id < 0 || this.stored < id) {
                throw Error("fixedNumberArray.rem: overflow(" + id + "," + this.stored + ")");
            }
            this.stored -= 1;
            this.vals[id] = this.vals[this.stored];
        };
        fixedNumberArray.prototype.removeByValue = function (val) {
            this.removeById(this.find(val));
        };
        fixedNumberArray.prototype.find = function (val) {
            var i = 0;
            for (; i < this.stored; i += 1) {
                if (this.vals[i] == val) {
                    return i;
                }
            }
            return -1;
        };
        return fixedNumberArray;
    }());
    /* Specify order book */
    var askSide = /** @class */ (function () {
        function askSide(maxCapacity) {
            var i = 0;
            this.capacity = maxCapacity;
            this.quotes = new Array(this.capacity);
            this.owners = new Array(this.capacity);
            for (i = 0; i < this.capacity; i += 1) {
                this.quotes[i] = -1;
                this.owners[i] = -1;
            }
            this.stored = 0;
        }
        askSide.prototype.get = function (order) {
            if (order === void 0) { order = 1; }
            if (order > 0) { // default ordering
                return this.quotes.slice(0, this.stored);
            }
            return this.quotes.slice(0, this.stored).reverse();
        };
        askSide.prototype.add = function (quote, ownerId, orderIds) {
            var i = 0;
            var j = 0;
            var jm = 0;
            if (this.stored >= this.capacity) {
                throw "Add overflow!";
            }
            for (i = 0; i < this.stored; i += 1) {
                if (this.quotes[i] > quote) {
                    break;
                }
            }
            if (i < this.stored) {
                for (j = this.stored; j > i; j -= 1) {
                    jm = j - 1;
                    this.quotes[j] = this.quotes[jm];
                    this.owners[j] = this.owners[jm];
                    orderIds[this.owners[j]] = j;
                }
                this.quotes[i] = quote;
                this.owners[i] = ownerId;
                orderIds[ownerId] = i;
                this.stored += 1;
            }
            else {
                this.quotes[i] = quote;
                this.owners[i] = ownerId;
                orderIds[ownerId] = i;
                this.stored += 1;
            }
        };
        askSide.prototype.cancel = function (orderId, orderIds) {
            var i = 0;
            var im = 0;
            if (orderId >= this.stored) {
                throw "Cancel overflow!";
            }
            orderIds[this.owners[orderId]] = -1;
            for (i = orderId + 1; i < this.stored; i += 1) {
                im = i - 1;
                this.quotes[im] = this.quotes[i];
                this.owners[im] = this.owners[i];
                orderIds[this.owners[i]] = im;
            }
            this.stored -= 1;
        };
        askSide.prototype.revise = function (orderId, quote, orderIds) {
            var i = 0;
            if (orderId >= this.stored) {
                throw "Revise overflow!";
            }
            if (this.quotes[orderId] > quote) {
                this.quotes[orderId] = quote;
                for (i = orderId - 1; i > -1; i -= 1) {
                    if (this.quotes[i + 1] > this.quotes[i]) {
                        break;
                    }
                    this.swap(i, i + 1, orderIds);
                }
            }
            else {
                this.quotes[orderId] = quote;
                for (i = orderId + 1; i < this.stored; i += 1) {
                    if (this.quotes[i - 1] < this.quotes[i]) {
                        break;
                    }
                    this.swap(i, i - 1, orderIds);
                }
            }
        };
        askSide.prototype.wouldMarket = function (quote) {
            if (this.stored == 0) {
                return false;
            }
            return this.quotes[0] < quote;
        };
        askSide.prototype.swap = function (i1, i2, orderIds) {
            var swapQuote = this.quotes[i1];
            var swapOwner = this.owners[i1];
            this.quotes[i1] = this.quotes[i2];
            this.owners[i1] = this.owners[i2];
            this.quotes[i2] = swapQuote;
            this.owners[i2] = swapOwner;
            orderIds[this.owners[i1]] = i1;
            orderIds[this.owners[i2]] = i2;
        };
        return askSide;
    }());
    var bidSide = /** @class */ (function () {
        function bidSide(maxCapacity) {
            var i = 0;
            this.capacity = maxCapacity;
            this.quotes = new Array(this.capacity);
            this.owners = new Array(this.capacity);
            for (i = 0; i < this.capacity; i += 1) {
                this.quotes[i] = -1;
                this.owners[i] = -1;
            }
            this.stored = 0;
        }
        bidSide.prototype.get = function (order) {
            if (order === void 0) { order = 1; }
            if (order > 0) { // default ordering
                return this.quotes.slice(0, this.stored);
            }
            return this.quotes.slice(0, this.stored).reverse();
        };
        bidSide.prototype.add = function (quote, ownerId, orderIds) {
            var i = 0;
            var j = 0;
            var jm = 0;
            if (this.stored >= this.capacity) {
                throw "Add overflow!";
            }
            for (i = 0; i < this.stored; i += 1) {
                if (this.quotes[i] < quote) {
                    break;
                }
            }
            if (i < this.stored) {
                for (j = this.stored; j > i; j -= 1) {
                    jm = j - 1;
                    this.quotes[j] = this.quotes[jm];
                    this.owners[j] = this.owners[jm];
                    orderIds[this.owners[j]] = j;
                }
                this.quotes[i] = quote;
                this.owners[i] = ownerId;
                orderIds[ownerId] = i;
                this.stored += 1;
            }
            else {
                this.quotes[i] = quote;
                this.owners[i] = ownerId;
                orderIds[ownerId] = i;
                this.stored += 1;
            }
        };
        bidSide.prototype.cancel = function (orderId, orderIds) {
            var i = 0;
            var im = 0;
            if (orderId >= this.stored) {
                throw "Cancel overflow!";
            }
            orderIds[this.owners[orderId]] = -1;
            for (i = orderId + 1; i < this.stored; i += 1) {
                im = i - 1;
                this.quotes[im] = this.quotes[i];
                this.owners[im] = this.owners[i];
                orderIds[this.owners[i]] = im;
            }
            this.stored -= 1;
        };
        bidSide.prototype.revise = function (orderId, quote, orderIds) {
            var i = 0;
            if (orderId >= this.stored) {
                throw "Revise overflow!";
            }
            if (this.quotes[orderId] < quote) {
                this.quotes[orderId] = quote;
                for (i = orderId - 1; i > -1; i -= 1) {
                    if (this.quotes[i + 1] < this.quotes[i]) {
                        break;
                    }
                    this.swap(i, i + 1, orderIds);
                }
            }
            else {
                this.quotes[orderId] = quote;
                for (i = orderId + 1; i < this.stored; i += 1) {
                    if (this.quotes[i - 1] > this.quotes[i]) {
                        break;
                    }
                    this.swap(i, i - 1, orderIds);
                }
            }
        };
        bidSide.prototype.wouldMarket = function (quote) {
            if (this.stored == 0) {
                return false;
            }
            return this.quotes[0] > quote;
        };
        bidSide.prototype.swap = function (i1, i2, orderIds) {
            var swapQuote = this.quotes[i1];
            var swapOwner = this.owners[i1];
            this.quotes[i1] = this.quotes[i2];
            this.owners[i1] = this.owners[i2];
            this.quotes[i2] = swapQuote;
            this.owners[i2] = swapOwner;
            orderIds[this.owners[i1]] = i1;
            orderIds[this.owners[i2]] = i2;
        };
        return bidSide;
    }());
    var orderBook = /** @class */ (function () {
        function orderBook(maxCapacity) {
            this.ask = new askSide(maxCapacity);
            this.bid = new bidSide(maxCapacity);
        }
        orderBook.prototype.wouldExecute = function () {
            return this.ask.quotes[0] < this.bid.quotes[0];
        };
        orderBook.prototype.best = function () {
            var price = (this.ask.quotes[0] + this.bid.quotes[0]) / 2.0;
            var ownerA = this.ask.owners[0];
            var ownerB = this.bid.owners[0];
            return [price, ownerA, ownerB];
        };
        return orderBook;
    }());
    /* Specify agent */
    var AgentStates;
    (function (AgentStates) {
        AgentStates[AgentStates["FUNDAMENTALIST"] = 0] = "FUNDAMENTALIST";
        AgentStates[AgentStates["CHARTIST"] = 1] = "CHARTIST";
    })(AgentStates || (AgentStates = {}));
    // object constructor -----------------------------------------------------
    function herdModel(reportTick, price, priceFundamental) {
        if (reportTick === void 0) { reportTick = 1; }
        if (price === void 0) { price = 1000; }
        if (priceFundamental === void 0) { priceFundamental = 1000; }
        this.rng = new Random();
        this.resetTime(reportTick);
        this.resetPrice(price, priceFundamental);
        this.eventProbs = new Array(5);
    }
    // various resets ---------------------------------------------------------
    herdModel.prototype.resetTime = function (reportTick) {
        if (reportTick === void 0) { reportTick = 1; }
        this.time = 0;
        this.reportAt = 0;
        this.reportTick = reportTick;
    };
    herdModel.prototype.resetPrice = function (price, priceFundamental) {
        if (price === void 0) { price = 1000; }
        if (priceFundamental === void 0) { priceFundamental = 1000; }
        this.lastPrice = price;
        this.price = price;
        this.priceFundamental = priceFundamental;
        this.tradeEvents = 0;
    };
    herdModel.prototype.resetAgents = function (nFunds, nChars, laE, laTC, laTF, laM, eF, eC, a, laZero, cMood, cSpreadShape, cSpreadScale) {
        if (nFunds === void 0) { nFunds = 100; }
        if (nChars === void 0) { nChars = 100; }
        if (laE === void 0) { laE = 0.001; }
        if (laTC === void 0) { laTC = 1.0; }
        if (laTF === void 0) { laTF = 1.0; }
        if (laM === void 0) { laM = 0.1; }
        if (eF === void 0) { eF = 2; }
        if (eC === void 0) { eC = 2; }
        if (a === void 0) { a = 0; }
        if (laZero === void 0) { laZero = 0.005; }
        if (cMood === void 0) { cMood = 1; }
        if (cSpreadShape === void 0) { cSpreadShape = 4; }
        if (cSpreadScale === void 0) { cSpreadScale = 15.5; }
        var i = 0;
        this.nAgents = nFunds + nChars;
        this.nFunds = 0; // will be set to correct later
        this.nChars = 0; // will be set to correct later
        // initialize agents
        this.agents = new Array(this.nAgents);
        this.fundIds = new fixedNumberArray(-1, this.nAgents);
        this.charIds = new fixedNumberArray(-1, this.nAgents);
        this.askOrderIds = new Array(this.nAgents);
        this.bidOrderIds = new Array(this.nAgents);
        for (i = 0; i < this.nAgents; i += 1) {
            // reset order owner id arrays
            this.askOrderIds[i] = -1;
            this.bidOrderIds[i] = -1;
            // generate agents
            this.agents[i] = {
                cHalfSpread: this.rng.gamma(cSpreadShape, cSpreadScale) / 2.0,
                cValuation: this.price,
                state: (i < nFunds) ? AgentStates.FUNDAMENTALIST : AgentStates.CHARTIST,
            };
            if (this.agents[i].state == AgentStates.FUNDAMENTALIST) {
                this.fundIds.add(i);
            }
            else {
                this.charIds.add(i);
            }
        }
        this.nFunds = this.fundIds.stored;
        this.nChars = this.charIds.stored;
        this.lastChars = this.nChars;
        // reset order book
        this.resetOrderBook();
        // set common agent parameters
        this.epsilonF = eF;
        this.epsilonC = eC;
        this.alpha = a;
        this.lambdaZero = laZero;
        this.cMood = cMood;
        this.lastMood = this.cMood;
        // reset event rates
        this.laEvent = laE;
        this.laTradeChar = laTC;
        this.laTradeFund = laTF;
        this.laMoodChange = laM;
        this.updateEventRates();
    };
    herdModel.prototype.resetOrderBook = function () {
        var i = 0;
        this.lob = new orderBook(this.nAgents);
        for (i = 0; i < this.nChars; i += 1) {
            this.charLimitAdd(this.charIds.vals[i]);
        }
    };
    // event rates ------------------------------------------------------------
    herdModel.prototype.updateEventRates = function () {
        var baseRate = this.laEvent * this.lambdaScenario();
        var laTC = baseRate * this.laTradeChar * this.nChars;
        this.probBid = (1.0 + this.cMood) / 2.0;
        var laTF = baseRate * this.laTradeFund * this.nFunds * Math.abs(Math.log(this.price / this.priceFundamental));
        //let laMood:number=baseRate*this.laMoodChange;
        var laMood = this.laEvent * this.laMoodChange;
        var laFtoC = baseRate * this.nFunds * (this.epsilonC + this.nChars);
        var laCtoF = baseRate * this.nChars * (this.epsilonF + this.nFunds);
        this.laTotal = laTC + laTF + laMood + laFtoC + laCtoF;
        /* events structure:
           0 - chartist trade event
           1 - fundamentalist trade event
           2 - mood swing event
           3 - f->c event
           4 - c->f event
        */
        this.eventProbs[0] = laTC / this.laTotal;
        this.eventProbs[1] = this.eventProbs[0] + laTF / this.laTotal;
        this.eventProbs[2] = this.eventProbs[1] + laMood / this.laTotal;
        this.eventProbs[3] = this.eventProbs[2] + laFtoC / this.laTotal;
        this.eventProbs[4] = 1.0;
    };
    herdModel.prototype.lambdaScenario = function () {
        if (this.alpha == 0) {
            return this.lambdaZero + 1.0;
        }
        var y = 1.0;
        if (this.nFunds == 0) {
            y = 2.0 * this.nChars;
        }
        else {
            y = this.nChars / this.nFunds;
        }
        if (this.alpha == 1) {
            return this.lambdaZero + y;
        }
        else if (this.alpha == 2) {
            return this.lambdaZero + y * y;
        }
        else {
            return this.lambdaZero + Math.pow(y, this.alpha);
        }
    };
    // step by step execution of the model ------------------------------------
    herdModel.prototype.step = function () {
        this.reportAt += this.reportTick;
        while (this.time < this.reportAt) {
            this.lastChars = this.nChars;
            this.lastMood = this.cMood;
            this.lastPrice = this.price;
            this.eventStep();
        }
        return this.lastPrice;
    };
    herdModel.prototype.eventStep = function () {
        var dt = this.rng.exponential(this.laTotal);
        var r = this.rng.random();
        var eventCode = -1;
        if (r < this.eventProbs[0]) {
            eventCode = 0;
            this.eventTradeChartist();
        }
        else if (r < this.eventProbs[1]) {
            eventCode = 1;
            this.eventTradeFundamentalist();
        }
        else if (r < this.eventProbs[2]) {
            eventCode = 2;
            this.eventMoodChange();
        }
        else if (r < this.eventProbs[3]) {
            eventCode = 3;
            this.eventSwitchFtoC();
        }
        else {
            eventCode = 4;
            this.eventSwitchCtoF();
        }
        this.time += dt;
    };
    // triggered events -------------------------------------------------------
    herdModel.prototype.eventTradeChartist = function () {
        this.charMarket(this.getRandomChartist());
        this.fundClearMarket();
        this.charRequote();
        this.updateEventRates();
    };
    herdModel.prototype.eventTradeFundamentalist = function () {
        this.fundMarket();
        this.fundClearMarket();
        this.charRequote();
        this.updateEventRates();
    };
    herdModel.prototype.eventMoodChange = function () {
        this.cMood = -this.cMood;
    };
    herdModel.prototype.eventSwitchFtoC = function () {
        this.moveFtoC();
        this.updateEventRates();
    };
    herdModel.prototype.eventSwitchCtoF = function () {
        this.moveCtoF();
        this.updateEventRates();
    };
    // operations on agent lists ----------------------------------------------
    herdModel.prototype.getRandomFundamentalist = function () {
        return this.fundIds.vals[Math.floor(this.rng.random() * this.fundIds.stored)];
    };
    herdModel.prototype.moveFtoC = function (agentId) {
        // pick random agent if not picked
        if (typeof agentId == "undefined") {
            agentId = this.getRandomFundamentalist();
        }
        // remove him from Ids array
        this.fundIds.removeByValue(agentId);
        this.nFunds -= 1;
        // add him to chartists' Ids array
        this.charIds.add(agentId);
        this.nChars += 1;
        // update his internal state
        this.agents[agentId].state = AgentStates.CHARTIST;
        // submit his limit orders
        this.charLimitAdd(agentId);
    };
    herdModel.prototype.getRandomChartist = function () {
        return this.charIds.vals[Math.floor(this.rng.random() * this.charIds.stored)];
    };
    herdModel.prototype.moveCtoF = function (agentId) {
        // pick random agent if not picked
        if (typeof agentId == "undefined") {
            agentId = this.getRandomChartist();
        }
        // remove him from Ids array
        this.charIds.removeByValue(agentId);
        this.nChars -= 1;
        // add him to fundamentalists' Ids array
        this.fundIds.add(agentId);
        this.nFunds += 1;
        // update his internal state
        this.agents[agentId].state = AgentStates.FUNDAMENTALIST;
        // cancel his limit orders
        this.charLimitCancel(agentId);
    };
    // chartist's interaction with LOB ----------------------------------------
    herdModel.prototype.charLimitAdd = function (agentId) {
        if (this.askOrderIds[agentId] == -1) { // if no orders
            // either both orders are present or neither is
            // so check only ask side
            this.lob.ask.add(this.agents[agentId].cValuation + this.agents[agentId].cHalfSpread, agentId, this.askOrderIds);
            this.lob.bid.add(this.agents[agentId].cValuation - this.agents[agentId].cHalfSpread, agentId, this.bidOrderIds);
        }
        else {
            console.log("charLimitAdd: order present");
        }
    };
    herdModel.prototype.charLimitRevise = function (agentId) {
        if (this.askOrderIds[agentId] > -1) { // if orders present
            // either both orders are present or neither is
            // so check only ask side
            this.lob.ask.revise(this.askOrderIds[agentId], this.agents[agentId].cValuation + this.agents[agentId].cHalfSpread, this.askOrderIds);
            this.lob.bid.revise(this.bidOrderIds[agentId], this.agents[agentId].cValuation - this.agents[agentId].cHalfSpread, this.bidOrderIds);
        }
        else {
            console.log("charLimitRevise: no order present");
        }
    };
    herdModel.prototype.charLimitCancel = function (agentId) {
        this.lob.ask.cancel(this.askOrderIds[agentId], this.askOrderIds);
        this.lob.bid.cancel(this.bidOrderIds[agentId], this.bidOrderIds);
    };
    herdModel.prototype.charMarket = function (agentId) {
        var agentId2 = -1;
        var quote = -1;
        if (this.rng.random() < this.probBid) {
            agentId2 = this.lob.ask.owners[0];
            quote = this.lob.ask.quotes[0];
            if (agentId2 == agentId) {
                agentId2 = this.lob.ask.owners[1];
                quote = this.lob.ask.quotes[1];
            }
        }
        else {
            agentId2 = this.lob.bid.owners[0];
            quote = this.lob.bid.quotes[0];
            if (agentId2 == agentId) {
                agentId2 = this.lob.bid.owners[1];
                quote = this.lob.bid.quotes[1];
            }
        }
        if (agentId2 > -1) {
            this.price = quote;
            this.tradeEvents += 1;
        }
    };
    herdModel.prototype.charRequote = function () {
        var i = 0;
        for (i = 0; i < this.nAgents; i += 1) {
            this.agents[i].cValuation = this.price;
            if (this.agents[i].state == AgentStates.CHARTIST) {
                this.charLimitRevise(i);
            }
        }
    };
    // fundamentalist's interaction with LOB ----------------------------------
    herdModel.prototype.fundMarket = function () {
        if (this.lob.bid.wouldMarket(this.priceFundamental)) {
            this.price = this.lob.bid.quotes[0];
            this.tradeEvents += 1;
            return;
        }
        if (this.lob.ask.wouldMarket(this.priceFundamental)) {
            this.price = this.lob.ask.quotes[0];
            this.tradeEvents += 1;
            return;
        }
    };
    herdModel.prototype.fundClearMarket = function () {
        if (this.price < 10) {
            this.lastPrice = this.priceFundamental;
            this.price = this.priceFundamental;
            this.tradeEvents += 1;
        }
    };
    return herdModel;
}());
