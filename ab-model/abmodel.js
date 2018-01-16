/*options and settings*/
var figureDiv="#figDiv";
var g;
var time=0;
var nA=0;
var nB=0;
var timeoutID=null;
var arrA=new Array();
var arrB=new Array();
var arrAB=new Array();
var field=new Array();
var fieldL=50;
var fieldPx=4;
var fieldSq=fieldL*fieldL;
$(figureDiv).data("plotOptions",{yaxis:{tickDecimals:2,min:0,max:1}});

function myParseFloat(val) {
    return parseFloat((""+val).replace(",","."));
}

function initialize() {
    g=$("#plotDiv")[0].getContext("2d");
    time=0;
    window.clearInterval(timeoutID);
    timeoutID=null;
    var rhoa=myParseFloat($("#rhoa").val());
    var rhob=myParseFloat($("#rhob").val());
    if(rhoa<0) rhoa=0;
    if(rhob<0) rhob=0;
    if(rhoa+rhob>1) {
        rhoa=rhoa/(rhoa+rhob);
        rhob=rhob/(rhoa+rhob);
    }
    $("#rhoa").val(rhoa);
    $("#rhob").val(rhob);
    populateField(rhoa,rhob);
    drawField();
    plotFigure();
    arrA=[[time,nA/fieldSq]];
    arrB=[[time,nB/fieldSq]];
    arrAB=[[time,1-(nA+nB)/fieldSq]];
}

function plotFigure() {
    $.plot($(figureDiv),[{data:arrA,color:"#ff0000"},{data:arrB,color:"#0000ff"},{data:arrAB,color:"#ff00ff"}],$(figureDiv).data("plotOptions"));
}

function startGame() {
    initialize();
    $("#resume").click();
}

function iteracija() {
    if(nA==0 || nB==0) return;
    time++;
    for(var i=0;i<fieldSq;i++) {
        var x=Math.floor(Math.random()*fieldL);
        var y=Math.floor(Math.random()*fieldL);
        var neighborhood=getNeighborhood(x,y);
        if(getSpin(x,y)==0) {
            var pB=0.5*(1-neighborhood[0]);
            var pA=0.5*(1-neighborhood[1]);
            var r=Math.random();
            if(r<pB) {
                setSpin(x,y,-1);
                nB++;
            } else if(r<pB+pA) {
                setSpin(x,y,1);
                nA++;
            }
        } else {
            var pAB=0.5;
            if(getSpin(x,y)==1) pAB*=neighborhood[1];
            else pAB*=neighborhood[0];
            if(Math.random()<pAB) {
                if(getSpin(x,y)==1) nA--;
                else nB--;
                setSpin(x,y,0);
            }
        }
    }
    arrA.push([time,nA/fieldSq]);
    arrB.push([time,nB/fieldSq]);
    arrAB.push([time,1-(nA+nB)/fieldSq]);
    return ;
}

function populateField(ra,rb) {
    nA=0;
    nB=0;
    field=new Array();
    for(var i=0;i<fieldL;i++) {
        var tfield=new Array();
        for(var j=0;j<fieldL;j++) {
            var r=Math.random();
            if(r<ra) {
                tfield.push(1);
                nA++;
            } else if(r<1-rb) tfield.push(0);
            else {
                tfield.push(-1);
                nB++;
            }
        }
        field.push(tfield);
    }
}
function drawField() {
    for(var i=0;i<fieldL;i++) {
        for(var j=0;j<fieldL;j++) {
            if(getSpin(i,j)==1) g.fillStyle="rgb(255,0,0)";
            else if(getSpin(i,j)==0) g.fillStyle="rgb(255,0,255)";
            else g.fillStyle="rgb(0,0,255)";
            g.fillRect(i*fieldPx,j*fieldPx,fieldPx,fieldPx);
        }
    }
}

function getSpin(x,y) {
    return field[(fieldL+x)%fieldL][(fieldL+y)%fieldL];
}
function getNeighborhood(x,y) {
    var sigmaA=0;
    var sigmaB=0;
    if(getSpin(x+1,y)==1) sigmaA++;
    else if(getSpin(x+1,y)==-1) sigmaB++;
    if(getSpin(x-1,y)==1) sigmaA++;
    else if(getSpin(x-1,y)==-1) sigmaB++;
    if(getSpin(x,y+1)==1) sigmaA++;
    else if(getSpin(x,y+1)==-1) sigmaB++;
    if(getSpin(x,y-1)==1) sigmaA++;
    else if(getSpin(x,y-1)==-1) sigmaB++;
    return [sigmaA/4,sigmaB/4];
}
function setSpin(x,y,v) {
    field[(fieldL+x)%fieldL][(fieldL+y)%fieldL]=v;
}

function kadras() {
    iteracija();
    drawField();
    plotFigure();
}

/*main*/
$(function () {
    initialize();
    $("#start").click(function(){startGame();});
    $("#fastf").click(function(){fastForward();});
    $("#resume").toggle(function(){resumeGame();},function(){stopGame();});
});
