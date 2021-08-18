const my_parse_float = (val) => parseFloat((""+val).replace(",","."));

let timeSeriesPlot = new plotlyPlot("timeSeries", ["t", "x(t)"]);
let acfPlot = new plotlyPlot("acfPlot", ["lag", "ACF"]);
let pacfPlot = new plotlyPlot("pacfPlot", ["lag", "PACF"]);

let data = {
    'ma_coeffs': [],
    'noise_scale': 1,
    'timeseries': [],
    'ts_points': 1001,
    'acf': [],
    'pacf': [],
    'max_lag': 20,
}

function generate_timeseries() {
    let distribution = parseInt(document.getElementById("distribution").value);
    let sample = () => jStat.normal.sample(0, data.noise_scale);
    if(distribution == 1) {
        sample = () => jStat.cauchy.sample(0, data.noise_scale);
    }

    data.ma_coeffs = [];
    for(let idx=1; idx<=5; idx+=1) {
        data.ma_coeffs.push(my_parse_float(document.getElementById(`beta${idx}`).value));
    }

    let time = Array(data.ts_points).fill(null).map((v, i) => i);
    let noise_series = time.map(() => sample());
    let previous_noise = Array(data.ma_coeffs.length).fill(null).map(() => sample());
    let series = noise_series.reduce((acc, v, idx) => {
            let next = jStat.dot(data.ma_coeffs, previous_noise) + v;
            previous_noise.pop();
            previous_noise.unshift(v);
            acc.push(next);
            return acc;
        }, []);
    data.timeseries = time.map((v, i) => [v, series[i]]);

    timeSeriesPlot.update(
        [data.timeseries.map(v => v[0])],
        [data.timeseries.map(v => v[1])]);
}

function evaluate_acf() {
    let diff_order = 0;
    
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

function evaluate_pacf() {
    let diff_order = 0;
    
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

function generate() {
    generate_timeseries();
    evaluate_acf();
    evaluate_pacf();
}
document.getElementById("generate").addEventListener("click", () => generate());

// on load
generate();
