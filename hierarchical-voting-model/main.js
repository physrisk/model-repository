function myParseFloat(val) {return parseFloat((""+val).replace(",","."));}

let model;
let g;
let level=1;
let factor=2;
let plotDivSize=384;
let fred=0.5;

function upClick() {
    level+=1;
    updateGUI();
}

function downClick() {
    level-=1;
    updateGUI();
}

function updateGUI() {
    $("#plotDiv")
        .attr("width",plotDivSize)
        .attr("height",plotDivSize)
        .css("width",plotDivSize+"px")
        .css("height",plotDivSize+"px");
    plotField();
    $("#fillFrac").val(fred);
    $("#currentLayer").val(level);
    updateButtons();
}

function plotField() {
    let i,j,layer,size,box;
    layer=model.getLayer(level);
    size=layer.length;
    box=plotDivSize/size;
    fred=0;
    for(i=0;i<size;i+=1) {
        for(j=0;j<size;j+=1) {
            if(layer[i][j]==1) {
                g.fillStyle="rgb(204,37,41)";
                fred+=1;
            } else g.fillStyle="rgb(57,106,177)";
            g.fillRect(j*box,i*box,box,box);
        }
    }
    fred/=(size*size);
    if((level>1 && factor!=3) || (level>2 && factor==3)) {
        g.beginPath();
        g.strokeStyle="rgb(0,0,0)";
        for(i=0;i<=size;i+=1) {
            g.moveTo(i*box,0);
            g.lineTo(i*box,plotDivSize);
            g.moveTo(0,i*box);
            g.lineTo(plotDivSize,i*box);
        }
        g.stroke();
    }
}

function updateButtons() {
    if(level<model.levels) {
        $("#hup").removeAttr("disabled");
    } else {
        $("#hup").attr("disabled","disabled");
    }
    if(level>1) {
        $("#hdown").removeAttr("disabled");
    } else {
        $("#hdown").attr("disabled","disabled");
    }
}

function setup() {
    let fillProb=myParseFloat($("#fillProb").val());
    let levels=8;
    factor=parseInt($("#factor").val());
    g=$("#plotDiv")[0].getContext("2d");
    level=1;
    if(factor==2) {
        levels=8;
        plotDivSize=384;
    } else if(factor==3) {
        levels=6;
        plotDivSize=486;
    } else if(factor==4) {
        levels=4;
        plotDivSize=384;
    } else if(factor==5) {
        levels=4;
        plotDivSize=375;
    } else {
        levels=4;
        plotDivSize=432;
    }
    model=new HierarchicalVotingModel(levels,factor,fillProb);
    updateGUI();
}
