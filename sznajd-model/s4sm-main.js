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

let timeoutID=null;

let g;

$("#fillProb1, #fillProb2, #fillProb3, #fillProb4").css("font-weight","bold");
$("#fillProb1").css("color","#ff000f");
$("#fillProb2").css("color","#e80ab7");
$("#fillProb3").css("color","#540ae8");
$("#fillProb4").css("color","#000fff");

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
        commonFunctions.toOneDimensionalArray(magSeries,1),
        commonFunctions.toOneDimensionalArray(magSeries,2),
        commonFunctions.toOneDimensionalArray(magSeries,3),
        commonFunctions.toOneDimensionalArray(magSeries,4),
    ],"lines",["#ff000f","#e80ab7","#540ae8","#000fff"]);
    plotField();
}

function plotField() {
    let i,j;
    for(i=0;i<model.height;i+=1) {
        for(j=0;j<model.width;j+=1) {
            if(model.spinArray[i][j]==0) g.fillStyle="rgb(200,200,200)";
            else if(model.spinArray[i][j]==1) g.fillStyle="rgb(255,0,15)";
            else if(model.spinArray[i][j]==2) g.fillStyle="rgb(232,10,183)";
            else if(model.spinArray[i][j]==3) g.fillStyle="rgb(84,10,232)";
            else if(model.spinArray[i][j]==4) g.fillStyle="rgb(0,15,255)";
            else g.fillStyle="rgb(0,0,255)";
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
    let pUp=new Array(5);
    pUp[0]=parseInt($("#fillProb0").val());
    pUp[1]=pUp[0]+parseInt($("#fillProb1").val());
    pUp[2]=pUp[1]+parseInt($("#fillProb2").val());
    pUp[3]=pUp[2]+parseInt($("#fillProb3").val());
    pUp[4]=pUp[3]+parseInt($("#fillProb4").val());
    pUp[0]/=pUp[4];
    pUp[1]/=pUp[4];
    pUp[2]/=pUp[4];
    pUp[3]/=pUp[4];
    pUp[4]=1;
    console.log(pUp);
    g=$("#plotDiv")[0].getContext("2d");
    model=new Stauffer4SznajdModel(height,width,pUp);
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
