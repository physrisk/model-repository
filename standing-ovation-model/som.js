/*options and settings*/
var plotDiv="#plotDiv";
var figureDiv="#figDiv";
var g; /*drawing context*/
var time=0; /*time ticker*/
var timeoutID=null; /*timer id*/
var field=new Array(); /* array with agent states*/
var fieldOpinion=new Array(); /* array with opinions */
var fieldL=40; /* dimension of "auditorium" */
var fieldSq=1; /* agents in "auditorium" */
var fieldPx=5; /* pixels to represent agent (square"s side length in px) */
var arrStanding=new Array(); /* previous history of standing agents*/
var arrAkward=new Array(); /* previous history of akward agents */
var performanceStandard=0.5; /* performance standard required to stand up */
var visionRadius=1; /* defines how far the cone extends*/
var visionN=1; /* how many agents are seen*/
$(figureDiv).data("plotOptions", {yaxis:{tickDecimals:2,min:0,max:1}});

function myParseFloat(val) {
    return parseFloat((""+val).replace(",","."));
}

function getParameterValues() {
    time=0;
    performanceStandard=myParseFloat($("#controlStandard").val());
    visionRadius=parseInt($("#controlRadius").val());
    fieldL=parseInt($("#controlSize").val());
    if(visionRadius>=fieldL) {
        visionRadius=fieldL-1;
        $("#controlRadius").val(visionRadius);
    }
    if(performanceStandard<=0 || performanceStandard>=1) {
        performanceStandard=0.5;
        $("#controlStandard").val(performanceStandard);
    }
    /* pre-calculate some often used values */
    fieldSq=fieldL*fieldL;
    fieldPx=parseInt(Math.floor(200/fieldL));
    visionN=2+2*visionRadius+visionRadius*visionRadius;
    /* pre-calc end */
    populateField();
    drawField();
    plotFigure();
}

function initialize() {
    g=$(plotDiv)[0].getContext("2d");
    window.clearInterval(timeoutID);
    timeoutID=null;
    getParameterValues();
}

function populateField() {
    arrStanding=new Array();
    arrAkward=new Array();
    field=new Array();
    fieldOpinion=new Array();
    for(var i=0;i<fieldL;i+=1) {
        var tfield=new Array();
        var tofield=new Array();
        for(var j=0;j<fieldL;j+=1) {
            var tr=Math.random();
            tofield.push(tr);
            if(tr>performanceStandard) tfield.push(1);
            else tfield.push(0);
        }
        field.push(tfield);
        fieldOpinion.push(tofield);
    }
}

function drawField() {
    for(var i=0;i<fieldL;i+=1) {
        for(var j=0;j<fieldL;j+=1) {
            if(field[i][j]==1) g.fillStyle="rgb(34,"+parseInt(180*fieldOpinion[i][j]+50)+",34)";
            else g.fillStyle="rgb("+parseInt(180*fieldOpinion[i][j]+50)+",34,34)";
            g.fillRect(i*fieldPx,j*fieldPx,fieldPx,fieldPx);
        }
    }
    updateStatistics();
}

function updateStatistics() {
    var curStanding=0;
    var curAkward=0;
    var nfield=new Array();
    for(var i=0;i<fieldL;i+=1) {
        var tnfield=new Array();
        for(var j=0;j<fieldL;j+=1) {
            if(field[i][j]==1) curStanding+=1;
            if(isAkward(i,j)) {
                curAkward+=1;
                if(field[i][j]==1) tnfield.push(0);
                else tnfield.push(1);
            } else tnfield.push(field[i][j]);
        }
        nfield.push(tnfield);
    }
    field=nfield;
    arrStanding.push([time,curStanding/fieldSq]);
    arrAkward.push([time,curAkward/fieldSq]);
    if(curAkward==0) $("#resume").click();
}

function isAkward(x,y) {
    var ratio=getAkwardRatio(x,y);
    return (ratio>0.5 && field[x][y]==0) || (ratio<0.5 && field[x][y]==1);
}

function getAkwardRatio(x,y) {
    var r=visionRadius;
    var tmp=0;
    for(var j=y-r;j<=y;j+=1) {
        var tr=Math.max(y-j,1);
        for(var i=x-tr;i<=x+tr;i+=1) {
            var ii=(i+fieldL)%fieldL;
            var jj=(j+fieldL)%fieldL;
            if(!(ii==x && jj==y)) tmp+=field[ii][jj];
        }
    }
    return tmp/visionN;
}

function plotFigure() {
    $.plot($(figureDiv),[{data:arrStanding,color:"green"},{data:arrAkward,color:"black"}],$(figureDiv).data("plotOptions"));
}

function startGame() {
    initialize();
    $("#resume").click();
}

function nextFrame() {
    time+=1;
    drawField();
    plotFigure();
}

/*main*/
$(function () {
    initialize();
    $("#start").click(function(){startGame();});
    $("#resume").toggle(function(){resumeGame();},function(){stopGame();});
});
