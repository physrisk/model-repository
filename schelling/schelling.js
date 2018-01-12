var g;
var time=0;
var happy=2;
var timeoutID=null;
var field=new Array();
var fieldL=100;
var fieldPx=2;
var interactions=1000;
var probEmpty=0.2;
var probRed=0.5;
var numberOfHappy=0;
var fractionOfHappy=0;
var arrHappy=new Array();
var arrSimilarity=new Array();
var emptyCoords=new Array();
$('#happyDiv').data('plotOptions', {yaxis:{tickDecimals:2, max:1, min:0}});

function initialize() {
	getParameterValues();
	g=$("#plotDiv")[0].getContext('2d');
	time=0;
	arrHappy=[];
	arrSimilarity=[];
	window.clearInterval(timeoutID);
	timeoutID=null;
	emptyCoords=[];
	populateField();
	drawField();
	plotFigure();
	if(emptyCoords.length==0) manualStop();
}

function getParameterValues() {
	happy=Math.min(Math.max(myParseFloat($('#controlHappy').val()),0),1);
	probEmpty=Math.min(Math.max(myParseFloat($('#controlEmpty').val()),0.01),0.99);
	probRed=Math.min(Math.max(myParseFloat($('#controlProb').val()),0.01),0.99);
	$('#controlHappy').val(happy);
	$('#controlEmpty').val(probEmpty);
	$('#controlProb').val(probRed);
}

function myParseFloat(val) {
	return parseFloat((""+val).replace(",","."));
}

function iteration() {
	time++;
	for(var i=0;i<interactions;i++) {
		var x=Math.floor(Math.random()*fieldL);
		var y=Math.floor(Math.random()*fieldL);
		if(getSpin(x,y)!=0) {
			if(!happySpin(x,y)) relocateSpin(x,y);
		} else {
			i--;
		}
	}
	return ;
}

function populateField() {
	field=new Array();
	for(var i=0;i<fieldL;i++) {
		var tfield=new Array();
		for(var j=0;j<fieldL;j++) {
			if(Math.random()<probEmpty) {
				tfield.push(0);
				emptyCoords.push([i,j]);
			} else if(Math.random()>probRed) tfield.push(-1);
			else tfield.push(1);
		}
		field.push(tfield);
	}
}
function drawField() {
	numberOfHappy=0;
	var meanSimilarity=0;
	for(var i=0;i<fieldL;i++) {
		for(var j=0;j<fieldL;j++) {
			if(field[i][j]==1) g.fillStyle="rgb(255,0,0)";
			else if(field[i][j]==-1) g.fillStyle="rgb(0,0,255)";
			else g.fillStyle="rgb(255,255,255)";
			if(getSpin(i,j)!=0 && happySpin(i,j)) numberOfHappy++;
			if(getSpin(i,j)!=0) meanSimilarity+=similaritySpin(i,j);
			g.fillRect(i*fieldPx,j*fieldPx,fieldPx,fieldPx);
		}
	}
	var totalCells=fieldL*fieldL-emptyCoords.length;
	fractionOfHappy=numberOfHappy/(totalCells);
	meanSimilarity/=(totalCells);
	arrHappy.push([time,fractionOfHappy]);
	arrSimilarity.push([time,meanSimilarity]);
	if(arrHappy.length>300) {
		arrHappy.splice(0,1);
		arrSimilarity.splice(0,1);
	}
	if(numberOfHappy==totalCells) manualStop();
}

function getSpin(x,y) {
	return field[(fieldL+x)%fieldL][(fieldL+y)%fieldL];
}
function setSpin(x,y,v) {
	field[(fieldL+x)%fieldL][(fieldL+y)%fieldL]=v;
}
function happySpin(x,y) {
	return similaritySpin(x,y)>=happy;
}
function similaritySpin(x,y) {
	var similarSpins=0;
	var otherSpins=0;
	var curSpin=getSpin(x,y);
	if(getSpin(x-1,y)==curSpin) similarSpins++;
	else if(!(getSpin(x-1,y)==0)) otherSpins++;
	if(getSpin(x+1,y)==curSpin) similarSpins++;
	else if(!(getSpin(x+1,y)==0)) otherSpins++;
	if(getSpin(x,y-1)==curSpin) similarSpins++;
	else if(!(getSpin(x,y-1)==0)) otherSpins++;
	if(getSpin(x,y+1)==curSpin) similarSpins++;
	else if(!(getSpin(x,y+1)==0)) otherSpins++;
	if(similarSpins+otherSpins==0) return 1;
	return similarSpins/(similarSpins+otherSpins);
}
function relocateSpin(x,y) {
	var newDestId=Math.floor(Math.random()*emptyCoords.length);
	setSpin(emptyCoords[newDestId][0],emptyCoords[newDestId][1],getSpin(x,y));
	setSpin(x,y,0);
	emptyCoords[newDestId][0]=x;
	emptyCoords[newDestId][1]=y;
}

function singleFrame() {
	iteration();
	drawField();
	plotFigure();
}

function plotFigure() {
	$.plot($("#happyDiv"),[{data:arrHappy, color:"red"},{data:arrSimilarity, color:"blue"}],$('#happyDiv').data('plotOptions'));
}

/*main*/
$(function () {
	initialize();
	plotFigure();
	$("#start").click(function(){startGame();});
	$("#resume").toggle(function(){resumeGame();},function(){stopGame();});
});