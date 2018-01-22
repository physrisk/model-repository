class plotlyPlot {
    constructor(id,axisLabels=['x','y'],margins=[10,10,40,40]) {
        this.id=id;
        this.additionalParams={staticPlot:true};
        this.layout={
            showlegend: false,
            xaxis: {
                showline: true,
                zeroline: false,
                ticks: 'inside',
                mirror: 'all',
                title: axisLabels[0],
                autorange: true
            },
            yaxis: {
                showline: true,
                zeroline: false,
                ticks: 'inside',
                mirror: 'all',
                title: axisLabels[1],
                autorange: true
            },
            margin: {
                t:margins[0],
                r:margins[1],
                b:margins[2],
                l:margins[3],
                pad:0
            },
        };
        this.reset();
    }
    update(x,y,mode='lines') {
        var i, m;
        var data=[];
        for(i=0;i<x.length;i+=1) {
            if(typeof mode==="object") {
                m=mode[i];
            } else {
                m=mode;
            }
            data.push({
                'x': x[i],
                'y': y[i],
                'mode': m});
        }
        Plotly.newPlot(this.id,data,this.layout,this.additionalParams);
    }
    reset() {
        this.update([[0]],[[0]]);
    }
    setLabels(labels) {
        this.layout.xaxis.title=labels[0];
        this.layout.yaxis.title=labels[1];
    }
}
