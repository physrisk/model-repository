function myParseFloat(val) {return parseFloat((""+val).replace(",","."));}

let timeSeriesPlot=new plotlyPlot("timeSeries",["time (years)","lg-capital of #"]);
let talCapPlot=new plotlyPlot("talentCap",["talent","lg-capital"]);
let lucCapPlot=new plotlyPlot("luckCap",["relative luck","lg-capital"]);

let sqSize=5;

let model=null;

let chosenId=0;
let timeSeries=null;

let timeoutID=null;

let g;

function play() {
    model.step();
}

function plotFigures() {
    timeSeries.push([model.time,commonFunctions.LogBase10(model.cap[chosenId])]);
    timeSeriesPlot.update([commonFunctions.toOneDimensionalArray(timeSeries,0)],
                          [commonFunctions.toOneDimensionalArray(timeSeries,1)]);
    talCapPlot.update([model.talent],[model.cap.map(x => commonFunctions.LogBase10(x))],"markers");
    lucCapPlot.update([model.histLuck],[model.cap.map(x => commonFunctions.LogBase10(x))],"markers");
}

function plotField() {
    let i;
    g.fillStyle="rgb(200,200,200)";
    g.fillRect(0,0,model.size[0]*sqSize,model.size[1]*sqSize);
    for(i=0;i<model.nEvents;i+=1) {
        if(model.luck[i]) {
            g.fillStyle="rgb(62,150,81)";
        } else {
            g.fillStyle="rgb(204,37,41)";
        }
        g.fillRect(
            model.locEvent[i][0]*sqSize,
            model.locEvent[i][1]*sqSize,
            sqSize,sqSize
        );
    }
    for(i=0;i<model.nEvents;i+=1) {
        g.fillStyle="rgb(0,0,0)";
        g.fillRect(
            model.locAgent[i][0]*sqSize+1,
            model.locAgent[i][1]*sqSize+1,
            sqSize-2,sqSize-2
        );
    }
}

function setup() {
    g=$("#plotDiv")[0].getContext("2d");
    model=new talentModel(
        [50,40],
        parseInt($("#nAgents").val()),
        parseInt($("#nEvents").val()),
        myParseFloat($("#pLuck").val()),
        [myParseFloat($("#tAlpha").val()),
         myParseFloat($("#tBeta").val())]
    );
    chosenId=Math.floor(model.rng.uniform(0,model.nAgents));
    timeSeries=[[model.time,commonFunctions.LogBase10(model.cap[chosenId])]];
    plotFigures();
    plotField();
}

function frame() {
    play();
    plotFigures();
    plotField();
    if(timeoutID) {
        window.setTimeout(frame,100.0);
    }
}

function stopGame() {
    timeoutID=false;
}

function resumeGame() {
    timeoutID=true;
    window.setTimeout(frame,100.0);
}
