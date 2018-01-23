// on "Get realization" button click
$("#getRealization").on("click",function(){
    var params=getParams();
    worker.postMessage({msg: "getRealization", realizationParams: params[2]});
    $("#getRealization").prop("disabled",true);
});
// on "Reset" button click
$("#reset").on("click",function() {
    reset();
    $("#getRealization").prop("disabled",false);
    STPlot.reset();
    tauPlot.reset();
    TPlot.reset();
    thetaPlot.reset();
});

// global worker object
var worker=null;
var realizationParams=null;

// plots to be plotted
var STPlot=new plotlyPlot("STPlot",["lg[T]","lg[S]"]);
var tauPlot=new plotlyPlot("tauPlot",["lg[τ]","lg[p(τ)]"]);
var TPlot=new plotlyPlot("TPlot",["lg[T]","lg[p(T)]"]);
var thetaPlot=new plotlyPlot("thetaPlot",["lg[θ]","lg[p(θ)]"]);

// averaging over realizations
var STValues=null;
var STCenter=null;
var tauValues=null;
var thetaValues=null;
var TValues=null;

function averageOverRealizations(data) {
    var i, mx, my;
    if(STValues!==null) {
        STValues=STValues.concat(data.burstSize);
        TValues=tauValues.concat(data.burstDuration);
        tauValues=tauValues.concat(data.waitingTime);
        thetaValues=tauValues.concat(data.interBurstDuration);
    } else {
        STValues=data.burstSize.slice(0);
        mx=0;
        my=0;
        for(i=0;i<STValues.length;i+=1) {
            mx+=STValues[i][0];
            my+=STValues[i][1];
        }
        STCenter=[mx/STValues.length,my/STValues.length];
        TValues=data.burstDuration.slice(0);
        tauValues=data.waitingTime.slice(0);
        thetaValues=data.interBurstDuration.slice(0);
    }
}

// plot updating
function updatePlots() {
    var pdf, approx;
    approx=getSTApproximation(STValues,[2,STCenter[1]-2*STCenter[0]]);
    STPlot.update([commonFunctions.toOneDimensionalArray(STValues,0), approx.x],
                  [commonFunctions.toOneDimensionalArray(STValues,1), approx.y],
                  ["markers","lines"]);
    // estimate PDFs
    pdf=getShowablePdf(TValues);
    approx=getApproximation(pdf,[-1.5,-1]);
    TPlot.update([commonFunctions.toOneDimensionalArray(pdf,0), approx.x],
                 [commonFunctions.toOneDimensionalArray(pdf,1), approx.y]);
    pdf=getShowablePdf(tauValues);
    approx=getApproximation(pdf,[-1.5,-1]);
    tauPlot.update([commonFunctions.toOneDimensionalArray(pdf,0), approx.x],
                   [commonFunctions.toOneDimensionalArray(pdf,1), approx.y]);
    pdf=getShowablePdf(thetaValues);
    approx=getApproximation(pdf,[-1.5,-1]);
    thetaPlot.update([commonFunctions.toOneDimensionalArray(pdf,0), approx.x],
                     [commonFunctions.toOneDimensionalArray(pdf,1), approx.y]);
}
function getShowablePdf(series) {
    var hist, pdf;
    hist=commonFunctions.makePdf(series,realizationParams.dt,
                                 realizationParams.dt*100001,100000,true);
    pdf=commonFunctions.pdfModification(hist,true,realizationParams.dt,
                                 realizationParams.dt*100001,100,
                                 realizationParams.dt,realizationParams.dt);
    return pdf;
}
function getApproximation(pdf,coefs) {
    return {
            x: [pdf[1][0],pdf[pdf.length-2][0]],
            y: [pdf[1][0]*coefs[0]+coefs[1],
                pdf[pdf.length-2][0]*coefs[0]+coefs[1]],
        };
}
function getSTApproximation(ST,coefs) {
    var minX=ST.reduce((a,v) => {
            return a < v[0] ? a : v[0];
        });
    var maxX=ST.reduce((a,v) => {
            return a > v[0] ? a : v[0];
        });
    return {
            x: [minX,maxX],
            y: [minX*coefs[0]+coefs[1],
                maxX*coefs[0]+coefs[1]],
        };
}

// get parameter values from the form
function getParams() {
    var sdeParams, noiseParams;
    sdeParams={
        simple: true,
        lambda: parseFloat($("#lambda").val()),
        epsilon: 0,
        doubleEta: Math.round(2.0*parseFloat($("#eta").val())),
        xmax: parseInt($("#xmax").val()),
    };
    noiseParams={
        use: false,
        lambda: 5.0,
        r0: 1.0,
    };
    realizationParams={
        points: 32768,
        dt: parseFloat($("#deltaT").val())*1e-4,
        h: parseFloat($("#thresh").val()),
    };
    return [sdeParams, noiseParams, realizationParams];
}

// do reset of the model and averaging
function reset() {
    // reset averaging
    STValues=null;
    STCenter=null;
    tauValues=null;
    thetaValues=null;
    TValues=null;
    // reset model
    var params=getParams();
    if(worker!=null) {
        worker.terminate();
    }
    worker=new Worker("./burstWorker.js");
    worker.postMessage({
        msg: "setParams",
        sdeParams: params[0],
        noiseParams: params[1],
        realizationParams: params[2],
    });
    worker.addEventListener("message", function(e) {
        var data=e.data;
        switch(data.msg) {
            case "getRealization":
                averageOverRealizations(data);
                updatePlots();
                $("#getRealization").prop("disabled",false);
                break;
        }
    });
}

// main initialization on page load
$(function () {
    reset();
});
