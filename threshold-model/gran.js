/*options and settings*/
var plotDiv="#plotDiv";
var figureDiv="#figDiv";
var histDiv="#histDiv";
var g; /*drawing context*/
var histG; /*drawing context*/
var time=0; /*time ticker*/
var timeoutID=null; /*timer id*/
var field=new Array(); /* array with agent types*/
var fieldState=new Array(); /* array with agent states*/
var fieldL=40; /* dimension of "auditorium" */
var fieldSq=1; /* agents in "auditorium" */
var fieldPx=5; /* pixels to represent agent (square's side length in px) */
var thresholds=new Array(); /* array holding thresholds for distinct agent types */
var typeProb=new Array(); /* array holding probabilities to have an agent of certain type */
var typeColorsPassive=['rgb(100,40,40)','rgb(40,100,40)','rgb(40,100,100)','rgb(100,40,100)','rgb(100,100,40)']
var typeColorsActive=['rgb(255,40,40)','rgb(40,255,40)','rgb(40,255,255)','rgb(255,40,255)','rgb(255,255,40)']
var arrProtesters=new Array(); /* history of protest*/
var curProtesters=0;
var histJoined=new Array(); /* last joined agent types */
$(figureDiv).data('plotOptions', {yaxis:{tickDecimals:2,min:0,max:1}});

function myParseFloat(val) {
	return parseFloat((""+val).replace(",","."));
}

function getParameterValues() {
    time=0;
    curProtesters=0;
    arrProtesters=[[0,0]];
	fieldL=parseInt($('#controlSize').val());
    /* pre-calculate some often used values */
    fieldSq=fieldL*fieldL;
    fieldPx=parseInt(Math.floor(200/fieldL))
    /* pre-calc end */
    typeProb=new Array();
    thresholds=new Array();
    var probSum=0;
    for(var i=0;i<typeColorsPassive.length;i++) {
        typeProb.push(myParseFloat($('#controlP'+i).val()))
        probSum+=typeProb[i];
        thresholds.push(parseInt(myParseFloat($('#controlT'+i).val())*fieldSq))
    }
    for(var i=0;i<typeColorsPassive.length;i++) {
        if(probSum!=1) {
            typeProb[i]/=probSum;
            $('#controlP'+i).val(typeProb[i]);
        }
        if(thresholds[i]>=fieldSq) {
            thresholds[i]=fieldSq;
            $('#controlT'+i).val(1);
        }
    }
    populateField();
    drawField();
    plotFigure();
}

function initialize() {
	g=$(plotDiv)[0].getContext('2d');
	histG=$(histDiv)[0].getContext('2d');
	window.clearInterval(timeoutID);
	timeoutID=null;
}

function populateField() {
	field=new Array();
	fieldState=new Array();
    var cumProb=new Array();
    var sum=0;
    for(var i=0;i<typeProb.length;i++) {
        sum+=typeProb[i];
        cumProb.push(sum);
    }
	for(var i=0;i<fieldL;i++) {
		var tfield=new Array();
		var tsfield=new Array();
		for(var j=0;j<fieldL;j++) {
            var tr=Math.random();
            for(var k=0;k<cumProb.length;k++) {
                if(tr<cumProb[k]) break;
            }
            tfield.push(k);
            tsfield.push(0);
		}
		field.push(tfield);
        fieldState.push(tsfield);
	}
    histJoined=new Array();
    for(var i=0;i<80;i++) histJoined.push(-1);
}

function drawField() {
	for(var i=0;i<fieldL;i++) {
		for(var j=0;j<fieldL;j++) {
            if(fieldState[i][j]==0) g.fillStyle=typeColorsPassive[field[i][j]];
            else g.fillStyle=typeColorsActive[field[i][j]];
			g.fillRect(i*fieldPx,j*fieldPx,fieldPx,fieldPx);
		}
	}
    drawHistory();
}

function drawHistory() {
    for(var i=0;i<80;i++) {
        if(histJoined[i]<0) histG.fillStyle='rgb(255,255,255)';
        else histG.fillStyle=typeColorsActive[histJoined[i]];
        histG.fillRect(i*5,0,5,5);
    }
}

function iteration() {
    var i=parseInt(Math.floor(Math.random()*fieldL));
    var j=parseInt(Math.floor(Math.random()*fieldL));
    if(fieldState[i][j]==0 && thresholds[field[i][j]]<=curProtesters) {
        fieldState[i][j]=1;
        curProtesters++;
        histJoined.push(field[i][j]);
        histJoined=histJoined.slice(1);
    }
}

function plotFigure() {
	$.plot($(figureDiv),[{data:arrProtesters,color:"black"}],$(figureDiv).data('plotOptions'));
}

function startGame() {
	initialize();
    getParameterValues();
	$("#resume").click();
}

function nextFrame() {
    time+=1;
    for(var i=0;i<0.1*fieldSq;i++) iteration();
    arrProtesters.push([time,curProtesters/fieldSq]);
	drawField();
	plotFigure();
    if(curProtesters==fieldSq) $('#resume').click();
}

/*main*/
$(function () {
	initialize();
    getParameterValues();
	$("#start").click(function(){startGame();});
	$("#resume").toggle(function(){resumeGame();},function(){stopGame();});
    for(var i=0;i<typeColorsActive.length;i++) {
        $('#controlP'+i+', #controlT'+i).css('background-color',typeColorsActive[i]);
    }
    $('#controlT0').css('background-color',typeColorsPassive[0]).css('color','white');
});
