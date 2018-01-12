/* reasonable defaults for the model parameters */
var fieldL=40; /* size of modeled field */
var legitimacy=0.8; /* perceived legitimacy */
var visionRadius=5; /* circular vision radius of all agents */
var threshold=0.075; /* global activation threshold*/
var maxTerm=40; /* maximum jail term */
var rhociv=0.7; /* density of civilians (what fraction of cells are occupied by civilians) */
var rhopol=0.05; /* density of policemen */
//var fieldL=100; /* size of modeled field */
//var legitimacy=0.8; /* perceived legitimacy */
//var visionRadius=7; /* circular vision radius of all agents */
//var threshold=0.05; /* global activation threshold*/
//var maxTerm=50; /* maximum jail term */
//var rhociv=0.7; /* density of civilians (what fraction of cells are occupied by civilians) */
//var rhopol=0.05; /* density of policemen */var fieldL=100; /* size of modeled field */

/* generic options and settings*/
var plotDiv="#plotDiv";
var figureDiv="#figDiv";
var g; /*drawing context*/
var time=0; /*time ticker*/
var timeoutID=null; /*timer id*/
var field=new Array(); /* field itself */
var fieldPx=parseInt(Math.floor(200/fieldL)); /* size of square on field */
var idSeparator=fieldL*fieldL+fieldL;
var allCivilians=new Array(); /* array to store civilian agents */
var allCops=new Array(); /* array to store cop agents */
var allIds=new Array(); /* array to store agent ids */
var arrProtesters=new Array(); /* protest history */
var arrJailed=new Array(); /* jailed history */
var maxHistLen=200; /* desired number of points in history */
$(figureDiv).data('plotOptions', {yaxis:{tickDecimals:2,min:0}});

/*
 * Generic functions
 */
function myParseFloat(val) {return parseFloat((""+val).replace(",","."));}
function shuffle(arr) {var cur=arr.length;var tmpv=0;var rid=0;while(0!==cur) {rid=Math.floor(Math.random()*cur);cur-=1;tmpv=arr[cur];arr[cur]=arr[rid];arr[rid]=tmpv;}return arr;}

/*
 * Civilian agent class
 */
var civilianAgent=function(id,x,y) {
    this.id=id;
    this.hardship=Math.random();
    this.risk=Math.random();
    this.justSetPos(x,y);
};
civilianAgent.prototype.id=-1;/* id as stored on field */
civilianAgent.prototype.pos=[-1,-1];/* position on field */
civilianAgent.prototype.justSetPos=function(x,y){
    this.pos=[x,y];
}
civilianAgent.prototype.setPos=function(x,y){/* agents position is updated to the new */
    /* if previous position was valid, then update field */
    if(!isInvalid(this.pos)) field[this.pos[0]][this.pos[1]]=-1;
    this.justSetPos(x,y);
    /* if new position is valid, then update field */
    if(!isInvalid(this.pos)) field[this.pos[0]][this.pos[1]]=this.id;
}
civilianAgent.prototype.setRandomPos=function(){/* agent is pust somewhere on grid (looking for empty cell) */
    var i=parseInt(Math.floor(Math.random()*field.length));
    var j=parseInt(Math.floor(Math.random()*field[i].length));
    while(!isEmpty([i,j])) {/* while not empty */
        i=parseInt(Math.floor(Math.random()*field.length));
        j=parseInt(Math.floor(Math.random()*field[i].length));
    }
    this.setPos(i,j);
}
civilianAgent.prototype.getMove=function(){
    if(this.state>0) return;
    toMoveXY=getTarget(this.pos,isEmpty);
    if(isInvalid(toMoveXY)) return;
    this.setPos(toMoveXY[0],toMoveXY[1]);
}
civilianAgent.prototype.hardship=0; /* perceived hardship */
civilianAgent.prototype.risk=0; /* risk aversion */
civilianAgent.prototype.state=0; /* current state: -1 - active, 0 - passive, x>0 - jailed for x steps */
civilianAgent.prototype.changeState=function(){
    if(this.state>0) {/* jailed */
        this.state--;
        if(this.state==0) this.getFree();
    } else this.getActive(); /* passive or active */
    return this.state;
}
civilianAgent.prototype.getActive=function(){/* to protest or to stay quiet */
    var grievance=this.hardship*(1-legitimacy);
    var riskPerception=this.risk*this.arrestRisk();
    if(grievance-riskPerception>threshold) this.state=-1;
    else this.state=0;
}
civilianAgent.prototype.arrestRisk=function(){/* do the cops outnumber actives? */
    var cops=0;
    var acts=1;
    for(var i=this.pos[0]-visionRadius;i<=this.pos[0]+visionRadius;i++) {
        var ii=(i+field.length)%field.length;
        for(var j=this.pos[1]-visionRadius;j<=this.pos[1]+visionRadius;j++) {
            var jj=(j+field[ii].length)%field[ii].length;
            if(!(ii==this.pos[0] && jj==this.pos[1])) {
                if(isCop([ii,jj])) cops++;
                else if(isCivilian([ii,jj])) {
                    if(allCivilians[field[ii][jj]].state==-1) acts++;
                }
            }
        }
    }
    if(cops>=acts) return 1;
    else return 0;
    //return 1-Math.exp(-2.3*cops/acts);
}
civilianAgent.prototype.getFree=function(){/* released from jail */
    //this.hardship=Math.random();
    //this.risk=Math.random();
    this.setRandomPos();
}
civilianAgent.prototype.getJailed=function(){/* put to jail */
    this.state=parseInt(Math.floor(Math.random()*maxTerm)+1);
    this.setPos(-1,-1);
}

/*
 * Cop Agent class
 */
var copAgent=function(id,x,y) {
    this.id=id;
    this.justSetPos(x,y);
};
copAgent.prototype.id=-1;/* id as stored on field */
copAgent.prototype.pos=[-1,-1];/* position on field */
copAgent.prototype.justSetPos=function(x,y){
    this.pos=[x,y];
}
copAgent.prototype.setPos=function(x,y){/* agents position is updated to the new */
    /* if previous position was valid, then update field */
    if(!isInvalid(this.pos)) field[this.pos[0]][this.pos[1]]=-1;
    this.justSetPos(x,y);
    /* if new position is valid, then update field */
    if(!isInvalid(this.pos)) field[this.pos[0]][this.pos[1]]=this.id;
}
copAgent.prototype.getMove=function(){
    toMoveXY=getTarget(this.pos,isEmpty);
    if(isInvalid(toMoveXY)) return;
    this.setPos(toMoveXY[0],toMoveXY[1]);
}
copAgent.prototype.arrest=function(){
    toArrestXY=getTarget(this.pos,isActiveCivilian);
    if(isInvalid(toArrestXY)) return;
    allCivilians[field[toArrestXY[0]][toArrestXY[1]]].getJailed();
}

/*
 * What does the cell at pos contain?
 */
function isCop(pos){return isCopId(field[pos[0]][pos[1]]);}
function isCopId(id){return id>=idSeparator;}
function isCivilian(pos){return isCivilianId(field[pos[0]][pos[1]]);}
function isCivilianId(id){return -1<id && id<idSeparator;}
function isActiveCivilian(pos){
    if(!isCivilian(pos)) return false;
    return allCivilians[field[pos[0]][pos[1]]].state==-1;
}
function isEmpty(pos){return field[pos[0]][pos[1]]==-1;}

/* is position invalid? */
function isInvalid(pos){return pos[0]==-1 && pos[1]==-1;}

/* get suitable targer cell within visionRadius from pos */
/* suitability is determined by cb function */
function getTarget(pos,cb) {
    var x=pos[0];
    var y=pos[1];
    var t=new Array();
    for(var i=x-visionRadius;i<=x+visionRadius;i++) {
        var ii=(i+field.length)%field.length;
        for(var j=y-visionRadius;j<=y+visionRadius;j++) {
            var jj=(j+field[ii].length)%field[ii].length;
            if(cb([ii,jj])) t.push([ii,jj]);
        }
    }
    if(t.length==0) return [-1,-1];
    var s=0;
    if(t.length>1) s=parseInt(Math.floor(Math.random()*t.length));
    return t[s];
}

function getParameterValues() {
    time=0;
    rhociv=myParseFloat($("#controlRC").val());
    rhopol=myParseFloat($("#controlRP").val());
    if(rhociv+rhopol+0.05>1){
        rhociv=0.95*rhociv/(rhociv+rhopol);
        rhopol=0.95*rhopol/(rhociv+rhopol);
        $("#controlRC").val(rhociv);
        $("#controlRP").val(rhopol);
    }
    threshold=myParseFloat($("#controlT").val());
    legitimacy=myParseFloat($("#controlL").val());
    if(legitimacy<0 || legitimacy>1) {
        legitimacy=0.8;
        $("#controlL").val(legitimacy);
    }
    visionRadius=parseInt($("#controlV").val());
    if(visionRadius>fieldL/2.5) {
        visionRadius=parseInt(Math.floor(fieldL/2.5));
        $("#controlV").val(visionRadius);
    }
    maxTerm=parseInt($("#controlJ").val());
    if(maxTerm<1) {
        maxTerm=40;
        $("#controlJ").val(maxTerm);
    }
    arrProtesters=[[0,0]];
    arrJailed=[[0,0]];
    populateField();
    drawField();
    plotFigure();
    allIds=new Array();
    for(var i=0;i<allCivilians.length;i++) allIds.push(i);
    for(var i=0;i<allCops.length;i++) allIds.push(idSeparator+i);
}

function initialize() {
	g=$(plotDiv)[0].getContext('2d');
	window.clearInterval(timeoutID);
	timeoutID=null;
}

function populateField() {
    field=new Array();
    allCivilians=new Array();
    allCops=new Array();
    var nAgents=0;
    var nCops=0;
    for(var i=0;i<fieldL;i++) {
        var tfield=new Array();
        for(var j=0;j<fieldL;j++) {
            var r=Math.random()
            if(r<rhociv) {
                var id=nAgents;
                tfield.push(id);
                allCivilians.push(new civilianAgent(id,i,j));
                nAgents++;
            } else if(r<rhociv+rhopol) {
                var id=idSeparator+nCops;
                tfield.push(id);
                allCops.push(new copAgent(id,i,j));
                nCops++;
            } else tfield.push(-1);
        }
        field.push(tfield);
    }
}

function drawField() {
	for(var i=0;i<fieldL;i++) {
		for(var j=0;j<fieldL;j++) {
            g.fillStyle='rgb(250,250,250)';
            if(isCivilian([i,j])) {
                var id=field[i][j];
                if(allCivilians[id].state==0) g.fillStyle='rgb(50,250,50)';
                else if(allCivilians[id].state==-1) g.fillStyle='rgb(250,50,50)';
            } else if(isCop([i,j])) g.fillStyle='rgb(50,50,250)';
			g.fillRect(i*fieldPx,j*fieldPx,fieldPx,fieldPx);
		}
	}
}

function iteration() {
    /* move */
    allIds=shuffle(allIds);
    for(var i=0;i<allIds.length;i++) {
        if(isCivilianId(allIds[i])) {
            var id=allIds[i];
            allCivilians[id].getMove();
        }
        if(isCopId(allIds[i])) {
            var id=allIds[i]-idSeparator;
            allCops[id].getMove();
        }
    }
    /* do action */
    allIds=shuffle(allIds);
    for(var i=0;i<allIds.length;i++) {
        if(isCivilianId(allIds[i])) {
            var id=allIds[i];
            allCivilians[id].changeState();
        }
        if(isCopId(allIds[i])) {
            var id=allIds[i]-idSeparator;
            allCops[id].arrest();
        }
    }
}

function updateStats() {
    var curProtesters=0;
    var curJailed=0;
    for(var i=0;i<allCivilians.length;i++) {
        var st=allCivilians[i].state;
        if(st==-1) curProtesters++;
        else if(st>0) curJailed++;
    }
    arrProtesters.push([time,curProtesters/allCivilians.length]);
    arrJailed.push([time,curJailed/allCivilians.length]);
    if(arrProtesters.length>maxHistLen) {
        arrProtesters=arrProtesters.slice(1);
        arrJailed=arrJailed.slice(1);
    }
}

function plotFigure(){$.plot($(figureDiv),[{data:arrProtesters,color:"red"},{data:arrJailed,color:"black"}],$(figureDiv).data('plotOptions'));}

function startGame() {
	initialize();
    getParameterValues();
	$("#resume").click();
}

function nextFrame() {
    time++;
    iteration();
	drawField();
    updateStats();
	plotFigure();
}

/*main*/
$(function () {
	initialize();
    getParameterValues();
	$("#start").click(function(){startGame();});
	$("#resume").toggle(function(){resumeGame();},function(){stopGame();});
});
