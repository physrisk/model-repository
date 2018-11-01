function myParseFloat(val) {return parseFloat((""+val).replace(",","."));}

let timeSeriesPlot=new plotlyPlot("timeSeries",["t",false]);
timeSeriesPlot.setRanges(true,[0,1]);
let pdfPlot=new plotlyPlot("pdf",["x","p(x)"]);
pdfPlot.setRanges([0,1],true);

let nAgents=100;

let model=null;

let timeSeries=null;
let opinionSeries=null;
let opinionPdfX=null;
let pdfStep=0.01;

let timeoutID=null;

function play() {
    let i;
    if(model.step(nAgents)==0) {
        $("#stop").click();
    }
    if(timeSeries.length>30) {
        timeSeries.splice(0,1);
    }
    timeSeries.push(model.time);
    for(i=0;i<nAgents;i+=1) {
        if(opinionSeries[i].length>30) {
            opinionSeries[i].splice(0,1);
        }
        opinionSeries[i].push(model.opinions[i]);
    }
}

function plotFigures() {
    let opinionPdf=commonFunctions.makePdf(model.opinions,0,nAgents*pdfStep,nAgents,false);
    pdfPlot.update([opinionPdfX],[opinionPdf]);
    timeSeriesPlot.update([timeSeries],opinionSeries);
}

function seriesSetup() {
    let i;
    timeSeries=[];
    opinionSeries=new Array(nAgents);
    for(i=0;i<nAgents;i+=1) {
        opinionSeries[i]=[model.opinions[i]];
    }
}

function pdfSetup() {
    let i;
    opinionPdfX=new Array(nAgents+1);
    for(i=0;i<nAgents+1;i+=1) {
        opinionPdfX[i]=i*pdfStep;
    }
}

function setup() {
    model=new HKBCModel(nAgents,
            myParseFloat($("#mu").val()),
            myParseFloat($("#epsilon").val())
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
    timeoutID=window.setInterval("frame()",100.0);
}
