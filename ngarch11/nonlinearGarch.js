var nonlinearGarch=function () {
	this.lastOmega=this.GaussianRandom(0,1);
	this.lastOmega2=this.lastOmega*this.lastOmega;
};
//properties
nonlinearGarch.prototype.a1=1.0;
nonlinearGarch.prototype.b1=1.0;
nonlinearGarch.prototype.c1=1.0;
nonlinearGarch.prototype.mu=1.0;//realiai 2 eta
nonlinearGarch.prototype.sqrtOmegaHat=1;
nonlinearGarch.prototype.lastOmega=1;
nonlinearGarch.prototype.lastOmega2=1;
nonlinearGarch.prototype.lastSigma2=1;
nonlinearGarch.prototype.boundaries=[1e-2,1e2];
nonlinearGarch.prototype.savedGauss=false;
//functions
//--setting properties
nonlinearGarch.prototype.setParameters=function (va1,vb1,vc1,vmu) {
	this.a1=va1;
	this.b1=vb1;
	this.c1=vc1;
	this.mu=vmu;
};
nonlinearGarch.prototype.setState=function (vo2,vs2) {
	this.lastOmega2=vo2;
	this.lastOmega=Math.sqrt(vo2);
	if(Math.random()<0.5) this.lastOmega=-this.lastOmega;
	this.lastSigma2=vs2;
};
//--runtime functions
nonlinearGarch.prototype.step=function () {
	var zeta=this.lastOmega*Math.sqrt(this.lastSigma2);//eta=0.5
	if(this.mu!=1) {//eta!=0.5
		//spartus pakelimas laipsniu po 0.5
		var rez=zeta;
		for(var i=1;i<this.mu;i++) rez*=zeta;
		zeta=rez;
	}
	this.lastSigma2=this.a1+this.b1*zeta+this.lastSigma2*this.c1;
	this.lastSigma2=Math.max(Math.min(this.lastSigma2,this.boundaries[1]),this.boundaries[0]);
	this.lastOmega=this.GaussianRandom(0,1);
	this.lastOmega2=this.lastOmega*this.lastOmega;
	return this.lastSigma2;
}
//--auxilary
nonlinearGarch.prototype.GaussianRandom=function(mu,sigma) {
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