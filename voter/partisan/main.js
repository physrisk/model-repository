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

let timeoutID=null;

let g;

function play() {
    let i, mag;
    timeSeries.splice(0,64);
    extSeries.splice(0,64);
    disSeries.splice(0,64);
    for(i=0;i<64;i+=1) {
        time+=timeStep;
        mag=model.step(timeStep*total);

        timeSeries.push(time);
        extSeries.push(mag/total);
        disSeries.push(model.disonant/total);
    }
}

function plotFigures() {
    timeSeriesPlot.update([timeSeries,timeSeries],
        [extSeries,intSeries],"lines",
        ["rgb(100,70,150)","rgb(80,80,80)"]);
    disonancePlot.update([timeSeries],[disSeries],"lines","rgb(210,120,50)");
    plotField();
}

function plotField() {
    let i,j;
    for(i=0;i<model.height;i+=1) {
        for(j=0;j<model.width;j+=1) {
            if(model.extArray[i][j]<0) {
                if(model.intArray[i][j]<0) {
                    g.fillStyle="rgb(60,100,180)";
                } else {
                    g.fillStyle="rgb(110,150,200)";
                }
            } else {
                if(model.intArray[i][j]>0) {
                    g.fillStyle="rgb(200,40,40)";
                } else {
                    g.fillStyle="rgb(210,95,95)";
                }
            }
            g.fillRect(j*sqSize,i*sqSize,sqSize,sqSize);
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
    for(i=0;i<timeSeries.length;i+=1) {
        timeSeries[i]=(i-timeSeries.length)*timeStep;
        extSeries[i]=model.globalExt/total;
        intSeries[i]=model.globalInt/total;
        disSeries[i]=model.disonant/total;
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
