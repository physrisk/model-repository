function myParseFloat(val) {return parseFloat((""+val).replace(",","."));}

let rsPlot=new plotlyPlot("rsPlot",["r","f[r]"]);

let model;
let nAgents=[13,13];
let nTypes=2;
let nComps=100;
let capacity=30;
let epsilon=[2,2];

let showRSDX=[];
let showSpatial=[];
let showTemporal=[];
let showRSDTheory=[];

let runFlag=false;

function play() {
    let k=Math.floor(Math.random()*model.nAgents.length);
    showSpatial=model.step(3e-6).slice(nComps);
    showTemporal.push(model.nAgents[k]/model.getPopulation(k));
    while(showTemporal.length>nComps) {
        k=Math.floor(nComps*Math.random());
        showTemporal.splice(k,1);
    }
}

function plotFigures() {
    let showCRSD=showSpatial.sort((a,b) => a<b);
    let showSRSD=showTemporal.sort((a,b) => a<b);
    rsPlot.setRanges([1,nComps],[0,Math.max(showCRSD[0],showSRSD[0])]);
    rsPlot.update([showRSDX,showRSDX],[showCRSD,showSRSD],"markers",["#396ab1","#cc2525"]);
}

function getParams() {
    nTypes=parseInt($("#nTypes").val());
    nAgents=(new Array(nTypes)).fill(parseInt($("#nAgents").val()));
    epsilon=(new Array(nTypes)).fill(myParseFloat($("#epsilon").val()));
    nComps=parseInt($("#nComps").val());
    capacity=parseInt($("#capacity").val());
}

function setup() {
    getParams();
    showRSDX=(new Array(nComps)).fill(null).map((v,i) => i+1);
    showSpatial=[];
    showTemporal=[];
    model=new compVoterModel(nAgents,2,epsilon,nComps,capacity);
}

function frame() {
    play();
    plotFigures();
    if(runFlag) {
        setTimeout("frame()",30.0);
    }
}

function stop() {
    runFlag=false;
}

function resume() {
    runFlag=true;
    setTimeout("frame()",30.0);
}

/* bind events and set initial GUI states */
$("#stop").attr("disabled","disabled");
$("#restart").click(function () {
    setup();
    $("#restart").attr("disabled","disabled");
    $("#stop").removeAttr("disabled").click();
});
$("#stop").toggle(function() {
    resume();
    $("#stop").text("Stop");
    $("#restart").attr("disabled","disabled");
},function() {
    stop();
    $("#stop").text("Continue");
    $("#restart").removeAttr("disabled");
});

/* onLoad */
$(function () {
    setup();
    plotFigures();
});
