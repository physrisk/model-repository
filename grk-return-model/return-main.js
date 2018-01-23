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
    pdfPlot.reset();
    psdPlot.reset();
    seriesPlot.reset();
});
// on "Use noise?" checkbox state change
$("#useNoise").on("change",function() {
    // enable/disable related fields
    $("#lambdaNoise, #rNoise").prop("disabled",!$("#useNoise").is(":checked"));
});
// on "Use simple SDE?" checkbox state change
$("#simpleSDE").on("change",function() {
    if($("#simpleSDE").is(":checked")) {
        // set label
        $("label[for=tauS").html("&Delta;t=");
        // disable relevant field
        $("#epsilon").prop("disabled",true);
        // hide noise related parameters
        $("#noiseParams").hide();
    } else {
        // set label
        $("label[for=tauS").html("&tau;<sub>s</sub>=");
        // enable relevant field
        $("#epsilon").prop("disabled",false);
        // show noise related parameters
        $("#noiseParams").show();
    }
});

// global worker object
var worker=null;

// plots to be plotted
var pdfPlot=new plotlyPlot("pdfPlot",["lg[|r|]","lg[P(|r|)]"]);
var psdPlot=new plotlyPlot("psdPlot",["lg[f]","lg[S(f)]"]);
var seriesPlot=new plotlyPlot("seriesPlot",["time (hours)","lg[|r|]"]);

// averaging over realizations
var psdValues=null;
var pdfValues=null;
var realizations=0;

function averageOverRealizations(data) {
    var i;
    if(realizations==0) {
        psdValues=data.psdY.slice(0);
        pdfValues=data.pdf.slice(0);
    } else {
        for(i=0;i<10000;i+=1) {
            pdfValues[i]=(pdfValues[i]*realizations+data.pdf[i])/(realizations+1.0);
        }
        for(i=0;i<psdValues.length;i+=1) {
            psdValues[i]=(psdValues[i]*realizations+data.psdY[i])/(realizations+1.0);
        } 
    }
    realizations+=1;
}

// plot updating
function updatePlots(data) {
    // estimate PDF
    var showPdf=commonFunctions.pdfModification(pdfValues,true,0.01,100,100,0.01,0.01);
    // update plots
    if($("#lgSeries").is(":checked")) {
        seriesPlot.setLabels(["time (hours)","lg[|r|]"]);
    } else {
        seriesPlot.setLabels(["time (hours)","|r|"]);
    }
    seriesPlot.update([data.seriesX],[data.seriesY]);
    pdfPlot.update([commonFunctions.toOneDimensionalArray(showPdf,0)],
                   [commonFunctions.toOneDimensionalArray(showPdf,1)]);
    psdPlot.update([data.psdX],[psdValues]);
}

// get parameter values from the form
function getParams() {
    var sdeParams, noiseParams, realizationParams;
    sdeParams={
        simple: $("#simpleSDE").is(":checked"),
        lambda: parseFloat($("#lambda").val()),
        epsilon: parseInt($("#epsilon").val())*1e-3,
        doubleEta: Math.round(2.0*parseFloat($("#eta").val())),
        xmax: parseInt($("#xmax").val()),
    };
    noiseParams={
        use: $("#useNoise").is(":checked"),
        lambda: parseFloat($("#lambdaNoise").val()),
        r0: parseFloat($("#rNoise").val()),
    };
    realizationParams={
        points: Math.pow(2.0,parseInt($("#points").val())),
        dt: parseFloat($("#tauS").val())*1e-5,
        log: $("#lgSeries").is(":checked"),
    };
    return [sdeParams, noiseParams, realizationParams];
}

// do reset of the model and averaging
function reset() {
    // reset averaging
    psdValues=null;
    pdfValues=null;
    realizations=0;
    // reset model
    var params=getParams();
    if(worker!=null) {
        worker.terminate();
    }
    worker=new Worker("./returnModelWorker.js");
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
                updatePlots(data);
                $("#getRealization").prop("disabled",false);
                break;
        }
    });
}

// main initialization on page load
$(function () {
    reset();
});
