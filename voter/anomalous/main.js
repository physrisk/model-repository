function myParseFloat(val) {return parseFloat((""+val).replace(",","."));}

let meanPlot = new plotlyPlot("meanPlot",["lg{t}","lg{E[y(t)]}"]);
let varPlot = new plotlyPlot("varPlot",["lg{t}","lg{Var[y(t)]}"]);

let model = null;
let nAgents = parseInt(1e6);

document.querySelector("#X0").max=nAgents-document.querySelector("#X0").min;
document.querySelector("#nAgents").innerHTML="10<sup>6</sup>";

let invAlpha = 1/2;
let normalDiffusionFlag = true;

let data = []; // series storage
let maxData = 100; // maximum series to keep stored in memory
// time start:end:step
let minLgTime = -6;
let maxLgTime = 1;
let timePoints = 30;
let lgTimes = []; // times used in plot lg(tau)
let times = []; // times used for simulation 10^lgTimes
let lgTeorMean = []; // power law function with exponent 1/alpha
let lgTeorVar = []; // power law function with exponent 2/alpha
let lgNormalVar = []; // power law function with exponent 1 (normal diffusion)
// used to estimate by how much to shift theoretical curves up/down
let lgTeorMeanZero = 0;
let lgTeorVarZero = 0;
let scaleShift = 0;

let timeoutID=null;

function transY(x) {
    if(x==0) {
        return Math.pow(0.5/(nAgents-0.5),invAlpha);
    } else if(x==1) {
        return Math.pow((nAgents-0.5)/0.5,invAlpha);
    }
    return Math.pow(x/(1-x),invAlpha);
}

function getYSeries() {
    model.reset();

    let series = (new Array(timePoints)).fill(null).map((v,i) => transY(model.step(times[i])));
    
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
        meanPlot.update([lgTimes,lgTimes],
            [lgMean,lgTeorMean.map(v => v+shift)],["markers","lines"],
            ["#cc2529","#666666"]);

        // plot variance
        shift = lgVarZero-lgTeorVarZero+2*scaleShift;
        if(!normalDiffusionFlag) {
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
    model = new VoterModel(
        myParseFloat($("#epsi1").val()),
        myParseFloat($("#epsi2").val()),
        nAgents, X0);

    let alpha = myParseFloat($("#alpha").val());
    invAlpha = 1 / alpha;
    normalDiffusionFlag = (alpha==2);

    let step = (maxLgTime - minLgTime) / (timePoints-1); // step on lg-scale
    lgTimes = (new Array(timePoints)).fill(null).map((v,i) => step*i + minLgTime);
    times = lgTimes.map(v => Math.pow(10,v));

    if(X0 > nAgents/2) {
        lgTeorMean = lgTimes.map(v => -invAlpha*v);
        lgTeorVar = lgTimes.map(v => -2*invAlpha*v);
        lgNormalVar = lgTimes.map(v => -v);
    } else {
        lgTeorMean = lgTimes.map(v => invAlpha*v);
        lgTeorVar = lgTimes.map(v => 2*invAlpha*v);
        lgNormalVar = lgTimes.map(v => v);
    }
    
    lgTeorMeanZero = jStat(lgTeorMean).mean();
    lgTeorVarZero = jStat(lgTeorVar).mean();
    let lgNormalVarZero = jStat(lgNormalVar).mean();
    lgNormalVar = lgNormalVar.map(v => v - lgNormalVarZero + lgTeorVarZero);
    
    scaleShift = invAlpha*(maxLgTime-minLgTime)*0.1;

    data = [];
}

function frame() {
    getYSeries();
    plotFigures();
}

function stopGame() {
    window.clearInterval(timeoutID);
    timeoutID=null;
}

function resumeGame() {
    timeoutID=window.setInterval("frame()",10.0);
}
