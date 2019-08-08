function myParseFloat(val) {return parseFloat((""+val).replace(",","."));}

let nAgents=100;

let model=null;

let pdf=null;
let pdfSteps=100;

let timeoutID=null;

let nTicks=9;
let sqSize=5;
let g;

function play() {
    let t;

    model.step();

    pdf.splice(0,1);

    t=new Array(pdfSteps);
    t.fill(0);
    pdf.push(t);
    for(i=0;i<nAgents;i+=1) {
        t=Math.floor((model.opinions[i]+10)*(pdfSteps-1)/20);
        t=Math.min(Math.max(t,0),pdfSteps-1);
        pdf[pdfSteps-1][t]+=1;
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
        t=new Array(pdfSteps);
        t.fill(0);
        pdf.push(t.slice(0));
    }
}

function setup() {
    let i, j, k, sigma, probSusp, rng;
    sigma=myParseFloat($("#sigma").val());
    probSusp=myParseFloat($("#probSusp").val());
    rng=new Random();
    g=$("#plotDiv")[0].getContext("2d");
    let trust=[];
    for(i=0;i<nAgents;i+=1) {
        t=[];
        for(j=0;j<nAgents;j+=1) {
            if(i==j) {
                t.push(0);
            } else if(i<j) {
                k=Math.abs(rng.normal(0,sigma));
                k*=(rng.random() < probSusp ? -1 : 1);
                t.push(k);
            } else {// i>j
                t.push(trust[j][i]);
            }
        }
        trust.push(t);
    }
    model=new IshiiTrustModel(
        parseInt($("#modelType").val()),
        nAgents,
        myParseFloat($("#epsilon").val()),
        trust
    );
    pdfSetup();
}

function frame() {
    play();
    plotFigures();
    if(timeoutID) {
        window.setTimeout(frame,100.0);
    }
}

function stopGame() {
    timeoutID=false;
}

function resumeGame() {
    timeoutID=true;
    window.setTimeout(frame,100.0);
}
