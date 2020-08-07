function myParseFloat(val){return parseFloat((""+val).replace(",","."));}

$("#shift, #deathProb").change(() => {
    getParams();
    plot();
});

let mainPlot = new plotlyPlot("mainPlot",
    ["time","I(t)×(1-d), R(t-Δt)"],
    [10,10,40,60]);

let colors = ["#cc2529","#396ab1"];

let empirical_data = null;
let time_vals = null;
let confirmed_vals = null;
let recovered_vals = null;

let shift = 28;
let deathProb = 0.11;

function getParams() {
    shift = parseInt($("#shift").val());
    deathProb = myParseFloat($("#deathProb").val());
}

function getRMSE() {
    let v1 = confirmed_vals.slice(0,-shift).map(v => v*(1-deathProb));
    let v2 = recovered_vals.slice(shift);
    let mse = v1.reduce((acc, v, i) => {
        let d = v - v2[i];
        return acc + d*d;
    })/v1.length;
    return Math.sqrt(mse);
}

function plot() {
    mainPlot.update(
        [time_vals,time_vals.slice(0,-shift)],
        [confirmed_vals.map(v => v*(1-deathProb)),
         recovered_vals.slice(shift)],
        "lines",colors);
    $("#rmseIndicator").val(getRMSE());
}

/* onLoad */
$(function () {
    $.getJSON("./data.json",(data) => {
        empirical_data = data;
        confirmed_vals = Object.values(empirical_data["confirmed"]);
        recovered_vals = Object.values(empirical_data["recovered"]);
        time_vals = Array.from({length:confirmed_vals.length}, (v,i) => i);
        getParams();
        plot();
    });
});
