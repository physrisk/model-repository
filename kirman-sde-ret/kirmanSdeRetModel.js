var kirmanSdeRetModel=function () {};
//properties
kirmanSdeRetModel.prototype.e1=1.0;
kirmanSdeRetModel.prototype.e2=1.0;
kirmanSdeRetModel.prototype.frac=0.5;
kirmanSdeRetModel.prototype.integrationDt=1e-3;
kirmanSdeRetModel.prototype.kappa2=0.16;
kirmanSdeRetModel.prototype.boundaries=[1e-2,1e2];
kirmanSdeRetModel.prototype.tauScen=3;
//functions
//--setting properties
kirmanSdeRetModel.prototype.setEpsilon1=function (e) {
	this.e1=e;
};
kirmanSdeRetModel.prototype.setEpsilon2=function (e) {
	this.e2=e;
};
kirmanSdeRetModel.prototype.setEpsilons=function (ee1, ee2) {
	this.setEpsilon1(ee1);
	this.setEpsilon2(ee2);
};
kirmanSdeRetModel.prototype.setState=function (e) {
	this.frac=e;
};
kirmanSdeRetModel.prototype.setTauScenario=function (a) {
	this.tauScen=a;
};
//--runtime functions
kirmanSdeRetModel.prototype.stepPerTime=function (iDt) {
	if(typeof iDt==="undefined") iDt=this.integrationDt;
	var t=0;
	while(t<iDt) {
		var vdt=Math.min(iDt-t,this.wantedDt(this.frac));
		this.frac=this.solveSde(this.frac,vdt);
		t+=vdt;
	}
}
kirmanSdeRetModel.prototype.tauScenario=function (y) {
	switch(this.tauScen) {
		case 3: return 1.0/(y*y);
		case 2: return 1.0/y;
		case 1: return 1.0/Math.sqrt(y);
		case 0: 
		default: return 1.0;
	}
}
kirmanSdeRetModel.prototype.wantedDt=function (y) {
	return this.kappa2*this.tauScenario(y)/(y*(1.0+y)*(1.0+y));
}
kirmanSdeRetModel.prototype.drift=function (y) {
	return (this.e1+y*(2.0-this.e2)/this.tauScenario(y))*(1.0+y);
}
kirmanSdeRetModel.prototype.diffusion=function (y) {
	return Math.sqrt(2*y/this.tauScenario(y))*(1.0+y);
}
kirmanSdeRetModel.prototype.solveSde=function (y,dt) {
	var rez=y+this.drift(y)*dt+this.diffusion(y)*Math.sqrt(dt)*commonFunctions.gaussianRandom();
	return Math.max(Math.min(rez,this.boundaries[1]),this.boundaries[0]);
}