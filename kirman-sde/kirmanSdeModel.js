var kirmanSdeModel=function () {};
//properties
kirmanSdeModel.prototype.e1=1.0;
kirmanSdeModel.prototype.e2=1.0;
kirmanSdeModel.prototype.frac=0.5;
kirmanSdeModel.prototype.stepDt=1e-6;
kirmanSdeModel.prototype.integrationDt=1e-3;
kirmanSdeModel.prototype.kappa=1e-6;
kirmanSdeModel.prototype.boundary=1e-6;
//functions
//-=1setting properties
kirmanSdeModel.prototype.setEpsilon1=function (e) {
    this.e1=e;
};
kirmanSdeModel.prototype.setEpsilon2=function (e) {
    this.e2=e;
};
kirmanSdeModel.prototype.setEpsilons=function (ee1, ee2) {
    this.setEpsilon1(ee1);
    this.setEpsilon2(ee2);
};
kirmanSdeModel.prototype.setState=function (e) {
    this.frac=e;
};
//-=1special setting function
kirmanSdeModel.prototype.updateStep=function () {
    this.stepDt=this.kappa/(this.e1+this.e2+1.0);
};
//-=1runtime functions
kirmanSdeModel.prototype.stepPerTime=function (iDt) {
    if(typeof iDt==="undefined") iDt=this.integrationDt;
    var t=0;
    while(t<iDt) {
        var vdt=Math.min(iDt-t,this.stepDt);
        this.singleStep(vdt);
        t+=vdt;
    }
};
kirmanSdeModel.prototype.singleStep=function (stepDt) {
    if(typeof stepDt==="undefined") stepDt=this.stepDt;
    this.frac=this.frac+(this.e1*(1.0-this.frac)-this.e2*this.frac)*stepDt+Math.sqrt(2.0*this.frac*(1.0-this.frac)*this.stepDt)*commonFunctions.gaussianRandom();
    this.frac=Math.max(Math.min(this.frac,1.0-this.boundary),this.boundary);
};
