/*options and settings*/
var g;
var time=0;
var timeoutID=null;
var field=new Array();
var fieldLX=100;
var fieldLY=100;
var iterations=10000;
var Nwolves=100;
var Nrabbits=1000;
var rabitReprod=0.03;
var wolfReprod=1;
var wolfDeath=0.02;
var nWArr=new Array();
var nRArr=new Array();
$("#popDiv").data("plotOptions", {xaxis:{show:false},yaxis:{show:false}});

function initialize() {
    readParameters();
    g=$("#plotDiv")[0].getContext("2d");
    time=0;
    nWArr=[[time,Nwolves]];
    nRArr=[[time,Nrabbits]];
    window.clearInterval(timeoutID);
    timeoutID=null;
    populateField();
    drawField();
    plotFigure();
}

function plotFigure() {
    $.plot($("#popDiv"),[{data:nWArr, color:"black"},{data:nRArr, color:"light gray"}],$("#popDiv").data("plotOptions"));
}

function myParseFloat(val) {
    return parseFloat((""+val).replace(",","."));
}

function readParameters() {
    Nwolves=parseInt($("#wolfPop").val());
    Nrabbits=parseInt($("#rabPop").val());
    rabitReprod=myParseFloat($("#rabRep").val())/100.0;
    wolfReprod=myParseFloat($("#wolfRep").val())/100.0;
    wolfDeath=myParseFloat($("#wolfDeath").val())/100.0;
}

function iteracija() {
    time+=1;
    for(var i=0;i<iterations;i+=1) vienaIteracija();
    if(time>400) {
        nWArr.splice(0,1);
        nRArr.splice(0,1);
    }
    nWArr.push([time,Nwolves]);
    nRArr.push([time,Nrabbits]);
    drawField();
    plotFigure();
    $("#TInd").text(time);
    $("#RInd").text(Nrabbits);
    $("#WInd").text(Nwolves);
    if(Nwolves<1 || Nrabbits<1) $("#start").click().attr("disabled","disabled");
}

function vienaIteracija() {
    //renkami du agentai - vienas atsitiktinis, kitas jo kaimynas
    var x1=Math.floor(Math.random()*fieldLX);
    var y1=Math.floor(Math.random()*fieldLY);
    var x2=0;
    var y2=0;
    while((x2==0)&&(y2==0)) {
        x2=Math.floor(Math.random()*3)-2;
        y2=Math.floor(Math.random()*3)-2;
    }
    x2+=x1;
    y2+=y1;
    while(x2<0) x2+=fieldLX;
    while(x2>=fieldLX) x2-=fieldLX;
    while(y2<0) y2+=fieldLY;
    while(y2>=fieldLY) y2-=fieldLY;
    //agentai istrinkti ir patikrinti
    //1. jei vilkas prie zuikio, triusis mirsta, o vilkas gali reprudukuotis
    if(((field[x1][y1]==1)&&(field[x2][y2]==-1))||((field[x2][y2]==1)&&(field[x1][y1]==-1))) {
        if(field[x2][y2]==-1) {
            Nrabbits--;
            if(Math.random()<wolfReprod) {
                field[x2][y2]=1;
                Nwolves+=1;
            } else {
                field[x2][y2]=0;
            }
        } else if(field[x1][y1]==-1) {
            Nrabbits--;
            if(Math.random()<wolfReprod) {
                Nwolves+=1;
                field[x1][y1]=1;
            } else {
                field[x1][y1]=0;
            }
        }
    }
    //2. jei triusis prie zoles, tai triusis gali reprodukuotis
    else if(((field[x1][y1]==0)&&(field[x2][y2]==-1))||((field[x2][y2]==0)&&(field[x1][y1]==-1))) {
        if(Math.random()<rabitReprod) {
            if(field[x2][y2]==-1) {
                field[x1][y1]=-1;
                Nrabbits+=1;
            } else if(field[x1][y1]==-1) {
                field[x2][y2]=-1;
                Nrabbits+=1;
            }
        }
    }
    //3. jei kazkas stovi prie tuscio ploto, tas kazkas pereina i ta langeli, jei vilkas stovi prie tuscio langelio, tai jis gali mirti
    if((field[x2][y2]==0)&&(field[x1][y1]!=0)) {
        if(field[x1][y1]==1) {
            field[x1][y1]=0;
            if(Math.random()>=wolfDeath) {//vilkas nemirsta
                field[x2][y2]=1;
            } else {
                Nwolves--;
            }
        } else {
            field[x2][y2]=field[x1][y1];
            field[x1][y1]=0;
        }
    } else if((field[x1][y1]==0)&&(field[x2][y2]!=0)) {
        if(field[x2][y2]==1) {
            field[x2][y2]=0;
            if(Math.random()>=wolfDeath) {//vilkas nemirsta
                field[x1][y1]=1;
            } else {
                Nwolves--;
            }
        } else {
            field[x1][y1]=field[x2][y2];
            field[x2][y2]=0;
        }
    }
    return ;
}

function placeAgentInEmpty(type) {
    var rX=Math.floor(Math.random()*fieldLX);
    var rY=Math.floor(Math.random()*fieldLY);
    while(field[rX][rY]!=0) {
        rX=Math.floor(Math.random()*fieldLX);
        rY=Math.floor(Math.random()*fieldLY);
    }
    field[rX][rY]=type;
}

function populateField() {
    var i;
    field=new Array();
    var tfield=new Array();
    for(i=0;i<fieldLY;i+=1) tfield.push(0);
    for(i=0;i<fieldLX;i+=1) field.push(tfield.slice(0,fieldLY));
    for(i=0;i<Nrabbits;i+=1) placeAgentInEmpty(-1);
    for(i=0;i<Nwolves;i+=1) placeAgentInEmpty(1);
}

function drawField() {
    g.fillStyle="rgb(0,255,0)";
    g.fillRect(0,0,fieldLX*3,fieldLY*3);
    for(var i=0;i<fieldLX;i+=1) {
        for(var j=0;j<fieldLY;j+=1) {
            if(field[i][j]==1) {
                g.fillStyle="rgb(0,0,0)";
                g.fillRect(i*3,j*3,3,3);
            } else if(field[i][j]==-1) {
                g.fillStyle="rgb(255,255,255)";
                g.fillRect(i*3,j*3,3,3);
            }
        }
    }
}

function kadras() {
    iteracija();
    drawField();
    plotFigure();
}
