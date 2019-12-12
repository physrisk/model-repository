function myParseFloat(val) {return parseFloat((""+val).replace(",","."));}

let pdfPlot=new plotlyPlot("pdfPlot",["X","lg[p(X)]"],[10,10,40,60]);

let model;
let nAgents=[25];
let nTypes=1;
let nComps=3;
let capacity=60;
let epsilon=[0.03];

let pdf=[];
let pdfLen=0;
let pdfMax=0;

let runFlag=false;

function play() {
    let i, k;
    for(i=0;i<100;i+=1) {
        model.step(3e-6);
        k=Math.floor(Math.random()*model.nAgents.length);
        pdf[model.nAgents[k]]+=1;
        pdfMax=Math.max(pdfMax,model.nAgents[k]);
        pdfLen+=1;
    }
}

function plotFigures() {
    if(pdfLen>0) {
        let showPDF=commonFunctions.pdfModification(pdf,false,1,
            Math.min(pdfMax,capacity),Math.min(pdfMax+1,101),1,1,pdfLen);
        let showPDFX=commonFunctions.toOneDimensionalArray(showPDF,0);
        let showPDFY=commonFunctions.toOneDimensionalArray(showPDF,1);
        showPDFY=showPDFY.map(v => commonFunctions.LogBase10(v));
        showPDF=null;
        pdfPlot.update([showPDFX],[showPDFY],"markers",["#cc2525"]);
    }
}

function getParams() {
    nTypes=parseInt($("#nTypes").val());
    nAgents=(new Array(nTypes)).fill(parseInt($("#nAgents").val()));
    epsilon=(new Array(nTypes)).fill(myParseFloat($("#epsilon").val()));
    nComps=parseInt($("#nComps").val());
    capacity=parseInt($("#capacity").val());
}

function pdfSetup() {
    pdf=(new Array(capacity+1)).fill(0);
    pdfLen=0;
    pdfMax=0;
}

function setup() {
    getParams();
    pdfSetup();
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
