function myParseFloat(val){return parseFloat((""+val).replace(",","."));}

let seriesPlot = new plotlyPlot("seriesPlot",
    ["t","x(t)"],
    [10,15,40,60]);
let sigmaPlot = new plotlyPlot("sigmaPlot",
    ["lg[t]","lg[ σ(t) / σ(0) ]"],
    [10,5,40,60]);

let rng = new Random();

let gamma = 1.5;

let nSeries = 30;
let seriesLength = 1001;
let desiredStdLen = 30;
let stdMaxTime = 100;
let timeSeriesVals = null;
let timeStdValsLog = null;
let timeStdVals = null;

function getParams() {
    gamma = myParseFloat($("#gamma").val());
}

function generate() {
    let i, series, std, model;
    let manySeries = [];
    for(i=0;i<nSeries;i+=1) {
        model = new levyWalkModel(gamma, rng);
        series = Array.from({length:seriesLength}, (v,t) => {
            return model.get(t);
        });
        manySeries.push(series);
    }
    series = null;

    std = timeStdVals.map(t => {
        let subset = manySeries.map(v => v[t]);
        let mean = subset.reduce((acc,v) => acc+v,0)/subset.length;
        let diff = subset.map(v => v - mean);
        return 0.5*Math.log10(diff.reduce((acc,v) => {
            return acc+v*v;
        },0)/(subset.length-1));
    });
    std = std.map(v => v-std[0]);
    
    seriesPlot.update([timeSeriesVals],manySeries,"lines");
    sigmaPlot.update([timeStdValsLog],[std],"markers");
}

function execute() {
    getParams();
    generate();
}

$("#generate").click(() => {
    execute();
});

/* onLoad */
$(function () {
    timeSeriesVals = Array.from({length:seriesLength}, (v,i) => i);
    let stdCoeff = Math.log10(stdMaxTime)/(desiredStdLen-1);
    timeStdValsLog = Array.from({length:desiredStdLen}, (v,i) => stdCoeff*i);
    timeStdVals = Array.from({length:desiredStdLen}, (v,i) => {
        return Math.round(Math.pow(10,timeStdValsLog[i]));
    });
    timeStdValsLog = timeStdValsLog.filter((v,i) => {
        return (i==0) || (timeStdVals[i]>timeStdVals[i-1]);
    });
    timeStdVals = timeStdVals.filter((v,i,s) => {
        return (i==0) || (v>s[i-1]);
    });

    execute();
});
