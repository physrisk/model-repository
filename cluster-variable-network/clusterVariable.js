var constCluster=function (){};
//model parameters
constCluster.prototype.links=1.0;
constCluster.prototype.probLocal=0;
constCluster.prototype.redoGraph=false;
//general $jit object
constCluster.prototype.networkPlot;
constCluster.prototype.ccPlot;
constCluster.prototype.pdfPlot;
//last addition
constCluster.prototype.lastNode1=null;
//model control parameters
constCluster.prototype.degrees=[];
constCluster.prototype.friends=[];
constCluster.prototype.cluster=[];
constCluster.prototype.clusterHistory=[];
constCluster.prototype.clusterSum=0;
constCluster.prototype.newNodeId=null;
constCluster.prototype.totalNodeProbs=null;
//timing
constCluster.prototype.timer=null;
//functions
constCluster.prototype.init=function (graphPlot,ccP,pdfP,linksControl,pControl) {
	var self=this;//needed for some parent references
	//get options
	this.ccPlot=ccP;
	this.pdfPlot=pdfP;
	this.links=this.myParseFloat($("#"+linksControl).val());
	this.links=Math.ceil(this.links);
	this.probLocal=this.myParseFloat($("#"+pControl).val());
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
	//create initial nodes and one default
	for(var i=0;i<this.links+1;i++) {
		this.lastNode1={id:"node"+i,name:"node"+i,data:{}};
		this.networkPlot.graph.addNode(this.lastNode1);
		if(i==0) this.networkPlot.root=this.lastNode1.id;
	}
	this.newNodeId=this.links+1;
	this.degrees=[];
	this.friends=[];
	this.cluster=[];
	this.clusterHistory=[];
	this.clusterSum=0;
	this.totalNodeProbs=0;
	var tmpNode2=this.networkPlot.graph.getNode("node"+this.links);
	for(var i=0;i<this.links+1;i++) {
		if(i!=this.links) {
			var tmpNode1=this.networkPlot.graph.getNode("node"+i);
			this.networkPlot.graph.addAdjacence(tmpNode1,tmpNode2,{});
			this.degrees.push(1);
			this.friends.push([this.links]);
			this.totalNodeProbs++;
		} else {
			this.degrees.push(this.links);
			var friendL=[];
			for(var j=0;j<i;j++) friendL.push(j);
			this.friends.push(friendL);
			this.totalNodeProbs+=this.links;
		}
		this.cluster.push(0.0);
	}
	tmpNode2=null;
	this.clusterHistory.push([this.degrees.length-this.links,this.clusterSum/this.degrees.length]);
	//update degrees and other model related data
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
	if(!(this.degrees.length%10==(this.links+1)%10)) this.reevalPdf();
	if(this.redoGraph) {
		this.networkPlot.compute();
		this.networkPlot.plot();
	}
}
constCluster.prototype.findPref=function (arr) {
	var cont=true;
	var nodeProbs=[];
	for(var i=0;i<this.newNodeId;i++) {
		nodeProbs.push(this.degrees[i]/this.totalNodeProbs);
	}
	while(cont) {
		var rnd=Math.random();
		var sump=0;
		var dest=0;
		while(sump<rnd) {
			sump+=nodeProbs[dest];
			dest++;
		}
		dest--;
		if(arr==null || arr.length==0 || arr.indexOf(dest)==-1) cont=false;
	}
	return dest;
}
constCluster.prototype.findNeighbor=function (id, arr) {
	var friends=this.friends[id];
	if(arr==null || arr.length==0) return friends[Math.floor(Math.random()*friends.length)];
	var cand=[];
	for(var i=0;i<friends.length;i++) {
		if(arr.indexOf(friends[i])==-1) cand.push(friends[i]);
	}
	if(cand.length==0) return -1;
	return cand[Math.floor(Math.random()*cand.length)];
	
}
constCluster.prototype.addNode=function () {
	//create a new node
	var friendL=[];
	this.lastNode1={id:"node"+this.newNodeId,name:"node"+this.newNodeId,data:{}};
	this.networkPlot.graph.addNode(this.lastNode1);
	//find first preffered
	var dest=this.findPref(null);
	var tmpNode1=this.networkPlot.graph.getNode("node"+dest);
	this.networkPlot.graph.addAdjacence(this.lastNode1,tmpNode1,{});
	this.degrees[dest]++;
	this.totalNodeProbs++;
	friendL.push(dest);
	//connect to others
	for(var i=1;i<this.links;i++) {
		var ndest=-1;
		if(Math.random()<this.probLocal) ndest=this.findNeighbor(dest,friendL);
		if(ndest==-1) {
			ndest=this.findPref(friendL);
			if(ndest>=0) dest=ndest;
		}
		if(ndest>=0) {
			tmpNode1=this.networkPlot.graph.getNode("node"+ndest);
			this.networkPlot.graph.addAdjacence(this.lastNode1,tmpNode1,{});
			this.degrees[ndest]++;
			this.totalNodeProbs++;
			friendL.push(ndest);
		}
	}
	this.degrees.push(this.links);
	this.totalNodeProbs+=this.links;
	this.friends.push(friendL);
	for(var i=0;i<friendL.length;i++) this.friends[friendL[i]].push(this.newNodeId);
	//refresh
	this.cluster.push(0.0);
	for(var i=0;i<friendL.length;i++) this.refreshClust(friendL[i]);
	this.refreshClust(this.newNodeId);
	this.clusterHistory.push([this.degrees.length-this.links,this.clusterSum/this.degrees.length]);
	this.refreshPlot();
	this.newNodeId++;
}
constCluster.prototype.refreshClust=function (id) {
	if(this.degrees[id]<=1) return 0;
	this.clusterSum-=this.cluster[id];
	var cc=0;
	for(var i=0;i<this.friends[id].length-1;i++) {
		var idf1=this.friends[id][i];
		for(var j=i+1;j<this.friends[id].length;j++) {
			if(this.friends[idf1].indexOf(this.friends[id][j])>-1) cc++;
		}
	}
	this.cluster[id]=2.0*cc/(this.degrees[id]*(this.degrees[id]-1));
	this.clusterSum+=this.cluster[id];
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
	$.plot($("#"+this.pdfPlot),[{data: pdf, color: "red", points: {show: true}, lines: {show: false}}],$('#'+this.pdfPlot).data('plotOptions'));
	$.plot($("#"+this.ccPlot),[{data:this.clusterHistory, color:"red", points: {show: true}, lines: {show: false}}],$('#'+this.ccPlot).data('plotOptions'));
}
