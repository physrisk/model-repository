var field;
var g;
var desiredStep=0.1;
var minTimeStep=30;
var timeStep=300;
var alpha=0.25;
$("#inpA").val(alpha);
var critCells=[];
var run=false;
var t=0;
var timeSeries=[];
var pdf=[];
var quakes=0;

function myParseFloat(val) {
    return parseFloat((""+val).replace(",","."));
}

function initialize() {
    var i;
    alpha=myParseFloat($("#inpA").val());
    g=$("#plotDiv")[0].getContext("2d");
    field=[];
    pdf=[];
    for(i=0;i<80;i+=1) {
        var tf=[];
        for(var j=0;j<50;j+=1) {
            tf.push(Math.random());
        }
        field.push(tf);
    }
    pdf=[];
    for(i=0;i<50;i+=1) {
        pdf.push([i,0]);
    }
    timeSeries=[];
    quakes=0;
    t=0;
    critCells=[];
    plotField();
    plotFigures();
}

function plotField() {
    var d=Math.round(480/field.length);
    for(var i=0;i<field.length;i+=1) {
        for(var j=0;j<field.length;j+=1) {
            var color=Math.floor(210*field[i][j])+45;
            var color2=Math.floor(150*field[i][j])+45;
            if(field[i][j]<1) g.fillStyle="rgb("+color+","+color2+","+color2+")";
            else g.fillStyle="rgb(255,0,0)";
            g.fillRect(i*d,j*d,d,d);
        }
    }
}

function step() {
    var i,j,inArray;
    var max=-1;
    var newCritCells=[];
    for(i=0;i<field.length && max<1;i+=1) {
        for(j=0;j<field.length && max<1;j+=1) {
            if(max<field[i][j]) max=field[i][j];
        }
    }
    var ofcStep=1-max;
    var usedStep=Math.max(Math.min(ofcStep,desiredStep),0);
    var usedTimeStep=minTimeStep+usedStep*(timeStep-minTimeStep)/desiredStep;
    if(ofcStep>0) {
        for(i=0;i<field.length;i+=1) {
            for(j=0;j<field.length;j+=1) {
                field[i][j]+=usedStep;
            }
        }
        t+=(ofcStep*100);
    }
    for(i=0;i<field.length;i+=1) {
        for(j=0;j<field.length;j+=1) {
            if(field[i][j]>=1) {
                inArray=critCells.findIndex(function(e,ind,arr){return e[0]==i && e[1]==j;});
                if(inArray==-1) newCritCells.push([i,j]);
            }
        }
    }
    if(newCritCells.length>0) {
        var newCrit=getAllNeighbors4(newCritCells);
        for(i=0;i<newCrit.length;i+=1) {
            field[newCrit[i][0]][newCrit[i][1]]+=(alpha*field[newCrit[i][2][0]][newCrit[i][2][1]]);
        }
        var appCrit=[];
        for(i=0;i<newCrit.length;i+=1) {
            if(field[newCrit[i][0]][newCrit[i][1]]>=1) {
                if(appCrit.length==0) appCrit.push([newCrit[i][0],newCrit[i][1]]);
                else {
                    var trez=newCrit[i];
                    inArray=appCrit.findIndex(function(e,i,a){return e[0]==trez[0] && e[1]==trez[1];});
                    if(inArray==-1) appCrit.push([trez[0],trez[1]]);
                }
            }
        }
        critCells=critCells.concat(newCritCells);
    } else {
        timeSeries.push([t,0]);
        timeSeries.push([t,critCells.length]);
        timeSeries.push([t,0]);
        if(critCells.length<pdf.length) {
            pdf[critCells.length][1]+=1;
            quakes+=1;
        }
        if(timeSeries.length>100) timeSeries.splice(0,3);
        plotFigures();
        for(i=0;i<critCells.length;i+=1) {
            field[critCells[i][0]][critCells[i][1]]=0;
        }
        critCells=[];
    }
    return usedTimeStep;
}

function plotFigures() {
    $.plot($("#timeDiv"),[{data:timeSeries,color:"red"}],{yaxis:{axisLabel:"M(t)"},xaxis:{axisLabel:"t"}});
    var outDist=[];
    var matlog10=Math.log(10);
    var norm=Math.log(quakes)/matlog10;
    for(var i=0;i<pdf.length;i+=1) {
        if(pdf[i][1]>0) outDist.push([Math.log(i+1)/matlog10,Math.log(pdf[i][1])/matlog10-norm]);
    }
    $.plot($("#pdfDiv"),[{data:outDist,color:"red"}],{yaxis:{axisLabel:"lg[p(M)]"},xaxis:{axisLabel:"lg[M]"}});
}

function getAllNeighbors4(v) {
    var neigh=[];
    for(var i=0;i<v.length;i+=1) {
        var dirs=[1,3,5,7];
        for(var k=0;k<dirs.length;k+=1) {
            var trez=getSingleNeighbor(v[i],dirs[k]);
            trez.push(v[i]);
            if(!(trez===false)) {
                var inArray=v.findIndex(function(e,i,a){return e[0]==trez[0] && e[1]==trez[1];});
                if(inArray==-1) neigh.push(trez);
            }
        }
    }
    return neigh;
}

function getSingleNeighbor(o,d) {
    if(d==4) return false;
    moves=[o[0]+Math.floor(d/3)-1,o[1]+(d % 3)-1];
    if(moves[0]<0 || field.length<=moves[0]) {
        moves[0]=(moves[0]+field.length) % field.length;
    }
    if(moves[1]<0 || field[moves[0]].length<=moves[1]) {
        moves[1]=(moves[1]+field[moves[0]].length) % field[moves[0]].length;
    }
    return moves;
}

function play() {
    var t=step();
    plotField();
    if(run) window.setTimeout("play()",t);
}
