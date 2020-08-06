function myParseFloat(val) {return parseFloat((""+val).replace(",","."));}

let rng = new Random();

let logPlot = new plotlyPlot("logPlot",
    ["time","lg-observation"],
    [5,5,40,60]);
let loglogPlot = new plotlyPlot("loglogPlot",
    ["lg-time","lg-observation"],
    [5,5,40,60]);

let colors = ["#396ab1","#aaaaaa","#aaaaaa","#aaaaaa","#aaaaaa"];

let nSamples = 400; // number of exponential growths to sum
let mu = 1.0; // deterministic growth rate
let nu = 1.0; // random startup rate for deterministic growths
let dt = 3e-4; // observation resolution
let idt = 1/dt; // inverse of observation

let nPoints = 10000;
let xVals = Array.from({length:nPoints}, (v,i) => (i+1)*dt);
let yVals = Array.from({length:nPoints}, v => 0);
let cVals = Array.from({length:4});
let logXVals = Array.from(xVals, v => Math.log10(v));

$("#plot").click(() => {
    doUpdate();
});

function getParams() {
    nSamples = parseInt($("#nSamples").val());
    mu = myParseFloat($("#mu").val());
    nu = myParseFloat($("#nu").val());
}

function growthRate(it) {
    return it>0 ? Math.exp(mu*it*dt)-1 : 0;
}

function generateTau() {
    if(nu>0) {
        return rng.exponential(nu);
    } else {
        return rng.random();
    }
}

function generate() {
    let iSample, cidx, itau, cval;
    cVals = Array.from({length:Math.min(4,nSamples)});
    cVals[0] = Array.from({length:nPoints},(v,it) => growthRate(it)/nSamples);
    cidx = 1;
    yVals = yVals.map((v,it) => cVals[0][it]);
    for(iSample=1;iSample<nSamples;iSample+=1) {
        itau = generateTau()/dt;
        cval = Array.from({length:nPoints},v=>0);
        yVals = yVals.map((v,it) => {
            cval[it] = growthRate(it-itau)/nSamples;
            return v + cval[it];
        });
        if(cidx<cVals.length && itau<idt) {
            cVals[cidx] = cval.map(v => Math.log10(v));
            cidx += 1;
        }
    }
    if(cidx<cVals.length) {
        cVals = cVals.slice(0,cidx);
    }
    yVals = yVals.map(v => Math.log10(v));
    cVals[0] = cVals[0].map(v => Math.log10(v));
}

function plot() {
    logPlot.update([xVals],
        [yVals,...cVals],
        "lines",colors);
    loglogPlot.update([logXVals],
        [yVals,...cVals],
        "lines",colors);
}

function doUpdate() {
    getParams();
    generate();
    plot();
}

/* onLoad */
$(function () {
    doUpdate();
});
