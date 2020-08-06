let mainPlot = new plotlyPlot("mainPlot",
    ["lg[I(t)], lg[D(t)]","lg[p(I(t))], lg[p(D(t))]"],
    [10,10,40,50]);
mainPlot.setRanges([-0.5,6.5],[-8.5,-0.5]);

let colors = ["#396ab1","#cc2529"];

let confirmed_data = null;
let deaths_data = null;
let dates = null;
let picked = 10;
let playFlag = false;
let timer = null;

function plot() {
    let xVals, yVals, y2Vals;
    xVals = Object.values(confirmed_data["X"]);
    yVals = Object.values(confirmed_data[dates[picked]]);
    y2Vals = Object.values(deaths_data[dates[picked]]);
    mainPlot.update([xVals],[yVals,y2Vals],"markers",colors);
}

function play() {
    picked += 1;
    if(picked>=dates.length) {
        picked = 0;
    }
    $("#date").val(picked);
    plot();
    if(playFlag) {
        timer = setTimeout(() => play(),1000);
    } else {
        timer = null;
    }
}

$("#date").change(() => {
    picked = parseInt($("#date").val());
    plot();
});

$("#play").toggle(() => {
        $("#play").html("&#9632;");
        playFlag = true;
        if(timer == null) {
            timer = setTimeout(() => play(),1000);
        }
    }, ()=> {
        $("#play").html("&#9658;");
        playFlag = false;
});

/* onLoad */
$(function () {
    $.getJSON("./covid_confirmed.json",(data) => {
        confirmed_data = data;
        $.getJSON("./covid_deaths.json",(data) => {
            deaths_data = data;
            plot();
        });
        dates = Object.keys(confirmed_data).slice(1);
        dates.forEach((v,i) => {
            let selected = "";
            v = (new Date(v)).toISOString().slice(0,10);
            if(i==picked) {
                selected = " selected";
            }
            $("#date").append("<option value=\""+i+"\""+selected+"> "+v+"</option>");
        });
    });
});
