function myParseFloat(val){return parseFloat((""+val).replace(",","."));}

$("#restart").click(() => {
    execute();
    $("#start").prop("disabled", false);
    $("#restart").prop("disabled", true);
    $("#start").click();
});
$("#start").toggle(() => {
    if(worker!==null) {
        worker.postMessage({msg:"start", observed: new_recovered});
    } else {
        execute();
    }
    $("#start").html("Stop");
    $("#restart").prop("disabled", true);
}, ()=>{
    if(worker!==null) {
        worker.postMessage({msg:"stop"});
    }
    $("#start").html("Continue");
    $("#restart").prop("disabled", false);
});

let worker = null;

let mainPlot = new plotlyPlot("mainPlot",
    ["time","I(t), R(t)"],
    [10,10,40,60]);

let colors = ["#cc2529","#396ab1","#666666","#aaaaaa"];

let time_vals = null;
let new_recovered = null;
let confirmed_vals = null;
let recovered_vals = null;
let model_vals = null;
let conv_vals = null;

let k = 2.5;
let invLambda = 32;
let deathProb = 0.11;
let sigma = 10;

function getParams() {
    k = myParseFloat($("#k").val());
    invLambda = myParseFloat($("#invLambda").val());
    sigma = myParseFloat($("#sigma").val());
}

function plot() {
    mainPlot.update(
        [time_vals],
        [confirmed_vals, recovered_vals,
         model_vals.map(v => v*(1+deathProb)), conv_vals],
        "lines",colors);
}

function cumsum(x) {
    return x.reduce((acc,v) => {
        acc.push(acc[acc.length-1]+v);
        return acc;
    },[0]).slice(1);
}

function execute() {
    getParams();
    
    if(worker!=null) {
        worker.terminate();
    }
    worker=new Worker("./deconv-norm-worker.js");
    worker.addEventListener("message", function(e) {
        let data=e.data;
        switch(data.msg) {
            case "get":
                model_vals = cumsum(data.series);
                conv_vals = cumsum(data.conv);
                plot();
                break;
            default:
                break;
        }
    });
    worker.postMessage({
        msg: "init",
        k: k,
        lambda: 1/invLambda,
        sigma: sigma,
        observed: new_recovered,
    });
}

/* onLoad */
$(function () {
    $.getJSON("./data.json",(data) => {
        new_recovered = Object.values(data["new recovered"]);
        confirmed_vals = Object.values(data["confirmed"]);
        recovered_vals = Object.values(data["recovered"]);
        time_vals = Array.from({length:confirmed_vals.length}, (v,i) => i);
        model_vals = Array.from({length:confirmed_vals.length}, () => 0);
        mainPlot.setRanges(
            [0,200],
            [-100,2200]
        );
        plot();
    });
});
