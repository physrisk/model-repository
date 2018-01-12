var g;
var time=0;
var timeoutID=null;
var field=new Array();
var fieldL=50;
var interactions=100;
var pauseSec=20;
var probRed=0.5;
var numberOfHappy=0;
var fractionOfHappy=0;
var twoDim=false;
var arrHappy=new Array();
var trajectory1D=[]
$('#happyDiv').data('plotOptions', {yaxis:{tickDecimals:2, max:1, min:-1}});

function initialize() {
	formulateTrajectory();
	getParameterValues();
	g=$("#plotDiv")[0].getContext('2d');
	time=0;
	arrHappy=[];
	window.clearInterval(timeoutID);
	timeoutID=null;
	populateField();
	drawField();
	plotFigure();
}

function getParameterValues() {
	twoDim=(parseInt($('#controlDim').val())==2);
	probRed=Math.min(Math.max(myParseFloat($('#controlProb').val()),0.01),0.99);
	$('#controlProb').val(probRed);
}

function myParseFloat(val) {
	return parseFloat((""+val).replace(",","."));
}

function iteration() {
	time++;
	for(var i=0;i<interactions;i++) {
		if(twoDim) {
			var x=Math.floor(Math.random()*fieldL);
			var y=Math.floor(Math.random()*fieldL);
			var dx=Math.floor(3*Math.random())-1;
			var dy=Math.floor(3*Math.random())-1;
			if((dx==0 && dy==0)) i--;
			else {
				setSpin(x,y,getSpin(x+dx,y+dy));
			}
		} else {
			var rpos=Math.floor(Math.random()*trajectory1D.length);
			var x=trajectory1D[rpos][0];
			var y=trajectory1D[rpos][1];
			var dr=1;
			if(Math.random()<0.5) dr=-dr;
			if(getSpin(x+dr,y)!=0) setSpin(x,y,getSpin(x+dr,y));
			else if(getSpin(x,y+dr)!=0) setSpin(x,y,getSpin(x,y+dr));
			else i--;
		}
	}
	return ;
}

function populateField() {
	field=new Array();
	for(var i=0;i<fieldL;i++) {
		var tfield=new Array();
		for(var j=0;j<fieldL;j++) {
			if(twoDim || trajectory(i,j)) {
				if(Math.random()>probRed) tfield.push(-1);
				else tfield.push(1);
			} else {
				tfield.push(0);
			}
		}
		field.push(tfield);
	}
}
function drawField() {
	numberOfHappy=0;
	for(var i=0;i<fieldL;i++) {
		for(var j=0;j<fieldL;j++) {
			if(field[i][j]==1) g.fillStyle="rgb(255,0,0)";
			else if(field[i][j]==-1) g.fillStyle="rgb(0,0,255)";
			else g.fillStyle="rgb(255,255,255)";
			numberOfHappy+=field[i][j];
			g.fillRect(i*4,j*4,4,4);
		}
	}
	var totalCells=fieldL*fieldL;
	if(twoDim) fractionOfHappy=numberOfHappy/(totalCells);
	else fractionOfHappy=numberOfHappy/(trajectory1D.length-1);
	arrHappy.push([time,fractionOfHappy]);
	if(arrHappy.length>300) arrHappy.splice(0,1);
	if(twoDim && Math.abs(numberOfHappy)==totalCells) manualStop();
	if(!twoDim && Math.abs(numberOfHappy)==trajectory1D.length) manualStop();
}

function getSpin(x,y) {
	return field[(fieldL+x)%fieldL][(fieldL+y)%fieldL];
}
function setSpin(x,y,v) {
	field[(fieldL+x)%fieldL][(fieldL+y)%fieldL]=v;
}
function happySpin(x,y) {
	var similarSpins=0;
	var curSpin=getSpin(x,y);
	if(getSpin(x-1,y)==curSpin) similarSpins++;
	if(getSpin(x+1,y)==curSpin) similarSpins++;
	if(getSpin(x,y-1)==curSpin) similarSpins++;
	if(getSpin(x,y+1)==curSpin) similarSpins++;
	return similarSpins>=happy;
}

function formulateTrajectory() {
	trajectory1D=[];
	var x=1;
	var y=1;
	for(;y<fieldL-1;y++) trajectory1D.push([x,y]);
	y--;
	x++;
	for(;x<fieldL-1;x++) trajectory1D.push([x,y]);
	x--;
	y--;
	for(;y>0;y--) trajectory1D.push([x,y]);
	y++;
	/*while((y==1 && x>6) || (y==fieldL-4 && x>4)) {
		trajectory1D.push([--x,y]);
		trajectory1D.push([--x,y]);
		if(y==1) {
			y++;
			for(;y<fieldL-3;y++) trajectory1D.push([x,y]);
			y--;
		} else if(y==fieldL-4) {
			y--;
			for(;y>0;y--) trajectory1D.push([x,y]);
			y++;
		}
	}*/
	x--;
	for(;x>1;x--) trajectory1D.push([x,y]);
}

function trajectory(x,y) {
	return trajectory1D.filter(function (e) {return e[0]==x && e[1]==y;}).length > 0;
}

function singleFrame() {
	iteration();
	drawField();
	plotFigure();
}

function plotFigure() {
	$.plot($("#happyDiv"),[{data:arrHappy, color:"red"}],$('#happyDiv').data('plotOptions'));
}

/*main*/
$(function () {
	var cmdHash=location.hash.substr(1);
	if(cmdHash=="1D") $('#controlDim').val(1);
	else if(cmdHash=="2D") $('#controlDim').val(2);
	initialize();
	$("#start").click(function(){startGame();});
	$("#resume").toggle(function(){resumeGame();},function(){stopGame();});
});