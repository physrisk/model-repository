function p(x,k) {
    return x[1]+k*Math.sin(x[0]);
}

function x(x) {
    return mod(x[0] + x[1],2.0*Math.PI);
}

function mod(val,from) {
    return ((val % from)+from) % from;
}

function inArr(arr,val,err) {
    for(var i=0;i<arr.length;i++) {
        if(Math.abs(arr[i][0]-val[0])<err && Math.abs(arr[i][1]-val[1])<err) return true;
    }
    return false;
}

function newAttractor(vd) {
    var sers=new Array();
    var K=vd.k;
    var step=2*Math.PI/vd.parts;
    var npoints=vd.npoints;
    var colors=[];
    colors.push("#7FC97F");colors.push("#BEAED4");colors.push("#FDC086");colors.push("#FFFF99");colors.push("#386CB0");colors.push("#F0027F");colors.push("#BF5B17");colors.push("#666666");colors.push("#A6CEE3");colors.push("#1F78B4");colors.push("#B2DF8A");colors.push("#33A02C");colors.push("#FB9A99");colors.push("#E31A1C");colors.push("#FDBF6F");colors.push("#FF7F00");colors.push("#E41A1C");colors.push("#4DAF4A");colors.push("#984EA3");colors.push("#FF7F00");colors.push("#FFFF33");colors.push("#F781BF");
    var err=step/10.0;
    for(var i=0;i<vd.parts;i++) {
        var f=[[Math.PI,i*step]];
        for(var j=0;j<npoints;j++) {
            var pp=p(f[f.length-1],K);
            if(vd.omegaLim) pp=mod(pp,2*Math.PI);
            var ff=[x([f[f.length-1][0],pp]),pp];
            if(!inArr(f,ff,err)) {
                f.push(ff);
                if(j==0) f.slice(1);
            } else j=npoints+5;
        }
        sers[i]={
            color: colors[i % colors.length],
            shadowSize: 0,
            data: f
        };
    }
    var options = {
        series: {
            lines: { show: false },
            points: { show: true, radius: 1 }
        } ,
        xaxis: {
            show: true,
            tickLength:0,
            min: -0.1,
            max: 2*Math.PI+0.1,
            ticks: [[0,"0"],[Math.PI,"\u03c0"],[2*Math.PI,"2 \u03c0"]]
        } ,
        yaxis: {
            show: true,
            tickLength:0,
            min: -Math.PI,
            max: 3*Math.PI,
            ticks: [[-Math.PI,"-\u03c0"],[0,"0"],[Math.PI,"\u03c0"],[2*Math.PI,"2 \u03c0"],[3*Math.PI,"3 \u03c0"]]
            
        }
    };
    if(vd.omegaLim) {
        options.yaxis.min=-0.1;
        options.yaxis.max=2*Math.PI+0.1;
        options.yaxis.ticks=[[0,"0"],[Math.PI,"\u03c0"],[2*Math.PI,"2 \u03c0"]];
    }
    return [sers,options];
}

self.addEventListener("message", function(e) {
    self.postMessage(newAttractor(e.data));
}, false);
