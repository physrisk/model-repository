if(!Array.prototype.lastValue){Array.prototype.lastValue=function(){if(this.length>0){return this[this.length-1][1];}return 0;};};
if(!Array.prototype.lastTime){Array.prototype.lastTime=function(){if(this.length>0){return this[this.length-1][0];}return 0;};};

var bornholdtModel=function() {};
//properties
bornholdtModel.prototype.time=0;
bornholdtModel.prototype.spins=80;
bornholdtModel.prototype.spinsPx=3;
bornholdtModel.prototype.magnetization=0;
bornholdtModel.prototype.alfa=1;
bornholdtModel.prototype.beta=20;
bornholdtModel.prototype.sigma=0;
bornholdtModel.prototype.tau=0;
bornholdtModel.prototype.magneticDomains=[];
bornholdtModel.prototype.priceFundamental=[];
bornholdtModel.prototype.returnsFundamental=[];
bornholdtModel.prototype.price=[];
bornholdtModel.prototype.returns=[];
bornholdtModel.prototype.volume=[];
bornholdtModel.prototype.chartistImpact=1;//b
bornholdtModel.prototype.fundamentalistImpact=1;//a*m
bornholdtModel.prototype.charts=0;//n
bornholdtModel.prototype.savedGauss=false;
//functions
bornholdtModel.prototype.initialize=function(){
	this.time=0;
	this.magnetization=0;
	this.tau=this.spins*this.spins;
	this.charts=this.spins*this.spins;
	this.magneticDomains=[];
	var tmpArr=[];
	for(var i=-32768;i<0;i++) {
		tmpArr.push([i,0]);
	}
	this.volume=[];
	this.priceFundamental=[];
	this.price=[];
	this.returns=tmpArr.slice();
	this.returnsFundamental=tmpArr.slice();
	this.populate();
};
bornholdtModel.prototype.setParameters=function(al,be,si,ci,fi) {
	this.alfa=al;
	this.beta=be;
	this.sigma=si;
	this.chartistImpact=ci;
	this.fundamentalistImpact=fi;
}
bornholdtModel.prototype.populate=function(){
	this.magnetization=0;
	this.magneticDomains=[];
	for(var i=0;i<=this.spins;i++) {
		var tmp=[];
		for(var j=0;j<=this.spins;j++) {
			var trez=-1;
			if(Math.random()<0.5) trez=1;
			tmp.push(trez);
			this.magnetization+=trez;
		}
		this.magneticDomains.push(tmp);
	}
};
bornholdtModel.prototype.getSpin=function(x,y) {
	return this.magneticDomains[(this.spins+x)%this.spins][(this.spins+y)%this.spins];
}
bornholdtModel.prototype.setSpin=function(x,y,v) {
	this.magneticDomains[(this.spins+x)%this.spins][(this.spins+y)%this.spins]=v;
}
bornholdtModel.prototype.flipSpin=function(x,y) {
	var pUp=1.0/(1.0+Math.exp((-2.0)*this.beta*this.totalEnergy(x,y)));
	if(Math.random()<pUp) this.setSpin(x,y,1);
	else this.setSpin(x,y,-1);
}
bornholdtModel.prototype.totalEnergy=function(x,y){
	return this.neighborhoodEnergy(x,y)-this.globalCoupling(x,y);
};
bornholdtModel.prototype.neighborhoodEnergy=function(x,y){
	return this.getSpin(x-1,y)+this.getSpin(x+1,y)+this.getSpin(x,y-1)+this.getSpin(x,y+1);
};
bornholdtModel.prototype.globalCoupling=function(x,y){
	return this.getSpin(x,y)*this.alfa*Math.abs(this.magnetization)/this.charts;
}
bornholdtModel.prototype.estimateCurrent=function(){
	var priceOld=this.priceFundamental.lastValue();
	this.priceFundamental.push([this.time,this.priceFundamental.lastValue()+this.sigma*this.GaussianRandom(0,1)]);
	this.returnsFundamental.push([this.time,this.priceFundamental.lastValue()-priceOld]);
	priceOld=this.price.lastValue();
	this.price.push([this.time,this.priceFundamental.lastValue()+(this.chartistImpact/this.fundamentalistImpact)*this.magnetization]);
	this.returns.push([this.time,this.price.lastValue()-priceOld]);
	this.volume.push([this.time,this.chartistImpact*(1.0+Math.abs(this.magnetization)/this.charts)/2.0]);
	if(this.returnsFundamental.length>32768) {
		this.returnsFundamental.splice(0,1);
		this.returns.splice(0,1);
	}
}
bornholdtModel.prototype.GaussianRandom=function(mu,sigma) {
	if(this.savedGauss===false) {
		var u1=Math.random();
		var u2=Math.random();
		this.savedGauss=Math.sqrt(-2.0*Math.log(u1))*Math.sin(2.0*Math.PI*u2);
		return mu+sigma*Math.sqrt(-2.0*Math.log(u1))*Math.cos(2.0*Math.PI*u2);
	}
	var ret=mu+sigma*this.savedGauss;
	this.savedGauss=false;
	return ret;
}
bornholdtModel.prototype.singleInteraction=function(){
	var x=Math.floor(this.spins*Math.random());
	var y=Math.floor(this.spins*Math.random());
	this.magnetization-=this.getSpin(x,y);
	this.flipSpin(x,y);
	this.magnetization+=this.getSpin(x,y);
}
bornholdtModel.prototype.singleFrame=function(){
	this.time++;
	for(var i=0;i<this.tau;i++) this.singleInteraction();
	this.estimateCurrent();
}