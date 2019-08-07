function myParseFloat(val) {return parseFloat((""+val).replace(",","."));}

let nAgents=1000;

let model=null;

let pdf=null;
let pdfSteps=100;

let timeoutID=null;

let sqSize=5;
let nTicks=9;

let g;

function play() {
    let i,t;
    if(model.step(nAgents)==0 && model.probNoise<=0) {
        $("#stop").click();
    }
    pdf.splice(0,1);
    t=new Array(pdfSteps);
    t.fill(0);
    pdf.push(t);
    for(i=0;i<nAgents;i+=1) {
        pdf[pdfSteps-1][Math.floor(model.opinions[i]*(pdfSteps-1))]+=1;
    }
}

function trans(x) {
    return 1-Math.log(Math.max(x,0.01))/Math.log(0.01);
}

function plotFigures() {
    let i,j,c;
    // data plotting
    for(i=0;i<pdfSteps;i+=1) {
        for(j=0;j<pdfSteps;j+=1) {
            c=255-Math.floor(200*trans(pdf[i][j]/nAgents));
            g.fillStyle="rgb("+c+","+c+","+c+")";
            g.fillRect(i*sqSize,j*sqSize,sqSize,sqSize);
        }
    }
    // frame
    g.strokeStyle="rgb(0,0,0)";
    g.strokeRect(0,0,pdfSteps*sqSize,pdfSteps*sqSize);
    // ticks
    for(i=1;i<=nTicks;i+=1) {
        c=Math.floor(pdfSteps*sqSize*i/(nTicks+1));
        g.beginPath();
        g.moveTo(0,c);
        g.lineTo(sqSize,c);
        g.stroke();
        g.beginPath();
        g.moveTo(pdfSteps*sqSize,c);
        g.lineTo(pdfSteps*sqSize-sqSize,c);
        g.stroke();
    }
}

function pdfSetup() {
    let i,j,t;
    pdf=[];
    for(i=0;i<pdfSteps;i+=1) {
        t=[];
        for(j=0;j<pdfSteps;j+=1) {
            t.push(1);
        }
        pdf.push(t);
    }
}

function setup() {
    g=$("#plotDiv")[0].getContext("2d");
    model=new DeffuantBCModel(nAgents,
            myParseFloat($("#mu").val()),
            myParseFloat($("#epsilon").val()),
            0,0,0,
            myParseFloat($("#probNoise").val())
        );
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
