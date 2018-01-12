/*options and settings*/
var g;
var gC;
var rule=[false,true,true,true,false,true,true,false];
var ruleNr=110;
var timeoutID=null;
var field=new Array();
var fieldL=48;
var time=1;

function initialize() {
	g=$("#plotDiv")[0].getContext('2d');
	gC=$("#controlDiv")[0].getContext('2d');
	window.clearInterval(timeoutID);
	timeoutID=null;
	if(field.length<fieldL || time>1) populateField();
	time=1;
	drawField();
	drawControls();
	ruleNr=binaryToDecimal(rule);
	$("#rule").text(ruleNr);
}

function myParseFloat(val) {
	return parseFloat((""+val).replace(",","."));
}

function iteration() {
	for(var i=0;i<fieldL;i++) {
		if(live(time,i)) {
			field[time][i]=1;
		} else{
			field[time][i]=0;
		}
	}
	time++;
	if(time>fieldL-1) {
		for(var i=0;i<fieldL-1;i++) {
			field[i]=field[i+1].splice(0,fieldL);
		}
		time--;
	}
	drawField();
	return ;
}

function populateField() {
	field=new Array();
	prob=myParseFloat($("#prob").val())/100.0;
	for(var i=0;i<fieldL;i++) {
		var tfield=new Array();
		for(var j=0;j<fieldL;j++) {
			if(i==0) {
				if(Math.random()>prob) tfield.push(0);
				else tfield.push(1);
			} else tfield.push(0);
		}
		field.push(tfield);
	}
}

function drawLine(x1,y1,x2,y2) {
	g.beginPath();
	g.moveTo(x1,y1);
	g.lineTo(x2,y2);
	g.stroke();
}

function live(x,y) {
	var neigh=0;
	if(x==0) return true;
	if(y>0) {
		if(field[x-1][y-1]) neigh+=4;
	} else {
		if(field[x-1][fieldL-1]) neigh+=4;
	}
	if(field[x-1][y]) neigh+=2;
	if(y<fieldL-1) {
		if(field[x-1][y+1]) neigh+=1;
	} else {
		if(field[x-1][0]) neigh+=1;
	}
	if((neigh>7)||(neigh<0)) neigh=7;
	return rule[neigh];
}

function drawField() {
	g.fillStyle="rgb(255,255,255)";
	g.fillRect(0,0,fieldL*10,fieldL*10);
	g.lineWidth="1";
	g.strokeStyle="rgb(0,0,0)";
	for(var i=0;i<fieldL;i++) {
		for(var j=0;j<fieldL;j++) {
			if(field[j][i]==1) {
				g.fillStyle="rgb(0,0,0)";
				g.fillRect(i*10,j*10,10,10);
			}
		}
	}
	for(var i=0;i<fieldL+1;i++) {
		drawLine(i*10,0,i*10,fieldL*10);
		drawLine(0,i*10,fieldL*10,i*10);
	}
}

function drawControls() {
	ruleNr=binaryToDecimal(rule);
	$("#rule").text(ruleNr);
	//clean
	gC.fillStyle="rgb(255,255,255)";
	gC.fillRect(0,0,330,40);
	//draw
	gC.strokeStyle="rgb(0,0,0)";
	gC.fillStyle="rgb(0,0,0)";
	// 128
	gC.fillRect(10,10,30,10);
	gC.strokeRect(10,10,30,10);
	gC.strokeRect(20,20,10,10);
	if(rule[7]) {
		gC.beginPath();
		gC.arc(25,25,3,0,2*Math.PI,false);
		gC.fill();
	}
	// 64
	gC.fillRect(50,10,20,10);
	gC.strokeRect(50,10,30,10);
	gC.strokeRect(60,20,10,10);
	if(rule[6]) {
		gC.beginPath();
		gC.arc(65,25,3,0,2*Math.PI,false);
		gC.fill();
	}
	// 32
	gC.fillRect(90,10,10,10);
	gC.fillRect(110,10,10,10);
	gC.strokeRect(90,10,30,10);
	gC.strokeRect(100,20,10,10);
	if(rule[5]) {
		gC.beginPath();
		gC.arc(105,25,3,0,2*Math.PI,false);
		gC.fill();
	}
	// 16
	gC.fillRect(130,10,10,10);
	gC.strokeRect(130,10,20,10);
	gC.strokeRect(150,10,10,10);
	gC.strokeRect(140,20,10,10);
	if(rule[4]) {
		gC.beginPath();
		gC.arc(145,25,3,0,2*Math.PI,false);
		gC.fill();
	}
	// 8
	gC.fillRect(180,10,20,10);
	gC.strokeRect(170,10,30,10);
	gC.strokeRect(180,20,10,10);
	if(rule[3]) {
		gC.beginPath();
		gC.arc(185,25,3,0,2*Math.PI,false);
		gC.fill();
	}
	// 4
	gC.fillRect(220,10,10,10);
	gC.strokeRect(210,10,30,10);
	gC.strokeRect(220,20,10,10);
	if(rule[2]) {
		gC.beginPath();
		gC.arc(225,25,3,0,2*Math.PI,false);
		gC.fill();
	}
	// 2
	gC.fillRect(270,10,10,10);
	gC.strokeRect(250,10,10,10);
	gC.strokeRect(250,10,30,10);
	gC.strokeRect(260,20,10,10);
	if(rule[1]) {
		gC.beginPath();
		gC.arc(265,25,3,0,2*Math.PI,false);
		gC.fill();
	}
	// 1
	gC.strokeRect(290,10,10,10);
	gC.strokeRect(300,10,10,10);
	gC.strokeRect(310,10,10,10);
	gC.strokeRect(300,20,10,10);
	if(rule[0]) {
		gC.beginPath();
		gC.arc(305,25,3,0,2*Math.PI,false);
		gC.fill();
	}
}

function kadras() {
	iteration();
	drawField();
	drawControls();
}

function binaryToDecimal(n) {
	var rez=0;
	if(n[7]) rez+=128;
	if(n[6]) rez+=64;
	if(n[5]) rez+=32;
	if(n[4]) rez+=16;
	if(n[3]) rez+=8;
	if(n[2]) rez+=4;
	if(n[1]) rez+=2;
	if(n[0]) rez+=1;
	return rez;
}

$('#plotDiv').click(function (e) {
	var posY=Math.floor((e.pageX-$(this).offset().left)/10.0),
	posX=Math.floor((e.pageY-$(this).offset().top)/10.0);
	if(field[posX][posY]==0) field[posX][posY]=1;
	else field[posX][posY]=0;
	drawField();
});

$('#controlDiv').click(function (e) {
	var posX=Math.floor((e.pageX-$(this).offset().left)/10.0),
	posY=Math.floor((e.pageY-$(this).offset().top)/10.0);
	if(posY==2) {
		posX-=2;
		if(posX%4==0) {
			posX=Math.floor(posX/4);
			rule[7-posX]=!rule[7-posX];
		}
	}
	drawControls();
});