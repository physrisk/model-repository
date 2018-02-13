function myParseFloat(val) {return parseFloat((""+val).replace(",","."));}

var obFigPlot=new plotlyPlot("obFig",["price-price<sub>0</sub>","orders"],[10,10,40,40]);

var model=null;
var price=0;

var timeoutID=null;

function play() {
    price=model.step();
}

function getSteps() {
    var al=model.obAsk.length;
    var bl=model.obBid.length;
    return [41,price-0.5-20];
}

function plotFigures() {
    var i, l, steps, pdfBidX, pdfAskX, pdfBid, pdfAsk, findIndex, fi;
    steps=getSteps();
    pdfBidX=Array(steps[0]);
    pdfAskX=Array(steps[0]);
    pdfBid=Array(steps[0]);
    pdfAsk=Array(steps[0]);
    var xMin=steps[1];
    pdfBidX[0]=xMin;
    pdfAskX[0]=xMin;
    pdfBid[0]=0;
    pdfAsk[0]=0;
    for(i=1;i<steps[0];i+=1) {
        pdfBidX[i]=pdfBidX[i-1]+1;
        pdfAskX[i]=pdfAskX[i-1]+1;
        pdfBid[i]=0;
        pdfAsk[i]=0;
    }
    findIndex=function(x) {
        return Math.floor(x-xMin+0.5);
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
    var max=Math.max(...pdfBid,...pdfAsk);
    obFigPlot.update([pdfBidX,pdfAskX,[price,price]],
                     [pdfBid,pdfAsk,[-0.5,max+0.5]],
                     "lines");
}

function setup() {
    model=new PreisModel(
        parseInt($("#nAgents").val()),
        myParseFloat($("#limitRate").val()),
        myParseFloat($("#marketRate").val()),
        myParseFloat($("#cancelRate").val()),
        myParseFloat($("#limitBuyP").val()),
        myParseFloat($("#marketBuyP").val()),
        myParseFloat($("#invDepthRate").val())
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
    timeoutID=window.setInterval("frame()",300.0);
}
