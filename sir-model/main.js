function myParseFloat(val) {return parseFloat((""+val).replace(",","."));}

let infPlot=new plotlyPlot("infPlot",["time","currently infected"]);
let sickPlot=new plotlyPlot("sickPlot",["time","all sick"]);

let model=null;
let isolationFlag=false;
let runFlag=false;
let time=0;
let timeSeries=null;
let infSeries=null;
let sickSeries=null;

function plotFigures() {
    infPlot.update([timeSeries],[infSeries]);
    sickPlot.update([timeSeries],[sickSeries]);
}

function play() {
    time=time+1;
    model.step(time);
    timeSeries.push(time);
    infSeries.push(model.nInf);
    sickSeries.push(model.nSick);
    if(model.nInf==0 && runFlag) {
        $("#stop").click();
    }
}

function stop() {
    runFlag=false;
}

function resume() {
    setTimeout("frame()",30.0);
    runFlag=true;
}

function frame() {
    play();
    plotFigures();
    if(runFlag) {
        setTimeout("frame()",30.0);
    }
}

function setup() {
    isolationFlag=false;
    time=0;
    model=new sirModel(
        myParseFloat($("#beta0").val()),
        myParseFloat($("#beta1").val()),
        myParseFloat($("#gamma").val()),
        isolationFlag,
        parseInt($("#nAgents").val()),
        parseInt($("#nInf").val())
    );
    toggleIsolationBtn();
    runFlag=true;
    timeSeries=[];
    infSeries=[];
    sickSeries=[];
}

function toggleIsolation() {
    isolationFlag=!isolationFlag;
    model.isolation=isolationFlag;
    toggleIsolationBtn();
}

function toggleIsolationBtn() {
    if(isolationFlag) {
        $("#isolate").text("Socialize");
    } else {
        $("#isolate").text("Isolate");
    }
}

/* bind events and set initial states */
$("#stop").attr("disabled","disabled");
$("#restart").click(function () {
	setup();
    frame();
	$("#restart").attr("disabled","disabled");
	$("#stop").removeAttr("disabled").click();
});
$("#stop").toggle(function() {
	resume();
	$("#stop").text("Stop");
	$("#restart").attr("disabled","disabled");
},function() {
	stop();
	$("#stop").text("Continue");
	$("#restart").removeAttr("disabled");
});
$("#isolate").click(function () {
    toggleIsolation();
});

/* onLoad */
$(function () {
	setup();
    plotFigures();
});
