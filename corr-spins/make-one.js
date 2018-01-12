var NParticles=100;
var boundaries=4;
$('#stop').click(function() {initialize();$("#controlM").val(play());});

function play() {
	var bPos=[0,NParticles];
	for(var i=0;i<boundaries;i++) {
		var npos=Math.floor(NParticles*Math.random());
		while(bPos.indexOf(npos)>=0) npos=Math.floor(NParticles*Math.random());
		bPos.push(npos);
	}
	bPos=bPos.sort(function(a,b){return a>b;});
	var spin=2*Math.floor(Math.random()*2)-1;
	var g=$("#plotDiv")[0].getContext('2d');
	var nB=1;
	var rez=0;
	for(var i=0;i<NParticles;i++) {
		if(i==bPos[nB]) {
			spin*=(-1);
			nB++;
		}
		rez+=spin;
		if(spin>0) g.fillStyle="rgb(255,0,0)";
		else g.fillStyle="rgb(0,0,255)";
		g.fillRect(i*4,0,4,4);
	}
	return rez/2;
}

function initialize() {
	NParticles=parseInt($('#controlN').val());
	NParticles=2*Math.floor(NParticles/2);
	$('#controlN').val(NParticles);
	boundaries=parseInt($('#controlD').val());
}

$(function () {
	initialize();$("#controlM").val(play());
});