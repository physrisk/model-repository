var kirmanBassModel=function() {};
//properties
kirmanBassModel.prototype.e1min=0.01;
kirmanBassModel.prototype.e1mean=0.01;
kirmanBassModel.prototype.e1max=0.01;
kirmanBassModel.prototype.hmin=0.25;
kirmanBassModel.prototype.hmean=0.275;
kirmanBassModel.prototype.hmax=0.3;
kirmanBassModel.prototype.population=100;
kirmanBassModel.prototype.customers=0;
kirmanBassModel.prototype.stepDt=1e-6;
kirmanBassModel.prototype.integrationDt=1e-2;
kirmanBassModel.prototype.kappa=0.3;
kirmanBassModel.prototype.totalTime=0;
kirmanBassModel.prototype.e1=[];
kirmanBassModel.prototype.h=[];
kirmanBassModel.prototype.state=[];
//functions
//--setting properties
kirmanBassModel.prototype.setEpsilon1=function(min1,max1){this.e1min=min1;this.e1max=max1;this.e1mean=0.5*(min1+max1);};
kirmanBassModel.prototype.setHerding=function(min,max) {this.hmin=min;this.hmax=max;this.hmean=0.5*(min+max)};
kirmanBassModel.prototype.setParams=function(min1,max1,hmin,hmax){this.setEpsilon1(min1,max1);this.setHerding(hmin,hmax);};
kirmanBassModel.prototype.setPopulation=function(pop){
    this.population=pop;
    this.state=new Array(pop);
    this.e1=new Array(pop);
    this.h=new Array(pop);
    for(i=0;i<pop;i++) {
        this.state[i]=0;
        this.e1[i]=(this.e1max-this.e1min)*Math.random()+this.e1min;
        this.h[i]=(this.hmax-this.hmin)*Math.random()+this.hmin;
    }
};
//--special setting function
kirmanBassModel.prototype.updateStep=function() {this.stepDt=this.kappa/(this.population*(2.0*this.e1max+this.hmax));};
//--runtime functions
kirmanBassModel.prototype.predict=function() {
	var exppqt=Math.exp((this.e1mean+this.hmean)*this.totalTime);
	return this.population*this.e1mean*(exppqt-1.0)/(exppqt*this.e1mean+this.hmean);
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
	var curUsr=this.customers;
	if(this.population<=curUsr) return false;
	return true;
}
kirmanBassModel.prototype.singleInteraction=function(stepDt) {
	if(typeof stepDt==="undefined") stepDt=this.stepDt;
	var curUsr=this.customers;
	if(this.population<=curUsr) return false;
    var r=Math.random();
    var p=0;
    for(i=0;i<this.population;i++) {
        if(this.state[i]==0) {
            p+=(this.e1[i]+this.h[i]*curUsr/this.population)*stepDt;
        }
        if(r<p) {
            this.state[i]=1;
            this.customers++;
            break;
        }
    }
	return true;
};
