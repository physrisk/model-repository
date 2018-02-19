importScripts("../js-lib/commonFunctions.js");
importScripts("./kirmanSdeRetModel.js");

var active=false;

var fqtau=[];
var realizations=0;

var model=null;
var modelLogStep=-3;

var deform=0;
var kappa2=0.1;
var nPoints=131072;
var outPoints=256;
var logStep=commonFunctions.LogBase10(nPoints)/outPoints;

var qArr=[-10,-8,-5,-4,-3,-2,-1,-0.5,0.5,1,2,3,4,5,8,10];

function getSeries() {
    var i;
    var series=new Array(nPoints);
    for(i=0;i<nPoints;i+=1) {
        model.stepPerTime();
        series[i]=model.frac;
    }
    return series;
}

function toBetaDistribution(y) {
    return y/(1+y);
}

function deformSeries(series) {
    if(deform==0) {// do not deform the series
        return series;
    }
    if(deform==1 || deform==3) {// shuffle
        series=commonFunctions.shuffleArray(series);
    }
    if(deform==2 || deform==3) {// change distribution
        series=series.map(toBetaDistribution);
    }
    return series;
}

function getProfile(series) {
    var mean=commonFunctions.average(series);
    return series.reduce((a,c) => {
        a.push((a.length && a[a.length-1] || 0)+c-mean);
        return a;
    },[]);
}

function updateFq(profile) {
    var qi, i, q, oldTau, tau, logTau, filledIn;
    var fqEmpty=(realizations==0);
    for(qi=0;qi<qArr.length;qi+=1) {
        q=qArr[qi];
        oldTau=0;
        filledIn=0;
        if(fqEmpty) {
            fqtau[qi]=[];
        }
        for(i=0;i<outPoints;i+=1) {
            tau=Math.round(Math.pow(10,i*logStep));
            logTau=commonFunctions.LogBase10(tau);
            if(tau>oldTau && tau>50 && tau<10000) {
                if(fqEmpty) {
                    fqtau[qi][filledIn]=[
                        logTau+modelLogStep,
                        commonFunctions.LogBase10(f2(profile,tau,q))
                    ];
                } else {
                    fqtau[qi][filledIn][1]=commonFunctions.LogBase10(Math.pow(10,fqtau[qi][filledIn][1])+f2(profile,tau,q));
                }
                filledIn+=1;
            }
            oldTau=tau;
        }
    }
}
    
function f2(profile, tau, q) {
    var segment, nSegments, globalDif, i, trend, dif, rejected;
    if(q==0) {
        return f0(profile,tau);
    }
    nSegments=profile.length/tau;
    if(nSegments<1) {
        return -1;
    }
    globalDif=0;
    for(i=0;i<nSegments;i++) {
        // slice a segment
        segment=profile.slice(i*tau,i*tau+tau);
        // approximate trend
        trend=commonFunctions.linearFit1D(segment);
        // get differences
        rejected=0;
        dif=segment.reduce((ac,cv,ci) => {
            var innerDif=cv-trend[0]*ci-trend[1];
            innerDif=innerDif*innerDif;
            if(innerDif>0) {
                return ac+innerDif;
            }
            rejected+=1;
            return ac;
        });
        if(tau-rejected>0 && dif>0) {
            globalDif+=Math.pow(dif/(tau-rejected),q/2);
        }
    }
    if(globalDif==0) {
        return -1;
    }
    return Math.pow(globalDif/nSegments,1.0/q);
}

function f0(profile,tau) {
    var segment, nSegments, globalDif, i, trend, dif, rejected;
    nSegments=profile.length/tau;
    if(nSegments<1) {
        return -1;
    }
    globalDif=0;
    for(i=0;i<nSegments;i+=1) {
        // slice a segment
        segment=profile.slice(i*tau,i*tau+tau);
        // approximate trend
        trend=commonFunctions.linearFit1D(segment);
        // get differences
        rejected=0;
        dif=segment.reduce((ac,cv,ci) => {
            var innerDif=cv-trend[0]*ci-trend[1];
            innerDif=innerDif*innerDif;
            if(innerDif>0) {
                return ac+innerDif;
            }
            rejected+=1;
            return ac;
        });
        if(tau-rejected>0 && dif>0) {
            globalDif+=Math.log(dif/(tau-rejected));
        }
    }
    return Math.exp(0.5*globalDif/nSegments);
}

function getHq() {
    var qi, rez;
    var hq=[];
    for(qi=0;qi<qArr.length;qi+=1) {
        rez=commonFunctions.linearFit(fqtau[qi],-0.5,0.5);
        hq.push([qArr[qi],rez[0]]);
    }
    return hq;
}

function getHolder(hq) {
    var i, maxLength, maxRange, falfa;
    var dhq=[];
    for(i=0;i<fqtau.length-1;i+=1) {
        dhq.push([
            (hq[i][0]+hq[i+1][0])/2.0,
            (hq[i][1]-hq[i+1][1])/(hq[i][0]-hq[i+1][0])
        ]);
    }
    var qa=[];
    for(i=0;i<dhq.length;i+=1) {
        qa[i]=[
            dhq[i][0],
            dhq[i][0]*dhq[i][1]+(hq[i+1][1]+hq[i][1])/2
        ];
    }
    maxRange=[0,dhq.length-1];
    maxLength=dhq.length;
    falfa=[];
    for(i=0;i<maxLength;i+=1) {
        falfa[i]=[
            qa[maxRange[0]+i][1],
            Math.max(qa[maxRange[0]+i][0]*qa[maxRange[0]+i][0]*dhq[maxRange[0]+i][1]+1,0)
        ];
    }
    return falfa;
}

function getResults() {
    var series, profile, hq, i, logr, holder;
    var res={
        fqtau: { x: [], y: [], },
        hq: { x: [], y: [], },
        holder: { x: [], y: [], },
    };
    series=getSeries();
    series=deformSeries(series);
    profile=getProfile(series);
    updateFq(profile);
    realizations+=1;
    logr=commonFunctions.LogBase10(realizations);
    hq=getHq();
    holder=getHolder(hq);
    for(i=0;i<qArr.length;i+=1) {
        res.fqtau.x.push(commonFunctions.toOneDimensionalArray(fqtau[i],0));
        res.fqtau.y.push(commonFunctions.toOneDimensionalArray(fqtau[i],1).map(cv => cv-logr));
    }
    res.hq.x=commonFunctions.toOneDimensionalArray(hq,0);
    res.hq.y=commonFunctions.toOneDimensionalArray(hq,1);
    res.holder.x=commonFunctions.toOneDimensionalArray(holder,0);
    res.holder.y=commonFunctions.toOneDimensionalArray(holder,1);
    self.postMessage({"msg":"get","res":res,"final":!active});
    if(active) {
        setTimeout(()=> getResults(),100);
    }         
}

function initializeModel(e1,e2,alpha) {
    model=new kirmanSdeRetModel();
    model.setEpsilons(e1,e2);
    model.setTauScenario(alpha);
    model.kappa2=kappa2;
    modelLogStep=commonFunctions.LogBase10(model.integrationDt);
}

self.addEventListener("message", function(e) {
    var data=e.data;
    var reply={msg:data.msg};
    switch(data.msg) {
        case "init":
            active=true;
            fqtau=[];
            realizations=0;
            deform=data.deform;
            initializeModel(data.e1,data.e2,data.alpha);
            break;
        case "get":
            active=true;
            getResults();
            reply.msg="async";
            break;
        case "stop":
            active=false;
            break;
    }
    self.postMessage(reply);
}, false);
