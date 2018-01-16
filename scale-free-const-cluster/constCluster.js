var constCluster=function (){};
//model parameters
constCluster.prototype.links=1.0;
constCluster.prototype.a=1.0;
//general $jit object
constCluster.prototype.networkPlot;
constCluster.prototype.ccPlot;
constCluster.prototype.pdfPlot;
//last addition
constCluster.prototype.lastNode1=null;
//model control parameters
constCluster.prototype.degrees=[];
constCluster.prototype.cluster=[];
constCluster.prototype.clusterHistory=[];
constCluster.prototype.clusterSum=0;
constCluster.prototype.newNodeId=null;
constCluster.prototype.totalNodeProbs=null;
constCluster.prototype.zoom=1.0;
//new vars
constCluster.prototype.activeNodes=[];
//timing
constCluster.prototype.timer=null;
//functions
constCluster.prototype.init=function (graphPlot,ccP,pdfP,linksControl) {
	var self=this;//needed for some parent references
	//get options
	this.ccPlot=ccP;
	this.pdfPlot=pdfP;
	this.links=this.myParseFloat($("#"+linksControl).val());
	this.links=Math.ceil(this.links);
	this.a=this.links;
	this.activeNodes=[];
	//remember flot object id
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
		Node: {'overridable': true, 'color': '#fff'},
		Edge: {'overridable': true, 'color': '#fff'},
		levelDistance: 10,
		onBeforePlotNode: function(node){//color last Nodes in red
			if(self.isLastNode(node.id)) node.data.$color='#f00';
			else node.data.$color='#fff';
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
	//create initial nodes
	for(var i=0;i<this.links;i++) {
		this.lastNode1={id:"node"+i,name:"node"+i,data:{}};
		this.activeNodes.push(i);
		this.networkPlot.graph.addNode(this.lastNode1);
		if(i==0) this.networkPlot.root=this.lastNode1.id;
	}
	this.newNodeId=this.links;
	//connect them
	this.degrees=[];
	this.cluster=[];
	this.clusterHistory=[];
	this.clusterSum=0;
	for(var i=0;i<this.links;i++) {
		var tmpNode1=this.networkPlot.graph.getNode("node"+i);
		for(var j=i+1;j<this.links;j++) {
			var tmpNode2=this.networkPlot.graph.getNode("node"+j);
			this.networkPlot.graph.addAdjacence(tmpNode1,tmpNode2,{});
		}
		this.degrees.push(this.links-1);
		this.cluster.push(1.0);
		this.clusterSum++;
	}
	this.clusterHistory.push([this.degrees.length-this.links,this.clusterSum/this.degrees.length]);
	//update degrees and other model related data
	this.zoom=1.0;
	clearInterval(this.timer);
	this.refreshPlot();
}
constCluster.prototype.play=function () {
	var self=this;
	this.timer=setInterval(function(){
		self.addNode();
	},
	100);
}
constCluster.prototype.pause=function () {
	clearInterval(this.timer);
}
constCluster.prototype.refreshPlot=function () {
	if(!(this.degrees.length%10==(this.links)%10)) return;
	this.reevalPdf();
	this.networkPlot.compute();
	this.networkPlot.plot();
}
constCluster.prototype.addNode=function () {
	//create a new node
	this.lastNode1={id:"node"+this.newNodeId,name:"node"+this.newNodeId,data:{}};
	this.networkPlot.graph.addNode(this.lastNode1);
	//connect to all active nodes
	for(var i=0;i<this.activeNodes.length;i++) {
		var tmpNode1=this.networkPlot.graph.getNode("node"+this.activeNodes[i]);
		this.networkPlot.graph.addAdjacence(this.lastNode1,tmpNode1,{});
		this.degrees[this.activeNodes[i]]++;
	}
	this.degrees.push(this.links);
	this.cluster.push(1.0);
	this.clusterSum++;
	this.activeNodes.push(this.newNodeId);
	//refresh clustering of actives nodes
	for(var i=0;i<this.activeNodes.length-1;i++) {
		var tmpC=this.cluster[this.activeNodes[i]];
		var tmpK=this.degrees[this.activeNodes[i]];
		this.cluster[this.activeNodes[i]]=(tmpC*(tmpK-1)*(tmpK-2)+2*(this.links-1))/(tmpK*(tmpK-1));
		this.clusterSum=this.clusterSum+this.cluster[this.activeNodes[i]]-tmpC;
	}
	this.clusterHistory.push([this.degrees.length-this.links,this.clusterSum/this.degrees.length]);
	//disable single active node
	var tmpSum=0;
	var tmpProbs=[];
	for(var i=0;i<this.activeNodes.length;i++) {
		tmpProbs.push(1.0/(this.a+this.degrees[this.activeNodes[i]]));
		tmpSum+=tmpProbs[i];
	}
	var tmpRnd=tmpSum*Math.random();
	var removeId=-1;
	tmpSum=0;
	for(var i=0;i<this.activeNodes.length && tmpSum<tmpRnd;i++) {
		tmpSum+=tmpProbs[i];
		removeId=i;
	}
	this.activeNodes.splice(removeId,1);
	this.newNodeId++;
	this.refreshPlot();
}
constCluster.prototype.isLastNode=function(id) {
	return (id==this.lastNode1.id);
}
constCluster.prototype.isLastEdge=function(id1,id2) {
	return (id1==this.lastNode1.id || id2==this.lastNode1.id);
}
constCluster.prototype.myParseFloat=function (val) {
	return parseFloat((""+val).replace(",","."));
}
constCluster.prototype.reevalPdf=function() {
	var diag=this.degrees;
	var llim=Math.min.apply(Math,diag);
	var rlim=Math.max.apply(Math,diag);
	var pdf=commonFunctions.pdfModification(
		commonFunctions.makePdf(diag,llim,rlim,rlim-llim,false),
		true,llim*0.9,rlim*1.1,60,llim,1.0
	);
	diag=null;
	var tmpConst=commonFunctions.LogBase10(1+this.a/this.links)+(1+this.a/this.links)*commonFunctions.LogBase10(llim);
	$.plot($("#"+this.pdfPlot),[{data: pdf, color: "red", points: {show: true}, lines: {show: false}},{data: [[commonFunctions.LogBase10(llim),tmpConst-(2+this.a/this.links)*commonFunctions.LogBase10(llim)],[commonFunctions.LogBase10(rlim),tmpConst-(2+this.a/this.links)*commonFunctions.LogBase10(rlim)]], color: "gray"}],$('#'+this.pdfPlot).data('plotOptions'));
	$.plot($("#"+this.ccPlot),[{data:this.clusterHistory, color:"red", points: {show: true}, lines: {show: false}}],$('#'+this.ccPlot).data('plotOptions'));
}
