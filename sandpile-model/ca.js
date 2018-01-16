/*options and settings*/
var g;
var timeoutID=null;
var field=[];
var fieldX=80;
var fieldY=40;
var fieldPixel=6;
var maxHeight=4;
var time=1;
var legitQuake=1;
var lastSet=[];
var avalanches=[];
var pdf=[];
var play=false;

function initialize() {
    g=$("#plotDiv")[0].getContext("2d");
    window.clearInterval(timeoutID);
    timeoutID=null;
    if(field.length<fieldX || time>1) populateField();
    time=1;
    legitQuake=1;
    lastSet=[];
    avalanches=[];
    pdf=[];
    for(var i=0;i<300;i+=1) pdf.push([i+4,0]);
    drawField();
}

function onSite(x,y) {
    return (x>=0)&&(x<fieldX)&&(y>=0)&&(y<fieldY);
}

function putCell(x,y) {
    if(!onSite(x,y)) return -1;
    if(lastSet.indexOf(x+" "+y)<0) lastSet.push(x+" "+y);
    return field[x][y]+=1;
}

function iter() {
    var tx=Math.floor(Math.random()*fieldX);
    var ty=Math.floor(Math.random()*fieldY);
    while(field[tx][ty]==0) {
        tx=Math.floor(Math.random()*fieldX);
        ty=Math.floor(Math.random()*fieldY);
    }
    lastSet=[tx+" "+ty];
    field[tx][ty]+=1;
    iteration(tx,ty);
    time+=1;
    avalanches.push(lastSet.length-1);
    if(avalanches.length>1000) avalanches.splice(0,1);
    if(3<lastSet.length && lastSet.length<=pdf.length+3) {
        pdf[lastSet.length-4][1]+=1;
        legitQuake+=1;
    }
    drawField();
}

function iteration(x,y) {
    if(!onSite(x,y)) return ;
    var ti=x;
    var tj=y;
    while(field[ti][tj]>4) {
        field[ti][tj]-=4;
        if(putCell(ti+1,tj)>4) iteration(ti+1,tj);
        if(putCell(ti-1,tj)>4) iteration(ti-1,tj);
        if(putCell(ti,tj+1)>4) iteration(ti,tj+1);
        if(putCell(ti,tj-1)>4) iteration(ti,tj-1);
    }
    return ;
}

function populateField() {
    field=[];
    /*var tcenterX=fieldX/2.0;
    var tcenterY=fieldY/2.0;*/
    for(var i=0;i<fieldX;i+=1) {
        var tfield=[];
        for(var j=0;j<fieldY;j+=1) {
            /*var radius=Math.sqrt((i-tcenterX)*(i-tcenterX)+(j-tcenterY)*(j-tcenterY));
            if(radius<maxRadius) tfield.push(Math.floor(Math.random()*maxHeight));
            else tfield.push(0);*/
            tfield.push(Math.floor(Math.random()*maxHeight));
        }
        field.push(tfield);
    }
}

function drawField() {
    g.fillStyle="rgb(255,255,255)";
    g.fillRect(0,0,fieldX*fieldPixel,fieldY*fieldPixel);
    g.lineWidth="1";
    g.strokeStyle="rgb(0,0,0)";
    for(var i=0;i<fieldX;i+=1) {
        for(var j=0;j<fieldY;j+=1) {
            var tval=field[i][j];
            if(field[i][j]>5) tval=5;
            var tcol=255-Math.floor(255.0*(tval/5.0));
            if(lastSet.indexOf(i+" "+j)>=0) g.fillStyle="rgb("+tcol+",0,0)";
            else g.fillStyle="rgb("+tcol+","+tcol+","+tcol+")";
            g.fillRect(i*fieldPixel,j*fieldPixel,fieldPixel,fieldPixel);
        }
    }
    plotFigures();
}

function plotFigures() {
    $.plot($("#timeDiv"),[{data:avalanches,color:"red"}],{yaxis:{axisLabel:"S(t)"},xaxis:{axisLabel:"t"}});
    var outDist=[];
    var matlog10=Math.log(10);
    var norm=Math.log(legitQuake)/matlog10;
    //var normX=Math.log(fieldX*fieldY)/matlog10;
    for(var i=0;i<pdf.length;i+=1) {
        if(pdf[i][1]>0) outDist.push([Math.log(pdf[i][0])/matlog10,Math.log(pdf[i][1])/matlog10-norm]);
    }
    $.plot($("#pdfDiv"),[{data:outDist,color:"red"}],{yaxis:{axisLabel:"lg[p(S)]"},xaxis:{axisLabel:"lg[S]"}});
}

function kadras() {
    for(var i=0;i<100 && play;i+=1) {
        var tx=Math.floor(Math.random()*fieldX);
        var ty=Math.floor(Math.random()*fieldY);
        while(field[tx][ty]==0) {
            tx=Math.floor(Math.random()*fieldX);
            ty=Math.floor(Math.random()*fieldY);
        }
        lastSet=[tx+" "+ty];
        field[tx][ty]+=1;
        iteration(tx,ty);
        time+=1;
        avalanches.push([time,(lastSet.length-1)]);
        if(3<lastSet.length && lastSet.length<=pdf.length+3) {
            pdf[lastSet.length-4][1]+=1;
            legitQuake+=1;
        }
    }
    if(avalanches.length>1000) avalanches.splice(0,100);
    drawField();
    if(play) window.setTimeout("kadras()",100);
}
