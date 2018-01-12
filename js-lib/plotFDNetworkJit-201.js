var labelType, useGradients, nativeTextSupport, animate;

(function() {
	var ua = navigator.userAgent,
		iStuff = ua.match(/iPhone/i) || ua.match(/iPad/i),
		typeOfCanvas = typeof HTMLCanvasElement,
		nativeCanvasSupport = (typeOfCanvas == 'object' || typeOfCanvas == 'function'),
		textSupport = nativeCanvasSupport 
		&& (typeof document.createElement('canvas').getContext('2d').fillText == 'function');
	labelType = (!nativeCanvasSupport || (textSupport && !iStuff))? 'Native' : 'HTML';
	nativeTextSupport = labelType == 'Native';
	useGradients = nativeCanvasSupport;
	animate = !(iStuff || !nativeCanvasSupport);
})();

var Log = {
	left: 225,
	target: 'log',
	elem: false,
	write: function(text){
		if(!this.elem) this.elem = $('#'+this.target);
		this.elem.text(text);
		this.elem.css("left",(this.left - this.elem.width()/2)+'px');
	},
	hide: function() {
		if(!this.elem) this.elem = $('#'+this.target);
		this.elem.fadeOut(3000);
	},
	show: function() {
		if(!this.elem) this.elem = $('#'+this.target);
		this.elem.show();
	}
};

function adjacencyMatrixToJSON(adj) {
	var json=[];
	for(var i=0;i<adj.length;i++) {
		var tmp={
			"id": "node"+i,
			"name": "node"+i,
			"adjacencies": []
		}
		for(var j=i+1;j<adj[i].length;j++) {
			if(adj[i][j]==1) tmp.adjacencies.push({"nodeTo": "node"+j});
		}
		json.push(tmp);
	}
	return json;
}

function adjacenyMatrixToDegreeHist(adj,logscale) {
	logscale=typeof logscale!=='undefined' ? logscale : false;
	var diag=[];
	var minDegree=-1;
	var maxDegree=-1;
	for(var i=0;i<adj.length;i++) {
		diag[i]=adj[i][i];
		if(minDegree>diag[i] || minDegree<0) minDegree=diag[i];
		if(maxDegree<diag[i] || maxDegree<0) maxDegree=diag[i];
	}
	var hist=[];
	for(var i=minDegree;i<=maxDegree;i++) {
		var numNodes=0;
		for(var j=0;j<adj.length;j++) {
			if(adj[j][j]==i) numNodes++;
		}
		hist.push([i,numNodes/adj.length]);
	}
	if(logscale) {
		for(var i=0;i<hist.length;i++) {
			hist[i][0]=Math.log(hist[i][0])/Math.LN10;
			hist[i][1]=Math.log(hist[i][1])/Math.LN10;
		}
	}
	return hist;
}

function plotGraph(json,graphTarget,messageTarget){
	Log.target=messageTarget;
	var graph=new $jit.ForceDirected({
		'injectInto': graphTarget,
		iterations: 200,
		Navigation: {
			enable: true,
			type: 'Native',
			panning: 'avoid nodes',
			zooming: 10
		},
		levelDistance: 10
	});
    graph.loadJSON(json);
	graph.computeIncremental({
		iter: 40,
		property: 'end',
		onStep: function(perc){
			Log.write(perc+'%');
		},
		onComplete: function(){
			Log.write('done');
			graph.animate({
				modes: ['linear'],
				transition: $jit.Trans.Elastic.easeOut,
				duration: 2500
			});
			Log.hide();
			graph.canvas.scale(0.9,0.9);
			setTimeout(function(){$('#restart').removeAttr('disabled');},3000);
		}
	});
}