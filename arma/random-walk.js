let timeSeriesPlot = new plotlyPlot("timeSeries", ["t", "x(t)"]);
let acfPlot = new plotlyPlot("acfPlot", ["lag", "ACF"]);

let data = {
    'timeseries': [],
    'ts_points': 1001,
    'acf': [],
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

function evaluate_acf() {
    let diff_order = parseInt(document.getElementById("diff").value);
    
    let acf_obj = ssci.ts.acf()
        .data(data.timeseries)
        .x((d) => d[0])
        .y((d) => d[1])
        .maxlag(data.max_lag)
        .diff(diff_order);
    acf_obj();
    data.acf = acf_obj.output();

    acfPlot.update(
        [data.acf.map(v => v[0])],
        [data.acf.map(v => v[1])],
        "markers",
    );
}

function generate(gen, eva) {
    if(gen) generate_timeseries();
    if(eva) evaluate_acf();
}
document.getElementById("generate").addEventListener("click", () => generate(true, true));
document.getElementById("distribution").addEventListener("change", () => generate(true, true));
document.getElementById("diff").addEventListener("change", () => generate(false, true));

// on load
generate(true, true);
