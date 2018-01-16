var g;
var timeoutID=null;
var const_k1=3;
var const_k2=3;
var const_g=98;
var field=new Array();

function myParseFloat(val) {
    return parseFloat((""+val).replace(",","."));
}

function stopGame() {
    window.clearInterval(timeoutID);
    timeoutID=null;
    $("#stop").attr("disabled","disabled");
    $("#restart").removeAttr("disabled");
}

function resumeGame() {
    populateField();
    timeoutID=window.setInterval("kadras()",100.0);
    $("#stop").removeAttr("disabled");
    $("#restart").attr("disabled","disabled");
    const_k1=myParseFloat($("#controlK1").val());
    const_k2=myParseFloat($("#controlK2").val());
    const_g=myParseFloat($("#controlG").val());
    if(const_k1<0) const_k1=0;
    if(const_k2<0) const_k2=0;
    if(const_g<0) const_g=0;
    $("#controlK1").attr("value",const_k1);
    $("#controlK2").attr("value",const_k2);
    $("#controlG").attr("value",const_g);
}

function iteracija() {
    var i,j;
    var field2={};
    for(i=0;i<120;i+=1) {
        field2[i]={};
        for(j=0;j<120;j+=1) {
            field2[i][j]=1;
            if(isCellHealthy(i,j)) {
                setCellValue(field2,i,j,getNumInfected(i,j)/const_k1+getNumSick(i,j)/const_k2+1.0);
            } else if(isCellSick(i,j)) {
                setCellValue(field2,i,j,1);
            } else if(isCellInfected(i,j)) {
                setCellValue(field2,i,j,getSuma(i,j)/(getNumInfected(i,j)+getNumSick(i,j)+1.0)+const_g);
            }
        }
    }
    for(i=0;i<120;i+=1) {
        for(j=0;j<120;j+=1) {
            field[i][j]=field2[i][j];
        }
    }
}

function populateField() {
    field=new Array();
    for(var i=0;i<120;i+=1) {
        var tfield=new Array();
        for(var j=0;j<120;j+=1) {
            tfield.push(Math.ceil(255*Math.random()));
        }
        field.push(tfield);
    }
}
function drawField() {
    for(var i=0;i<120;i+=1) {
        for(var j=0;j<120;j+=1) {
            var cell=field[i][j];
            g.fillStyle="rgb("+cell+","+cell+","+cell+")";
            g.fillRect(i*4,j*4,4,4);
        }
    }
}

function getNumSick(x,y) {
    var a=0;
    if(isCellSick(x-1,y-1)) a+=1;if(isCellSick(x-1,y)) a+=1;if(isCellSick(x-1,y+1)) a+=1;if(isCellSick(x,y-1)) a+=1;if(isCellSick(x,y+1)) a+=1;if(isCellSick(x+1,y-1)) a+=1;if(isCellSick(x+1,y)) a+=1;if(isCellSick(x+1,y+1)) a+=1;
    return a;
}
function getNumInfected(x,y) {
    var a=0;
    if(isCellInfected(x-1,y-1)) a+=1;if(isCellInfected(x-1,y)) a+=1;if(isCellInfected(x-1,y+1)) a+=1;if(isCellInfected(x,y-1)) a+=1;if(isCellInfected(x,y+1)) a+=1;if(isCellInfected(x+1,y-1)) a+=1;if(isCellInfected(x+1,y)) a+=1;if(isCellInfected(x+1,y+1)) a+=1;
    return a;
}
function getSuma(x,y) {
    var S=0;
    S+=getCellValue(x-1,y-1);S+=getCellValue(x-1,y);S+=getCellValue(x-1,y+1);S+=getCellValue(x,y-1);S+=getCellValue(x,y);S+=getCellValue(x,y+1);S+=getCellValue(x+1,y-1);S+=getCellValue(x+1,y);S+=getCellValue(x+1,y+1);
    return S;
}
function isCellHealthy(x,y) {
    return (field[(120+x)%120][(120+y)%120]<=1);
}
function isCellInfected(x,y) {
    return (!isCellHealthy(x,y)) && (!isCellSick(x,y));
}
function isCellSick(x,y) {
    return (field[(120+x)%120][(120+y)%120]>=255);
}
function setCellValue(arr,x,y,val) {
    if(val>255) val=255;
    if(val<1) val=1;
    arr[(120+x)%120][(120+y)%120]=Math.floor(val);
}
function getCellValue(x,y) {
    x=(120+x)%120;
    y=(120+y)%120;
    if(field[x][y]>255) field[x][y]=255;
    if(field[x][y]<1) field[x][y]=1;
    return field[x][y];
}

function kadras() {
    iteracija();
    drawField();
}

/*main*/
$(function () {
    g=$("#plotDiv")[0].getContext("2d");
    populateField();
    drawField();
    $("#restart").click(function(){resumeGame();});
    $("#stop").click(function(){stopGame();}).click();
});

