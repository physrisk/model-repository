function myParseFloat(val) {return parseFloat((""+val).replace(",","."));}

let timeSeriesPlot=new plotlyPlot("timeSeries",["t","M(t)"]);
let magPdfPlot=new plotlyPlot("magPdf",["M","p(M)"]);

let height=50;
let width=125;
let total=height*width;

let model=null;
let time=0;
let timeSeries=null;
let magSeries=null;

let pdf=null;
let pdfLen=0;

let timeoutID=null;

let g;

function play() {
    let i, mag;
    timeSeries.splice(0,64);
    magSeries.splice(0,64);
    for(i=0;i<64;i+=1) {
        time+=1;
        mag=model.step(total);

        timeSeries.push(time);
        magSeries.push(mag);
        
        pdf[mag+total]+=1;
        pdfLen+=1;
    }
}

function plotFigures() {
    timeSeriesPlot.update([timeSeries],[magSeries]);
    if(pdfLen>128) {
        let showPdf=commonFunctions.pdfModification(pdf,false,-total,total,101,-total,1,pdfLen);
        magPdfPlot.update([commonFunctions.toOneDimensionalArray(showPdf,0)],
                          [commonFunctions.toOneDimensionalArray(showPdf,1)]);
    } else {
        magPdfPlot.reset();
    }
    plotField();
}

function plotField() {
    let i,j;
    for(i=0;i<model.height;i+=1) {
        for(j=0;j<model.width;j+=1) {
            if(model.spinArray[i][j]==1) g.fillStyle="rgb(255,0,0)";
            else g.fillStyle="rgb(0,0,255)";
            g.fillRect(j*4,i*4,4,4);
        }
    }
}

function pdfSetup() {
    let i;
    pdf=new Array(2*total+1);
    for(i=0;i<pdf.length;i+=1) {
        pdf[i]=0;
    }
    pdfLen=0;
}

function seriesSetup() {
    let i;
    time=0;
    timeSeries=new Array(4096);
    magSeries=new Array(4096);
    for(i=0;i<timeSeries.length;i+=1) {
        timeSeries[i]=i-timeSeries.length;
        magSeries[i]=Math.abs(model.globalSpin);
    }
}

function setup() {
    g=$("#plotDiv")[0].getContext("2d");
    model=new MajorityVoteModel(height,width,
        myParseFloat($("#flipProb").val()),
        myParseFloat($("#fillProb").val())
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
