var g;
var timeoutID=null;
var nFeats=3;
var nTraits=2;
var field=new Array();
var fieldL=40;
var fieldSize=400;
var fieldPx=10;
var interactions=100000;

function initialize() {
    g=$("#plotDiv")[0].getContext('2d');
    window.clearInterval(timeoutID);
    timeoutID=null;
    getParameterValues();
    resetSpeed();
    populateField();
    drawField();
}

function getParameterValues() {
    fieldL=parseInt($('#controlSize').val());
    fieldPx=Math.floor(fieldSize/fieldL);
    nTraits=parseInt($('#nTraits').val());
    nFeats=parseInt($('#nFeats').val());
}

function resetSpeed() {
    interactions=parseInt($('#controlSpeed').val());
}

function myParseFloat(val) {
    return parseFloat((""+val).replace(",","."));
}

function iteration() {
    for(var i=0;i<interactions;i+=1) {
        var x=Math.floor(Math.random()*fieldL);
        var y=Math.floor(Math.random()*fieldL);
        var n=Math.floor(Math.random()*4);
        var active=getTraits(x,y);
        var passive=null;
        switch(n) {
            case 0: passive=getTraits(x+1,y); break;
            case 1: passive=getTraits(x-1,y); break;
            case 2: passive=getTraits(x,y+1); break;
            case 3: passive=getTraits(x,y-1); break;
        }
        var interactionProb=0;
        for(var k=0;k<nFeats;k+=1) {
            if(passive[k]==active[k]) {
                interactionProb+=1;
            }
        }
        if(interactionProb<nFeats) {// if agents are not completely the same
            if(interactionProb>nFeats*Math.random()) {// if agents interact
                var copyTrait=0;
                if(interactionProb==1) {
                    copyTrait=Math.floor(Math.random()*(nFeats-1));
                } else if(interactionProb==0) {
                    copyTrait=Math.floor(Math.random()*nFeats);
                }
                for(var k=0;k<nFeats;k+=1) {
                    if(passive[k]!=active[k]) {
                        if(copyTrait==0) {
                            active[k]=passive[k];
                            break;
                        } else {
                            copyTrait-=1;
                        }
                    }
                }
            }
        }
    }
    return ;
}

function populateField() {
    field=new Array();
    for(var i=0;i<fieldL;i+=1) {
        var tfield=new Array();
        for(var j=0;j<fieldL;j+=1) {
            var props=new Array(3);
            for(var k=0;k<nFeats;k+=1) {
                props[k]=Math.floor(Math.random()*nTraits);
            }
            for(var k=nFeats;k<3;k+=1) {
                props[k]=0;
            }
            tfield.push(props);
        }
        field.push(tfield);
    }
}
function drawField() {
    function optToHex(x) {
        return parseInt((x*255)/(nTraits-1));
    }
    for(var i=0;i<fieldL;i+=1) {
        for(var j=0;j<fieldL;j+=1) {
            g.fillStyle="rgb("+optToHex(field[i][j][0])+","+optToHex(field[i][j][1])+","+optToHex(field[i][j][2])+")";
            g.fillRect(i*fieldPx,j*fieldPx,fieldPx,fieldPx);
        }
    }
}

function getTraits(x,y) {
    return field[(fieldL+x)%fieldL][(fieldL+y)%fieldL];
}

function singleFrame() {
    iteration();
    drawField();
}

/*main*/
$(function () {
    initialize();
    $("#start").click(function(){startGame();});
    $("#resume").toggle(function(){resumeGame();},function(){stopGame();});
});
