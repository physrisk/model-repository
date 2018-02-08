function myParseFloat(val) {return parseFloat((""+val).replace(",","."));}

var obFigPlot=new plotlyPlot("obFig",["price","orders"],[10,10,40,40]);

var model=null;
var price=0;
var priceTick=0.1;
var priceZero=100;

var timeoutID=null;

function play() {
    price=priceZero+model.step();
}

function getSteps() {
    var al=model.obAsk.length;
    var bl=model.obBid.length;
    if(al>0 && bl>0) {
        return [
            Math.round((model.obAsk[al-1][0]-model.obBid[bl-1][0])/priceTick)+3,
            model.obBid[bl-1][0]-priceTick
        ];
    }
    if(al>0) {// bl<0
        return [
            Math.round((model.obAsk[al-1][0]-model.obAsk[0][0])/priceTick)+3,
            model.obAsk[0][0]-priceTick
        ];
    }
    if(bl>0) {// al<0
        return [
            Math.round((model.obBid[0][0]-model.obBid[bl-1][0])/priceTick)+3,
            model.obBid[bl-1][0]-priceTick
        ];
    }
    return [0,0];
}

function plotFigures() {
    var i, l, steps, pdfBidX, pdfAskX, pdfBid, pdfAsk, findIndex, fi;
    steps=getSteps();
    pdfBidX=Array(steps[0]);
    pdfAskX=Array(steps[0]);
    pdfBid=Array(steps[0]);
    pdfAsk=Array(steps[0]);
    var xMin=steps[1];
    pdfBidX[0]=priceZero+xMin;
    pdfAskX[0]=priceZero+xMin;
    pdfBid[0]=0;
    pdfAsk[0]=0;
    for(i=1;i<steps[0];i+=1) {
        pdfBidX[i]=pdfBidX[i-1]+priceTick;
        pdfAskX[i]=pdfAskX[i-1]+priceTick;
        pdfBid[i]=0;
        pdfAsk[i]=0;
    }
    findIndex=function(x) {
        return Math.floor((x-xMin+priceTick/2.0)/priceTick);
    };
    l=model.obBid.length;
    if(l>0) {
        for(i=0;i<l;i+=1) {
            fi=findIndex(model.obBid[i][0]);
            if(fi>0 && fi<steps[0]) {
                pdfBid[fi]+=1;
            }
        }
    }
    l=model.obAsk.length;
    if(l>0) {
        for(i=0;i<l;i+=1) {
            fi=findIndex(model.obAsk[i][0]);
            if(fi>0 && fi<steps[0]) {
                pdfAsk[fi]+=1;
            }
        }
    }
    obFigPlot.update([pdfBidX,pdfAskX,[price,price]],
                     [pdfBid,pdfAsk,[-0.5,10.5]],
                     "lines");
}

function setup() {
    model=new CristelliModel(
        myParseFloat($("#marketOrderProb").val()),
        parseInt($("#broadness").val()),
        parseInt($("#survival").val()),
        parseInt($("#dt").val()),
        priceTick);
    price=priceZero+model.getCurrentPrice();
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
    timeoutID=window.setInterval("frame()",300.0);
}
