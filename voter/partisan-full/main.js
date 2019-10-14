function myParseFloat(val) {return parseFloat((""+val).replace(",","."));}

let timeSeriesPlot=new plotlyPlot("timeSeries",["t","M(t)"]);
let disonancePlot=new plotlyPlot("disonance",["t","D(t)"]);

let height=40;
let width=100;
let sqSize=5;
let total=height*width;

let model=null;
let time=0;
let timeSeries=null;
let timeStep=1;
let extSeries=null;
let intSeries=null;
let disSeries=null;
let disBSeries=null;
let disRSeries=null;
let fReds=0;

let timeoutID=null;

let g;

function play() {
    let i, mag;
    timeSeries.splice(0,64);
    extSeries.splice(0,64);
    disSeries.splice(0,64);
    disBSeries.splice(0,64);
    disRSeries.splice(0,64);
    for(i=0;i<64;i+=1) {
        time+=timeStep;
        mag=model.step(timeStep*total)/total;

        timeSeries.push(time);
        extSeries.push(mag);
        disSeries.push(model.disonant/total);

        disBSeries.push(model.disB/total/(1-fReds));
        disRSeries.push(model.disR/total/fReds);
    }
}

function plotFigures() {
    timeSeriesPlot.update([timeSeries,timeSeries],
        [extSeries,intSeries],"lines",
        ["rgb(100,70,150)","rgb(80,80,80)"]);
    disonancePlot.update([timeSeries,timeSeries,timeSeries],
        [disSeries,disBSeries,disRSeries],"lines",
        ["rgb(80,80,80)","rgb(60,100,180)","rgb(200,40,40)"]);
    plotField();
}

function plotField() {
    let i,j,n,nT;
    n=0;
    nT=model.type.reduce((cv,x,i)=>{cv.push(cv[i]+x);return cv;},[0]);
    for(i=0;i<height;i+=1) {
        for(j=0;j<width;j+=1) {
            if(n<nT[1]) {
                g.fillStyle="rgb(60,100,180)";
            } else if(n<nT[2]) {
                g.fillStyle="rgb(110,150,200)";
            } else if(n<nT[3]) {
                g.fillStyle="rgb(210,95,95)";
            } else {
                g.fillStyle="rgb(200,40,40)";
            }
            g.fillRect(j*sqSize,i*sqSize,sqSize,sqSize);
            n+=1;
        }
    }
}

function seriesSetup() {
    let i;
    time=0;
    timeSeries=new Array(4096);
    extSeries=new Array(4096);
    intSeries=new Array(4096);
    disSeries=new Array(4096);
    disBSeries=new Array(4096);
    disRSeries=new Array(4096);
    fReds=(1-model.globalInt/total)/2;
    for(i=0;i<timeSeries.length;i+=1) {
        timeSeries[i]=(i-timeSeries.length)*timeStep;
        extSeries[i]=model.globalExt/total;
        intSeries[i]=model.globalInt/total;
        disSeries[i]=model.disonant/total;
        disBSeries[i]=model.disB/total/(1-fReds);
        disRSeries[i]=model.disR/total/fReds;
    }
}

function setup() {
    g=$("#plotDiv")[0].getContext("2d");
    model=new PartisanModel(height,width,
        myParseFloat($("#epsi").val()),
        myParseFloat($("#extFillProb").val()),
        myParseFloat($("#intFillProb").val())
    );
    seriesSetup();
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
