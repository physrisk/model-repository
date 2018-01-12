/*options and settings*/
var g;
var time=0;
var timeoutID=null;
var vacField=new Array();
var sirField=new Array();
var lInfArr=new Array();
var lDeadArr=new Array();
var rInfArr=new Array();
var rDeadArr=new Array();
var lDeadVacArr=new Array();
var rDeadVacArr=new Array();
var lDeadUnVacArr=new Array();
var rDeadUnVacArr=new Array();
var lDeadUnVacArr2=new Array();
var rDeadUnVacArr2=new Array();
var fieldX=100;
var fieldY=50;
var pvacL=0.9;
var pvacR=0.1;
var peff=0.1;
var pih=0.1;
var phi=0.1;
var pid=0.1;
var pim=0.1;
var nAgents=fieldX*fieldY/2;
var vacAgents=[0,0];

$('#lDiv').data('plotOptions', {yaxis:{tickDecimals:1,max:1}});
$('#rDiv').data('plotOptions', {yaxis:{tickDecimals:1,max:1}});

function initialize() {
	lInfArr=new Array();
	lDeadArr=new Array();
	rInfArr=new Array();
	rDeadArr=new Array();
	lDeadVacArr=new Array();
	rDeadVacArr=new Array();
	lDeadUnVacArr=new Array();
	rDeadUnVacArr=new Array();
	lDeadUnVacArr2=new Array();
	rDeadUnVacArr2=new Array();
	g=$("#plotDiv")[0].getContext('2d');
	getParameterValues();
	time=0;
	window.clearInterval(timeoutID);
	timeoutID=null;
	populateField();
	drawField();
	lInfArr.push([0,0]);
	rInfArr.push([0,0]);
	lDeadArr.push([0,0]);
	rDeadArr.push([0,0]);
	lDeadVacArr.push([0,0]);
	rDeadVacArr.push([0,0]);
	lDeadUnVacArr.push([0,0]);
	rDeadUnVacArr.push([0,0]);
	lDeadUnVacArr2.push([0,0]);
	rDeadUnVacArr2.push([0,0]);
}

function getParameterValues() {
	pvacL=myParseFloat($('#pvacL').val(),0,1);
	pvacR=myParseFloat($('#pvacR').val(),0,1);
	peff=myParseFloat($('#peff').val(),0,1);
	pih=myParseFloat($('#pih').val(),0,1);
	phi=myParseFloat($('#phi').val(),0,1);
	pid=myParseFloat($('#pid').val(),0,1);
	pim=myParseFloat($('#pim').val(),0,1);
	if(pid+pih>1) {
		pid=pid/(pid+pih);
		pih=pih/(pid+pih);
	}
	$('#pvacL').val(pvacL);
	$('#pvacR').val(pvacR);
	$('#peff').val(peff);
	$('#pih').val(pih);
	$('#phi').val(phi);
	$('#pid').val(pid);
	$('#pim').val(pim);
}

function myParseFloat(val, min, max) {
	min=(typeof min !== 'undefined' ? min : null);
	max=(typeof max !== 'undefined' ? max : null);
	if(min==null || max==null) return parseFloat((""+val).replace(",","."));
	return Math.min(Math.max(parseFloat((""+val).replace(",",".")),min),max);
}

function startGame() {
	initialize();
	var x=Math.floor(Math.random()*fieldX/2);
	var y=Math.floor(Math.random()*fieldY);
	sirField[x][y]=1;
	sirField[x+fieldX/2][y]=1;
	$("#resume").click();
}

function iteracija() {
	var nsir=new Array();
	var dead=[0,0,0,0];
	var infected=[0,0];
	for(var i=0;i<fieldX;i++) {
		var tfield=new Array();
		for(var j=0;j<fieldY;j++) {
			if(!isDead(i,j)) {
				if(isInfected(i,j)) {
					if(Math.random()<pih) tfield.push(0);
					else if(Math.random()<pih+pid) {
						tfield.push(2);
						if(leftPopulation(i,j)) {
							dead[0]++;
							if(isVaccinated(i,j)) dead[2]++;
						} else {
							dead[1]++;
							if(isVaccinated(i,j)) dead[3]++;
						}
					} else {
						tfield.push(1);
						if(leftPopulation(i,j)) infected[0]++;
						else infected[1]++;
					}
				} else {
					var ninf=neighborsInfected(i,j);
					if(ninf>0) {
						var tmp=1.0-phi;
						var prob=1.0;
						for(var k=0;k<ninf;k++) prob*=tmp;
						prob=(1-pim)*(1.0-prob);
						if(isVaccinated(i,j)) prob*=(1-peff);
						if(Math.random()<prob) {
							tfield.push(1);
							if(leftPopulation(i,j)) infected[0]++;
							else infected[1]++;
						}
						else tfield.push(0);
					} else tfield.push(0);
				}
			} else {
				tfield.push(2);
				if(leftPopulation(i,j)) {
					dead[0]++;
					if(isVaccinated(i,j)) dead[2]++;
				} else {
					dead[1]++;
					if(isVaccinated(i,j)) dead[3]++;
				}
			}
		}
		nsir.push(tfield);
	}
	time++;
	lInfArr.push([time,infected[0]/(nAgents)]);
	rInfArr.push([time,infected[1]/(nAgents)]);
	lDeadArr.push([time,dead[0]/(nAgents)]);
	rDeadArr.push([time,dead[1]/(nAgents)]);
	lDeadVacArr.push([time,dead[2]/vacAgents[0]]);
	rDeadVacArr.push([time,dead[3]/vacAgents[1]]);
	lDeadUnVacArr.push([time,(dead[0]-dead[2])/(nAgents-vacAgents[0])]);
	rDeadUnVacArr.push([time,(dead[1]-dead[3])/(nAgents-vacAgents[1])]);
	if(dead[0]>0) lDeadUnVacArr2.push([time,(dead[0]-dead[2])/(dead[0])]);
	else lDeadUnVacArr2.push([time,0]);
	if(dead[1]>1) rDeadUnVacArr2.push([time,(dead[1]-dead[3])/(dead[1])]);
	else rDeadUnVacArr2.push([time,0]);
	sirField=nsir.slice(0);
	if(infected[0]==0 && infected[1]==0) $("#resume").click();
}

function populateField() {
	vacField=new Array();
	sirField=new Array();
	vacAgents=[0,0];
	for(var i=0;i<fieldX;i++) {
		var tfield=new Array();
		var tfield2=new Array();
		var tfield3=new Array();
		for(var j=0;j<fieldY;j++) {
			if(i<fieldX/2) {
				if(Math.random()<pvacL) {
					tfield.push(1);
					vacAgents[0]++;
				} else tfield.push(-1);
			} else {
				if(Math.random()<pvacR) {
					tfield.push(1);
					vacAgents[1]++;
				} else tfield.push(-1);
			}
			tfield2.push(0);
		}
		vacField.push(tfield);
		sirField.push(tfield2);
	}
}
function drawField() {
	for(var i=0;i<fieldX;i++) {
		for(var j=0;j<fieldY;j++) {
			if(isHealthy(i,j)) {
				if(isVaccinated(i,j)) g.fillStyle="rgb(70,220,70)";
				else g.fillStyle="rgb(70,70,220)";
			} else if(isInfected(i,j)) {
				g.fillStyle="rgb(220,70,70)";
			} else if(isDead(i,j)) {
				g.fillStyle="rgb(15,15,15)";
			} else {//???
				g.fillStyle="rgb(0,255,255)";
			}
			g.fillRect(i*5,j*5,5,5);
		}
	}
}

function isVaccinated(x,y) {
	return vacField[(fieldX+x)%fieldX][(fieldY+y)%fieldY]==1;
}
function isHealthy(x,y) {
	return sirField[(fieldX+x)%fieldX][(fieldY+y)%fieldY]==0;
}
function isInfected(x,y) {
	return sirField[(fieldX+x)%fieldX][(fieldY+y)%fieldY]==1;
}
function isInfectedRel(x,y,dx,dy) {
	if(leftPopulation(x,y)) return sirField[(fieldX/2+x+dx)%(fieldX/2)][(fieldY+y+dy)%fieldY]==1;
	return sirField[fieldX/2+(fieldX/2+x+dx)%(fieldX/2)][(fieldY+y+dy)%fieldY]==1;
}
function isDead(x,y) {
	return sirField[(fieldX+x)%fieldX][(fieldY+y)%fieldY]==2;
}
function neighborsInfected(x,y) {
	var n=0;
	if(isInfectedRel(x,y,-1,0)) n++;
	if(isInfectedRel(x,y,1,0)) n++;
	if(isInfectedRel(x,y,0,-1)) n++;
	if(isInfectedRel(x,y,0,1)) n++;
	return n;
}
function separatePopulations(x,y,x2,y2) {
	return (leftPopulation(x,y) && !leftPopulation(x2,y2)) || (!leftPopulation(x,y) && leftPopulation(x2,y2));
}
function leftPopulation(x,y) {
	return ((fieldX+x)%fieldX)<fieldX/2;
}

function plotFigure() {
	$.plot($("#lDiv"),[{data:lInfArr, color:"red"},{data:lDeadArr, color:"black"},{data:lDeadVacArr, color:"green"},{data:lDeadUnVacArr, color:"blue"},{data:lDeadUnVacArr2, color:"magenta"}],$('#lDiv').data('plotOptions'));
	$.plot($("#rDiv"),[{data:rInfArr, color:"red"},{data:rDeadArr, color:"black"},{data:rDeadVacArr, color:"green"},{data:rDeadUnVacArr, color:"blue"},{data:rDeadUnVacArr2, color:"magenta"}],$('#rDiv').data('plotOptions'));
}

function kadras() {
	iteracija();
	drawField();
	plotFigure();
}

/*main*/
$(function () {
	initialize();
	plotFigure();
	$("#start").click(function(){startGame();});
	$("#resume").toggle(function(){resumeGame();},function(){stopGame();});	
});