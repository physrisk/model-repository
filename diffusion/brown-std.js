function myParseFloat(val){return parseFloat((""+val).replace(",","."));}

let seriesPlot = new plotlyPlot("seriesPlot",
    ["t","x(t)"],
    [10,15,40,60]);
let stdPlot = new plotlyPlot("stdPlot",
    ["lg[t]","lg[ σ(t) / σ(0) ]"],
    [10,5,40,60]);

let rng = new Random();

let initialCondition = 0;

let nSeries = 30;
let seriesLength = 10001;
let desiredStdLen = 30;
let stdMaxTime = 1000;
let timeSeriesVals = null;
let timeStdValsLog = null;
let timeStdVals = null;

function generate() {
    let i, series, std;
    let manySeries = [];
    for(i=0;i<nSeries;i+=1) {
        series = Array.from({length:seriesLength}, () => rng.normal(0,1));
        series = series.reduce((acc,v,i) => {
            acc.push(acc[i]+v);
            return acc;
        }, [initialCondition]).slice(1);
        
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
    stdPlot.update([timeStdValsLog],[std],"markers");
}

$("#generate").click(() => {
    generate();
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

    generate();
});
