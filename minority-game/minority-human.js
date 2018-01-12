function myParseFloat(val) {return parseFloat((""+val).replace(",","."));}

/*options and settings*/
var nParticles=100;
var nStrategies=2;
var memoryLength=5;
var timer=null;
var internalTime=0;
var totalAction=new Array();
var plAction=new Array();
var allAgents=new Array();
var score=0;
$('#positiveAction').click(function(){timeStep(1);updateScore(1);});
$('#negativeAction').click(function(){timeStep(-1);updateScore(-1);});

function plotFigure() {
	var hist=takeLastValues(totalAction,memoryLength);
	$("#history .blockContent").empty();
	for(var i=0;i<hist.length;i++) {
		if(hist[i]>0) {
			$("#history .blockContent").append('<img src="images/el-farol.png" />');
		} else {
			$("#history .blockContent").append('<img src="images/home.png" />');
		}
	}
	hist=takeLastValues(plAction,memoryLength);
	$("#actions .blockContent").empty();
	for(var i=0;i<hist.length;i++) {
		if(hist[i]>0) {
			$("#actions .blockContent").append('<img src="images/el-farol.png" />');
		} else {
			$("#actions .blockContent").append('<img src="images/home.png" />');
		}
	}
}

var agent=function(m,s) {
	var possibleMemories=Math.pow(2,m);
	var totalStrategies=Math.pow(2,Math.pow(2,m));
	if(totalStrategies<s) s=totalStrategies;
	this.strategies=new Array();
	for(var i=0;i<s;i++) {
		var tmp=new Array();
		for(var j=0;j<possibleMemories;j++) tmp.push(2*Math.floor(2*Math.random())-1);
		this.strategies.push(tmp);
	}
	this.goodness=new Array();
	this.memory=m;
	for(var i=0;i<s;i++) this.goodness.push(10*Math.random());
}
agent.prototype.strategies=new Array();
agent.prototype.goodness=new Array();
agent.prototype.memory=1;
agent.prototype.lastAction=0;
agent.prototype.lastOption=0;
agent.prototype.score=0;
agent.prototype.play=function(history) {
	this.lastOption=this.binaryMemory(history.slice(-this.memory));
	return this.lastAction=this.translateToAction(this.pickBest(),this.lastOption);
}
agent.prototype.feedback=function(trueAction) {
    this.score-=Math.sign(trueAction)*this.lastAction;
	for(var i=0;i<this.strategies.length;i++) {
		this.goodness[i]-=(this.translateToAction(this.strategies[i],this.lastOption)*this.feedbackFunction(trueAction));
	}
}
agent.prototype.feedbackFunction=function(trueAction) {
	return trueAction;
}
agent.prototype.binaryMemory=function(mem)	{
	var rez=0, add=1;
	for(var i=0;i<mem.length;i++) {
		if(i>0) add*=2;
		if(mem[i]>0) rez+=add;
	}
	return rez;
}
agent.prototype.pickBest=function (){
	var best=0;
	var bgood=this.goodness[0];
	for(var i=1;i<this.strategies.length;i++) {
		if(bgood<this.goodness[i]) {
			bgood=this.goodness[i];
			best=i;
		}
	}
	return this.strategies[best];
}
agent.prototype.translateToAction=function (strat,mem) {
	return strat[mem];
}

function takeLastValues(arr,n) {
	var rez=new Array();
	for(var i=arr.length-1;(i>=0 && i>=arr.length-n);i--) rez.push(arr[i][1]);
	return rez.reverse();
}

function timeStep(act) {
	var totAct=act;
	var hist=takeLastValues(totalAction,memoryLength);
	for(var i=0;i<allAgents.length;i++) totAct+=allAgents[i].play(hist);
	totAct/=(allAgents.length+1);
	for(var i=0;i<allAgents.length;i++) allAgents[i].feedback(totAct);
	internalTime++;
	totalAction.push([internalTime,totAct]);
	plAction.push([internalTime,act]);
	plotFigure();
}

function initialize() {
	totalAction=new Array();
	plAction=new Array();
	for(var i=0;i<memoryLength;i++) totalAction.push([-memoryLength+i,0.5*(2*Math.round(Math.random())-1)/nParticles]);
	allAgents=new Array();
	for(var i=0;i<nParticles;i++) allAgents.push(new agent(memoryLength,nStrategies));
	internalTime=0;
	timer=null;
	score=0;
	plotFigure();
}

function updateScore(act) {
	var tmp=totalAction.slice(-1);
	console.log(tmp);
	score-=(act*Math.sign(tmp[0][1]));
	$("#score").text(score+" ["+getRankBest()+"]");
	$("#time").text(internalTime);
}

$(function () {
	initialize();
});