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
    } else if(distribution == 2) {
        sample = () => jStat.exponential.sample(1);
    }

    let time = Array(data.ts_points).fill(null).map((v, i) => i);
    data.timeseries = time.map(v => [v, sample()]);

    timeSeriesPlot.update(
        [data.timeseries.map(v => v[0])],
        [data.timeseries.map(v => v[1])]);
}

function evaluate_acf() {
    let acf_obj = ssci.ts.acf()
        .data(data.timeseries)
        .x((d) => d[0])
        .y((d) => d[1])
        .maxlag(data.max_lag)
        .diff(0);
    acf_obj();
    data.acf = acf_obj.output();

    acfPlot.update(
        [data.acf.map(v => v[0])],
        [data.acf.map(v => v[1])],
        "markers",
    );
}

function generate() {
    generate_timeseries();
    evaluate_acf();
}
document.getElementById("generate").addEventListener("click", () => generate());
document.getElementById("distribution").addEventListener("change", () => generate());

// on load
generate();
