var nonlinearSde=function () {
	this.lastOmega=this.GaussianRandom(0,1);
	this.lastOmega2=this.lastOmega*this.lastOmega;
};
//properties
nonlinearSde.prototype.lambda=3.0;
nonlinearSde.prototype.doubleEta=4;
nonlinearSde.prototype.lastX=4.0;
nonlinearSde.prototype.kappa=0.03;
nonlinearSde.prototype.boundaries=[1,1e3];
nonlinearSde.prototype.savedGauss=false;
//functions
//--setting properties
nonlinearSde.prototype.setParameters=function (vla,veta) {
	this.lambda=vla;
	this.doubleEta=2*veta;
};
nonlinearSde.prototype.setState=function (vx) {
	this.lastX=vx;
};
//--runtime functions
nonlinearSde.prototype.variableTimeStep=function(x) {
	return this.kappa*this.kappa/this.raiseToPower(x,2*(this.doubleEta-2));
}
nonlinearSde.prototype.drift=function(x) {
	return ((this.doubleEta-this.lambda)/2.0)*this.raiseToPower(x,2*(this.doubleEta-1));
}
nonlinearSde.prototype.diffusion=function(x) {
	return this.raiseToPower(x,this.doubleEta);
}
nonlinearSde.prototype.solveSDE=function(x, dt) {
	return x+this.drift(x)*dt+this.diffusion(x)*Math.sqrt(dt)*this.GaussianRandom(0,1);
}
nonlinearSde.prototype.step=function (dt) {
	var t=0;
	var rez=0;
	while(t<dt) {
		var innerDt=this.variableTimeStep(this.lastX);
		if(!isFinite(innerDt)) innerDt=dt+dt-t-t;
		var whileDt=Math.min(dt-t,innerDt);
		this.lastX=Math.min(Math.max(this.solveSDE(this.lastX,whileDt),this.boundaries[0]),this.boundaries[1]);
		t+=whileDt;
	}
	return this.lastX;
}
//--auxilary
nonlinearSde.prototype.GaussianRandom=function(mu,sigma) {
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
nonlinearSde.prototype.raiseToPower=function(x, pow) {
	var rez=x;
	var sqrtx=Math.sqrt(x);
	for(var i=2;i<pow;i++) rez*=sqrtx;
	return rez;
}