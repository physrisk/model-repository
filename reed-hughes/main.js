function myParseFloat(val) {return parseFloat((""+val).replace(",","."));}

let rng = new Random();

let mainPlot = new plotlyPlot("mainPlot",
    ["lg[τ], lg[I]","lg[p(τ)], lg[p(I)]"],
    [5,5,40,60]);

let colors = ["#396ab1","#cc2529"];

let nSamples = 1e5; // number of rvs to sample
let mu = 1.0; // deterministic growth rate
let nu = 1.0; // random stopage rate for deterministic growths

// general statistics estimation parameters
let histPoints = 1e5;
let pdfPoints = 1e2;

// X specific statistics parameters
let pdfXMax = 15; // maximum value to represent in pdf
let pdfXMin = 1e-1; // minimum value to represent in pdf
let histXStep = (pdfXMax-pdfXMin)/(histPoints+1);

// Y specific statistics parameters
let pdfYMax = 1e3; // maximum value to represent in pdf
let pdfYMin = 1; // minimum value to represent in pdf
let histYStep = (pdfYMax-pdfYMin)/(histPoints+1);

$("#generate").click(() => {
    doUpdate();
});

function getParams() {
    mu = myParseFloat($("#mu").val());
    nu = myParseFloat($("#nu").val());
}

function grow(t) {
    return Math.exp(mu*t);
}

function generateTau() {
    return rng.exponential(nu);
}

function plot() {
    let hist, pdfX, pdfY, samples;
    // generate samples
    samples = Array.from({length:nSamples}, v => generateTau());
    // x stats
    hist = commonFunctions.makePdf(
        samples,
        pdfXMin,pdfXMax,histPoints,true);
    pdfX = commonFunctions.pdfModification(hist,false,
        pdfXMin,pdfXMax,pdfPoints,pdfXMin,histXStep);
    // y = grow(x) stats
    hist = commonFunctions.makePdf(
        samples.map(v => grow(v)),
        pdfYMin,pdfYMax,histPoints,true);
    pdfY = commonFunctions.pdfModification(hist,true,
        pdfYMin,pdfYMax,pdfPoints,pdfYMin,histYStep);
    // plot
    mainPlot.update(
        [commonFunctions.toOneDimensionalArray(pdfX,0).map(v => Math.log10(v)),
         commonFunctions.toOneDimensionalArray(pdfY,0),
        ],
        [commonFunctions.toOneDimensionalArray(pdfX,1).map(v => Math.log10(v)),
         commonFunctions.toOneDimensionalArray(pdfY,1),
        ],
        "lines",colors);
}

function doUpdate() {
    getParams();
    plot();
}

/* onLoad */
$(function () {
    doUpdate();
});
