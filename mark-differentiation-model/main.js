function myParseFloat(val) {return parseFloat((""+val).replace(",","."));}

let timeSeriesPlot=new plotlyPlot("timeSeries",["t","G(t), S(t)"]);

let nAgents=50;
let sqSize=5;

let model=null;
let time=0;
let timeTick=0.1;
let timeSeries=null;
let groupSeries=null;
let maxSeries=null;

let timeoutID=null;

let g;

function play() {
    let detect;
    model.step(timeTick);
    model.clearFacts();
    time+=timeTick;
    timeSeries.push(time);
    detect=detectGroups();
    groupSeries.push(detect["unique"].length);
    maxSeries.push(detect["maxSize"]);
}

function plotFigures() {
    timeSeriesPlot.update([timeSeries,timeSeries],[groupSeries,maxSeries]);
    plotField();
}

function plotField() {
    let i,j,c;
    for(i=0;i<nAgents;i+=1) {
        for(j=0;j<nAgents;j+=1) {
            c=Math.min(Math.floor(-26*Math.log(model.interactionT[i][j])),255);
            g.fillStyle="rgb("+c+","+c+","+c+")";
            g.fillRect(j*sqSize,i*sqSize,sqSize,sqSize);
        }
    }
}

function detectGroups() {
    let i,j,group,ugroup,uid,change,sizes,s;
    group=[];
    ugroup=[];
    for(i=0;i<nAgents;i+=1) {
        group.push(i);
        ugroup.push(i);
    }
    for(i=0;i<nAgents;i+=1) {
        for(j=i+1;j<nAgents;j+=1) {
            if(model.interactionT[i][j]>0) {
                if(group[j]!=group[i]) {
                    uid=ugroup.indexOf(group[j]);
                    if(uid>-1) {
                        ugroup.splice(uid,1);
                    }
                    change=group[j];
                    uid=group.indexOf(change);
                    while(uid>-1) {
                        group[uid]=group[i];
                        uid=group.indexOf(change);
                    }
                }
            }
        }
    }
    sizes=[];
    for(i=0;i<ugroup.length;i+=1) {
        s=0;
        for(j=0;j<group.length;j+=1) {
            if(group[j]==ugroup[i]) {
                s+=1;
            }
        }
        sizes.push(s);
    }
    return {
        "groupIds": group,
        "unique": ugroup,
        "sizes": sizes,
        "maxSize": Math.max.apply(null,sizes),
    };
}

function seriesSetup() {
    time=0;
    timeSeries=[];
    groupSeries=[];
    maxSeries=[];
}

function setup() {
    g=$("#plotDiv")[0].getContext("2d");
    model=new MarkModel(nAgents,myParseFloat($("#lambda").val()));
    seriesSetup();
}

function frame() {
    play();
    plotFigures();
}

function stopGame() {
    window.clearInterval(timeoutID);
    timeoutID=null;
}

function resumeGame() {
    timeoutID=window.setInterval("frame()",100.0);
}
