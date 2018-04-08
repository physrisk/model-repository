var commonFunctions={
    matlog2: Math.log(2),
    matlog10: Math.log(10),
    LogBase10: function(x) {return Math.log(x)/this.matlog10;},
    pdfModification: function(pdf, log, llim, rlim, outPoints, xlim, xstep, ntrials) {
        if(!log) xlim=typeof xlim!=="undefined" ? xlim : 0;
        else xlim=typeof xlim!=="undefined" ? xlim : 1;
        xstep=typeof xstep!=="undefined" ? xstep : 1;
        ntrials=typeof ntrials!=="undefined" ? ntrials : 1;
        if((log)&&(llim<=0)) return null;
        var rez=[];
        var i, ii, lstep, used, integralas, rez2;
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
            llim=this.LogBase10(llim);
            rlim=this.LogBase10(rlim);
            lstep=(rlim-llim)/(outPoints-1.0);
            used=0;
            while((llim<=rlim)&&(used<outPoints)) {
                integralas=0;
                llim+=lstep;
                while((this.LogBase10(curlim)<llim)&&(nueita<pdf.length)) {
                    curlim+=xstep;
                    integralas+=(pdf[nueita]/ntrials);
                    nueita++;
                }
                if(integralas>0) {
                    rez[used][0]=llim-0.5*lstep;
                    if(used>0) rez[used][1]=this.LogBase10(integralas/(Math.pow(10,rez[used][0])-Math.pow(10,rez[used-1][0])));
                    else rez[used][1]=this.LogBase10(integralas/(Math.pow(10,rez[used][0])-Math.pow(10,rez[used][0]-lstep)));
                    used++;
                }
            }
            if(used<outPoints) {
                rez2=[];
                for(ii=0;ii<used;ii++) {
                    rez2.push(rez[ii]);
                }
                rez=[];
                for(ii=0;ii<used;ii++) {
                    rez.push(rez2[ii]);
                }
                rez2=null;
            }
        } else {
            lstep=(rlim-llim)/(outPoints-1.0);
            for(i=0;i<outPoints;i++) {
                integralas=0;
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
        var i;
        for(i=0;i<steps;i++) rez.push(0);
        var lstep=(rlim-llim)/(steps-1.0);
        var kiek=0;
        for(i=0;i<arrx.length;i++) {
            if((llim<=arrx[i])&&(arrx[i]<=rlim)) {
                rez[Math.floor((arrx[i]-llim)/lstep)]++;
                kiek++;
            }
        }
        if(normalizeInInterval) {
            for(i=0;i<steps;i++) rez[i]/=(kiek);
        } else {
            for(i=0;i<steps;i++) rez[i]/=(arrx.length);
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
        var j, i, k, l, tr, ti;
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
        for(j=cut;j<n+cut;j++) {
            rex.push(arrx[j]);
            imx.push(0);
        }
        var nm1=n-1;
        var nd2=Math.floor(n/2);
        m=this.cint(m);
        j=nd2;
        for(i=1;i<nm1;i++) {//bit reversal
            if(i<=j) {
                tr=rex[j];
                ti=imx[j];
                rex[j]=rex[i];
                imx[j]=imx[i];
                rex[i]=tr;
                imx[i]=ti;
            }
            k=nd2;
            while(k<=j) {
                j-=k;
                k=Math.floor(k/2);
            }
            j+=k;
        }       
        for(l=1;l<m+1;l++) {
            var le=this.cint(Math.pow(2,l));
            var le2=Math.floor(le/2);
            var ur=1;
            var ui=0;
            tr=0;
            ti=0;
            var sr=Math.cos(Math.PI/(le2));
            var si=-Math.sin(Math.PI/(le2));
            for(j=1;j<le2+1;j++) {
                var jm1=j-1;
                for(i=jm1;i<=nm1;i+=le) {
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
        for(i=0;i<=n/2;i++) {
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
        var normalization=this.LogBase10(timeTick/spec.length);
        var scale=this.LogBase10(spec.length)+this.LogBase10(timeTick);
        var llim=0;
        var rlim=this.LogBase10(spec.length/2.0);
        var lstep=(rlim-llim)/(outPoints);
        var clim=llim+lstep;
        var i=1;
        var inInterval=0;
        var rez=[];
        for(var k=0;k<outPoints+1;k++) rez.push([0,0]);
        var used=0;
        var total=0;
        var oldX=0;
        while(clim<=rlim) {
            while(this.LogBase10(i)<clim) {
                total+=spec[i];
                i++;
                inInterval++;
            }
            if(total>0) {
                if(used==0) {
                    oldX=Math.pow(10,clim-scale);
                    rez[used][0]=this.LogBase10(oldX/2.0);
                    rez[used][1]=this.LogBase10(total/(inInterval));
                } else {
                    var newX=Math.pow(10,clim-scale);
                    rez[used][0]=this.LogBase10((newX+oldX)/2.0);
                    rez[used][1]=this.LogBase10(total/(inInterval));
                    oldX=newX;
                }
                rez[used][1]+=normalization;
                used++;
            }
            inInterval=0;
            total=0;
            clim+=lstep;
        }
        var rez2=[];
        for(i=0;i<used;i++) rez2.push([rez[i][0],rez[i][1]]);
        if(smoothen) {
            /*movavg time window 3*/
            for(var ii=0;ii<used;ii++) {
                if((ii>0)&&(ii<used-1)) {
                    rez2[ii][1]=(rez2[ii-1][1]+rez2[ii][1]+rez2[ii+1][1])/3.0;
                }
            }
        }
        return rez2;
    },
    autocorrelation: function(series,tauInt) {
        var i, tau, numer;
        var cor=new Array(Math.floor((tauInt[1]-tauInt[0])/tauInt[2]));
        var mu=this.average(series);
        var sigma=this.standardDeviation(series);
        var denom=sigma*sigma;
        series=series.map(x=>x-mu);
        cor[0]=1;
        for(i=1;i<cor.length;i+=1) {
            tau=i*tauInt[2];
            numer=series.map((cv,id,arr)=>{
                if(id+tau>=arr.length) {
                    return Number.NaN;
                }
                return arr[id]*arr[id+tau];
            });
            numer=numer.filter(cv=>!isNaN(cv));
            cor[i]=this.average(numer)/denom;
        }
        return cor;
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
    qGaussianRandom: function(q,abs) {
        function qLog(x,qGen) {
            return (Math.pow(x,1-qGen)-1)/(1-qGen);
        }
        var qGen=(1+q)/(3-q);
        var u1=Math.random();
        var u2=Math.random();
        if(abs) return Math.abs(Math.sqrt(-2*qLog(u1,qGen))*Math.sin(2*Math.PI*u2));
        return Math.sqrt(-2*qLog(u1,qGen))*Math.sin(2*Math.PI*u2);
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
    },
    shuffleArray: function(arr) {
        var i, j;
        var rarr=new Array(arr.length);
        for(i=rarr.length-1;i>0;i-=1) {
            j=Math.floor(Math.random()*(i+1));
            rarr[i]=arr[j];
            arr[j]=arr[i];
        }
        rarr[0]=arr[0];
        return rarr;
    },
    linearFit1D: function(arry) {
        var i, tx, ty, invDelta;
        var l=arry.length;
        var xtot=0, ytot=0, x2tot=0, xytot=0;
        var rez=new Array(2);
        for(i=0;i<l;i+=1) {
            tx=i;
            ty=arry[i];
            xtot+=tx;
            ytot+=ty;
            x2tot+=(tx*tx);
            xytot+=(tx*ty);
        }
        invDelta=1.0/(l*x2tot-xtot*xtot);
        rez[0]=invDelta*(l*xytot-xtot*ytot);
        rez[1]=invDelta*(x2tot*ytot-xtot*xytot);
        return rez;
    },
    linearFit: function(arr,from,to) {
        var i, tx, ty, invDelta;
        var l=0;
        var xtot=0, ytot=0, x2tot=0, xytot=0;
        var rez=new Array(2);
        for(i=0;i<arr.length;i+=1) {
            tx=arr[i][0];
            ty=arr[i][1];
            if(from<=tx && tx<=to) {
                xtot+=tx;
                ytot+=ty;
                x2tot+=(tx*tx);
                xytot+=(tx*ty);
                l+=1;
            }
        }
        if(l==0) {
            return -1;
        }
        invDelta=1.0/(l*x2tot-xtot*xtot);
        rez[0]=invDelta*(l*xytot-xtot*ytot);
        rez[1]=invDelta*(x2tot*ytot-xtot*xytot);
        return rez;
    },
};
