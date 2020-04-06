$("#rsPlot, #controlWrapper").hide();
$("#logXAxis, #logYAxis").change(function(){
    logState=[$("#logXAxis").prop("checked"),$("#logYAxis").prop("checked")];
    plotFigures();
});
$("#xaxis, #yaxis").change(function() {
    dataUpdate();
});

let rsPlot=null;

let data=null;
let showIdx=["Ethnic_group-White","Religion-Christian"];
let color="#396ab1";
let logState=[false,false];
let logBase10=Math.log(10);

function plotFigures() {
    let xData=showIdx[0].replace(/_/g," ").split("-");
    let xVals=data.data[xData[0]][xData[1]];
    if(logState[0]) {
        xVals=xVals.map((v) => Math.log(v)/logBase10);
        xData[0]="Lg["+xData[0];
        xData[1]=xData[1]+"]";
    }
    let yData=showIdx[1].replace(/_/g," ").split("-");
    let yVals=data.data[yData[0]][yData[1]];
    if(logState[1]) {
        yVals=yVals.map((v) => Math.log(v)/logBase10);
        yData[0]="Lg["+yData[0];
        yData[1]=yData[1]+"]";
    }
    rsPlot=new plotlyPlot("rsPlot",[xData.join(": "),yData.join(": ")],[10,10,40,60]);
    rsPlot.update([xVals],[yVals],"markers",color);
}

function setup(d) {
    data=d;
    let sets=Object.keys(data.data);
    sets.forEach((v) => {
        let curves=Object.keys(data.data[v]);
        curves.forEach((c) => {
            let value=v.replace(/ /g,"_")+"-"+c.replace(/ /g,"_");
            let idx=showIdx.indexOf(value);
            let selected="";
            if(idx==0) {
                selected=" selected";
            }
            $("#xaxis").append("<option value=\""+value+"\""+selected+"> "+v+": "+c+"</option>");
            selected="";
            if(idx==1) {
                selected=" selected";
            }
            $("#yaxis").append("<option value=\""+value+"\""+selected+"> "+v+": "+c+"</option>");
            data.data[v][c]=data.data[v][c].slice(0);
        });
    });
    $("#controlWrapper").css("line-height","15px");
}

function dataUpdate(obj) {
    showIdx=[$("#xaxis").val(),$("#yaxis").val()];
    plotFigures();
}

/* onLoad */
$(function () {
    $.getJSON("./data.json",function(data) {
        $("#loader").hide();
        $("#rsPlot, #controlWrapper").show();
        setup(data);
        plotFigures();
    });
});
