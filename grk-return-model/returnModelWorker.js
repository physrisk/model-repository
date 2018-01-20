// import shared scripts
importScripts("../js-lib/commonFunctions.js");
// import local scripts
importScripts("./returnModel.js");

// couple of global parameters
var model=new returnModel();
var realizationParams;
var busy=false;
var time=0;

// return array of x and lg(y) values
function generateSeries() {
    return model.getRealization(realizationParams);
}
function prepareSeries(series) {
    var i, dtSeconds;
    var rez={};
    rez.x=new Array(realizationParams.points);
    rez.y=series.slice(0);
    rez.x[0]=time;
    if(realizationParams.log) {
        rez.y[0]=commonFunctions.LogBase10(rez.y[0]);
    }
    dtSeconds=realizationParams.dt/model.tauSSecond/3600;
    for(i=1;i<realizationParams.points;i+=1) {
        rez.x[i]=rez.x[i-1]+dtSeconds;
        if(realizationParams.log) {
            rez.y[i]=commonFunctions.LogBase10(rez.y[i]);
        }
    }
    time=rez.x[realizationParams.points-1];
    return rez;
}

// obtain showable PDF from series
function getPDF(series) {
    return commonFunctions.makePdf(series,0.01,100,10000,true);
}

// obtain showable PSD from series
function getPSD(series) {
    var dtSeconds=realizationParams.dt/model.tauSSecond;
    var fft=commonFunctions.performRealFFT(series);
    var show=commonFunctions.specModification(fft,dtSeconds,100,true);
    return {x: commonFunctions.toOneDimensionalArray(show,0),
            y: commonFunctions.toOneDimensionalArray(show,1)};
}

// listen, execute and reply
self.addEventListener("message", function(e) {
    var tmp, series;
    var data=e.data;
    var rez={msg:data.msg};
    if(busy) {
        rez.errorCode=503;
        rez.errorMsg="Busy executing some code.";
        self.postMessage(rez);
    }
    busy=true;
    switch(data.msg) {
        case "setParams":
            model.setParams(data.sdeParams,data.noiseParams);
            realizationParams=data.realizationParams;
            time=0;
            break;
        case "getRealization":
            realizationParams.log=data.realizationParams.log;
            try {
                series=generateSeries();
                rez.pdf=getPDF(series);
                tmp=getPSD(series);
                rez.psdX=tmp.x.slice(0);
                rez.psdY=tmp.y.slice(0);
                tmp=null;
                tmp=prepareSeries(series);
                rez.seriesX=tmp.x.slice(0);
                rez.seriesY=tmp.y.slice(0);
                tmp=null;
            } catch(error) {
                rez.errorCode=500;
                rez.errorMsg=error;
            }
            break;
        default:
            rez.errorCode=404;
            rez.errorMsg="Unknown message "+data.msg;
            break;
    }
    busy=false;
    self.postMessage(rez);
},false);
