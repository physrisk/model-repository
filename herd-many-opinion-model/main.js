function myParseFloat(val) {return parseFloat((""+val).replace(",","."));}
function hexToDec(val) {return parseInt(val.toString(16),16);}

let magPdfPlot=new plotlyPlot("magPdf",["v","ln[p(v)]"]);

let height=20;
let width=25;
let total=height*width;
let sqSize=10;
let nStates=4;

let model=null;

let pdf=null;
let pdfLen=0;

let timeoutID=null;

let g;
let colors=["#396ab1","#da7c30","#3e9651","#cc2529"];

function play() {
    let i, j, mag;
    for(i=0;i<64;i+=1) {
        mag=model.step().slice(0);
        for(j=0;j<mag.length;j+=1) {
            mag[j]/=total;
        }

        for(j=0;j<nStates;j+=1) {
            pdf[Math.floor(mag[j]*pdf.length)][j]+=1;
        }
        pdfLen+=1;
    }
}

function plotFigures() {
    let i,showPdf,showPdfX,showPdfY;
    showPdfX=new Array(nStates);
    showPdfY=new Array(nStates);
    if(pdfLen>128) {
        for(i=0;i<nStates;i+=1) {
            showPdf=commonFunctions.pdfModification(commonFunctions.toOneDimensionalArray(pdf,i),false,0,1,101,0,1/pdf.length,pdfLen);
            showPdfX[i]=commonFunctions.toOneDimensionalArray(showPdf,0);
            showPdfY[i]=commonFunctions.toOneDimensionalArray(showPdf,1).map(Math.log);
        }
        magPdfPlot.update(showPdfX,showPdfY,"lines",colors);
    } else {
        magPdfPlot.reset();
    }
    plotField();
}

function plotField() {
    let i,j,k,s;
    k=0;
    s=0;
    g.fillStyle="rgb("+hexToDec(colors[s].substr(1,2))+","+hexToDec(colors[s].substr(3,2))+","+hexToDec(colors[s].substr(5,2))+")";
    for(i=0;i<height;i+=1) {
        for(j=0;j<width;j+=1) {
            k+=1;
            if(k>model.totals[s]) {
                s+=1;
                while(model.totals[s]==0) {
                    s+=1;
                }
                if(s<colors.length) {
                    g.fillStyle="rgb("+hexToDec(colors[s].substr(1,2))+","+hexToDec(colors[s].substr(3,2))+","+hexToDec(colors[s].substr(5,2))+")";
                }
                k=1;
            }
            g.fillRect(j*sqSize,i*sqSize,sqSize,sqSize);
        }
    }
}

function pdfSetup() {
    let i,j,tmp;
    pdf=new Array(101);
    for(i=0;i<pdf.length;i+=1) {
        tmp=new Array(nStates);
        for(j=0;j<nStates;j+=1) {
            tmp[j]=0;
        }
        pdf[i]=tmp.slice(0);
    }
    pdfLen=0;
}

function setup() {
    let i,j,epsilonMatrix,tmp;
    epsilonMatrix=[];
    g=$("#plotDiv")[0].getContext("2d");
    for(i=0;i<nStates;i+=1) {
        tmp=[];
        for(j=0;j<nStates;j+=1) {
            tmp.push(myParseFloat($("#epsilon"+i+""+j).val()));
        }
        epsilonMatrix.push(tmp);
    }
    model=new HerdManyStateModel(total,nStates,epsilonMatrix,1/(total));
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
