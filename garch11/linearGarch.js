var linearGarch=function () {
    this.lastOmega2=this.GaussianRandom(0,1);
    this.lastOmega2*=this.lastOmega2;
};
//properties
linearGarch.prototype.a1=1.0;
linearGarch.prototype.b1=1.0;
linearGarch.prototype.c1=1.0;
linearGarch.prototype.lastOmega2=0.5;
linearGarch.prototype.lastSigma2=0.5;
linearGarch.prototype.boundaries=[1e-2,1e2];
linearGarch.prototype.savedGauss=false;
//functions
//--setting properties
linearGarch.prototype.setParameters=function (va1,vb1,vc1) {
    this.a1=va1;
    this.b1=vb1;
    this.c1=vc1;
};
linearGarch.prototype.setState=function (vo,vs2) {
    this.lastOmega2=vo;
    this.lastSigma2=vs2;
};
//--runtime functions
linearGarch.prototype.step=function () {
    this.lastSigma2=this.a1+this.lastSigma2*(this.c1+this.b1*this.lastOmega2);
    this.lastSigma2=Math.max(Math.min(this.lastSigma2,this.boundaries[1]),this.boundaries[0]);
    this.lastOmega2=this.GaussianRandom(0,1);
    this.lastOmega2*=this.lastOmega2;
    //console.log(this.lastSigma2+" "+this.lastOmega2);
    return this.lastSigma2;
};
//--auxilary
linearGarch.prototype.GaussianRandom=function(mu,sigma) {
    if(this.savedGauss===false) {
        var u1=Math.random();
        var u2=Math.random();
        this.savedGauss=Math.sqrt(-2.0*Math.log(u1))*Math.sin(2.0*Math.PI*u2);
        return mu+sigma*Math.sqrt(-2.0*Math.log(u1))*Math.cos(2.0*Math.PI*u2);
    }
    var ret=mu+sigma*this.savedGauss;
    this.savedGauss=false;
    return ret;
};
