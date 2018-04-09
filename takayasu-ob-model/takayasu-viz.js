function myParseFloat(val) {return parseFloat((""+val).replace(",","."));}

var obFigPlot=new plotlyPlot("obFig",["relative price","orders"],[10,10,40,40]);

var model=null;
var price=0;

var timeoutID=null;

function play() {
    price=model.step();
}

function plotFigures() {
    var i, jb, ja, pdfX, pdfBid, pdfAsk;
    var obAsk=model.getOrderedAsk(1);
    var obBid=model.getOrderedBid(1);
    var xMin=price-100;
    pdfX=Array(201);
    pdfBid=Array(201);
    pdfAsk=Array(201);
    pdfX[0]=xMin;
    jb=0;
    ja=0;
    while(jb<obBid.length && obBid[jb]<xMin) {
        jb+=1;
    }
    for(i=1;i<201;i+=1) {
        pdfX[i]=pdfX[i-1]+1;
        pdfBid[i]=0;
        while(jb<obBid.length && obBid[jb]<pdfX[i]) {
            pdfBid[i]+=1;
            jb+=1;
        }
        pdfAsk[i]=0;
        while(ja<obAsk.length && obAsk[ja]<pdfX[i]) {
            pdfAsk[i]+=1;
            ja+=1;
        }
    }
    obFigPlot.update([pdfX,pdfX,[price,price]],
                     [pdfBid,pdfAsk,[-0.5,1.5]],
                     "lines");
}

function setup() {
    model=new takayasuModel(
        myParseFloat(document.querySelector("#nAgents").value),
        myParseFloat(document.querySelector("#spreadShape").value),
        myParseFloat(document.querySelector("#spreadScale").value),
        myParseFloat(document.querySelector("#trendFollowSens").value),
        myParseFloat(document.querySelector("#trendFollowSatur").value),
        myParseFloat(document.querySelector("#trendFollowStd").value),
        0.01,
        myParseFloat(document.querySelector("#timeTick").value)
    );
    price=model.lastPrice;
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
