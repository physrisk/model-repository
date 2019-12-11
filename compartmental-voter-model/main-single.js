function myParseFloat(val) {return parseFloat((""+val).replace(",","."));}

let rsPlot=new plotlyPlot("rsPlot",["r","N[r]"]);

let model;
let nAgents=[20];
let nComps=100;
let capacity=2000;
let epsilon=[2];

let showX=[];
let showY=[];
let showTheory=[];

let runFlag=false;

function play() {
    model.step(3e-6);
    showY=model.nAgents.slice();
}

function plotFigures() {
    let showRSD=showY.sort((a,b) => a<b);
    rsPlot.setRanges([1,nComps],[0,showRSD[0]]);
    rsPlot.update([showX,showX],[showRSD,showTheory],["markers","lines"],["#cc2525","#505050"]);
}

function getParams() {
    nAgents=[parseInt($("#nAgents").val())];
    epsilon=[myParseFloat($("#epsilon").val())];
    nComps=parseInt($("#nComps").val());
    capacity=parseInt($("#capacity").val());
}

function setup() {
    let i;
    getParams();
    showX=new Array(nComps);
    for(i=0;i<nComps;i+=1) {
        showX[i]=i+1;
    }
    if(capacity>=nAgents[0]*nComps) {
        $("#alpha").val(epsilon[0]);
        $("#beta").val((nComps-1)*epsilon[0]);
    } 
    onUpdateDistParams();
    model=new compVoterModel(nAgents,1,epsilon,nComps,capacity);
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

function changeDistParamsInput() {
    getParams();
    if(capacity>=nAgents[0]*nComps) {
        $("#alpha, #beta").attr("disabled","disabled");
    } else if(!runFlag) {
        $("#alpha, #beta").removeAttr("disabled");
    }
}

function onUpdateEpsilon() {
    getParams();
    if(capacity>=nAgents[0]*nComps) {
        $("#alpha").val(epsilon[0]);
        $("#beta").val((nComps-1)*epsilon[0]);
    }
    onUpdateDistParams();
}

function onUpdateDistParams() {
    getParams();
    let a=myParseFloat($("#alpha").val());
    let b=myParseFloat($("#beta").val());
    showTheory=showX.map(v => capacity*jStat.ibetainv(v/nComps,a,b)).reverse();
    plotFigures();
}

/* bind events and set initial GUI states */
$("#stop").attr("disabled","disabled");
$("#restart").click(function () {
    setup();
    $("#restart, #alpha, #beta").attr("disabled","disabled");
    $("#stop").removeAttr("disabled").click();
});
$("#stop").toggle(function() {
    resume();
    $("#stop").text("Stop");
    $("#restart, #alpha, #beta").attr("disabled","disabled");
},function() {
    stop();
    $("#stop").text("Continue");
    $("#restart").removeAttr("disabled");
    changeDistParamsInput();
});
$("#capacity").change(function() {
    changeDistParamsInput();
});
changeDistParamsInput();
$("#epsilon").change(function() {
    onUpdateEpsilon();
});
onUpdateEpsilon();
$("#alpha, #beta").change(function() {
    onUpdateDistParams();
});
$("#capacity").change(function() {
    onUpdateDistParams();
});

/* onLoad */
$(function () {
    setup();
    plotFigures();
});
