function myParseFloat(val) {return parseFloat((""+val).replace(",","."));}

let timeSeriesPlot = new plotlyPlot("timeSeries", ["t", "x(t)"]);
timeSeriesPlot.setRanges(true, [0, 1]);
timeSeriesPlot.reset();

let stopButton = document.getElementById("stop");
stopButton.addEventListener("click", () => onStopButtonClick());
stopButton.disabled = true;
let startButton = document.getElementById("start");
startButton.addEventListener("click", () => onStartButtonClick());

let timeoutID = null;
let updateTimeout = 30;
let updateSteps = 1;

function onStopButtonClick() {
    if(startButton.disabled) {
        stop();
        stopButton.innerHTML = "Continue";
    } else {
        resume();
        stopButton.innerHTML = "Stop";
    }
    startButton.disabled = !startButton.disabled;
}

function stop() {
    window.clearTimeout(timeoutID);
    timeoutID=null;
}

function resume() {
    timeoutID=window.setTimeout("frame()", updateTimeout);
}

function onStartButtonClick() {
    setup();
    onStopButtonClick();
    startButton.disabled = true;
    stopButton.disabled = false;
}

let models = null;
let nModels = 10;
let timePoints = 128;
let timeStep = 1/64;
let time = new Array(timePoints);
let lastTime = 0;
let series = new Array(timePoints);
let nAgents = 1000;

function frame() {
    let lastX, i;
    for(i=0; i<updateSteps; i+=1) {
        lastX = simulate();
        appendData(lastTime, lastX);
    }
    plotFigures();
    resume();
}

function simulate() {
    lastTime = lastTime + timeStep;
    return models.step(lastTime);
}

function appendData(t, x) {
    time.splice(0,1);
    series.splice(0,1);
    time.push(t);
    series.push(x);
}

function plotFigures() {
    timeSeriesPlot.update([time], jStat.transpose(series));
}

function setup() {
    let sigma0 = myParseFloat(document.getElementById("sigma0").value);
    let sigma1 = myParseFloat(document.getElementById("sigma1").value);
    let supp = myParseFloat(document.getElementById("supp").value);
    let alpha = myParseFloat(document.getElementById("alpha").value);
    let beta = myParseFloat(document.getElementById("beta").value);

    models = new MultiModel(nModels, ImitationSupportModel, sigma0, sigma1, supp, alpha, beta, 0, nAgents);
    models.models.forEach((v,i) => {
        let X0 = Math.round(nAgents*(i+0.5)/nModels);
        v.initialize(X0);
    });
    
    time = time.fill((1-timePoints)*timeStep).map((v,i) => i*timeStep + v);
    lastTime = 0;
    series = series.fill(models.step(-1));
}

// on window load
window.addEventListener("load", () => {
    setup();
    plotFigures();
});
