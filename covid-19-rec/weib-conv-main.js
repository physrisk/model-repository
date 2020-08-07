function myParseFloat(val){return parseFloat((""+val).replace(",","."));}

$("#k, #invLambda, #deathProb").change(() => {
    execute();
});

let mainPlot = new plotlyPlot("mainPlot",
    ["time","I(t), R(t)"],
    [10,10,40,60]);

let colors = ["#cc2529","#396ab1","#666666"];

let rng = new Random();

let time_vals = null;
let new_confirmed_vals = null;
let confirmed_vals = null;
let recovered_vals = null;
let model_vals = null;

let k = 2.67;
let lambda = 1/32.2;
let deathProb = 0.1;

function getParams() {
    k = myParseFloat($("#k").val());
    lambda = 1/myParseFloat($("#invLambda").val());
    deathProb = myParseFloat($("#deathProb").val());
}

function weibPDF(xs,k,lambda) {
    let scaled = xs.map(v => Math.pow(v*lambda,k));
    return scaled.map((v,i) => k*v*Math.exp(-v)/xs[i] || 0);
}

function generate() {
    let i,j;
    let l = recovered_vals.length;
    // generate Weibull kernel
    let xs = Array.from({length:l}, (v,i) => i);
    let kernel = weibPDF(xs,k,lambda);
    let sum = kernel.reduce((acc,val) => acc+val);
    kernel = kernel.map(v => v/sum*(1-deathProb));
    // convolve
    for(i=0;i<l;i+=1) {
        model_vals[i] = 0;
        for(j=i;j>-1;j-=1) {
            model_vals[i] += (confirmed_vals[j] * kernel[i-j]);
        }
    }
}

function getRMSE() {
    let mse = recovered_vals.reduce((acc, v, i) => {
        let d = v - model_vals[i];
        return acc + d*d;
    })/recovered_vals.length;
    return Math.sqrt(mse);
}

function plot() {
    mainPlot.update(
        [time_vals],
        [confirmed_vals, recovered_vals, model_vals],
        "lines",colors);
    $("#rmseIndicator").val(getRMSE());
}

function execute() {
    getParams();
    generate();
    plot();
}

/* onLoad */
$(function () {
    $.getJSON("./data.json",(data) => {
        new_confirmed_vals = Object.values(data["new confirmed"]);
        confirmed_vals = Object.values(data["confirmed"]);
        recovered_vals = Object.values(data["recovered"]);
        time_vals = Array.from({length:confirmed_vals.length}, (v,i) => i);
        model_vals = Array.from({length:confirmed_vals.length}, () => 0);
        execute();
    });
});
