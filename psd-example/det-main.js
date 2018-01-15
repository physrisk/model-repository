// most likely redundant as type="number" is used
function myParseFloat(val) {return parseFloat((""+val).replace(",","."));}

// setup global figure objects
var timeSeriesPlot=new plotlyPlot("timeSeriesPlot",["x, s","f(x)"]);
var psdPlot=new plotlyPlot("psdPlot",["ν, Hz","S(ν)"]);

// other global variables
var points=512;
var dt=0.02;
var serX=Array(points);
var psdX=Array(points/2+1);

// get parameters and update figures
function update() {
    // define series generation function
    function generateSeries(a,nu,phi) {
        // define value generating function
        function getValue(f1,f2,a,phi,t) {
            return Math.sin(f1*t)+a*Math.sin(f2*t+phi);
        }
        // iterate through relevant t values
        var i;
        var freq1=2*Math.PI;//reducing load by precomputing frequency factor
        var freq2=2*Math.PI*nu;//reducing load by precomputing frequency factor
        var rezY=Array(points);
        for(i=0;i<points;i+=1) {
            rezY[i]=getValue(freq1,freq2,a,phi,serX[i]);
        }
        // return y values of the series
        return rezY;
    }
    // define PSD calculation function
    function calculatePSD(series) {
        var i;
        // calculate
        var psdY=commonFunctions.performRealFFT(series).slice(0,points/2+1);
        // normalize
        var normalizationFactor=2.0*dt/points;
        for(i=0;i<=points/2;i+=1) {
            psdY[i]=psdY[i]*normalizationFactor;
        }
        // return y values of the PSD
        return psdY;
    }
    // get parameter values
    var a=myParseFloat($("#amplitude").attr("value"));
    var nu=myParseFloat($("#frequency").attr("value"));
    var phi=myParseFloat($("#phase").attr("value"));
    // generate series and calculate its PSD
    var serY=generateSeries(a,nu,phi);
    var psdY=calculatePSD(serY);
    // update the figures
    timeSeriesPlot.update([serX],[serY]);
    psdPlot.update([psdX],[psdY]);
}

// bind on change (on parameter value update) event
$("input").on("change",function() {
    // draw figures using updated parameter values
    update();
});

// initialize on load
$(function () {
    var i;
    // setup time points at which deterministic series is measured
    for(i=0;i<points;i+=1) {
        serX[i]=(i===0) ? 0 : serX[i-1]+dt;
    }
    // setup frequency points of which PSD is obtained
    var tmax=points*dt;
    for(i=0;i<=points/2;i+=1) {
        psdX[i]=i/tmax;
    }
    // draw figures with default parameters
    update();
});
