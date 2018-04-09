function myParseFloat(val) {return parseFloat((""+val).replace(",","."));}

var retPdfPlot=new plotlyPlot("retPdf",["|Δp|","lg[P(|Δp|)]"]);
var retCorPlot=new plotlyPlot("retSpec",["τ","lg[C(τ)]"]);
retCorPlot.setRanges(true,[-1,1]);
var pSeriesPlot=new plotlyPlot("pSeries",["time","relative price"]);
var retSeriesPlot=new plotlyPlot("retSeries",["time","price change"]);

var model=null;
var time=0;
var timeTick=1;
var timeSeries=null;
var priceSeries=null;
var retSeries=null;

var priceTick=1;

var pdf=null;
var pdfLen=0;
var pdfMax=-1;

var timeoutID=null;

function play() {
    var i, price, ret;
    timeSeries.splice(0,64);
    priceSeries.splice(0,64);
    retSeries.splice(0,64);
    for(i=0;i<64;i+=1) {
        time+=timeTick;
        price=model.step();
        ret=(price-priceSeries[priceSeries.length-1])/priceTick;

        timeSeries.push(time);
        priceSeries.push(price);
        retSeries.push(ret);
        
        var pdfi=Math.floor(Math.abs(ret)-1);
        if(-1<pdfi && pdfi<pdf.length) {
            pdf[pdfi]+=1;
            pdfLen+=1;
            pdfMax=Math.max(pdfMax,pdfi+1);
        }
    }
}

function plotFigures() {
    if(pdfLen>0) {
        var showPdf=commonFunctions.pdfModification(pdf,false,1e0,pdfMax+1,pdfMax,1e0,1e0,pdfLen);
        var showPdfLogY=commonFunctions.toOneDimensionalArray(showPdf,1);
        showPdfLogY=showPdfLogY.map(y=>Math.log10(y));
        retPdfPlot.update([commonFunctions.toOneDimensionalArray(showPdf,0)],
                          [showPdfLogY]);
    } else {
        retPdfPlot.reset();
    }
    if(time>128) {
        var i=0;
        var corSeries=retSeries.slice(-1024);
        var autoCorY=commonFunctions.autocorrelation(corSeries,[0,8,1]);
        corSeries=corSeries.map(Math.abs);
        var autoCorY2=commonFunctions.autocorrelation(corSeries,[0,8,1]);
        var autoCorX=new Array(autoCorY.length);
        autoCorX[0]=0;
        for(i=1;i<autoCorX.length;i+=1) {
            autoCorX[i]=autoCorX[i-1]+timeTick;
        }
        retCorPlot.update([autoCorX,autoCorX],[autoCorY,autoCorY2]);
    } else {
        retCorPlot.reset();
    }
    pSeriesPlot.update([timeSeries],[priceSeries]);
    retSeriesPlot.update([timeSeries],[retSeries.slice(-4096)]);
}

function pdfSetup() {
    var i;
    pdf=new Array(10000);
    for(i=0;i<pdf.length;i+=1) {
        pdf[i]=0;
    }
    pdfLen=0;
    pdfMax=-1;
}

function seriesSetup() {
    var i;
    time=0;
    timeSeries=new Array(4096);
    priceSeries=new Array(timeSeries.length);
    for(i=0;i<timeSeries.length;i+=1) {
        timeSeries[i]=timeTick*(i-timeSeries.length);
    }
    for(i=0;i<priceSeries.length;i+=1) {
        priceSeries[i]=0;
    }
    retSeries=new Array(32768);
    for(i=0;i<retSeries.length;i+=1) {
        retSeries[i]=Math.random()*0.1;
    }
}

function setup() {
    timeTick=myParseFloat(document.querySelector("#timeTick").value)
    model=new takayasuModel(
        myParseFloat(document.querySelector("#nAgents").value),
        myParseFloat(document.querySelector("#spreadShape").value),
        myParseFloat(document.querySelector("#spreadScale").value),
        myParseFloat(document.querySelector("#trendFollowSens").value),
        myParseFloat(document.querySelector("#trendFollowSatur").value),
        myParseFloat(document.querySelector("#trendFollowStd").value),
        0.01,
        timeTick
    );
    seriesSetup();
    pdfSetup();
}

function frame() {
    play();
    plotFigures();
}

function stopGame() {
    window.clearInterval(timeoutID);
    timeoutID=null;
}

function resumeGame() {
    timeoutID=window.setInterval("frame()",30.0);
}
