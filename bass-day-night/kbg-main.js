function myParseFloat(val) {return parseFloat((""+val).replace(",","."));}

let totalCPlot=new plotlyPlot("totalC",["t (min)","N"]);
let newCPlot=new plotlyPlot("newC",["t (min)","ΔN"]);

let model=null;
let time=0;
let timeSeries=[0];
let oldCustomer=0;
let customerSeries=[0];
let newCustomerSeries=[0];
let awakeSeries=[0];

let timeoutID=null;

function play() {
    let i, price, ret;
    time+=15;
    let state=model.step();

    timeSeries.push(time);
    customerSeries.push(state[0]);
    newCustomerSeries.push(state[0]-oldCustomer);
    awakeSeries.push(state[1]+state[3]);
    
    oldCustomer=state[0];
}

function plotFigures() {
    let colors=["rgba(204,37,41,1)","rgba(57,106,177,1)"];
    if(timeSeries==null) {
        totalCPlot.update([[0]],[[0]],"lines",colors);
        newCPlot.update([[0]],[[0]],"lines",colors);
    } else {
        totalCPlot.update([timeSeries,timeSeries],[customerSeries,awakeSeries],"lines",colors);
        newCPlot.update([timeSeries],[newCustomerSeries],"lines",colors[0]);
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
    oldCustomer=0;
    customerSeries=[0];
    newCustomerSeries=[0];
    awakeSeries=[0];
}

function frame() {
    play();
    plotFigures();
    if(model.totalAgents==model.customers) {
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
