commonFunctions={
	matlog2: Math.log(2),
	matlog10: Math.log(10),
	LogBase10: function(x) {return Math.log(x)/commonFunctions.matlog10;},
	pdfModification: function(pdf, log, llim, rlim, outPoints, xlim, xstep, ntrials) {
		if(!log) xlim=typeof xlim!=='undefined' ? xlim : 0;
		else xlim=typeof xlim!=='undefined' ? xlim : 1;
		xstep=typeof xstep!=='undefined' ? xstep : 1;
		ntrials=typeof ntrials!=='undefined' ? ntrials : 1;
		if((log)&&(llim<=0)) return null;
		var rez=[];
		for(i=0;i<outPoints;i++) {
			rez.push([0,0]);
		}
		var nueita=0;
		var curlim=xlim;
		while(curlim<llim) {
			curlim+=xstep;
			nueita++;
		}
		if(log) {
			llim=commonFunctions.LogBase10(llim);
			rlim=commonFunctions.LogBase10(rlim);
			var lstep=(rlim-llim)/(outPoints-1.0);
			var panaudota=0;
			while((llim<=rlim)&&(panaudota<outPoints)) {
				var integralas=0;
				llim+=lstep;
				while((commonFunctions.LogBase10(curlim)<llim)&&(nueita<pdf.length)) {
					curlim+=xstep;
					integralas+=(pdf[nueita]/ntrials);
					nueita++;
				}
				if(integralas>0) {
					rez[panaudota][0]=llim-0.5*lstep;
					if(panaudota>0) rez[panaudota][1]=commonFunctions.LogBase10(integralas/(Math.pow(10,rez[panaudota][0])-Math.pow(10,rez[panaudota-1][0])));
					else rez[panaudota][1]=commonFunctions.LogBase10(integralas/(Math.pow(10,rez[panaudota][0])-Math.pow(10,rez[panaudota][0]-lstep)));
					panaudota++;
				}
			}
			if(panaudota<outPoints) {
				var rez2=[];
				for(ii=0;ii<panaudota;ii++) {
					rez2.push(rez[ii]);
				}
				rez=[];
				for(ii=0;ii<panaudota;ii++) {
					rez.push(rez2[ii]);
				}
				rez2=null;
			}
		} else {
			var lstep=(rlim-llim)/(outPoints-1.0);
			for(i=0;i<outPoints;i++) {
				var integralas=0;
				llim+=lstep;
				while((curlim<llim)&&(nueita<pdf.length)) {
					curlim+=xstep;
					integralas+=pdf[nueita];
					nueita++;
				}
				rez[i][0]=llim-0.5*lstep;
				rez[i][1]=integralas/lstep;
			}
		}
		return rez;
	},
	makePdf: function(arrx, llim, rlim, steps, normalizeInInterval) {
		var rez=[];
		for(var i=0;i<steps;i++) rez.push(0);
		var lstep=(rlim-llim)/(steps-1.0);
		var kiek=0;
		for(var i=0;i<arrx.length;i++) {
			if((llim<=arrx[i])&&(arrx[i]<=rlim)) {
				rez[Math.floor((arrx[i]-llim)/lstep)]++;
				kiek++;
			}
		}
		if(normalizeInInterval) {
			for(var i=0;i<steps;i++) rez[i]/=(kiek);
		} else {
			for(var i=0;i<steps;i++) rez[i]/=(arrx.length);
		}
		return rez;
	},
	diagonalizeMatrix: function(adj) {
		var rez=[];
		for(var i=0;i<adj.length;i++) {
			rez.push(adj[i][i]);
		}
		return rez;
	},
	performRealFFT: function(arrx) {
		var rex=[];
		var imx=[];
		var n=arrx.length;
		var m=Math.log(n)/this.matlog2;
        var cut=0;
        if(m % 1>0) {
            var tn=Math.pow(2,Math.floor(m));
            cut=Math.floor((n-tn+1)*Math.random());
            n=tn;
        }
        m=Math.log(n)/this.matlog2;
		for(var j=cut;j<n+cut;j++) {
			rex.push(arrx[j]);
			imx.push(0);
		}
		var nm1=n-1;
		var nd2=Math.floor(n/2);
		m=this.cint(m);
		var j=nd2;
		for(var i=1;i<nm1;i++) {//bit reversal
			if(i<=j) {
				var tr=rex[j];
				var ti=imx[j];
				rex[j]=rex[i];
				imx[j]=imx[i];
				rex[i]=tr;
				imx[i]=ti;
			}
			var k=nd2;
			while(k<=j) {
				j-=k;
				k=Math.floor(k/2);
			}
			j+=k;
		}		
		for(var l=1;l<m+1;l++) {
			var le=this.cint(Math.pow(2,l));
			var le2=Math.floor(le/2);
			var ur=1;
			var ui=0;
			var tr=0;
			var ti=0;
			var sr=Math.cos(Math.PI/(le2));
			var si=-Math.sin(Math.PI/(le2));
			for(j=1;j<le2+1;j++) {
				var jm1=j-1;
				for(var i=jm1;i<=nm1;i+=le) {
					var ip=i+le2;
					tr=rex[ip]*ur-imx[ip]*ui;
					ti=imx[ip]*ur+rex[ip]*ui;
					rex[ip]=rex[i]-tr;
					imx[ip]=imx[i]-ti;
					rex[i]+=tr;
					imx[i]+=ti;
				}
				tr=ur;
				ur=tr*sr-ui*si;
				ui=tr*si+ui*sr;
			}
		}
		for(var i=0;i<=n/2;i++) {
			rex[i]=(rex[i]*rex[i]+imx[i]*imx[i]);
		}
		return rex;
	},
	cint: function(expr) {
		var dif=Math.abs((expr-Math.floor(expr)));
		if(dif==0.5) {
			if((Math.floor(expr))%2==0) {
				return Math.floor(expr);
			} else {
				return Math.floor(expr)+1;
			}
		} else if(dif>0.5) {
			return Math.floor(expr)+1;
		} else {
			return Math.floor(expr);
		}
	},
	specModification: function(spec,timeTick,outPoints,smoothen) {
		var normavimas=this.LogBase10(2*timeTick/spec.length);
		var skale=this.LogBase10(spec.length)+this.LogBase10(timeTick);
		var llim=0;
		var rlim=this.LogBase10(spec.length/2.0);
		var lstep=(rlim-llim)/(outPoints);
		var clim=llim+lstep;
		var i=1;
		var intervale=0;
		var rez=[];
		for(var k=0;k<outPoints+1;k++) rez.push([0,0]);
		var panaudota=0;
		var total=0;
		var oldX=0;
		while(clim<=rlim) {
			while(this.LogBase10(i)<clim) {
				total+=spec[i];
				i++;
				intervale++;
			}
			if(total>0) {
				if(panaudota==0) {
					oldX=Math.pow(10,clim-skale);
					rez[panaudota][0]=this.LogBase10(oldX/2.0);
					rez[panaudota][1]=this.LogBase10(total/(intervale));//oldX);
				} else {
					var newX=Math.pow(10,clim-skale);
					rez[panaudota][0]=this.LogBase10((newX+oldX)/2.0);
					rez[panaudota][1]=this.LogBase10(total/(intervale));//(newX-oldX));
					oldX=newX;
				}
				rez[panaudota][1]+=normavimas;
				panaudota++;
			}
			intervale=0;
			total=0;
			clim+=lstep;
		}
		var rez2=[];
		for(var i=0;i<panaudota;i++) rez2.push([rez[i][0],rez[i][1]]);
		if(smoothen) {
			/*movavg time window 3*/
			for(var ii=0;ii<panaudota;ii++) {
				if((ii>0)&&(ii<panaudota-1)) {
					rez2[ii][1]=(rez2[ii-1][1]+rez2[ii][1]+rez2[ii+1][1])/3.0;
				}
			}
		}
		return rez2;
	},
	toOneDimensionalArray: function(arr,i) {
		if(typeof i=="undefined") i=0;
		var rez=[];
		for(var j=0;j<arr.length;j++) rez.push(arr[j][i]);
		return rez;
	},
	gaussianRandom: function() {
		var u1=Math.random();
		var u2=Math.random();
		return Math.sqrt(-2.0*Math.log(u1))*Math.cos(2*Math.PI*u2);
	},
    standardDeviation: function(values){
        var avg=this.average(values);
        var squareDiffs=values.map(function(value){var diff=value-avg;return diff*diff;});
        var avgSquareDiff=this.average(squareDiffs);
        var stdDev=Math.sqrt(avgSquareDiff);
        return stdDev;
    },
    average: function(values){
        return values.reduce(function(c,v){return c+v;},0)/values.length;
    }
}
