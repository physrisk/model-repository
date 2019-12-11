function myParseFloat(val) {return parseFloat((""+val).replace(",","."));}

let rsPlot=new plotlyPlot("rsPlot",["r","N[r]"]);

let model;
let nAgents=[13,13];
let nComps=100;
let capacity=30;
let epsilon=[2,2];

let showX=[];
let showY=[];

let timeoutID=null;

function play() {
    model.step(3e-6);
    showY=model.nAgents.slice();
}

function plotFigures() {
    let sy;

    sy=showY.sort((a,b) => a<b);

    rsPlot.setRanges([1,nComps],[0,sy[0]]);
    rsPlot.update([showX],[sy],"lines",["#396ab1"]);
}

function setup() {
    let i;
    nAgents=[parseInt($("#nAgents").val())];
    epsilon=[myParseFloat($("#epsilon").val())];
    nComps=parseInt($("#nComps").val());
    showX=new Array(nComps);
    for(i=0;i<nComps;i+=1) {
        showX[i]=i+1;
    }
    capacity=parseInt($("#capacity").val());

    model=new compVoterModel(nAgents,1,epsilon,nComps,capacity);
}

function frame() {
    play();
    plotFigures();
}

function stop() {
    window.clearInterval(timeoutID);
    timeoutID=null;
}

function resume() {
    timeoutID=window.setInterval("frame()",100.0);
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
