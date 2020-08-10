importScripts("../js-lib/random-026.min.js");

let rng = new Random();
let invTemp = 30;
let workFlag = false;
let series = null;
let conv = null;
let kernel = null;

// recursive log-factorial function with memoization
let factMemory = [0,0];
function logFact(n) {
    if( n < 2 ) {
        return 0;
    }
    if( factMemory[n] > 0 ) {
        return factMemory[n];
    }
    factMemory[n] = logFact(n-1) + Math.log(n);
    return factMemory[n];
}

function convolve(x,w) {
    // x - series, w - kernel
    // assuming that both series and kernel are of the same length
    let i,j;
    let l = x.length;
    let y = Array.from({length:l}, v => 0);
    for(i=0;i<l;i+=1) {
        for(j=i;j>-1;j-=1) {
            y[i] += (x[j] * w[i-j]);
        }
    }
    return y;
}

function logPDF(observed, rates) {
    // log PDF of exponential distribution
    return observed.reduce((acc,v,i) => {
        let p = - logFact(v);
        if(rates[i]>0) {
            p = p - rates[i] + v*Math.log(rates[i]);
        }
        return acc - p;
    }, 0);
}

function logProb(estimate, observed, kernel) {
    // log probability of estimated confirmed cases time series
    // given an observation of recovered time series
    
    // generate estimate of recovered time series from estimated confirmed
    // cases time series
    let estRec = convolve(estimate, kernel);
    
    return logPDF(observed, estRec);
}

function makeNewSeries(series) {
    // make small adjustment to the passed series
    let s = series.slice();
    let r = Math.floor(rng.random()*series.length);
    if( rng.random() < 0.5) {
        while(series[r]<1) {
            r = Math.floor(rng.random()*series.length);
        }
        s[r] -= 1;
    } else {
        s[r] += 1;
    }
    return s;
}

function weibPDF(xs,k,lambda) {
    let scaled = xs.map(v => Math.pow(v*lambda,k));
    return scaled.map((v,i) => k*v*Math.exp(-v)/xs[i] || 0);
}

function reset(observed, k, lambda) {
    // reinitialize series
    series = observed.slice(27);
    series = series.concat(Array.from({length:27}, v => 0));

    // reinitialize kernel
    let xs = Array.from({length:observed.length}, (v,i) => i);
    kernel = weibPDF(xs,k,lambda);
    let sum = kernel.reduce((acc,val) => acc+val);
    kernel = kernel.map(v => v/sum);
}

function doSearch(observed) {
    // create initial series from the observed data
    let lp = logProb(series,observed,kernel);

    // do the search
    let i, nSeries, nlp, delta;
    for(i=0;i<1000;i+=1) {
        nSeries = makeNewSeries(series);
        nlp = logProb(nSeries,observed,kernel);
        if(nlp < lp) {
            series = nSeries.slice();
            lp = nlp;
        } else {
            delta = invTemp*(nlp/lp - 1);
            if(rng.random() < Math.exp(-delta)) {
                series = nSeries.slice();
                lp = nlp;
            }
        }
    }
    if(workFlag) {
        setTimeout(() => {
            doSearch(observed);
        }, 10);
    }
    postStatus();

    invTemp *= 1.41;
}

function postStatus() {
    self.postMessage({
        msg:"get",
        series: series,
        conv: convolve(series,kernel),
    });
}

// listen, execute and reply
self.addEventListener("message", (e) => {
    let data=e.data;
    let rez={msg:data.msg};
    switch(data.msg) {
        case "init":
            invTemp = 30;
            reset(data.observed,data.k,data.lambda);
            break;
        case "start":
            workFlag = true;
            setTimeout(() => {
                doSearch(data.observed);
            }, 100);
            break;
        case "stop":
            workFlag = false;
            rez.series = series;
            rez.conv = convolve(series,kernel);
            break;
        default:
            rez.msg = "get";
            rez.series = series;
            rez.conv = convolve(series,kernel);
            break;
    }
    self.postMessage(rez);
},false);
