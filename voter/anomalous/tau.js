function myParseFloat(val) {return parseFloat((""+val).replace(",","."));}

let meanPlot = new plotlyPlot("meanPlot",["lg{t}","lg{E[x(t)]}"]);
let varPlot = new plotlyPlot("varPlot",["lg{t}","lg{Var[x(t)]}"]);

let model = null;
let nAgents = parseInt(1e6);

document.querySelector("#X0").max=nAgents-document.querySelector("#X0").min;
document.querySelector("#nAgents").innerHTML="10<sup>6</sup>";

let normalDiffusionFlag = true;
let showTheoryFlag = true;

let data = []; // series storage
let maxData = 100; // maximum series to keep stored in memory
// time start:end:step
let minLgTime = -6;
let maxLgTime = 0.5;
let timePoints = 30;
let lgTimes = []; // times used in plot lg(tau)
let times = []; // times used for simulation 10^lgTimes
let lgTeorMean = [];
let lgTeorVar = [];
let lgNormalVar = []; // power law function with exponent 1 (normal diffusion)
// used to estimate by how much to shift theoretical curves up/down
let lgTeorMeanZero = 0;
let lgTeorVarZero = 0;
let scaleShift = 0;

let timeoutID=null;

function getSeries() {
    model.reset();

    let series = (new Array(timePoints)).fill(null).map((v,i) => model.step(times[i]));
    
    data.push(series);
    if(data.length>maxData) {
        data.splice(0,1);
    }
}

function plotFigures() {
    if(data.length>1) {
        let jData = jStat(data);
        // empirical mean and variance
        let lgMean = (jData.mean()).map(v => Math.log10(v));
        let lgVar = (jData.variance()).map(v => Math.log10(v));
        // values used to shift the theoertical curves by
        let lgMeanZero = jStat(lgMean).mean();
        let lgVarZero = jStat(lgVar).mean();
        let shift = 0; // shifting constant

        // plot mean
        shift = lgMeanZero-lgTeorMeanZero+scaleShift;
        if(!showTheoryFlag) {
            meanPlot.update([lgTimes],[lgMean],"markers","#cc2529");
        } else {
            meanPlot.update([lgTimes,lgTimes],
                [lgMean,lgTeorMean.map(v => v+shift)],["markers","lines"],
                ["#cc2529","#666666"]);
        }

        // plot variance
        shift = lgVarZero-lgTeorVarZero+2*scaleShift;
        if(!showTheoryFlag) {
            varPlot.update([lgTimes], [lgVar], "markers", "#cc2529");
        } else if(!normalDiffusionFlag) {
            varPlot.update([lgTimes,lgTimes,lgTimes],
                [lgVar,
                 lgTeorVar.map(v => v+shift),
                 lgNormalVar.map(v => v+shift)],
                ["markers","lines","lines"],
                ["#cc2529","#666666","#aaaaaa"]);
        } else {
            varPlot.update([lgTimes,lgTimes],
                [lgVar,
                 lgTeorVar.map(v => v+shift)],
                ["markers","lines"],
                ["#cc2529","#666666"]);
        }
    }
}

function setup() {
    let X0 = parseInt($("#X0").val());
    let eta = myParseFloat($("#eta").val());
    let gamma = 1/(2*(1-eta)); // moment scaling exponent
    normalDiffusionFlag = (eta==0);
    showTheoryFlag = (X0 < nAgents/2);
    model = new VoterTauModel(
        myParseFloat($("#epsi1").val()),
        myParseFloat($("#epsi2").val()),
        eta, nAgents, X0);

    let step = (maxLgTime - minLgTime) / (timePoints-1); // step on lg-scale
    lgTimes = (new Array(timePoints)).fill(null).map((v,i) => step*i + minLgTime);
    times = lgTimes.map(v => Math.pow(10,v));

    if(X0 < nAgents/2) {
        lgTeorMean = lgTimes.map(v => gamma*v);
        lgTeorVar = lgTimes.map(v => 2*gamma*v);
        lgNormalVar = lgTimes.map(v => v);
    }
    
    lgTeorMeanZero = jStat(lgTeorMean).mean();
    lgTeorVarZero = jStat(lgTeorVar).mean();
    let lgNormalVarZero = jStat(lgNormalVar).mean();
    lgNormalVar = lgNormalVar.map(v => v - lgNormalVarZero + lgTeorVarZero);
    
    scaleShift = gamma*(maxLgTime-minLgTime)*0.1;

    data = [];
}

function frame() {
    getSeries();
    plotFigures();
}

function stopGame() {
    window.clearInterval(timeoutID);
    timeoutID=null;
}

function resumeGame() {
    timeoutID=window.setInterval("frame()",10.0);
}
