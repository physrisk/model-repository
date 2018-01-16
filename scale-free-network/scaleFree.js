var scaleFree=function (){};
//model parameters
scaleFree.prototype.power=1.0;
//general $jit object
scaleFree.prototype.networkPlot;
//id of flot object
scaleFree.prototype.pdfPlot;
//last addition
scaleFree.prototype.lastNode1=null;
scaleFree.prototype.lastNode2=null;
scaleFree.prototype.lastEdge=null;
//model control parameters
scaleFree.prototype.degrees=[];
scaleFree.prototype.newNodeId=null;
scaleFree.prototype.totalNodeProbs=null;
scaleFree.prototype.zoom=1.0;
//timing
scaleFree.prototype.timer=null;
//functions
scaleFree.prototype.init=function (graphPlot,pdfPlot,powerControl) {
    var self=this;//needed for some parent references
    //get options
    this.power=this.myParseFloat($("#"+powerControl).val());
    //remember flot object id
    this.pdfPlot=pdfPlot;
    //set flot plot options
    $("#"+this.pdfPlot).data("plotOptions", {
        xaxis: {
            axisLabel: "lg[d]",
            min: null,
            max: null
        } ,
        yaxis: {
            axisLabel: "lg[p(d)]",
            min: null,
            max: null
        }
    });
    //initialize $jit related object
    $("#"+graphPlot).text("");
    this.networkPlot=new $jit.ForceDirected({
        "injectInto": graphPlot,
        iterations: 50,
        Navigation: {
            enable: true,
            type: "Native",
            panning: "avoid nodes",
            zooming: 10
        },
        Node: {"overridable": true},
        Edge: {"overridable": true},
        levelDistance: 10,
        onBeforePlotNode: function(node){//color last Nodes in red
            if(self.isLastNode(node.id)) node.data.$color="#f00";
            else node.data.$color="#fff";
        },
        onBeforePlotLine: function(adj) {//color last edge in red
            if(self.isLastEdge(adj.nodeFrom.id,adj.nodeTo.id)) {
                adj.data.$color="#f00";
            } else {
                adj.data.$color="#fff";
            }
        }
    });
    //initialize graph
    this.networkPlot.graph=new $jit.Graph(
        this.networkPlot.graphOptions,
        this.networkPlot.config.Node,
        this.networkPlot.config.Edge,
        this.networkPlot.config.Label
    );
    //create two initial nodes
    this.lastNode1={id:"node0",name:"node0",data:{}};
    this.lastNode2={id:"node1",name:"node1",data:{}};
    //assign rootNode
    this.networkPlot.root=this.lastNode1.id;
    //addNodes to graph
    this.networkPlot.graph.addNode(this.lastNode1);
    this.networkPlot.graph.addNode(this.lastNode2);
    //connect them
    this.lastEdge=this.networkPlot.graph.addAdjacence(this.lastNode1,this.lastNode2,{});
    //update degrees and other model related data
    this.degrees=[];
    this.degrees.push(1);
    this.degrees.push(1);
    this.newNodeId=2;
    this.totalNodeProbs=2;
    this.zoom=1.0;
    clearInterval(this.timer);
    this.refreshPlot();
};
scaleFree.prototype.play=function () {
    var self=this;
    this.timer=setInterval(function(){
        self.addNode();
    },
    1000);
};
scaleFree.prototype.pause=function () {
    clearInterval(this.timer);
};
scaleFree.prototype.refreshPlot=function () {
    this.reevalPdf();
    //position nodes
    this.networkPlot.compute();
    //find center of mass
    var limx=0;
    var limy=0;
    this.networkPlot.graph.eachNode(function(node) {
        limx+=node.pos.x;
        limy+=node.pos.y;
    });
    //translate center of mass to (0,0)
    // also find largest radius
    var offset={"x":-limx/this.newNodeId, "y":-limy/this.newNodeId};
    var limr=-1;
    this.networkPlot.graph.eachNode(function(node) {
        node.pos.$add(offset);
        limr=Math.max(limr,node.pos.x*node.pos.x+node.pos.y*node.pos.y);
    });
    //zoom out based on the radius
    limr=this.zoom*110/Math.sqrt(limr);
    this.zoom/=limr;
    this.networkPlot.canvas.scale(limr,limr);
    //refresh image
    this.networkPlot.plot();
};
scaleFree.prototype.addNode=function () {
    //create a new node
    this.lastNode1={id:"node"+this.newNodeId,name:"node"+this.newNodeId,data:{}};
    this.networkPlot.graph.addNode(this.lastNode1);
    //evaluate its prefference to connect to
    var nodeProbs=[];
    for(var i=0;i<this.newNodeId;i+=1) {
        nodeProbs.push(this.degrees[i]/this.totalNodeProbs);
    }
    //find the preffered edge partner
    var rnd=Math.random();
    var sump=0;
    var dest=0;
    while(sump<rnd) {
        sump+=nodeProbs[dest];
        dest+=1;
    }
    dest-=1;
    this.lastNode2=this.networkPlot.graph.getNode("node"+dest);
    //create an edge
    this.lastEdge=this.networkPlot.graph.addAdjacence(this.lastNode1,this.lastNode2,{});
    //update degrees and other model related data
    this.totalNodeProbs-=this.degrees[dest];
    this.degrees.push(1);
    this.degrees[dest]=Math.pow(Math.pow(this.degrees[dest],1.0/this.power)+1,this.power);
    this.totalNodeProbs+=(1+this.degrees[dest]);
    this.newNodeId+=1;
    this.refreshPlot();
};
scaleFree.prototype.isLastNode=function(id) {
    return (id==this.lastNode1.id || id==this.lastNode2.id);
};
scaleFree.prototype.isLastEdge=function(id1,id2) {
    return ((id1==this.lastNode1.id || id1==this.lastNode2.id) && (id2==this.lastNode1.id || id2==this.lastNode2.id));
};
scaleFree.prototype.myParseFloat=function (val) {
    return parseFloat((""+val).replace(",","."));
};
scaleFree.prototype.reevalPdf=function() {
    var diag=this.degrees;
    var llim=Math.min.apply(Math,diag);
    var rlim=Math.max.apply(Math,diag);
    var pdf=commonFunctions.pdfModification(
        commonFunctions.makePdf(diag,llim,rlim,rlim-llim,false),
        true,llim*0.9,rlim*1.1,60,llim,1.0
    );
    diag=null;
    $("#"+this.pdfPlot).data("showData",[{data: pdf, color: "blue", points: {show: true}, lines: {show: false}}]);
    this.plotFigure();
};
scaleFree.prototype.plotFigure=function() {
    $.plot($("#"+this.pdfPlot),$("#"+this.pdfPlot).data("showData"),$("#"+this.pdfPlot).data("plotOptions"));
};
