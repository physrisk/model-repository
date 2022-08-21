class plotlyPlot {
    constructor(id, axisLabels = ["x", "y"], margins = [10, 10, 40, 40]) {
        this.id = id;
        this.additionalParams = { staticPlot: true };
        this.layout = {
            showlegend: false,
            xaxis: {
                showline: true,
                zeroline: false,
                ticks: "inside",
                mirror: "all",
                title: axisLabels[0],
                autorange: true,
            },
            yaxis: {
                showline: true,
                zeroline: false,
                ticks: "inside",
                mirror: "all",
                title: axisLabels[1],
                autorange: true,
            },
            margin: {
                t: margins[0],
                r: margins[1],
                b: margins[2],
                l: margins[3],
                pad: 0,
            },
        };
        this.reset();
    }
    update(x, y, mode = "lines", colors = null) {
        let i, c, dataObj;
        let data = [];
        let xl = x.length;
        let yl = y.length;
        let maxl = Math.max(xl, yl);
        for (i = 0; i < maxl; i += 1) {
            if (xl == maxl && yl == maxl) {
                dataObj = { x: x[i], y: y[i] };
            } else if (xl == maxl) {
                dataObj = { x: x[i], y: y[0] };
            } else if (yl == maxl) {
                dataObj = { x: x[0], y: y[i] };
            }
            if (typeof mode === "object") {
                dataObj["mode"] = mode[i];
            } else {
                dataObj["mode"] = mode;
            }
            if (colors !== null) {
                if (typeof colors === "object") {
                    c = colors[i];
                } else {
                    c = colors;
                }
                if (dataObj["mode"] == "markers") {
                    dataObj["marker"] = { color: c };
                } else {
                    dataObj["line"] = { color: c };
                }
            }
            data.push(dataObj);
        }
        Plotly.newPlot(this.id, data, this.layout, this.additionalParams);
    }
    reset() {
        this.update([[0]], [[0]]);
    }
    setLabels(labels) {
        this.layout.xaxis.title = labels[0];
        this.layout.yaxis.title = labels[1];
    }
    setRanges(xrange, yrange) {
        if (xrange !== true) {
            this.layout.xaxis.autorange = false;
            this.layout.xaxis.range = xrange;
        } else {
            this.layout.xaxis.autorange = true;
            delete this.layout.xaxis.range;
        }
        if (yrange !== true) {
            this.layout.yaxis.autorange = false;
            this.layout.yaxis.range = yrange;
        } else {
            this.layout.yaxis.autorange = true;
            delete this.layout.yaxis.range;
        }
    }
}
