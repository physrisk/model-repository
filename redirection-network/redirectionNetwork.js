var redirectionNetwork=function (){};
//model parameters
redirectionNetwork.prototype.lambda=0.75;
redirectionNetwork.prototype.type=1;
//general $jit object
redirectionNetwork.prototype.networkPlot;
//id of flot object
redirectionNetwork.prototype.pdfPlot;
//last addition
redirectionNetwork.prototype.lastNode1=null;
redirectionNetwork.prototype.lastNode2=null;
//model control parameters
redirectionNetwork.prototype.degrees=[];
redirectionNetwork.prototype.parrents=[];
redirectionNetwork.prototype.newNodeId=null;
redirectionNetwork.prototype.zoom=1.0;
//timing
redirectionNetwork.prototype.timer=null;
//functions
redirectionNetwork.prototype.init=function (graphPlot,pdfPlot,lambdaControl,typeControl) {
	var self=this;//needed for some parent references
	//get options
	this.lambda=this.myParseFloat($("#"+lambdaControl).val());
	this.type=parseInt($("#"+typeControl).val());
	//remember flot object id
	this.pdfPlot=pdfPlot;
	//set flot plot options
	$('#'+this.pdfPlot).data('plotOptions', {
		xaxis: {
			axisLabel: 'lg[d]',
			min: null,
			max: null
		} ,
		yaxis: {
			axisLabel: 'lg[p(d)]',
			min: null,
			max: null
		}
	});
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
		onBeforePlotNode: function(node){//color and size nodes based on their degree
			var numId=parseInt(node.id.substr(4));
			var rlim=Math.max.apply(Math,self.degrees);
			if(self.degrees[numId]<=1) node.data.$color='#0f0';
			else if(self.degrees[numId]<=rlim*0.7) node.data.$color='#00f';
			else node.data.$color='#f00';
			node.data.$dim=3.0*(Math.log(self.degrees[numId]+1)+1.0);
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
	//create two initial nodes
	this.lastNode1={id:"node0",name:"node0",data:{}};
	this.lastNode2={id:"node1",name:"node1",data:{}};
	//assign rootNode
	this.networkPlot.root=this.lastNode1.id;
	//addNodes to graph
	this.networkPlot.graph.addNode(this.lastNode1);
	this.networkPlot.graph.addNode(this.lastNode2);
	//connect them
	this.networkPlot.graph.addAdjacence(this.lastNode1,this.lastNode2,{});
	//update degrees and other model related data
	this.degrees=[];
	this.degrees.push(2);
	this.degrees.push(1);
	this.parrents.push(0);
	this.parrents.push(0);
	this.newNodeId=2;
	this.zoom=1.0;
	clearInterval(this.timer);
	this.refreshPlot();
}
redirectionNetwork.prototype.play=function () {
	var self=this;
	this.timer=setInterval(function(){
		self.addNode();
	},
	1000);
}
redirectionNetwork.prototype.pause=function () {
	clearInterval(this.timer);
}
redirectionNetwork.prototype.refreshPlot=function () {
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
}
redirectionNetwork.prototype.redirProb=function (a,b) {
	if(this.type==1) {
		if(b<1) return 0.0;
		return 1.0-Math.pow(b,-this.lambda);
	} else if(this.type==2) {
		return this.lambda;
	} else if(this.type==3) {
		if(b<1) return 1.0;
		return Math.pow(b,-this.lambda);
	}
}
redirectionNetwork.prototype.addNode=function () {
	//create a new node
	this.lastNode1={id:"node"+this.newNodeId,name:"node"+this.newNodeId,data:{}};
	this.networkPlot.graph.addNode(this.lastNode1);
	//evaluate its prefference to connect to
	var targetNode=Math.floor(Math.random()*this.newNodeId);
	var targetNodeDegree=this.degrees[targetNode];
	var parrentNode=this.parrents[targetNode];
	var parrentNodeDegree=this.degrees[parrentNode];
	if(Math.random()<this.redirProb(targetNodeDegree,parrentNodeDegree)) {
		targetNode=parrentNode;
	}
	targetNodeDegree=null;
	parrentNode=null;
	parrentNodeDegree=null;
	this.lastNode2=this.networkPlot.graph.getNode("node"+targetNode);
	//create an edge
	this.networkPlot.graph.addAdjacence(this.lastNode1,this.lastNode2,{});
	//update degrees and other model related data
	this.parrents.push(targetNode);
	this.degrees.push(1);
	this.degrees[targetNode]++;
	this.newNodeId++;
	this.refreshPlot();
}
redirectionNetwork.prototype.isLastNode=function(id) {
	return (id==this.lastNode1.id || id==this.lastNode2.id);
}
redirectionNetwork.prototype.isLastEdge=function(id1,id2) {
	return ((id1==this.lastNode1.id || id1==this.lastNode2.id) && (id2==this.lastNode1.id || id2==this.lastNode2.id));
}
redirectionNetwork.prototype.myParseFloat=function (val) {
	return parseFloat((""+val).replace(",","."));
}
redirectionNetwork.prototype.reevalPdf=function() {
	var diag=this.degrees;
	var llim=Math.min.apply(Math,diag);
	var rlim=Math.max.apply(Math,diag);
	var pdf=commonFunctions.pdfModification(
		commonFunctions.makePdf(diag,llim,rlim,rlim-llim,false),
		true,llim*0.9,rlim*1.1,60,llim,1.0
	);
    diag=null;
	$('#'+this.pdfPlot).data('showData',[{data: pdf, color: "blue", points: {show: true}, lines: {show: false}}]);
	this.plotFigure();
}
redirectionNetwork.prototype.plotFigure=function() {
	$.plot($("#"+this.pdfPlot),$('#'+this.pdfPlot).data('showData'),$('#'+this.pdfPlot).data('plotOptions'));
}
