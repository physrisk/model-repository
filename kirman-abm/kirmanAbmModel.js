var kirmanAbmModel=function () {};
//properties
kirmanAbmModel.prototype.e1=1.0;
kirmanAbmModel.prototype.e2=1.0;
kirmanAbmModel.prototype.population=100;
kirmanAbmModel.prototype.optimists=50;
kirmanAbmModel.prototype.stepDt=1e-6;
kirmanAbmModel.prototype.integrationDt=1e-3;
kirmanAbmModel.prototype.kappa=0.3;
//functions
//--setting properties
kirmanAbmModel.prototype.setEpsilon1=function (e) {
	this.e1=e;
};
kirmanAbmModel.prototype.setEpsilon2=function (e) {
	this.e2=e;
};
kirmanAbmModel.prototype.setEpsilons=function (ee1, ee2) {
	this.setEpsilon1(ee1);
	this.setEpsilon2(ee2);
};
kirmanAbmModel.prototype.setPopulation=function (pop) {
	var frac=this.optimists/this.population;
	this.population=pop;
	this.optimists=frac*this.population;
};
//--special setting function
kirmanAbmModel.prototype.updateStep=function () {
	this.stepDt=2*this.kappa/(this.population*(this.e1+this.e2+this.population));
};
//--runtime functions
kirmanAbmModel.prototype.stepPerTime=function (iDt) {
	if(typeof iDt==="undefined") iDt=this.integrationDt;
	var t=0;
	while(t<iDt) {
		var vdt=Math.min(iDt-t,this.stepDt);
		this.singleInteraction(vdt);
		t+=vdt;
	}
}
kirmanAbmModel.prototype.singleInteraction=function (stepDt) {
	if(typeof stepDt==="undefined") stepDt=this.stepDt;
	var popPes=(this.population-this.optimists);
	var probPlus=popPes*(this.e1+this.optimists)*stepDt;
	var probMinus=this.optimists*(this.e2+popPes)*stepDt;
	var rnd=Math.random();
	if(rnd<probPlus) this.optimists++;
	else if(rnd<probPlus+probMinus) this.optimists--;
};