function myParseFloat(val) {return parseFloat((""+val).replace(",","."));}

let pdfPlot=new plotlyPlot("pdfPlot",["lg[|Δp|]","lg[p(|Δp|)]"]);
let psdPlot=new plotlyPlot("psdPlot",["lg[f]","lg[S(f)]"]);
let seriesPlot=new plotlyPlot("seriesPlot",["time","Δp"]);

let time=0;
let timeSeries=null;
let series=null;
let absSeries=null;

let model=null;
let reportTick=1;

let runFlag=false;

let pdf=null;
let pdfLen=0;

function isStable() {
    let as=myParseFloat($("#supplyLaw").val());
    let ad=myParseFloat($("#demandLaw").val());
    let cr=myParseFloat($("#conversionRate").val());
    return model.isStable(as,ad,cr);
}

function play() {
    let prevPrice=model.currentPrice;
    let ret=0;
    let pdfi=0;

    model.step();
    
    // update time series
    timeSeries.splice(0,1);
    series.splice(0,1);
    absSeries.splice(0,1);

    time+=1;
    timeSeries.push(time);
    ret=model.currentPrice-prevPrice;
    series.push(ret);
    ret=Math.abs(ret);
    absSeries.push(ret);

    //update stats
    pdfi=Math.floor(Math.abs(ret)-1);
    if(-1<pdfi && pdfi<pdf.length) {
        pdf[pdfi]+=1;
        pdfLen+=1;
    }
}

function plotFigures() {
    seriesPlot.update([timeSeries],[series],"lines","rgb(83,81,84)");
    if(time>4096) {
        let showPdf=commonFunctions.pdfModification(pdf,true,1e0,1e4,101,1e0,1e0,pdfLen);
        pdfPlot.update([commonFunctions.toOneDimensionalArray(showPdf,0)],
                       [commonFunctions.toOneDimensionalArray(showPdf,1)],
                       "lines","rgb(83,81,84)");
    } else {
        pdfPlot.reset();
    }
    if(time>4096) {
        let curSpec=commonFunctions.performRealFFT(absSeries);
        let showPsd=commonFunctions.specModification(curSpec,1.0,100,true);
        psdPlot.update([commonFunctions.toOneDimensionalArray(showPsd,0)],
                       [commonFunctions.toOneDimensionalArray(showPsd,1)],
                       "lines","rgb(83,81,84)");
    } else {
        psdPlot.reset();
    }
}

function seriesSetup() {
    let i;
    time=0;
    timeSeries=new Array(32768);
    series=new Array(timeSeries.length);
    absSeries=new Array(timeSeries.length);
    for(i=0;i<timeSeries.length;i+=1) {
        timeSeries[i]=i-timeSeries.length;
        series[i]=0;
        absSeries[i]=0;
    }
}

function pdfSetup() {
    let i;
    pdf=new Array(10000);
    for(i=0;i<pdf.length;i+=1) {
        pdf[i]=0;
    }
    pdfLen=0;
}

function setup() {
    model=new cobwebABM(
        myParseFloat($("#demandLaw").val()),
        myParseFloat($("#supplyLaw").val()),
        myParseFloat($("#conversionRate").val()),
        myParseFloat($("#priceEqui").val()),
        myParseFloat($("#quantityEqui").val())*1e3,
        reportTick
    );
    seriesSetup();
    pdfSetup();
}

function frame() {
    let i=0;
    for(i=0;i<128;i+=1) {
        play();
    }
    plotFigures();
    if(runFlag) {
        window.setTimeout("frame()",30.0);
    }
}

function stopGame() {
    runFlag=false;
}

function resumeGame() {
    window.setTimeout("frame()",30.0);
    runFlag=true;
}

function updateStable() {
    if(isStable()) {
        $("#stabilityIndicator").css("color","rgb(132,186,91)").text("Stable");
    } else {
        $("#stabilityIndicator").css("color","rgb(211,94,96)").text("Unstable");
    }
}

/* bind events and set initial GUI states */
$("#stop, #step").attr("disabled","disabled");
$("#restart").click(function () {
    setup();
    plotFigures();
    $("#stop, #step").removeAttr("disabled");
    $("#stop").text("Start");
});
$("#stop").toggle(function() {
    resumeGame();
    $("#stop").text("Stop");
    $("#restart, #step").attr("disabled","disabled");
},function() {
    stopGame();
    $("#stop").text("Continue");
    $("#restart, #step").removeAttr("disabled");
});
$("#step").click(function() {
    frame();
    $("#stop").text("Continue");
});
$("#conversionRate, #demandLaw, #supplyLaw").change(function() {
    updateStable();
});

/* onLoad */
$(function () {
    setup();
    plotFigures();
    updateStable();
});
