function myParseFloat(val) {return parseFloat((""+val).replace(",","."));}

var fqtauPlot=new plotlyPlot("fqtauPlot",["lg[s]","lg[Fq(s)]"]);
var hqPlot=new plotlyPlot("hqPlot",["q","h(q)"]);
var holderPlot=new plotlyPlot("holderPlot",["α","f(α)"]);

var stopped=true;

var worker=new Worker("mf-worker.js");
worker.addEventListener("message", function(e) {
    var data=e.data;
    switch(data.msg) {
        case "init":
            $("#stop").prop("disabled",false);
            if(!stopped) {
                $("#indicator").text("Working...").addClass("blink");
            }
            break;
        case "get":
            plotFigures(data.res);
            $("#stop").prop("disabled",stopped);
            if(stopped) {
                $("#indicator").text("Stopping...");
            } else {
                $("#indicator").text("Working...").addClass("blink");
            }
            if(data.final) {
                $("#indicator").text("Stopped").removeClass("blink");
                $("#stop").prop("disabled",false);
                $("#restart").prop("disabled",false);
            }
            break;
    }
}, false);

function plotFigures(data=null) {
    if(data==null) {
        hqPlot.update([[0]],[[0]]);
        holderPlot.update([[0]],[[0]]);
        return ;
    }
    fqtauPlot.update(
        [
         data.fqtau.x[2],
         data.fqtau.x[4],
         data.fqtau.x[6],
         data.fqtau.x[9],
         data.fqtau.x[11],
         data.fqtau.x[13],
        ],[
         data.fqtau.y[2],
         data.fqtau.y[4],
         data.fqtau.y[6],
         data.fqtau.y[9],
         data.fqtau.y[11],
         data.fqtau.y[13],
        ]);
    hqPlot.update(
        [data.hq.x],
        [data.hq.y]
    );
    holderPlot.update(
        [data.holder.x],
        [data.holder.y]
    );
}

function setup() {
    var e1=myParseFloat($("#epsilon1").val());
    var e2=myParseFloat($("#epsilon2").val());
    var alpha=parseInt($("#alpha").val());
    var deform=parseInt($("#deform").val());
    worker.postMessage({
        "msg":"init",
        "e1":e1,
        "e2":e2,
        "alpha":alpha,
        "deform":deform
    });
}

function stopGame() {
    stopped=true;
    worker.postMessage({"msg":"stop"});
    $("#indicator").text("Stopping");
}

function resumeGame() {
    stopped=false;
    worker.postMessage({"msg":"get"});
    $("#indicator").text("Working");
}

