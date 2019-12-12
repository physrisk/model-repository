function myParseFloat(val) {return parseFloat((""+val).replace(",","."));}

let rsPlot=new plotlyPlot("rsPlot",["r","N[r], c X[r]"]);

let model;
let nAgents=[13,13];
let nTypes=2;
let nComps=100;
let capacity=30;
let epsilon=[2,2];

let showX=[];
let showPop=[];
let showY=[];

let runFlag=false;

function play() {
    model.step(3e-6);
    showPop=(new Array(nComps)).fill(null).map((v,i) => model.getPopulation(i));
    showY=model.nAgents.slice(nComps);
}

function plotFigures() {
    let sPop=showPop.sort((a,b) => b-a);
    let c=(nAgents[0]+nAgents[1])/nAgents[0];
    let sy=showY.sort((a,b) => b-a).map(v => c*v);
    rsPlot.setRanges([1,nComps],[0,Math.max(sPop[0],sy[0])]);
    rsPlot.update([showX,showX],[sPop,sy],"markers",["#396ab1","#cc2529"]);
}

function setup() {
    let i;
    nTypes=parseInt($("#nTypes").val());
    nAgents=new Array(nTypes);
    epsilon=new Array(nTypes);
    for(i=0;i<nTypes;i+=1) {
        nAgents[i]=parseInt($("#nAgents"+(i+1)).val());
        epsilon[i]=myParseFloat($("#epsilon"+(i+1)).val());
    }
    nComps=parseInt($("#nComps").val());
    showX=new Array(nComps);
    for(i=0;i<nComps;i+=1) {
        showX[i]=i+1;
    }
    capacity=parseInt($("#capacity").val());

    model=new compVoterModel(nAgents,nTypes,epsilon,nComps,capacity);
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
    setTimeout("frame()",30.0);
    runFlag=true;
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
