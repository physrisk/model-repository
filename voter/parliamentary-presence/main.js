function myParseFloat(val) {return parseFloat((""+val).replace(",","."));}

let fieldGraph=$("#plotDiv")[0].getContext("2d");
let sqSize=2; // square size in fieldGraph

let timeSeriesPlot=new plotlyPlot("timeSeries",["t","x(t)"]);
let stdSeriesPlot=new plotlyPlot("stdSeries",["lg[S⋅t]","lg[S⋅σ(t)]"]);

let model=null;
let timeArr=null
let lgTimeArr=null
let continueFlag=false;

function plotFigures() {
    // obtain cumulative attendance series for each of the agents 
    let series = model.history.reduce((c, v) => {
        return c.map((cv, idx) => {
            cv.push(cv[cv.length-1]+v[idx]);
            return cv;
        });
    }, Array.from(Array(model.nAgents), () => [0]));

    // calculate mean cumulative attendance at given times
    let mean = series.reduce((c,v) => {
        let i;
        for(i=0;i<c.length;i+=1) {
            c[i] = c[i] + v[timeArr[i]];
        }
        return c;
    }, Array.from(Array(timeArr.length), () => 0));
    mean = mean.map(v => v/model.nAgents);

    // calculate standard deviation of cumulative attendance
    let std = series.reduce((c,v) => {
        let i,d;
        for(i=0;i<c.length;i+=1) {
            d = (v[timeArr[i]]-mean[i])
            c[i] = c[i] + d*d;
        }
        return c;
    }, Array.from(Array(timeArr.length), () => 0));
    let n1 = Math.log10(model.nAgents-1);
    std = std.map(v => 0.5*(Math.log10(v)-n1));
    
    // keep series data only of three first agents at given times
    series = series.slice(-3);
    series = series.map(s => {
        return s.filter((v, idx) => timeArr.indexOf(idx)>-1);
    });

    // apply scaling on std data
    let scale = model.herd + model.sOn + model.sOff;
    let logScale = Math.log10(scale);
    let stdTheory = timeArr.map(v => Math.log10(0.66*scale*v/Math.sqrt(1.4+scale*v)));
    std = std.map(v => v + logScale);

    // plot the data
    timeSeriesPlot.update([timeArr], series);
    stdSeriesPlot.update([lgTimeArr.map(v => v + logScale)], [std, stdTheory],
        ["markers", "lines"],["#cc3333","#333333"]);
}

function plotField() {
    let i,j;
    for(i=0;i<model.nAgents;i+=1) {
        for(j=0;j<model.nSessions;j+=1) {
            if(model.history[j][i]==0) {
                fieldGraph.fillStyle="rgb(140,40,40)";
            } else {
                fieldGraph.fillStyle="rgb(60,150,80)";
            }
            fieldGraph.fillRect(j*sqSize,i*sqSize,sqSize,sqSize);
        }
    }
}

function setup() {
    let i;
    model = new AttendanceModel(
        parseInt($("#nSessions").val()),
        parseInt($("#nAgents").val()),
        myParseFloat($("#epsi0").val()),
        myParseFloat($("#epsi1").val()),
        Math.pow(10,myParseFloat($("#herd").val()))
    );
    for(i=0;i<model.nSessions;i+=1) {
        model.step();
    }
    timeArr = Array.from(Array(Math.floor(model.nSessions/5)), (v, idx) => 5*idx+1);
    lgTimeArr = timeArr.map(v => Math.log10(v));
}

function frame() {
    model.step();
    plotFigures();
    plotField();
    if(continueFlag) {
        window.setTimeout("frame()",30.0);
    } else {
        $("#restart, #stop").removeAttr("disabled");
    }
}

function stopGame() {
    continueFlag=false;
}

function resumeGame() {
    continueFlag=true;
    window.setTimeout("frame()",30.0);
}

/* bind events and set initial states */
$("#stop").attr("disabled","disabled");
$("#restart").click(function () {
	setup();
	$("#restart").attr("disabled","disabled");
	$("#stop").removeAttr("disabled").click();
});
$("#stop").toggle(function() {
	resumeGame();
	$("#stop").text("Stop");
	$("#restart").attr("disabled","disabled");
},function() {
	stopGame();
	$("#stop").text("Continue");
	$("#restart, #stop").attr("disabled","disabled");
});

/* onLoad */
$(function () {
	setup();
    plotFigures();
    plotField();
});
