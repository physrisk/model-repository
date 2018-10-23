function myParseFloat(val) {return parseFloat((""+val).replace(",","."));}

let timeSeriesPlot=new plotlyPlot("timeSeries",["t","M(t)"]);

let height=40;
let width=100;
let sqSize=5;

let model=null;
let time=0;
let timeSeries=null;
let timeStep=100;
let magSeries=null;

let timeoutID=null;

let g;

function play() {
    let i, mag;
    timeSeries.splice(0,64);
    magSeries.splice(0,64);
    for(i=0;i<64;i+=1) {
        time+=timeStep;
        mag=model.step(timeStep);

        timeSeries.push(time);
        magSeries.push(mag.slice(0));
    }
}

function plotFigures() {
    timeSeriesPlot.update([timeSeries,timeSeries,timeSeries,timeSeries],[
        commonFunctions.toOneDimensionalArray(magSeries,0),
        commonFunctions.toOneDimensionalArray(magSeries,1),
        commonFunctions.toOneDimensionalArray(magSeries,2),
        commonFunctions.toOneDimensionalArray(magSeries,3),
    ],"lines",["#c85a5a","#78be78","#328cc8","#9678be"]);
    plotField();
}

function plotField() {
    let i,j,ideo;
    for(i=0;i<model.height;i+=1) {
        for(j=0;j<model.width;j+=1) {
            ideo=model.getIdeology(j,i);
            if(ideo==0) g.fillStyle="rgb(200,90,90)";
            else if(ideo==1) g.fillStyle="rgb(120,190,120)";
            else if(ideo==2) g.fillStyle="rgb(50,140,200)";
            else g.fillStyle="rgb(150,120,190)";
            g.fillRect(j*sqSize,i*sqSize,sqSize,sqSize);
        }
    }
}

function seriesSetup() {
    let i;
    time=0;
    timeSeries=new Array(4096);
    magSeries=new Array(4096);
    for(i=0;i<timeSeries.length;i+=1) {
        timeSeries[i]=(i-timeSeries.length)*timeStep;
        magSeries[i]=model.globalSpin.slice(0);
    }
}

function setup() {
    g=$("#plotDiv")[0].getContext("2d");
    model=new ACLSModel(height,width,
        myParseFloat($("#pToll").val()),
        myParseFloat($("#ecoFree").val()),
        myParseFloat($("#socFree").val())
    );
    seriesSetup();
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
