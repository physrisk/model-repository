function myParseFloat(val) {return parseFloat((""+val).replace(",","."));}

let rsPlot=new plotlyPlot("rsPlot",["r","f[r]"]);

let model;
let nAgents=[20,16,10,6];
let nTypes=4;
let nComps=100;
let capacity=60;
let epsilon=[0.2,2,0.5,1];

let showX=[];
let showY=[];

let runFlag=false;

function play() {
    showY=model.step(3e-6).slice();
}

function plotFigures() {
    let sy1,sy2,sy3,sy4;

    sy1=showY.slice(0,nComps).sort((a,b) => b-a);
    sy2=showY.slice(nComps,2*nComps).sort((a,b) => b-a);            
    sy3=showY.slice(2*nComps,3*nComps).sort((a,b) => b-a);            
    sy4=showY.slice(3*nComps,4*nComps).sort((a,b) => b-a);            

    rsPlot.update([showX,showX,showX,showX],
                  [sy1,sy2,sy3,sy4],
                  "markers",
                  ["#396ab1","#cc2529","#3e9651","#da7c30"]);
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

    rsPlot.setRanges([1,nComps],[0,1]);
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
