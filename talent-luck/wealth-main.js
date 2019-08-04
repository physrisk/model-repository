function myParseFloat(val) {return parseFloat((""+val).replace(",","."));}

let capPdfPlot=new plotlyPlot("capPdf",["lg-capital","lg-pdf"]);
let talPdfPlot=new plotlyPlot("talPdf",["talent","probability"]);
let luckPdfPlot=new plotlyPlot("luckPdf",["relative luck","probability"]);

let sqSize=5;

let model=null;

let timeoutID=null;

let g;

function play() {
    model.step();
}

function plotFigures() {
    let pdf=commonFunctions.makePdf(model.cap,1e-3,1e2,100000,true);
    let showPdf=commonFunctions.pdfModification(pdf,true,1e-3,1e2,101,1e-3,1e-3);
    capPdfPlot.update([commonFunctions.toOneDimensionalArray(showPdf,0)],
                      [commonFunctions.toOneDimensionalArray(showPdf,1)]);
    pdf=commonFunctions.makePdf(model.histLuck,-50,50,101,true);
    luckPdfPlot.update([[...Array(pdf.length).keys()].map(x => x-=((pdf.length-1)/2))],[pdf]);
    if(model.time==0) {
        pdf=commonFunctions.makePdf(model.talent,0,1,101,true);
        talPdfPlot.update([[...Array(pdf.length).keys()].map(x => x/(pdf.length-1))],[pdf]);
    }
}

function plotField() {
    let i;
    g.fillStyle="rgb(200,200,200)";
    g.fillRect(0,0,model.size[0]*sqSize,model.size[1]*sqSize);
    for(i=0;i<model.nEvents;i+=1) {
        if(model.luck[i]) {
            g.fillStyle="rgb(62,150,81)";
        } else {
            g.fillStyle="rgb(204,37,41)";
        }
        g.fillRect(
            model.locEvent[i][0]*sqSize,
            model.locEvent[i][1]*sqSize,
            sqSize,sqSize
        );
    }
    for(i=0;i<model.nEvents;i+=1) {
        g.fillStyle="rgb(0,0,0)";
        g.fillRect(
            model.locAgent[i][0]*sqSize+1,
            model.locAgent[i][1]*sqSize+1,
            sqSize-2,sqSize-2
        );
    }
}

function setup() {
    g=$("#plotDiv")[0].getContext("2d");
    model=new talentModel(
        [50,40],
        parseInt($("#nAgents").val()),
        parseInt($("#nEvents").val()),
        myParseFloat($("#pLuck").val()),
        [myParseFloat($("#tAlpha").val()),
         myParseFloat($("#tBeta").val())]
    );
    plotFigures();
    plotField();
}

function frame() {
    play();
    plotFigures();
    plotField();
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
