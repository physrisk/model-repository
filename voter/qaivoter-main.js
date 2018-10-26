function myParseFloat(val) {return parseFloat((""+val).replace(",","."));}

let timeSeriesPlot=new plotlyPlot("timeSeries",["t","M(t)"]);
timeSeriesPlot.setRanges(true,[-1,1]);
let magPdfPlot=new plotlyPlot("magPdf",["M","p(M)"]);
magPdfPlot.setRanges([-1,1],true);

let height=50;
let width=60;
let sqSize=4;
let total=height*width;

let modelA=null;
let modelI=null;
let time=0;
let timeSeries=null;
let timeStep=100;
let magSeriesA=null;
let magSeriesI=null;

let pdfA=null;
let pdfI=null;
let pdfLen=0;

let timeoutID=null;

let gA;
let gI;

function play() {
    let i, magA, magI;
    timeSeries.splice(0,64);
    magSeriesA.splice(0,64);
    magSeriesI.splice(0,64);
    for(i=0;i<64;i+=1) {
        time+=timeStep;
        timeSeries.push(time);
        
        magA=modelA.step(timeStep);
        magSeriesA.push(magA/total);

        magI=modelI.step(timeStep);
        magSeriesI.push(magI/total);
        
        pdfA[magA+total]+=1;
        pdfI[magI+total]+=1;
        pdfLen+=1;
    }
}

function plotFigures() {
    timeSeriesPlot.update([timeSeries,timeSeries],[magSeriesA,magSeriesI],"lines",["#cc2529","#3e9651"]);
    if(!$("#magPdf").is(":hidden")) {
        if(pdfLen>128) {
            let showPdfA=commonFunctions.pdfModification(pdfA,false,-1,1,101,-1,1/total,pdfLen);
            let showPdfI=commonFunctions.pdfModification(pdfI,false,-1,1,101,-1,1/total,pdfLen);
            magPdfPlot.update([commonFunctions.toOneDimensionalArray(showPdfA,0),
                               commonFunctions.toOneDimensionalArray(showPdfI,0)],
                              [commonFunctions.toOneDimensionalArray(showPdfA,1),
                               commonFunctions.toOneDimensionalArray(showPdfI,1)],
                              "lines",
                              ["#cc2529","#3e9651"]);
        } else {
            magPdfPlot.reset();
        }
    }
    plotField();
}

function plotField() {
    let i,j;
    for(i=0;i<height;i+=1) {
        for(j=0;j<width;j+=1) {
            if(modelA.spinArray[i][j]==1) gA.fillStyle="rgb(204,37,41)";
            else gA.fillStyle="rgb(57,106,177)";
            gA.fillRect(j*sqSize,i*sqSize,sqSize,sqSize);
            if(modelI.spinArray[i][j]==1) gI.fillStyle="rgb(62,150,81)";
            else gI.fillStyle="rgb(218,124,48)";
            gI.fillRect(j*sqSize,i*sqSize,sqSize,sqSize);
        }
    }
}

function plotCrits() {
    let crits=[0,0];
    if(timeoutID==null) {
        crits[0]=modelA.getCriticals(
                        parseInt($("#neighbors").val()),
                        $("#completeGraph").is(":checked")
                       );
        crits[1]=modelI.getCriticals(
                        parseInt($("#neighbors").val()),
                        $("#completeGraph").is(":checked")
                       );
    } else {
        crits[0]=modelA.getCriticals();
        crits[1]=modelI.getCriticals();
    }
    try {
        $("#critA").val(crits[0].toFixed(2));
        $("#critI").val(crits[1].toFixed(2));
    } catch(e) {
        $("#critA").val(crits[0]);
        $("#critI").val(crits[1]);
    }
}

function pdfSetup() {
    let i;
    pdfA=new Array(2*total+1);
    pdfI=new Array(2*total+1);
    for(i=0;i<pdfA.length;i+=1) {
        pdfA[i]=0;
        pdfI[i]=0;
    }
    pdfLen=0;
}

function seriesSetup() {
    let i;
    time=0;
    timeSeries=new Array(4096);
    magSeriesA=new Array(4096);
    magSeriesI=new Array(4096);
    for(i=0;i<timeSeries.length;i+=1) {
        timeSeries[i]=(i-timeSeries.length)*timeStep;
        magSeriesA[i]=modelA.globalSpin/total;
        magSeriesI[i]=modelI.globalSpin/total;
    }
}

function setup() {
    gA=$("#plotDivA")[0].getContext("2d");
    gI=$("#plotDivI")[0].getContext("2d");
    modelA=new QAVoterModel(height,width,
        parseInt($("#neighbors").val()),
        myParseFloat($("#actProb").val()),
        myParseFloat($("#fillProb").val()),
        $("#completeGraph").is(":checked")
    );
    modelI=new QIVoterModel(height,width,
        parseInt($("#neighbors").val()),
        myParseFloat($("#actProb").val()),
        myParseFloat($("#fillProb").val()),
        $("#completeGraph").is(":checked")
    );
    seriesSetup();
    pdfSetup();
}

function frame() {
    play();
    plotFigures();
}

function stopGame() {
    window.clearInterval(timeoutID);
    timeoutID=null;
}

function resumeGame() {
    timeoutID=window.setInterval("frame()",100.0);
}
