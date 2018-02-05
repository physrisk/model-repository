function myParseFloat(val) {return parseFloat((""+val).replace(",","."));}

var obFigPlot=new plotlyPlot("obFig",["log-price","orders"],[10,10,40,40]);

var model=null;
var price=0;

var bookSize=101;
var xStep=1;

var timeoutID=null;

function play() {
    price=Math.floor(model.step()/xStep);
}

function plotFigures() {
    var i, pdfBidX, pdfAskX, pdfBid, pdfAsk, findIndex;
    pdfBidX=Array(bookSize);
    pdfAskX=Array(bookSize);
    pdfBid=Array(bookSize);
    pdfAsk=Array(bookSize);
    var xMin=0;
    pdfBidX[0]=xMin-xStep/5.0-model.zeroPrice;
    pdfAskX[0]=xMin+xStep/5.0-model.zeroPrice;
    pdfBid[0]=0;
    pdfAsk[0]=0;
    for(i=1;i<bookSize;i+=1) {
        pdfBidX[i]=pdfBidX[i-1]+xStep;
        pdfAskX[i]=pdfAskX[i-1]+xStep;
        pdfBid[i]=0;
        pdfAsk[i]=0;
    }
    findIndex=function(x) {
        return Math.floor((x-xMin+xStep/2.0)/xStep);
    };
    for(i=0;i<model.nHalf;i+=1) {
        if(0<=model.obBid[i] && model.obBid[i]<=bookSize) {
            pdfBid[findIndex(model.obBid[i])]+=1;
        }
        if(0<=model.obAsk[i] && model.obAsk[i]<=bookSize) {
            pdfAsk[findIndex(model.obAsk[i])]+=1;
        }
    }
    obFigPlot.update([pdfBidX,pdfAskX,[price,price]],
                     [pdfBid,pdfAsk,[-5,35]]);
}

function setup() {
    var d=myParseFloat($("#diff").val());
    bookSize=parseInt($("#bookSize").val());
    model=new BakOBModel(
            parseInt($("#nAgents").val()),
            bookSize,
            myParseFloat($("#diff").val()),
            parseInt($("#dt").val())
        );
    price=model.getPrice();
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
    timeoutID=window.setInterval("frame()",30.0);
}
