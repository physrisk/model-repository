function myParseFloat(val) {return parseFloat((""+val).replace(",","."));}

let sqSize=5;

let model=null;

let qLuckTal=null;
let qLuckCap=null;
let qTalCap=null;

let redistTax=0.1;
let redistFreq=1;
let redistMode=1;
let redistNext=redistFreq;

let chosenId=0;
let timeSeries=null;

let timeoutID=null;

let g;

function play() {
    model.step();
    if(model.time>=redistNext) {
        model.cap=redistribution(model.cap.slice(0),redistTax);
        redistNext+=redistFreq;
    }
}

function condQ1(v,lim) {
    return v>=lim[0];
}
function condQ2(v,lim) {
    return v<lim[0] && v>=lim[1];
}
function condQ3(v,lim) {
    return v<lim[1] && v>=lim[2];
}
function condQ4(v,lim) {
    return v<lim[2];
}

function getQTables() {
    let i,j,t,condFn,cond2Fn;
    let w=[Math.floor(0.25*model.nAgents),
           Math.floor(0.5*model.nAgents),
           Math.floor(0.75*model.nAgents)];
    let capQs=model.cap.slice(0).sort((a,b) => a-b);
    capQs=[capQs[w[2]],capQs[w[1]],capQs[w[0]]];
    let talQs=model.talent.slice(0).sort((a,b) => a-b);
    talQs=[talQs[w[2]],talQs[w[1]],talQs[w[0]]];
    let luckQs=model.histLuck.slice(0).sort((a,b) => a-b);
    luckQs=[luckQs[w[2]],luckQs[w[1]],luckQs[w[0]]];
    qLuckTal=[];
    for(i=0;i<4;i+=1) {
        if(i==0) condFn=condQ1;
        else if(i==1) condFn=condQ2;
        else if(i==2) condFn=condQ3;
        else condFn=condQ4;
        t=[];
        for(j=0;j<4;j+=1) {
            if(j==0) cond2Fn=condQ1;
            else if(j==1) cond2Fn=condQ2;
            else if(j==2) cond2Fn=condQ3;
            else cond2Fn=condQ4;
            t.push(model.histLuck.filter((v,j) => {
                return condFn(v,luckQs) && cond2Fn(model.talent[j],talQs);
            }).length);
        }
        qLuckTal.push(t);
    }
    qLuckCap=[];
    for(i=0;i<4;i+=1) {
        if(i==0) condFn=condQ1;
        else if(i==1) condFn=condQ2;
        else if(i==2) condFn=condQ3;
        else condFn=condQ4;
        t=[];
        for(j=0;j<4;j+=1) {
            if(j==0) cond2Fn=condQ1;
            else if(j==1) cond2Fn=condQ2;
            else if(j==2) cond2Fn=condQ3;
            else cond2Fn=condQ4;
            t.push(model.histLuck.filter((v,j) => {
                return condFn(v,luckQs) && cond2Fn(model.cap[j],capQs);
            }).length);
        }
        qLuckCap.push(t);
    }
    qTalCap=[];
    for(i=0;i<4;i+=1) {
        if(i==0) condFn=condQ1;
        else if(i==1) condFn=condQ2;
        else if(i==2) condFn=condQ3;
        else condFn=condQ4;
        t=[];
        for(j=0;j<4;j+=1) {
            if(j==0) cond2Fn=condQ1;
            else if(j==1) cond2Fn=condQ2;
            else if(j==2) cond2Fn=condQ3;
            else cond2Fn=condQ4;
            t.push(model.talent.filter((v,j) => {
                return condFn(v,talQs) && cond2Fn(model.cap[j],capQs);
            }).length);
        }
        qTalCap.push(t);
    }
}

function printQTable(table,id) {
    let i,j,cls1,cls2;
    for(i=0;i<4;i+=1) {
        cls1="q"+(i+1);
        for(j=0;j<4;j+=1) {
            cls2="q"+(j+1);
            $("#"+id+" ."+cls1+cls2).text((table[i][j]/model.nAgents*100).toFixed(1));
        }
    }
    for(i=0;i<4;i+=1) {
        cls1="q"+(i+1);
        cls2="q"+(i+1);
        $("#"+id+" ."+cls1+"qa").text(
            ((table[i][0]+table[i][1]+table[i][2]+table[i][3])/model.nAgents*100).toFixed(1));
        $("#"+id+" .qa"+cls2).text(
            ((table[0][i]+table[1][i]+table[2][i]+table[3][i])/model.nAgents*100).toFixed(1));
    }
}

function plotFigures() {
    getQTables();
    printQTable(qLuckTal,"qLuckTal");
    printQTable(qLuckCap,"qLuckCap");
    printQTable(qTalCap,"qTalCap");
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
    redistTax=myParseFloat($("#redistTax").val());
    redistFreq=myParseFloat($("#redistFreq").val());
    redistNext=redistFreq;
    redistMode=parseInt($("#redistMode").val());
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
