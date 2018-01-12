var perfectCorePeriphery=function (){};
//model parameters
perfectCorePeriphery.prototype.power=1.0;
perfectCorePeriphery.prototype.amountOfStarterNodes=10;
//general $jit object
perfectCorePeriphery.prototype.networkPlot;
//last addition
perfectCorePeriphery.prototype.lastNode1=null;
perfectCorePeriphery.prototype.lastNode2=null;
perfectCorePeriphery.prototype.lastEdge=null;
//model control parameters
perfectCorePeriphery.prototype.degrees=[];
perfectCorePeriphery.prototype.newNodeId=null;
perfectCorePeriphery.prototype.totalNodeProbs=null;
perfectCorePeriphery.prototype.zoom=1.0;
//timing
perfectCorePeriphery.prototype.timer=null;
//functions
perfectCorePeriphery.prototype.init=function (graphPlot,powerControl,starterNodeControl) {
	var self=this;//needed for some parent references
	//get options
	this.power=this.myParseFloat($("#"+powerControl).val());
	this.amountOfStarterNodes=parseInt($("#"+starterNodeControl).val());
	//initialize $jit related object
	$("#"+graphPlot).text("");
	this.networkPlot=new $jit.ForceDirected({
		'injectInto': graphPlot,
		iterations: 50,
		Navigation: {
			enable: true,
			type: 'Native',
			panning: 'avoid nodes',
			zooming: 10
		},
		Node: {'overridable': true},
		Edge: {'overridable': true},
		levelDistance: 10,
		onBeforePlotNode: function(node){//color last Nodes in red
			if(self.isLastNode(node.id)) {
				node.data.$color='#f00';
			} else {
				node.data.$color='#fff';
			}
		},
		onBeforePlotLine: function(adj) {//color last edge in red
			if(self.isLastEdge(adj.nodeFrom.id,adj.nodeTo.id)) {
				adj.data.$color='#f00';
			} else {
				adj.data.$color='#fff';
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
	//create initial fully connected network
	this.degrees=[];
	this.lastNode1={id:"node0",name:"node0",data:{}};
	this.networkPlot.root=this.lastNode1.id;
	this.networkPlot.graph.addNode(this.lastNode1);
	this.degrees.push(Math.pow(this.amountOfStarterNodes-1,this.power));
	for(var i=1;i<this.amountOfStarterNodes;i++) {
		this.lastNode1={id:"node"+i,name:"node"+i,data:{}};
		this.networkPlot.graph.addNode(this.lastNode1);
		for(var j=0;j<i;j++) {
			this.lastNode2=this.networkPlot.graph.getNode("node"+j);
			this.lastEdge=this.networkPlot.graph.addAdjacence(this.lastNode1,this.lastNode2,{});
		}
		this.degrees.push(Math.pow(this.amountOfStarterNodes-1,this.power));
	}
	//update degrees and other model related data
	this.newNodeId=this.amountOfStarterNodes;
	this.totalNodeProbs=this.amountOfStarterNodes*Math.pow(this.amountOfStarterNodes-1,this.power);
	this.zoom=1.0;
	this.addNode();
	clearInterval(this.timer);
}
perfectCorePeriphery.prototype.play=function () {
	var self=this;
	this.timer=setInterval(function(){
		self.addNode();
	},
	1000);
}
perfectCorePeriphery.prototype.pause=function () {
	clearInterval(this.timer);
}
perfectCorePeriphery.prototype.refreshPlot=function () {
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
	limr=this.zoom*175/Math.sqrt(limr);
	this.zoom/=limr;
	this.networkPlot.canvas.scale(limr,limr);
	//refresh image
	this.networkPlot.plot();
}
perfectCorePeriphery.prototype.addNode=function () {
	//create a new node
	this.lastNode1={id:"node"+this.newNodeId,name:"node"+this.newNodeId,data:{}};
	this.networkPlot.graph.addNode(this.lastNode1);
	//evaluate its prefference to connect to
	var nodeProbs=[];
	for(var i=0;i<this.newNodeId;i++) {
		nodeProbs.push(this.degrees[i]/this.totalNodeProbs);
	}
	//find the preffered edge partner
	var rnd=Math.random();
	var sump=0;
	var dest=0;
	while(sump<rnd) {
		sump+=nodeProbs[dest];
		dest++;
	}
	dest--;
	this.lastNode2=this.networkPlot.graph.getNode("node"+dest);//cia baigtas lastNode2 atsisakymas
	//create an edge
	this.lastEdge=this.networkPlot.graph.addAdjacence(this.lastNode1,this.lastNode2,{});
	//update degrees and other model related data
	this.totalNodeProbs-=this.degrees[dest];
	this.degrees.push(1);
	this.degrees[dest]=Math.pow(Math.pow(this.degrees[dest],1.0/this.power)+1,this.power);
	this.totalNodeProbs+=(this.degrees[dest]);
	this.totalNodeProbs++;
	this.newNodeId++;
	this.refreshPlot();
}
perfectCorePeriphery.prototype.isLastNode=function(id) {
	return (id==this.lastNode1.id || id==this.lastNode2.id);
}
perfectCorePeriphery.prototype.isLastEdge=function(id1,id2) {
	return ((id1==this.lastNode1.id || id1==this.lastNode2.id) && (id2==this.lastNode1.id || id2==this.lastNode2.id));
}
//auxilarry
perfectCorePeriphery.prototype.myParseFloat=function (val) {
	return parseFloat((""+val).replace(",","."));
}