function myParseFloat(val) {return parseFloat((""+val).replace(",","."));}

let pSeriesPlot=new plotlyPlot("pSeries",["time","relative price"],[10,10,40,60]);
let cobwebPlot=new plotlyPlot("cobwebSeries",["quantity","relative price"],[10,10,40,60]);
let supplyPlot=new plotlyPlot("sdSeries",["time","supply / demand"],[10,10,40,60]);

let model=null;
let time=0;
let timeSeries=null;
let priceSeries=null;
let sellSeries=null;
let buySeries=null;
let lastQs=null;
let lastPs=null;

let priceEqui=-0.5;
let quantityEqui=1000;
let reportTick=1;
let alphaSupply=1;
let alphaDemand=0.5;

let runFlag=false;

function limitQuantity(q) {
    return Math.max(q,0);
}

function limitPrice(p) {
    return Math.max(Math.min(p,1e4),-1e4);
}

function demandLaw(q) {
    return -alphaDemand*(limitQuantity(q)-quantityEqui)+priceEqui;
}

function supplyLaw(q) {
    return alphaSupply*(limitQuantity(q)-quantityEqui)+priceEqui;
}

function inverseDemandLaw(p) {
    return limitQuantity(-(p-priceEqui)/alphaDemand+quantityEqui);
}

function inverseSupplyLaw(p) {
    return limitQuantity((p-priceEqui)/alphaSupply+quantityEqui);
}

function play() {
    let price, itemsSold, itemsBought;
    timeSeries.splice(0,1);
    priceSeries.splice(0,1);
    sellSeries.splice(0,1);
    buySeries.splice(0,1);
    lastQs.splice(0,2);
    lastPs.splice(0,2);
        
    time+=1;
    price=limitPrice(model.step());
    itemsSold=model.nDeals[0]/reportTick;
    itemsBought=model.nDeals[1]/reportTick;

    timeSeries.push(time);
    priceSeries.push(price);
    sellSeries.push(itemsSold);
    buySeries.push(itemsBought);
    lastQs.push(itemsBought);
    lastPs.push(priceSeries[priceSeries.length-2]);
    lastQs.push(itemsSold);
    lastPs.push(priceSeries[priceSeries.length-2]);

    model.setRates(
        inverseDemandLaw(price),
        inverseSupplyLaw(price)
    );
}

function plotFigures() {
    let teorQ=[Math.min(...sellSeries,...buySeries),Math.max(...sellSeries,...buySeries)];
    let teorSell=teorQ.map(v=>supplyLaw(v));
    let teorBuy=teorQ.map(v=>demandLaw(v));
    pSeriesPlot.update([timeSeries],[priceSeries],"lines","rgb(83,81,84)");
    supplyPlot.update(
        [timeSeries,timeSeries],
        [sellSeries,buySeries],
        ["markers","markers"],
        ["rgb(57,106,177)","rgb(204,37,41)"]
    );
    cobwebPlot.update(
        [teorQ,teorQ,lastQs.slice(0,-1),sellSeries.slice(1),buySeries.slice(1)],
        [teorSell,teorBuy,lastPs.slice(0,-1),priceSeries.slice(0,-1),priceSeries.slice(0,-1)],
        ["lines","lines","lines","markers","markers"],
        ["rgb(57,106,177)","rgb(204,37,41)","rgb(83,81,84)","rgb(57,106,177)","rgb(204,37,41)"]
    );
}

function seriesSetup(price) {
    let i;
    time=0;
    timeSeries=new Array(128);
    priceSeries=new Array(timeSeries.length);
    sellSeries=new Array(timeSeries.length);
    buySeries=new Array(timeSeries.length);
    for(i=0;i<timeSeries.length;i+=1) {
        timeSeries[i]=i-timeSeries.length;
        priceSeries[i]=price;
        sellSeries[i]=limitQuantity(inverseSupplyLaw(price));
        buySeries[i]=limitQuantity(inverseDemandLaw(price));
    }
    lastQs=[0,0,0,0];
    lastPs=[price,price,price,price];
}

function setup() {
    alphaSupply=myParseFloat($("#supplyLaw").val());
    alphaDemand=myParseFloat($("#demandLaw").val());
    reportTick=myParseFloat($("#reportTick").val());
    quantityEqui=myParseFloat($("#quantityEqui").val())*1000;
    priceEqui=myParseFloat($("#priceEqui").val());
    let priceMax=demandLaw(0);
    let priceMin=supplyLaw(0);
    let price=(priceMax-priceMin)*Math.random()+priceMin;
    model=new EmmModel(
        inverseDemandLaw(price),
        inverseSupplyLaw(price),
        myParseFloat($("#sameSideP").val()),
        reportTick
    );
    model.bestSell=price;
    seriesSetup(price);
}

function frame() {
    play();
    plotFigures();
    if(runFlag) {
        window.setTimeout("frame()",30.0);
    }
}

function stopGame() {
    runFlag=false;
}

function resumeGame() {
    window.setTimeout("frame()",30.0);
    runFlag=true;
}

/* bind events and set initial GUI states */
$("#stop, #step").attr("disabled","disabled");
$("#restart").click(function () {
    setup();
    plotFigures();
    $("#stop, #step").removeAttr("disabled");
    $("#stop").text("Start");
});
$("#stop").toggle(function() {
    resumeGame();
    $("#stop").text("Stop");
    $("#restart, #step").attr("disabled","disabled");
},function() {
    stopGame();
    $("#stop").text("Continue");
    $("#restart, #step").removeAttr("disabled");
});
$("#step").click(function() {
    frame();
    $("#stop").text("Continue");
});

/* onLoad */
$(function () {
    setup();
    plotFigures();
});
