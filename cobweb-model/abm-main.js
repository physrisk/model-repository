function myParseFloat(val) {return parseFloat((""+val).replace(",","."));}

let pSeriesPlot=new plotlyPlot("pSeries",["time","relative price"],[10,10,40,60]);
let cobwebPlot=new plotlyPlot("cobwebSeries",["quantity","relative price"],[10,10,40,60]);
let supplyPlot=new plotlyPlot("sdSeries",["time","supply / demand"],[10,10,40,60]);

let time=0;
let timeSeries=null;
let priceSeries=null;
let demSeries=null;
let prodSeries=null;
let lastQs=null;
let lastPs=null;

let model=null;
let reportTick=1;

let runFlag=false;

function isStable() {
    let as=myParseFloat($("#supplyLaw").val());
    let ad=myParseFloat($("#demandLaw").val());
    let cr=myParseFloat($("#conversionRate").val());
    let coef=1-(as+ad)/(as*ad)*cr;
    return Math.abs(coef)<1;
}

function play() {
    let prevPrice=model.currentPrice;

    model.step();
    
    if(model.badDemand) {
        if(runFlag) {
            $("#stop").click();
        }
        $("#stop, #step").attr("disabled","disabled");
    }
    
    // update time series
    timeSeries.splice(0,1);
    priceSeries.splice(0,1);
    demSeries.splice(0,1);
    prodSeries.splice(0,1);
    lastQs.splice(0,2);
    lastPs.splice(0,2);

    time+=1;
    timeSeries.push(time);
    priceSeries.push(prevPrice);
    demSeries.push(model.lastEstimatedDemand);
    prodSeries.push(model.lastDeals+model.lastSupply);
    lastQs.push(model.lastDeals+model.lastSupply);
    lastPs.push(prevPrice);
    lastQs.push(model.lastEstimatedDemand);
    lastPs.push(prevPrice);

}

function plotFigures() {
    let teorQ=[Math.min(...demSeries,...prodSeries),Math.max(...demSeries,...prodSeries)];
    let teorSell=teorQ.map(v=>model.supplyLaw(v));
    let teorBuy=teorQ.map(v=>model.demandLaw(v));
    pSeriesPlot.update([timeSeries],[priceSeries],"lines","rgb(83,81,84)");
    supplyPlot.update(
        [timeSeries,timeSeries],
        [prodSeries,demSeries],
        ["markers","markers"],
        ["rgb(57,106,177)","rgb(204,37,41)"]
    );
    cobwebPlot.update(
        [teorQ,teorQ,lastQs.slice(0,-1),prodSeries,demSeries],
        [teorSell,teorBuy,lastPs.slice(0,-1),priceSeries,priceSeries],
        ["lines","lines","lines","markers","markers"],
        ["rgb(57,106,177)","rgb(204,37,41)","rgb(83,81,84)","rgb(57,106,177)","rgb(204,37,41)"]
    );
}

function seriesSetup() {
    let i;
    time=0;
    timeSeries=new Array(128);
    priceSeries=new Array(timeSeries.length);
    demSeries=new Array(timeSeries.length);
    prodSeries=new Array(timeSeries.length);
    for(i=0;i<timeSeries.length;i+=1) {
        timeSeries[i]=i-timeSeries.length;
        priceSeries[i]=model.currentPrice;
        prodSeries[i]=model.limitQuantity(model.inverseSupplyLaw(model.currentPrice));
        demSeries[i]=model.limitQuantity(model.inverseDemandLaw(model.currentPrice));
    }
    lastQs=[0,0,model.inverseSupplyLaw(model.currentPrice),model.inverseDemandLaw(model.currentPrice)];
    lastPs=[model.currentPrice,model.currentPrice,model.currentPrice,model.currentPrice];
}

function setup() {
    model=new cobwebABM(
        myParseFloat($("#demandLaw").val()),
        myParseFloat($("#supplyLaw").val()),
        myParseFloat($("#conversionRate").val()),
        myParseFloat($("#priceEqui").val()),
        myParseFloat($("#quantityEqui").val())*1e3,
        reportTick
    );
    seriesSetup();
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

function updateStable() {
    if(isStable()) {
        $("#stabilityIndicator").css("color","rgb(132,186,91)").text("Stable");
    } else {
        $("#stabilityIndicator").css("color","rgb(211,94,96)").text("Unstable");
    }
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
$("#conversionRate, #demandLaw, #supplyLaw").change(function() {
    updateStable();
});

/* onLoad */
$(function () {
    setup();
    plotFigures();
    updateStable();
});
