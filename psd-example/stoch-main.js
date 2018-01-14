// most likely redundant as type="number" is used
function myParseFloat(val) {return parseFloat((""+val).replace(",","."));}

// setup global figure objects
var timeSeriesPlot=new plotlyPlot("timeSeriesPlot",['x, s','f(x)']);
var psdPlot=new plotlyPlot("psdPlot",['lg[ν]','lg[S(ν)]']);

// other global variables
var points=4096;
var dt=0.1;
var serX=Array(points);
var seriesType=0;
var psdX=Array(points/2+1);

function update() {
    // define series generating function
    function generateSeries(type,sigma,gamma) {
        // define white noise generating function
        var sqrtDt=Math.sqrt(dt);
        function whiteSeries(sigma) {
            var i;
            var rez=Array(points);
            for(i=0;i<points;i+=1) {
                rez[i]=sigma*commonFunctions.gaussianRandom()/sqrtDt;
            }
            return rez;
        }
        // define brownian motion generating function
        function bmSeries(sigma,gamma) {
            var noise=whiteSeries(sigma);
            var total=0;
            return noise.map(function(v) {
                    total=total-gamma*total*dt+dt*v;
                    return total;
                });
        }
        // define geometric brownian motion generating function
        function gbmSeries(sigma) {
            var bms=bmSeries(sigma,0);
            return bms.map(function(v) {
                    return Math.pow(Math.E,v);
                });
        }
        // return the result base on the desired type
        switch(type) {
            default:
            case 0: return whiteSeries(sigma);
            case 1: return bmSeries(sigma,gamma);
            case 2: return gbmSeries(sigma);
        }
    }
    // define PSD calculation function
    function calculatePSD(series) {
        var i;
        // calculate
        var psdY=commonFunctions.performRealFFT(series).slice(0,points/2+1);
        // normalize
        var normalizationFactor=dt/points;
        for(i=0;i<=points/2;i+=1) {
            psdY[i]=commonFunctions.LogBase10(psdY[i]*normalizationFactor);
        }
        // return y values of the PSD
        return psdY;
    }
    // get parameter values
    var sigma=myParseFloat($("#sigma").attr("value"));
    var gamma=myParseFloat($("#gamma").attr("value"));
    // define theoretic approximation of PSD
    var sigmaSq=sigma*sigma;
    var piSq2=2.0*Math.PI*Math.PI;
    var gammaSq2=2.0*gamma*gamma;
    var whiteRatio=commonFunctions.LogBase10(sigmaSq);
    function theoreticApproximation(type,x) {
        var x10=Math.pow(10.0,x);
        switch(type) {
            default:
            case 0: return whiteRatio;
            case 1: return commonFunctions.LogBase10(sigmaSq/(gammaSq2+piSq2*x10*x10));
            case 2: return null;
        }
    }
    // update button styling depending on which was pressed last
    $("button").removeClass("chosen");
    switch(seriesType) {
        default:
        case 0: $("#white").addClass("chosen");
                $("#gamma").prop("disabled",true);
                break;
        case 1: $("#brown").addClass("chosen");
                $("#gamma").prop("disabled",false);
                break;
        case 2: $("#geom").addClass("chosen");
                $("#gamma").prop("disabled",true);
                break;
    }
    // generate series and calculate its PSD
    var serY=generateSeries(seriesType,sigma,gamma);
    var psdY=calculatePSD(serY);
    if(seriesType===2) {
        for(i=0;i<points;i+=1) {
            serY[i]=commonFunctions.LogBase10(serY[i]);
        }
        timeSeriesPlot.setLabels(["x, s","lg[f(x)]"]);
    } else {
        timeSeriesPlot.setLabels(["x, s","f(x)"]);
    }
    // update the figures
    timeSeriesPlot.update([serX],[serY]);
//    var psdX=commonFunctions.toOneDimensionalArray(psd,0);
    psdPlot.update([psdX,psdX],
                   [psdY,psdX.map(function(v) {
                             return theoreticApproximation(seriesType,v);
                         })]);
}

// bind on change (on parameter value update) event
$("#sigma").on("change",function() {
    update();
});
$("#gamma").on("change",function() {
    if(seriesType===1) {
        update();
    }
});
// bind on click (if series type has changed) event
$("#white").on("click",function() {
    seriesType=0;
    update();
});
$("#brown").on("click",function() {
    seriesType=1;
    update();
});
$("#geom").on("click",function() {
    seriesType=2;
    update();
});

/* initialize on load */
$(function () {
    var i;
    // setup time points at which deterministic series is measured
    for(i=0;i<points;i+=1) {
        serX[i]=(i===0) ? 0 : serX[i-1]+dt;
    }
    // setup frequency points of which PSD is obtained
    var tmax=points*dt;
    for(i=0;i<=points/2;i+=1) {
        psdX[i]=commonFunctions.LogBase10(i/tmax);
    }
    // draw figures with default parameters
    update();
});
