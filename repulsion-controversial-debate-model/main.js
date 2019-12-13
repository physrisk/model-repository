/* declare globals */
let worker=null;

let seriesPlot=null;

let timeArr=[];
let yesArr=[];
let doubtArr=[];
let noArr=[];

let timeout=100; // ms
let showPoints=300;

/* declare functions */
function myParseFloat(val) {
    return parseFloat((""+val).replace(",","."));
}

function setup() {
    let nAgents, convince, doubt, repel;
    timeArr=[];
    yesArr=[];
    doubtArr=[];
    noArr=[];
    nAgents=myParseFloat($("#nAgents").val());
    convince=myParseFloat($("#pcon").val());
    doubt=myParseFloat($("#pdoubt").val());
    repel=myParseFloat($("#prepel").val());
    worker.postMessage({
        "action": "setup",
        "convince": convince,
        "doubt": doubt,
        "repel": repel,
        "timeout": timeout,
    });
}

function updateData(d) {
    timeArr.push(d[0]);
    yesArr.push(d[1]);
    doubtArr.push(d[2]);
    noArr.push(d[3]);
    if(timeArr.length>showPoints) {
        timeArr.splice(0,1);
        yesArr.splice(0,1);
        doubtArr.splice(0,1);
        noArr.splice(0,1);
    }
}

function updatePlots(d=null) {
    if(d===null) {
        seriesPlot.reset();
        return ;
    }
    updateData(d);
    seriesPlot.update(
        [timeArr,timeArr,timeArr],
        [yesArr,noArr,doubtArr],
        "lines",
        ["rgb(57,106,177)","rgb(204,37,41)","rgb(83,81,84)"]
    );
}

function resume() {
    worker.postMessage({
        "action": "resume",
    });
}

function pause() {
    worker.postMessage({
        "action": "pause",
    });
}

function step() {
    worker.postMessage({
        "action": "step",
    });
}

function getMessage(msg) {
    if(msg.reply===false) {
        console.error("Worker has failed to deal with requested action \""+msg.action+"\"");
    } else {
        if(msg.action=="update") {
            updatePlots(msg.data);
        }
    }
}

/* setup UI events */
$("#setup").click(function () {
    setup();
    updatePlots();
});
$("#step").click(function () {
    step();
});
$("#stop").toggle(function() {
    resume();
    $("#stop").text("Stop");
    $("#setup, #step").attr("disabled","disabled");
},function() {
    pause();
    $("#stop").text("Continue");
    $("#setup, #step").removeAttr("disabled");
});

/* on load */
$(function () {
    /* setup UI state */
    seriesPlot=new plotlyPlot("timeSeries",["t","fraction"]);

    /* create worker */
    if(typeof Worker === "undefined") {
        $("body").empty().css("background-color","#999999");
        $("<p/>").text("Your browser does not support HTML5 Web Worker technology!").appendTo("body");
    } else {
        worker=new Worker("worker.js");
        worker.addEventListener("message",(e) => getMessage(e.data), false);
        setup();
        updatePlots();
    }
});
