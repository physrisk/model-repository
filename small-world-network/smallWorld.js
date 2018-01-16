var smallWorld=function (){};
//model parameters
smallWorld.prototype.nNodes;
smallWorld.prototype.pRewire;
//general $jit object
smallWorld.prototype.networkPlot;
//last attempt data
smallWorld.prototype.lastNodeId;
smallWorld.prototype.lastNodeIdLabel;
smallWorld.prototype.lastNodeConnected;
smallWorld.prototype.lastNodeDestinationId;
smallWorld.prototype.lastNodeDestinationIdLabel;
//controls
smallWorld.prototype.language="en";
smallWorld.prototype.zoom=1.0;
smallWorld.prototype.pauseCB;
smallWorld.prototype.timer=null;
//functions
smallWorld.prototype.init=function (graphPlot,console,lang,pCB,nN,pR) {
    Log.target=console;
    var self=this;
    lang=((typeof lang)!=="undefined" ? lang : "en");
    pCB=((typeof pCB)!=="undefined" ? pCB : function(){});
    nN=((typeof nN)!=="undefined" ? nN : 35);
    pR=((typeof pR)!=="undefined" ? pR : 0.11);
    if(nN<4) nN=4;
    if(pR<0) pR=0;
    if(pR>1) pR=1;
    this.nNodes=nN;
    this.pRewire=pR;
    this.language=lang;
    this.lastNodeId=-1;
    this.lastNodeConnected=false;
    this.lastNodeDestinationId=-1;
    this.zoom=1.0;
    this.pauseCB=pCB;
    this.timer=null;
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
        onBeforePlotNode: function(node){//color last Nodes in red/green/blue
            if(self.lastNodeIdLabel==node.id && self.lastNodeDestinationId>0) {
                node.data.$color="#f00";
                node.data.$dim=9;
            } else if(self.lastNodeIdLabel==node.id && self.lastNodeDestinationId<0) {
                node.data.$color="#2af";
                node.data.$dim=9;
            } else if(self.lastNodeDestinationIdLabel==node.id) {
                node.data.$color="#0f0";
                node.data.$dim=9;
            } else {
                node.data.$color="#fff";
                node.data.$dim=3;
            }
        },
        onBeforePlotLine: function(adj) {//color last edge in red
            if(self.lastNodeDestinationId<0) {
                adj.data.$color="#fff";
                adj.data.$lineWidth=1;
            } else if((self.lastNodeDestinationIdLabel==adj.nodeFrom.id || self.lastNodeDestinationIdLabel==adj.nodeTo.id)
                && (self.lastNodeIdLabel==adj.nodeFrom.id || self.lastNodeIdLabel==adj.nodeTo.id)) {
                adj.data.$color="#ff0";
                adj.data.$lineWidth=3;
            } else {
                adj.data.$color="#fff";
                adj.data.$lineWidth=1;
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
    //assign rootNode
    this.networkPlot.root="node0";
    //prepare regular form
    this.prepareRegularCircle();
    this.refreshPlot();
    Log.write("Press \"Rewire\" to start");
    Log.elem.css({"color": "#fff"});
    Log.show();
};
smallWorld.prototype.prepareRegularCircle=function(){
    for(var i=0;i<this.nNodes;i+=1) {
        this.networkPlot.graph.addNode({id:"node"+i,name:"node"+i,data:{}});
        if(i>0) {
            var j=i-1;
            this.networkPlot.graph.addAdjacence(
                {id:"node"+i,name:"node"+i,data:{}},
                {id:"node"+j,name:"node"+j,data:{}},
                {});
            if(i==this.nNodes-1) this.networkPlot.graph.addAdjacence(
                                    {id:"node"+i,name:"node"+i,data:{}},
                                    {id:"node0",name:"node0",data:{}},
                                    {});
        }
    }
};
smallWorld.prototype.attemptRewire=function(){
    // -1: if all nodes were tested for rewiring then return
    // true: if the last node was connected
    // false: if the last node was not connected
    if(this.lastNodeId>=this.nNodes) {
        Log.write("All nodes were checked.");
        Log.elem.css({color:"#2af"}).fadeOut(3000);
        return -1;
    }
    this.lastNodeId+=1;
    this.lastNodeDestinationId=-1;
    if(Math.random()<this.pRewire) {//add random link for certain node?
        this.lastNodeDestinationId=Math.floor(Math.random()*this.nNodes);
        while(this.lastNodeDestinationId==this.lastNodeId
            || this.lastNodeDestinationId==((this.lastNodeId+1+this.nNodes) % this.nNodes)
            || this.lastNodeDestinationId==((this.lastNodeId-1+this.nNodes) % this.nNodes)
        ) {//choose other target than self and immediate neighbors
            this.lastNodeDestinationId=Math.floor(Math.random()*this.nNodes);
        }
        this.networkPlot.graph.addAdjacence(
            {id:"node"+this.lastNodeId,name:"node"+this.lastNodeId,data:{}},
            {id:"node"+this.lastNodeDestinationId,name:"node"+this.lastNodeDestinationId,data:{}},
            {});
        this.setLastNodeLabels();
        this.refreshPlot();
        Log.write("New edge created!");
        Log.elem.css({color:"#ff0"});
        return true;
    }
    this.setLastNodeLabels();
    this.refreshPlot();
    Log.write("No new edge created!");
    Log.elem.css({color:"#2af"});
    return false;
};
smallWorld.prototype.refreshPlot=function () {
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
    var offset={"x":-limx/this.nNodes, "y":-limy/this.nNodes};
    var limr=-1;
    this.networkPlot.graph.eachNode(function(node) {
        node.pos.$add(offset);
        limr=Math.max(limr,node.pos.x*node.pos.x+node.pos.y*node.pos.y);
    });
    //zoom out based on the radius
    limr=this.zoom*175/Math.sqrt(limr);
    this.zoom/=limr;
    this.networkPlot.canvas.scale(limr,limr);
    //refresh image
    this.networkPlot.plot();
};
smallWorld.prototype.setLastNodeLabels=function() {
    this.lastNodeIdLabel="node"+this.lastNodeId;
    this.lastNodeDestinationIdLabel="node"+this.lastNodeDestinationId;
};
smallWorld.prototype.play=function () {
    var self=this;
    this.timer=setInterval(function(){
        if(self.attemptRewire()==-1) {
            self.pause();
            self.pauseCB();
        }
    },
    1000);
};
smallWorld.prototype.pause=function () {
    clearInterval(this.timer);
};
