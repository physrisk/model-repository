function myParseFloat(val) {return parseFloat((""+val).replace(",","."));}

var obFigPlot=new plotlyPlot("obFig",["log-price","orders"],[10,10,40,40]);

var model=null;
var price=0;
var oldAskLength=0;
var oldBidLength=0;
var lastOrder=0;

var steps=21;
var xStep=20/(steps-1.0);

var timeoutID=null;

function play() {
    price=Math.floor(model.step()/xStep);
}

function plotFigures() {
    lastOrder=0;
    var i, l, pdfBidX, pdfAskX, pdfBid, pdfAsk, findIndex;
    pdfBidX=Array(steps);
    pdfAskX=Array(steps);
    pdfBid=Array(steps);
    pdfAsk=Array(steps);
    var xMin=-10+Math.floor(price/xStep)*xStep;
    //var xMax=10+Math.floor(price/xStep)*xStep;
    pdfBidX[0]=xMin-xStep/5.0;
    pdfAskX[0]=xMin+xStep/5.0;
    pdfBid[0]=0;
    pdfAsk[0]=0;
    for(i=1;i<steps;i+=1) {
        pdfBidX[i]=pdfBidX[i-1]+xStep;
        pdfAskX[i]=pdfAskX[i-1]+xStep;
        pdfBid[i]=0;
        pdfAsk[i]=0;
    }
    findIndex=function(x) {
        return Math.floor((x-xMin+xStep/2.0)/xStep);
    };
    l=model.obBid.length;
    if(l>0) {
        for(i=0;i<l;i+=1) {
            if(-10<model.obBid[i] && model.obBid[i]<10) {
                pdfBid[findIndex(model.obBid[i])]+=1;
            }
        }
    }
    if(oldBidLength<l) {
        lastOrder=-1;
    } else if(oldBidLength>l) {
        lastOrder=-2;
    }
    oldBidLength=l;
    l=model.obAsk.length;
    if(l>0) {
        for(i=0;i<l;i+=1) {
            if(-10<model.obAsk[i] && model.obAsk[i]<10) {
                pdfAsk[findIndex(model.obAsk[i])]+=1;
            }
        }
    }
    if(oldAskLength<l) {
        lastOrder=1;
    } else if(oldAskLength>l) {
        lastOrder=2;
    }
    oldAskLength=l;
    var max=Math.max(...pdfBid,...pdfAsk);
    obFigPlot.update([pdfBidX,pdfAskX,[price,price]],
                     [pdfBid,pdfAsk,[-0.5,max+0.5]],
                     ["markers","markers","lines"]);
}

function updateIndicator() {
    var text="No order executed";
    var clas="report-nothing";
    switch(lastOrder) {
        case -2: text="Bid order executed";
                 clas="report-exe-bid";
                 break;
        case 2: text="Ask order executed";
                clas="report-exe-ask";
                break;
        case -1: text="Bid order placed";
                 clas="report-bid";
                 break;
        case 1: text="Ask order placed";
                clas="report-ask";
                break;
        default: break;
    }
    $("#orderIndicator").text(text).attr("class",clas);
}

function setup() {
    price=0;
    model=new MaslovModel(
            myParseFloat(0.65),
            myParseFloat(3.0),
            parseInt(10000),
            parseInt(1)
        );
}

function frame() {
    play();
    plotFigures();
    updateIndicator();
}

function stopGame() {
    window.clearInterval(timeoutID);
    timeoutID=null;
}

function resumeGame() {
    timeoutID=window.setInterval("frame()",300.0);
}
