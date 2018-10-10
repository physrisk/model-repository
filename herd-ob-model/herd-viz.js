function myParseFloat(val) {return parseFloat((""+val).replace(",","."));}

let obFigPlot=new plotlyPlot("obFig",["price","orders"],[10,10,40,40]);

let model=null;
let price=0;
let initialPrice=3e4;
let tauAlpha=2;
let laZero=0.4;

let timeoutID=null;

function play() {
    price=model.step();
}

function plotFigures() {
    let i, jb, ja, pdfX, pdfBid, pdfAsk;
    let obAsk=model.lob.ask.get(1);
    let obBid=model.lob.bid.get(-1);
    let xMin=price-100;
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
    timeTick=myParseFloat(document.querySelector("#timeTick").value);
    let nAgents=Math.round(parseInt(document.querySelector("#nAgents").value)/2);
    let spreadShape=myParseFloat(document.querySelector("#spreadShape").value);
    let spreadScale=myParseFloat(document.querySelector("#spreadScale").value);
    let cMood=myParseFloat(document.querySelector("#cMood").value);
    let lae=myParseFloat(document.querySelector("#lae").value)*1e-8;
    let epsiF=myParseFloat(document.querySelector("#epsiF").value);
    let epsiC=myParseFloat(document.querySelector("#epsiC").value);
    let latf=myParseFloat(document.querySelector("#latf").value);
    let latc=myParseFloat(document.querySelector("#latc").value);
    let lamc=myParseFloat(document.querySelector("#lamc").value);
    model=new herdModel(timeTick,initialPrice,initialPrice);
    model.resetAgents(
        nAgents,nAgents,
        lae,latc,latf,lamc,
        epsiF,epsiC,tauAlpha,laZero,
        cMood,spreadShape,spreadScale
    );
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
