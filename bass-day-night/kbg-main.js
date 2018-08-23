function myParseFloat(val) {return parseFloat((""+val).replace(",","."));}

let totalCPlot=new plotlyPlot("totalC",["t (min)","N"]);
let newCPlot=new plotlyPlot("newC",["t (min)","ΔN"]);

let model=null;
let time=0;
let timeSeries=[0];
let oldCommenter=0;
let commenterSeries=[0];
let newCommenterSeries=[0];
let awakeSeries=[0];

let timeoutID=null;

function play() {
    time+=15;// model proceeds in 15 minute ticks
    let state=model.step();// iterate the model
    // update series
    timeSeries.push(time);
    commenterSeries.push(state[0]);
    newCommenterSeries.push(state[0]-oldCommenter);
    awakeSeries.push(state[1]+state[3]);
    // store current number of commenters
    oldCommenter=state[0];
}

function plotFigures() {
    let colors=["rgba(204,37,41,1)","rgba(57,106,177,1)"];
    if(timeSeries==null) {
        totalCPlot.update([[0]],[[0]],"lines",colors);
        newCPlot.update([[0]],[[0]],"lines",colors);
    } else {
        totalCPlot.update([timeSeries,timeSeries],[commenterSeries,awakeSeries],"lines",colors);
        newCPlot.update([timeSeries],[newCommenterSeries],"lines",colors[0]);
    }
}

function setup() {
    model=new kbgModel(
        parseInt($("#nAgents").val()),
        myParseFloat($("#sigma").val())/60,
        myParseFloat($("#herding").val())/60,
        myParseFloat($("#wakeupRate").val())/60,
        myParseFloat($("#sleepRate").val())/60,
        $("#wakeupFrom").val(),
        $("#sleepFrom").val()
    );
    time=0;
    timeSeries=[0];
    oldCommenter=0;
    commenterSeries=[0];
    newCommenterSeries=[0];
    awakeSeries=[0];
}

function frame() {
    play();
    plotFigures();
    if(model.totalAgents==model.commenters) {
        $("#stop").click();
    }
}

function stopGame() {
    window.clearInterval(timeoutID);
    timeoutID=null;
}

function resumeGame() {
    timeoutID=window.setInterval("frame()",30.0);
}
