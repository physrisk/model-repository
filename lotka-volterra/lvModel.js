var lvModel=function () {};
//properties
lvModel.prototype.a1=20.0;
lvModel.prototype.a2=30.0;
lvModel.prototype.c12=1.0;
lvModel.prototype.c21=1.0;
lvModel.prototype.tmax=1.0;
lvModel.prototype.x1=8.0;
lvModel.prototype.x2=12.0;
lvModel.prototype.kappa=0.1;
//functions
lvModel.prototype.setParams=function (aa1, aa2, cc12, cc21, ttmax, x10, x20) {
	this.a1=aa1;
	this.a2=aa2;
	this.c12=cc12;
	this.c21=cc21;
	this.tmax=ttmax;
	this.x1=xx10;
	this.x2=xx20;
};
lvModel.prototype.realization=function () {
	var rez1=new Array();
	var rez2=new Array();
	var t=0;
	var selStep=this.tmax/300.0;
	while(t<this.tmax) {
		var ret=this.step(selStep);
		rez1.push([t,ret[0]]);
		rez2.push([t,ret[1]]);
		t+=selStep;
	}
	return [rez1,rez2];
}
lvModel.prototype.step=function (dt) {
	var t=0;
	while(t<dt) {
		var term1=this.a1*this.x1;
		var term2=this.c12*this.x1*this.x2;
		var term3=this.a2*this.x2;
		var term4=this.c21*this.x1*this.x2;
		var stepSize=Math.max(term1,term2);
		stepSize=Math.max(stepSize,term3);
		stepSize=Math.max(stepSize,term4);
		var innerT=Math.min(this.kappa/stepSize,dt-t);
		this.x1=this.x1+innerT*(term1-term2);
		this.x2=this.x2+innerT*(term4-term3);
		t+=innerT;
	}
	return [this.x1,this.x2];
};