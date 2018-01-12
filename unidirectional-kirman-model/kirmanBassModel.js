var kirmanBassModel=function() {};
//properties
kirmanBassModel.prototype.e1=0.01;
kirmanBassModel.prototype.h=0.275;
kirmanBassModel.prototype.tolerance=0;
kirmanBassModel.prototype.population=100;
kirmanBassModel.prototype.customers=0;
kirmanBassModel.prototype.charity=0;
kirmanBassModel.prototype.pirates=0;
kirmanBassModel.prototype.stepDt=1e-6;
kirmanBassModel.prototype.integrationDt=1e-2;
kirmanBassModel.prototype.kappa=0.3;
kirmanBassModel.prototype.totalTime=0;
//functions
//--setting properties
kirmanBassModel.prototype.setEpsilon1=function(ee1){this.e1=ee1;};
kirmanBassModel.prototype.setHerding=function(hh) {this.h=hh;};
kirmanBassModel.prototype.setParams=function(ee1,hh){this.setEpsilon1(ee1);this.setHerding(hh);};
kirmanBassModel.prototype.setPopulation=function(pop){this.population=pop;};
kirmanBassModel.prototype.setCharity=function(pop){this.charity=pop;};
kirmanBassModel.prototype.setTolerance=function(a){this.tolerance=a;};
//--special setting function
kirmanBassModel.prototype.updateStep=function() {this.stepDt=this.kappa/(this.population*(2.0*this.e1+this.h)*(1.0+this.tolerance));};
//--runtime functions
kirmanBassModel.prototype.reset=function(iDt) {this.customers=0;this.pirates=0;this.totalTime=0;}
kirmanBassModel.prototype.predict=function() {
	var exppqt=Math.exp((this.e1+this.h)*this.totalTime);
	return this.population*this.e1*(exppqt-1.0)/(exppqt*this.e1+this.h);
}
kirmanBassModel.prototype.stepPerTime=function(iDt) {
	if(typeof iDt==="undefined") iDt=this.integrationDt;
	var t=0;
	while(t<iDt) {
		var vdt=Math.min(iDt-t,this.stepDt);
		this.singleInteraction(vdt);
		t+=vdt;
	}
	this.totalTime+=iDt;
	var curUsr=this.customers+this.pirates+this.charity;
	if(this.population<=curUsr) return false;
	return true;
}
kirmanBassModel.prototype.singleInteraction=function(stepDt) {
	if(typeof stepDt==="undefined") stepDt=this.stepDt;
	var curUsr=this.customers+this.pirates+this.charity;
	if(this.population<=curUsr) return false;
	var probPlus=(this.population-curUsr)*(this.e1+this.h*curUsr/this.population)*stepDt;
	if(Math.random()<probPlus) this.customers++;
	probPlus=this.tolerance*probPlus;
	if(Math.random()<probPlus) this.pirates++;
	return true;
};