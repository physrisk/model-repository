// import shared scripts
importScripts("../js-lib/commonFunctions.js");
// import local scripts
importScripts("./abmThreeType.js");

// couple of global parameters
var model=new abmThreeType();
var busy=false;
var timeStep=0;

// return array of x and lg(y) values
function generateSeries() {
    return model.getRealization(32768);
}

// obtain showable PSD from series
function getPSD(series) {
    var i, j, temp;
    var cuts=[[0,8192],[8192,16384],[16384,24576],[24576,32768]];
    var fft=Array(8192);
    for(i=0;i<fft.length;i+=1) {
        fft[i]=0;
    }
    for(i=0;i<cuts.length;i+=1) {
        temp=commonFunctions.performRealFFT(series.slice(cuts[i][0],cuts[i][1]));
        for(j=0;j<fft.length;j+=1) {
            fft[j]+=(temp[j]/cuts.length);
        }
    }
    var show=commonFunctions.specModification(fft,timeStep,100,true);
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
            model.setParams(data.params);
            timeStep=data.params.T;
            break;
        case "getRealization":
            series=generateSeries();
            tmp=getPSD(series);
            series=null;
            rez.psdX=tmp.x.slice(0);
            rez.psdY=tmp.y.slice(0);
            tmp=null;
            break;
        default:
            rez.errorCode=404;
            rez.errorMsg="Unknown message "+data.msg;
            break;
    }
    busy=false;
    self.postMessage(rez);
},false);
