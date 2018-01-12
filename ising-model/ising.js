/*options and settings*/
var g;
var time=0;
var const_j=1;
var jarr=new Array();
var gaussianJ=true;
var const_h=0;
var const_dEnTe=0.4;
var timeoutID=null;
var field=new Array();
var fieldL=50;
var interactions=1000;
var curMagnetization=0;
var curEntropy=0;
var curEnergy=0;
var arrMagnetization=new Array();
var arrEntropy=new Array();
var arrEnergy=new Array();
$('#energyDiv').data('plotOptions', {yaxis:{tickDecimals:2}});
$('#entropyDiv').data('plotOptions', {yaxis:{tickDecimals:2,max:1}});
$('#magnetizationDiv').data('plotOptions', {yaxis:{tickDecimals:2}});

function initialize() {
	g=$("#plotDiv")[0].getContext('2d');
	time=0;
	window.clearInterval(timeoutID);
	timeoutID=null;
	populateField();
	drawField();
	plotFigure();
}

function getParameterValues() {
	const_j=myParseFloat($('#controlJ').val());
	jarr=new Array();
	if(const_j==-99999) {
		for(var i=0;i<fieldL;i++) {
			var tjarr=new Array();
			for(var j=0;j<fieldL;j++) {
				var ttjarr=new Array();
				if(gaussianJ) {
					var r1=Math.random();
					var r2=Math.random();
					tjarr.push([
						Math.sqrt(-2.0*Math.log(r1))*Math.cos(2.0*Math.PI*r2),
						Math.sqrt(-2.0*Math.log(r1))*Math.sin(2.0*Math.PI*r2)
					]);
				} else {
					if(Math.random()>0.5) ttjarr.push(1);
					else ttjarr.push(-1);
					if(Math.random()>0.5) ttjarr.push(1);
					else ttjarr.push(-1);
					tjarr.push(ttjarr);
				}
			}
			jarr.push(tjarr);
		}
	}
	const_h=myParseFloat($('#controlH').val());
	const_dEnTe=myParseFloat($('#controlDEKT').val());
}

function plotFigure() {
	$.plot($("#energyDiv"),[{data:arrEnergy, color:"red"}],$('#energyDiv').data('plotOptions'));
	$.plot($("#entropyDiv"),[{data:arrEntropy, color:"red"}],$('#entropyDiv').data('plotOptions'));
	$.plot($("#magnetizationDiv"),[{data:arrMagnetization, color:"red"}],$('#magnetizationDiv').data('plotOptions'));
}

function myParseFloat(val) {
	return parseFloat((""+val).replace(",","."));
}

function startGame() {
	initialize();
	populateField();
	$("#resume").click();
}

function iteracija() {
	time++;
	for(var i=0;i<interactions;i++) {
		var x=Math.floor(Math.random()*fieldL);
		var y=Math.floor(Math.random()*fieldL);
		pUp=1.0/(1.0+Math.exp(-2.0*const_dEnTe*getBondEnergy(x,y,-1)));
		if(Math.random()<pUp) setSpin(x,y,1);
		else setSpin(x,y,-1);
	}
	return ;
}

function populateField() {
	arrMagnetization=new Array();
	arrEntropy=new Array();
	arrEnergy=new Array();
	curMagnetization=0;
	curEntropy=0;
	curEnergy=0;
	field=new Array();
	for(var i=0;i<fieldL;i++) {
		var tfield=new Array();
		for(var j=0;j<fieldL;j++) {
			if(Math.random()>0.5) tfield.push(1);
			else tfield.push(-1);
		}
		field.push(tfield);
	}
}
function drawField() {
	for(var i=0;i<fieldL;i++) {
		for(var j=0;j<fieldL;j++) {
			if(field[i][j]==1) g.fillStyle="rgb(255,0,0)";
			else g.fillStyle="rgb(0,0,255)";
			g.fillRect(i*4,j*4,4,4);
		}
	}
	updateStatistics();
}

function updateStatistics() {
	curEnergy=totalEnergy();
	var p=(1.0-curMagnetization)/2.0;
	curEntropy=-1.442695*(p*Math.log(p)+(1.0-p)*Math.log(1.0-p));
	arrEnergy.push([time,curEnergy]);
	arrEntropy.push([time,curEntropy]);
	arrMagnetization.push([time,curMagnetization]);
}

function totalEnergy() {
	var tmp=0;
	var tmp_mag=0;
	for(var i=0;i<fieldL;i++) {
		for(var j=0;j<fieldL;j++) {
			tmp+=getBondEnergy(i,j,getSpin(i,j));
			tmp_mag+=getSpin(i,j);
		}
	}
	tmp/=(fieldL*fieldL);
	curMagnetization=tmp_mag/(fieldL*fieldL);
	return 0.5*tmp;
}

function getBondEnergy(x,y,v) {
	if(const_j!=-99999) return -const_j*v*(getSpin(x-1,y)+getSpin(x+1,y)+getSpin(x,y-1)+getSpin(x,y+1))-2.0*v*const_h;
	return -v*(getJ(x,y,x-1,y)*getSpin(x-1,y)+getJ(x,y,x+1,y)*getSpin(x+1,y)+getJ(x,y,x,y-1)*getSpin(x,y-1)+getJ(x,y,x,y+1)*getSpin(x,y+1))-2.0*v*const_h;
}

function getJ(x,y,x1,y1) {
	if(const_j==-99999) {
		var tx=Math.min(x,x1);
		var ty=Math.min(y,y1);
		if(!(Math.abs(x-x1)==0 || Math.abs(y-y1)==0)) return 0;
		else if(Math.abs(x-x1)==0) return jarr[(fieldL+tx)%fieldL][(fieldL+ty)%fieldL][0];
		else return jarr[(fieldL+tx)%fieldL][(fieldL+ty)%fieldL][1];
	}
	return const_j;
}
function getSpin(x,y) {
	return field[(fieldL+x)%fieldL][(fieldL+y)%fieldL];
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
	$("#resume").toggle(function(){resumeGame();},function(){stopGame();});
	if(location.hash=="#spin-glass") {
		$("#controlDEKT").val(1000);
		$("#controlJ").val(-99999);
	}
});