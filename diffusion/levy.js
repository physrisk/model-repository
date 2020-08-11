function myParseFloat(val){return parseFloat((""+val).replace(",","."));}

let seriesPlot = new plotlyPlot("seriesPlot",
    ["t","x(t)"],
    [10,15,40,60]);
let msdPlot = new plotlyPlot("msdPlot",
    ["lg[Δt]","lg[ MSD(Δt) / MSD(1) ]"],
    [10,5,40,60]);

let rng = new Random();

let gamma = 2.5;

let nSeries = 10;
let seriesLength = 1001;
let desiredMSDLen = 30;
let msdLength = 0;
let msdMaxTime = 100;
let timeSeriesVals = null;
let timeMSDValsLog = null;
let timeMSDVals = null;

function getParams() {
    gamma = myParseFloat($("#gamma").val());
}

function generate() {
    let i, series, msd, model;
    let manySeries = [];
    let manyMSDs = [];
    for(i=0;i<nSeries;i+=1) {
        model = new levyWalkModel(gamma, rng);
        series = Array.from({length:seriesLength}, (v,t) => {
            return model.get(t);
        });
        
        msd = Array.from({length:msdLength}, (msdVal,idx) => {
            let dT = timeMSDVals[idx];
            let _series = series.map((x,t,X) => {
                let dX = 0;
                if(t >= dT) {
                    dX = X[t] - X[t - dT];
                }
                return dX*dX;
            }).slice(dT);
            return _series.reduce((acc,dX) => acc + dX)/_series.length;
        });
        
        manySeries.push(series);
        manyMSDs.push(msd);
    }
    series = null;
    msd = Array.from({length:msdLength}, (msdVal,idx) => {
        return manyMSDs.reduce((acc,_msd) => {
            return acc + _msd[idx];
        }, 0)/nSeries;
    });
    msd = msd.map(v => Math.log10(v/msd[0]));
    seriesPlot.update([timeSeriesVals],manySeries,"lines");
    msdPlot.update([timeMSDValsLog],[msd],"markers");
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
    let msdCoeff = Math.log10(msdMaxTime)/(desiredMSDLen-1);
    timeMSDValsLog = Array.from({length:desiredMSDLen}, (v,i) => msdCoeff*i);
    timeMSDVals = Array.from({length:desiredMSDLen}, (v,i) => {
        return Math.round(Math.pow(10,timeMSDValsLog[i]));
    });
    timeMSDValsLog = timeMSDValsLog.filter((v,i) => {
        return (i==0) || (timeMSDVals[i]>timeMSDVals[i-1]);
    });
    timeMSDVals = timeMSDVals.filter((v,i,s) => {
        return (i==0) || (v>s[i-1]);
    });
    msdLength = timeMSDVals.length;

    execute();
});
