function myParseFloat(val) {return parseFloat((""+val).replace(",","."));}

let timeSeriesPlot=new plotlyPlot("timeSeries",["t",false]);

let model=null;

let timeSeries=null;
let opinionSeries=null;
let seriesLen=100;

let timeoutID=null;

function play() {
    let i;
    model.singleStep();
    if(timeSeries.length>seriesLen) {
        timeSeries.splice(0,1);
    }
    timeSeries.push(model.time);
    for(i=0;i<nAgents;i+=1) {
        if(opinionSeries[i].length>seriesLen) {
            opinionSeries[i].splice(0,1);
        }
        opinionSeries[i].push(model.opinions[i]);
    }
}

function plotFigures() {
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

function setup() {
    let i,j,t,alpha;
    let trust=[];
    for(i=0;i<nAgents;i+=1) {
        t=[];
        for(j=0;j<nAgents;j+=1) {
            if(i==j) {
                t.push(0);
            } else {
                t.push(myParseFloat($("#D"+i+""+j).val()));
            }
        }
        trust.push(t);
    }
    if(parseInt($("#modelType").val())==1) {
        alpha=[1,0];
    } else {
        alpha=[0,1];
    }
    model=new IshiiTrustModel(
        alpha,
        nAgents,
        myParseFloat($("#epsilon").val()),
        trust
    );
    for(i=0;i<nAgents;i+=1) {
        model.opinions[i]=myParseFloat($("#ini"+i).val());
    }
    seriesLen=Math.round(100/model.dt);
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
