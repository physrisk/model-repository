var kirmanAbmModel=function () {};
//properties
kirmanAbmModel.prototype.e1=1.0;
kirmanAbmModel.prototype.e2=1.0;
kirmanAbmModel.prototype.controledAgents=0;
kirmanAbmModel.prototype.population=100;
kirmanAbmModel.prototype.optimists=50;
kirmanAbmModel.prototype.stepDt=1e-6;
kirmanAbmModel.prototype.integrationDt=1e-2;
kirmanAbmModel.prototype.kappa=0.3;
kirmanAbmModel.prototype.interactionType=1;
//functions
//-=1setting properties
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
kirmanAbmModel.prototype.setControledAgents=function (s) {
    this.controledAgents=s;
};
kirmanAbmModel.prototype.setPopulation=function (pop) {
    var frac=this.optimists/this.population;
    this.population=pop;
    this.optimists=frac*this.population;
};
kirmanAbmModel.prototype.setInteractionType=function (x) {
    this.interactionType=x;
};
//-=1special setting function
kirmanAbmModel.prototype.updateStep=function () {
    if(this.interactionType==1) this.stepDt=this.kappa/(this.population*(this.e1+this.e2+this.population+Math.abs(this.controledAgents)));
    else if(this.interactionType==2) this.stepDt=this.kappa/(this.population*(this.e1+this.e2+1.0+Math.abs(this.controledAgents)));
    else this.stepDt=this.kappa/(this.population*(this.e1+this.e2+1.0)+Math.abs(this.controledAgents));
};
//-=1getting interesting properties
kirmanAbmModel.prototype.getExpectedMean=function () {
    var optSpec=0;
    if(this.controledAgents>0) optSpec=this.controledAgents;
    if(this.interactionType==1 || this.interactionType==2) return (this.e1+optSpec)/(this.e1+this.e2+Math.abs(this.controledAgents));
    else return (this.e1+optSpec/this.population)/(this.e1+this.e2+Math.abs(this.controledAgents/this.population));
};
//-=1runtime functions
kirmanAbmModel.prototype.stepPerTime=function (iDt) {
    if(typeof iDt==="undefined") iDt=this.integrationDt;
    var t=0;
    while(t<iDt) {
        var vdt=Math.min(iDt-t,this.stepDt);
        this.singleInteraction(vdt);
        t+=vdt;
    }
};
kirmanAbmModel.prototype.singleInteraction=function (stepDt) {
    var optSpec=0;
    var pesSpec=0;
    if(this.controledAgents>0) optSpec=this.controledAgents;
    else if(this.controledAgents<0) pesSpec=-this.controledAgents;
    var popPes=(this.population-this.optimists);
    var probPlus=0;
    var probMinus=0;
    if(this.interactionType==1) {//fully non-extensive
        probPlus=popPes*(this.e1+optSpec+this.optimists)*stepDt;
        probMinus=this.optimists*(this.e2+pesSpec+popPes)*stepDt;
    } else if(this.interactionType==2) {//normal agents extensive, controlled agents non-extensive
        probPlus=popPes*(this.e1+optSpec+this.optimists/this.population)*stepDt;
        probMinus=this.optimists*(this.e2+pesSpec+popPes/this.population)*stepDt;
    } else if(this.interactionType==3) {//normal agents extensive, controlled agents non-extensive
        probPlus=popPes*(this.e1+(optSpec+this.optimists)/this.population)*stepDt;
        probMinus=this.optimists*(this.e2+(pesSpec+popPes)/this.population)*stepDt;
    }
    var rnd=Math.random();
    if(rnd<probPlus) this.optimists+=1;
    else if(rnd<probPlus+probMinus) this.optimists-=1;
};
