function myParseFloat(val) {return parseFloat((""+val).replace(",","."));}

let pdfPlot=new plotlyPlot("pdfPlot",["X","p(X)"],[10,10,40,60]);
let rsPlot=new plotlyPlot("rsPlot",["r","X[r]"]);

let model;
let nAgents=[20];
let nComps=100;
let capacity=2000;
let epsilon=[2];
let alpha=2;
let beta=198;

let showRSDX=[];
let showRSDY=[];
let showRSDTheory=[];
let showPDFX=[];
let showPDFTheory=[];

let pdf=[];
let pdfLen=0;
let pdfMax=0;
let pdfNewMax=true;

let runFlag=false;

function play() {
    model.step(3e-6);
    
    pdf[model.nAgents[0]]+=1;
    pdfLen+=1;
    if(pdfMax<model.nAgents[0]) {
        pdfMax=model.nAgents[0];
        pdfNewMax=true;
    }
    
    showRSDY=model.nAgents.slice();
}

function plotFigures() {
    let showRSD=showRSDY.sort((a,b) => a<b);
    rsPlot.setRanges([1,nComps],[0,showRSD[0]]);
    rsPlot.update([showRSDX,showRSDX],[showRSD,showRSDTheory],["markers","lines"],["#cc2525","#505050"]);
    
    let n=Math.min(nAgents[0]*nComps,capacity);
    if(pdfLen>0) {
        let showPDF=commonFunctions.pdfModification(pdf,false,1,
            Math.min(pdfMax+5,capacity),Math.min(pdfMax+6,101),1,1,pdfLen);
        showPDFX=commonFunctions.toOneDimensionalArray(showPDF,0);
        let showPDFY=commonFunctions.toOneDimensionalArray(showPDF,1);
        showPDF=null;
        if(pdfNewMax) {
            showPDFTheory=showPDFX.map(v => jStat.beta.pdf(v/n,alpha,beta)/n);
            pdfNewMax=false;
        }
        pdfPlot.update([showPDFX,showPDFX],
                       [showPDFY,showPDFTheory],
                       ["markers","lines"],
                       ["#cc2525","#505050"]);
    } else {
        showPDFX=(new Array(101)).fill(null).map((v,i) => capacity*(i/100));
        if(pdfNewMax) {
            showPDFTheory=showPDFX.map(v => jStat.beta.pdf(v/n,alpha,beta)/n);
            pdfNewMax=false;
        }
        pdfPlot.update([showPDFX],[showPDFTheory],["lines"],["#505050"]);
    }
}

function getParams() {
    nAgents=[parseInt($("#nAgents").val())];
    epsilon=[myParseFloat($("#epsilon").val())];
    nComps=parseInt($("#nComps").val());
    capacity=parseInt($("#capacity").val());
}

function pdfSetup() {
    pdf=(new Array(capacity+1)).fill(0);
    pdfLen=0;
    pdfMax=0;
    pdfNewMax=true;
}

function setup() {
    getParams();
    showRSDX=(new Array(nComps)).fill(null).map((v,i) => i+1);
    if(capacity>=nAgents[0]*nComps) {
        $("#alpha").val(epsilon[0]);
        $("#beta").val((nComps-1)*epsilon[0]);
    }
    pdfSetup();
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
    alpha=myParseFloat($("#alpha").val());
    beta=myParseFloat($("#beta").val());
    showRSDTheory=showRSDX.map(v => capacity*jStat.ibetainv(v/nComps,alpha,beta)).reverse();
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
