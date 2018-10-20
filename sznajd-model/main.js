function myParseFloat(val) {return parseFloat((""+val).replace(",","."));}

let timeSeriesPlot=new plotlyPlot("timeSeries",["t","M(t)"]);

let height=40;
let width=100;
let sqSize=5;
let total=height*width;

let model=null;
let time=0;
let timeSeries=null;
let timeStep=100;
let magSeries=null;

let pdf=null;
let pdfLen=0;

let timeoutID=null;

let g;

function play() {
    let i, mag;
    for(i=0;i<64;i+=1) {
        time+=timeStep;
        mag=model.step(timeStep);

        timeSeries.push(time);
        magSeries.push(mag/total);
        
        pdf[mag+total]+=1;
        pdfLen+=1;
    }
    if(model.globalSpin==total || model.globalSpin==-total) {
        $("#stop").click();
    }
}

function plotFigures() {
    timeSeriesPlot.update([timeSeries],[magSeries]);
    plotField();
}

function plotField() {
    let i,j;
    for(i=0;i<model.height;i+=1) {
        for(j=0;j<model.width;j+=1) {
            if(model.spinArray[i][j]==1) g.fillStyle="rgb(255,0,0)";
            else g.fillStyle="rgb(0,0,255)";
            g.fillRect(j*sqSize,i*sqSize,sqSize,sqSize);
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
    timeSeries=new Array(1);
    magSeries=new Array(1);
    for(i=0;i<timeSeries.length;i+=1) {
        timeSeries[i]=i-timeSeries.length;
        magSeries[i]=model.globalSpin/total;
    }
}

function setup() {
    g=$("#plotDiv")[0].getContext("2d");
    model=new SznajdModel(height,width,
        myParseFloat($("#fillProb").val()),
        $("#uRule").is(":checked"),
        $("#dRule").is(":checked")
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
