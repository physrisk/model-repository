function myParseFloat(val) {return parseFloat((""+val).replace(",","."));}

let rsPlot=new plotlyPlot("rsPlot",["r","f[r]"]);

let model;
let nAgents=[13,13];
let nTypes=2;
let nComps=100;
let capacity=30;
let epsilon=[2,2];

let showX=[];
let showY=[];

let timeoutID=null;

function play() {
    showY=model.step(3e-6).slice();
}

function plotFigures() {
    let sy1,sy2;

    sy1=showY.slice(0,nComps).sort((a,b) => a<b);
    sy2=showY.slice(nComps,2*nComps).sort((a,b) => a<b);            

    rsPlot.update([showX,showX],[sy1,sy2],"lines",["#396ab1","#cc2529"]);
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
}

function stop() {
    window.clearInterval(timeoutID);
    timeoutID=null;
}

function resume() {
    timeoutID=window.setInterval("frame()",100.0);
}
