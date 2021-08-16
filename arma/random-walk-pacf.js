let timeSeriesPlot = new plotlyPlot("timeSeries", ["t", "x(t)"]);
let pacfPlot = new plotlyPlot("pacfPlot", ["lag", "PACF"]);

let data = {
    'timeseries': [],
    'ts_points': 1001,
    'pacf': [],
    'max_lag': 20,
}

function generate_timeseries() {
    let distribution = parseInt(document.getElementById("distribution").value);
    let sample = () => jStat.normal.sample(0, 1);
    if(distribution == 1) {
        sample = () => jStat.cauchy.sample(0, 1);
    }

    let time = Array(data.ts_points).fill(null).map((v, i) => i);
    let series = jStat.cumsum(time.map(() => sample()));
    data.timeseries = time.map((v, i) => [v, series[i]]);

    timeSeriesPlot.update(
        [data.timeseries.map(v => v[0])],
        [data.timeseries.map(v => v[1])]);
}

function evaluate_pacf() {
    let diff_order = parseInt(document.getElementById("diff").value);
    
    let pacf_obj = ssci.ts.pacf()
        .data(data.timeseries)
        .x((d) => d[0])
        .y((d) => d[1])
        .maxlag(data.max_lag)
        .diff(diff_order);
    pacf_obj();
    data.pacf = pacf_obj.output().slice(1);

    pacfPlot.update(
        [data.pacf.map(v => v[0])],
        [data.pacf.map(v => v[1])],
        "markers",
    );
}

function generate(gen, eva) {
    if(gen) generate_timeseries();
    if(eva) evaluate_pacf();
}
document.getElementById("generate").addEventListener("click", () => generate(true, true));
document.getElementById("distribution").addEventListener("change", () => generate(true, true));
document.getElementById("diff").addEventListener("change", () => generate(false, true));

// on load
generate(true, true);
