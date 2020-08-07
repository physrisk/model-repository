function myParseFloat(val){return parseFloat((""+val).replace(",","."));}

$("#generate").click(() => {
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

let lambda = 1/28;
let deathProb = 0.11;

function getParams() {
    lambda = 1/myParseFloat($("#lambda").val());
    deathProb = myParseFloat($("#deathProb").val());
}

function generate() {
    // generate daily
    model_vals.fill(0);
    new_confirmed_vals.forEach((v,i) => {
        let j, tau;
        if(v>0) {
            for(j=0;j<v;j+=1) {
                if(rng.random() > deathProb) {
                    tau = parseInt(rng.exponential(lambda));
                    if( i+tau < model_vals.length ) { 
                        model_vals[i+tau] += 1;
                    }
                }
            }
        }
    });
    // cumulative sum
    let acc = 0;
    model_vals = model_vals.map(v => acc+=v);
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
