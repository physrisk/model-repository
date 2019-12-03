let rsPlot=null;

let data=null;
let showIdx=["Ethnic_group-White","Ethnic_group-Asian","Ethnic_group-Black"];
let X=[];
let colors=["#396ab1","#cc2529","#3e9651","#da7c30","#6b4c9a"];
let maxCurves=colors.length;
let textColor=$("body").css("color");
let logState=[false,false];
let logBase10=Math.log(10);

function plotFigures() {
    let xLabel="rank";
    let yLabel="fraction";
    if(logState[0]) {
        xLabel="lg-rank";
    }
    if(logState[1]) {
        yLabel="lg-fraction";
    }
    rsPlot=new plotlyPlot("rsPlot",[xLabel,yLabel]);
    let xVals=[];
    let yVals=[];
    let idx=[];
    showIdx.forEach((v) => {
        if(xVals.length>-1) {
            $("#data-"+v).css("color",colors[xVals.length]);
        }
        if(!logState[0]) {
            xVals.push(X);
        } else {
            xVals.push(X.map((v)=>Math.log(v)/logBase10));
        }
        v=v.replace(/_/g," ");
        idx=v.split("-");
        if(!logState[1]) {
            yVals.push(data.data[idx[0]][idx[1]]);
        } else {
            yVals.push(data.data[idx[0]][idx[1]].map((v)=>Math.log(v)/logBase10));
        }
    });
    rsPlot.update(xVals,yVals,"lines",colors.slice(0,xVals.length));
}

function setup(d) {
    data=d;
    let sets=Object.keys(data.data);
    sets.forEach((v) => {
        $("#controlWrapper").append("<span class=\"controlBlockTitle\">"+v+":</span><br/>");
        let curves=Object.keys(data.data[v]);
        curves.forEach((c) => {
            let checked="";
            let value=v.replace(/ /g,"_")+"-"+c.replace(/ /g,"_");
            let idx=showIdx.indexOf(value);
            if(idx>-1) {
                checked=" checked";
            }
            $("#controlWrapper").append("<span id=\"data-"+value+"\" class=\"controlBlock singleWidth\"><input class=\"curveCheckbox\" type=\"checkbox\" value=\""+value+"\""+checked+"> "+c+"</span>");
            data.data[v][c]=data.data[v][c].sort((a,b) => b-a).slice(0);
        });
        $("#controlWrapper").append("<br/>");
    });
    $(".curveCheckbox").click(checkboxUpdate);
    $("#controlWrapper .singleWidth").css("width","90px");
    $("#controlWrapper").css("line-height","15px");

    X = d["postcode areas"].map((val,idx) => idx+1);
}

function checkboxUpdate(obj) {
    let target=obj.originalEvent.originalTarget;
    let rm="";
    if(target.checked) {
        if(showIdx.length>maxCurves-1) {
            rm=showIdx.splice(0,1);
            $("#data-"+rm).css("color",textColor);
            $("#data-"+rm+" input[type=checkbox]").prop("checked",false);
        }
        showIdx.push(target.value);
    } else {
        let idx=showIdx.indexOf(target.value);
        rm=showIdx.splice(idx,1);
        $("#data-"+rm).css("color",textColor);
    }
    plotFigures();
}
