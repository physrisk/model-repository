var teorDist=new Array();
var teor2Dist=new Array();
var trueDist=new Array();
var NParticles=100;
var timer=null;
var interactionsOccured=0;
var boundaries=3;
var bPos=[0,NParticles];
var pFlip=0.005;
var periodic=true;
var curSpin=0;
var spinZero=0.5;
$('#restart').click(function() {initialize();$('#stopBlock, #stop').show();$('#stop').click();});

$('#stopBlock, #stop').hide();

function plotFigure() {
	var opts=$('#plotDiv').data('plotOptions');
	var outDist=new Array();
	var matlog10=Math.log(10);
	var norm=0;
	var min=99999;
	if(interactionsOccured>0) norm=Math.log(interactionsOccured);
	for(var i=0;i<trueDist.length;i++) {
		if(trueDist[i][1]>=1) {
			var tput=(Math.log(trueDist[i][1])-norm)/matlog10;
			min=Math.min(min,tput);
			outDist.push([trueDist[i][0],tput]);
		}
	}
	if(outDist.length>0) opts.yaxis.min=min;
	rezDist=outDist;
	$('#plotDiv').data('plotOptions',opts);
	$.plot($("#plotDiv"),[{data:teorDist, color:"red", label:labels[0]},{data:teor2Dist, color:"magenta", label:labels[1]},{data:outDist, color:"blue", label:labels[2]}],$('#plotDiv').data('plotOptions'));
}

function play() {
	for(var i=0;i<100;i++) moveBoundaries();
	var rez=totalSpin();
	var tdId=Math.round(rez+NParticles/2);
	trueDist[tdId][1]++;
	interactionsOccured+=1;
}

function generateBoundaries() {
	bPos=[0,NParticles];
	for(var i=0;i<boundaries;i++) {
		var npos=Math.floor(NParticles*Math.random());
		while(bPos.indexOf(npos)>=0) npos=Math.floor(NParticles*Math.random());
		bPos.push(npos);
	}
	bPos=bPos.sort(function(a,b){return a>b;});
}

function drawBoundaries() {
	var spin=1;
	var g=$("#plotDiv2")[0].getContext('2d');
	var nB=1;
	for(var i=0;i<NParticles;i++) {
		if(i==bPos[nB]) {
			spin*=(-1);
			nB++;
		}
		if(spin>0) g.fillStyle="rgb(255,0,0)";
		else g.fillStyle="rgb(0,0,255)";
		g.fillRect(i*4,0,4,4);
	}
}

function totalSpin() {
	var spin=spinZero;
	var rez=0;
	for(var i=1;i<bPos.length;i++) rez+=(2*(i % 2)-1)*(bPos[i]-bPos[i-1]);
	return spinZero*rez;
}

function moveBoundaries() {
	var bid=[];
	for(var i=0;i<bPos.length-1;i++) bid.push(i);
	bid=shuffle(bid);
	for(var i=0;i<bid.length;i++) {
		var moveDir=1;
		if(Math.random()<0.5) moveDir=-1;
		if(bid[i]==0 && Math.random()<pFlip && periodic) {
			if(moveDir==1 && bPos[1]>1) {
				for(var j=1;j<bPos.length-1;j++) bPos[j]--;
			}
			if(moveDir==-1 && bPos[bPos.length-2]+1<NParticles) {
				for(var j=1;j<bPos.length-1;j++) bPos[j]++;
			}
		}
		if(bid[i]>0 && Math.random()<pFlip) {
			if(moveDir==1 && bPos[bid[i]+1]>bPos[bid[i]]+1) bPos[bid[i]]++;
			if(moveDir==-1 && bPos[bid[i]-1]<bPos[bid[i]]-1) bPos[bid[i]]--;
		}
	}
}

function shuffle(a){for(var b,c,d=a.length;d;b=Math.floor(Math.random()*d),c=a[--d],a[d]=a[b],a[b]=c);return a}

function la_gamma(x){
	var p=[0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
	var g=7;
	if(x<0.5) return Math.PI/(Math.sin(Math.PI*x)*la_gamma(1-x));
	x-=1;
	var a=p[0];
	var t=x+g+0.5;
	for(var i=1;i<p.length;i++){
		a+=p[i]/(x+i);
	}
	return Math.sqrt(2*Math.PI)*Math.pow(t,x+0.5)*Math.exp(-t)*a;
}

function timeStep() {
	for(var j=0;j<1000;j++) play();
	plotFigure();
	drawBoundaries();
}

function initialize() {
	$('#plotDiv').data('plotOptions', {
		xaxis:{axisLabel:'M'},
		yaxis:{axisLabel:'lg[p(M)]',min:null}
	});
	teorDist=new Array();
	teor2Dist=new Array();
	trueDist=new Array();
	//NParticles=parseInt($('#controlN').val());
	//NParticles=2*Math.floor(NParticles/2);
	//$('#controlN').val(NParticles);
	boundaries=parseInt($('#controlD').val())-1;
	periodic=(parseInt($('#controlT').val())==1);
	timer=null;
	interactionsOccured=0;
	var la=Math.floor((boundaries-1)/2);
	var cTeor=Math.log(2*la_gamma(1.5+la)/(NParticles*Math.sqrt(Math.PI)*la_gamma(1+la)));
	var cTeor2=0.5*Math.log(2/(NParticles*Math.PI));
	var matlog10=Math.log(10);
	for(var i=0;i<NParticles;i++) {
		trueDist.push([-NParticles/2+i,0]);
		var x=2*i/NParticles-1;
		teorDist.push([-NParticles/2+i,(cTeor+la*Math.log(1-x*x))/matlog10]);
		teor2Dist.push([-NParticles/2+i,(cTeor2-(NParticles/2)*x*x)/matlog10]);
	}
	generateBoundaries();
	plotFigure();
	drawBoundaries();
}

function start() {timer=setInterval(function(){timeStep();},100);}
function stop() {clearInterval(timer);}

$(function () {
	initialize();
});