function myParseFloat(val) {return parseFloat((""+val).replace(",","."));}

let retPdfPlot=new plotlyPlot("retPdf",["lg[|r|]","lg[P(|r|)]"]);
var retSpecPlot=new plotlyPlot("retSpec",["lg[f]","lg[S(f)]"]);
let pSeriesPlot=new plotlyPlot("pSeries",["time","price"]);
let retSeriesPlot=new plotlyPlot("retSeries",["time","return"]);

let model=null;
let time=0;
let timeTick=1;
let timeSeries=null;
let priceSeries=null;
let retSeries=null;

let initialPrice=3e4;
let tauAlpha=2;
let laZero=0.4;
let retTick=Math.abs(Math.log((initialPrice-1)/initialPrice));

let pdf=null;
let pdfLen=0;
let pdfMax=-1;

let timeoutID=null;

function play() {
    let i, price, ret;
    timeSeries.splice(0,64);
    priceSeries.splice(0,64);
    retSeries.splice(0,64);
    for(i=0;i<64;i+=1) {
        time+=timeTick;
        price=model.step();
        ret=Math.log(price/priceSeries[priceSeries.length-1])/retTick;

        timeSeries.push(time);
        priceSeries.push(price);
        retSeries.push(ret);
        
        let pdfi=Math.floor(Math.abs(ret)-1);
        if(-1<pdfi && pdfi<pdf.length) {
            pdf[pdfi]+=1;
            pdfLen+=1;
            pdfMax=Math.max(pdfMax,pdfi+1);
        }
    }
}

function plotFigures() {
    if(pdfLen>0) {
        var showPdf=commonFunctions.pdfModification(pdf,true,1e0,1e4,101,1e0,1e0,pdfLen);
        retPdfPlot.update([commonFunctions.toOneDimensionalArray(showPdf,0)],
                          [commonFunctions.toOneDimensionalArray(showPdf,1)]);
    } else {
        retPdfPlot.reset();
    }
    if(time>128) {
        var curSpec=commonFunctions.performRealFFT(retSeries);
        var showPsd=commonFunctions.specModification(curSpec,timeTick,100,true);
        retSpecPlot.update([commonFunctions.toOneDimensionalArray(showPsd,0)],
                           [commonFunctions.toOneDimensionalArray(showPsd,1)]);
    } else {
        retSpecPlot.reset();
    }
    pSeriesPlot.update([timeSeries],[priceSeries]);
    retSeriesPlot.update([timeSeries],[retSeries.slice(-4096)]);
}

function pdfSetup() {
    let i;
    pdf=new Array(10000);
    for(i=0;i<pdf.length;i+=1) {
        pdf[i]=0;
    }
    pdfLen=0;
    pdfMax=-1;
}

function seriesSetup() {
    let i;
    time=0;
    timeSeries=new Array(4096);
    priceSeries=new Array(timeSeries.length);
    for(i=0;i<timeSeries.length;i+=1) {
        timeSeries[i]=timeTick*(i-timeSeries.length);
    }
    for(i=0;i<priceSeries.length;i+=1) {
        priceSeries[i]=initialPrice;
    }
    retSeries=new Array(262144);
    for(i=0;i<retSeries.length;i+=1) {
        retSeries[i]=Math.random()*0.1;
    }
}

function setup() {
    timeTick=myParseFloat(document.querySelector("#timeTick").value);
    let nAgents=Math.round(parseInt(document.querySelector("#nAgents").value)/2);
    let spreadShape=myParseFloat(document.querySelector("#spreadShape").value);
    let spreadScale=myParseFloat(document.querySelector("#spreadScale").value);
    let cMood=myParseFloat(document.querySelector("#cMood").value);
    let lae=myParseFloat(document.querySelector("#lae").value)*1e-8;
    let epsiF=myParseFloat(document.querySelector("#epsiF").value);
    let epsiC=myParseFloat(document.querySelector("#epsiC").value);
    let latf=myParseFloat(document.querySelector("#latf").value);
    let latc=myParseFloat(document.querySelector("#latc").value);
    let lamc=myParseFloat(document.querySelector("#lamc").value);
    model=new herdModel(timeTick,initialPrice,initialPrice);
    model.resetAgents(
        nAgents,nAgents,
        lae,latc,latf,lamc,
        epsiF,epsiC,tauAlpha,laZero,
        cMood,spreadShape,spreadScale
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
