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
    psdPlot.reset();
});

// global worker object
var worker=null;

// plots to be plotted
var psdPlot=new plotlyPlot("psdPlot",["lg[f]","lg[S(f)]"]);

// averaging over realizations
var psdValues=null;
var realizations=0;

function averageOverRealizations(data) {
    var i;
    if(realizations==0) {
        psdValues=data.psdY.slice(0);
    } else {
        for(i=0;i<psdValues.length;i+=1) {
            psdValues[i]=(psdValues[i]*realizations+data.psdY[i])/(realizations+1.0);
        } 
    }
    realizations+=1;
}

// plot updating
function updatePlots(data) {
    // update plots
    psdPlot.update([data.psdX],[psdValues]);
}

// get parameter values from the form
function getParams() {
    return {
            a1: parseFloat($("#a1").val()),
            a2: parseFloat($("#a2").val()),
            b1: parseFloat($("#b1").val()),
            b2: parseFloat($("#b2").val()),
            c1: parseFloat($("#c1").val()),
            c2: parseFloat($("#c2").val()),
            H: parseFloat($("#H").val()),
            T: parseFloat($("#T").val())*1e-4,
        };
}

// do reset of the model and averaging
function reset() {
    // reset averaging
    psdValues=null;
    realizations=0;
    // reset model
    var params=getParams();
    if(worker!=null) {
        worker.terminate();
    }
    worker=new Worker("./abmThreeTypeWorker.js");
    worker.postMessage({
        msg: "setParams",
        params: params,
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
