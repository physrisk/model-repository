function myParseFloat(val) {return parseFloat((""+val).replace(",","."));}

var obFigPlot=new plotlyPlot("obFig",["relative price","orders"],[10,10,40,40]);

var model=null;
var price=0;

var timeoutID=null;

function play() {
    price=model.step();
}

function plotFigures() {
    var i, pdfBidX, pdfAskX, pdfBid, pdfAsk;
    pdfBidX=Array(41);
    pdfAskX=Array(41);
    pdfBid=Array(41);
    pdfAsk=Array(41);
    var xMin=price-20.5;
    pdfBidX[0]=xMin;
    pdfAskX[0]=xMin;
    pdfBid[0]=1;
    pdfAsk[0]=0;
    for(i=1;i<41;i+=1) {
        pdfBidX[i]=pdfBidX[i-1]+1;
        pdfAskX[i]=pdfAskX[i-1]+1;
        pdfBid[i]=i+xMin < price ? 1 : 0;
        pdfAsk[i]=i+xMin < price ? 0 : 1;
    }
    obFigPlot.update([pdfBidX,pdfAskX,[price,price]],
                     [pdfBid,pdfAsk,[-0.5,1.5]],
                     "lines");
}

function setup() {
    model=new EmmModel();
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
