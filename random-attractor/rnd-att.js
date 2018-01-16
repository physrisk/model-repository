var a=[0, 0, 0, 0, 0, 0];
var b=[0, 0, 0, 0, 0, 0];

function fx(x,y) {
    return (a[0]*x+a[1]*y+a[2])*x+(a[3]*y+a[4])*y+a[5];
}
function fy(x,y) {
    return (b[0]*x+b[1]*y+b[2])*x+(b[3]*y+b[4])*y+b[5];
}

function myParseFloat(val) {
    return parseFloat((""+val).replace(",","."));
}

function hashCode(x,y) {
    var str=Math.floor(x*1e6)+" "+Math.floor(y*1e6);
    var hash = 0;
    var chr;
    if (str.length == 0) return hash;
    for (var i = 0; i < str.length; i+=1) {
        chr = str.charCodeAt(i);
        hash = ((hash<<5)-hash)+chr;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
}

function newAttractor(vd) {
    var i, approxPoint;
    var randomize=false;
    if(typeof vd.a == "undefined") randomize=true;
    var brk=1;
    var bufferLength=100;
    var numet=100;
    if(!(typeof vd.numet == "undefined")) numet=parseInt(vd.numet);
    var ilgis=5000;
    if(!(typeof vd.ilgis == "undefined")) ilgis=parseInt(vd.ilgis);
    var f;
    
    while(1==brk) {
        if(randomize) {
            a[0]=2*Math.random()-1;a[1]=2*Math.random()-1;a[2]=2*Math.random()-1;a[3]=2*Math.random()-1;a[4]=2*Math.random()-1;a[5]=2*Math.random()-1;
            b[0]=2*Math.random()-1;b[1]=2*Math.random()-1;b[2]=2*Math.random()-1;b[3]=2*Math.random()-1;b[4]=2*Math.random()-1;b[5]=2*Math.random()-1;
        } else {
            a[0]=myParseFloat(vd.a[0]);a[1]=myParseFloat(vd.a[1]);a[2]=myParseFloat(vd.a[2]);a[3]=myParseFloat(vd.a[3]);a[4]=myParseFloat(vd.a[4]);a[5]=myParseFloat(vd.a[5]);
            b[0]=myParseFloat(vd.b[0]);b[1]=myParseFloat(vd.b[1]);b[2]=myParseFloat(vd.b[2]);b[3]=myParseFloat(vd.b[3]);b[4]=myParseFloat(vd.b[4]);b[5]=myParseFloat(vd.b[5]);
        }
        brk=0;
        f=new Array();
        var g=new Array();
        var xn=0;var yn=0;
        var xs=a[5];var ys=b[5];
        for(i=0;i<numet;i+=1) {
            xn=fx(xs,ys);
            yn=fy(xs,ys);
            approxPoint=hashCode(xn,yn);
            if(Math.sqrt(xn*xn+yn*yn)>1000 || g.indexOf(approxPoint)!=-1) {
                brk=1;
                i=numet+1;
                break;
            }
            g.push(approxPoint);
            if(g.length>bufferLength) g.splice(0,1);
            xs=xn;
            ys=yn;
        }
        if(0==brk) {
            for(i=0;i<ilgis;i+=1) {
                xn=fx(xs,ys);
                yn=fy(xs,ys);
                approxPoint=hashCode(xn,yn);
                if(Math.sqrt(xn*xn+yn*yn)>1000 || g.indexOf(approxPoint)!=-1) {
                    brk=1;
                    i=ilgis+1;
                    break;
                }
                g.push(approxPoint);
                if(g.length>bufferLength) g.splice(0,1);
                f.push([xn,yn]);
                xs=xn;
                ys=yn;
            }
        }
        if(!randomize && 1==brk) {
            f=g;
            brk=0;
        }
    }
    var sers=new Array();
    var cutlen=Math.floor(f.length/5.0);
    for(i=0;i<5;i+=1) {
        var tmpCol=200-(i+1)*20;
        sers[i]={
            color: "rgb("+tmpCol+","+tmpCol+","+tmpCol+")",
            data: f.slice(i*cutlen,(i+1)*cutlen)
        };
    }
    var options = {
        series: {
            lines: { show: false },
            points: { show: true, radius: 0.02 }
        } ,
        xaxis: {
            show: false
        } ,
        yaxis: {
            show: false
        }
    };
    return [sers,options,a,b];
}

self.addEventListener("message", function(e) {
    self.postMessage(newAttractor(e.data));
}, false);
