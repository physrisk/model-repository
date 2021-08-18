const my_parse_float = (val) => parseFloat((""+val).replace(",","."));

let timeSeriesPlot = new plotlyPlot("timeSeries", ["t", "x(t)"]);
let acfPlot = new plotlyPlot("acfPlot", ["lag", "ACF"]);
let pacfPlot = new plotlyPlot("pacfPlot", ["lag", "PACF"]);

let data = {
    'ar_coeffs': [],
    'ma_coeffs': [],
    'noise_scale': 1,
    'timeseries': [],
    'ts_points': 1024,
    'acf': [],
    'pacf': [],
    'max_lag': 20,
}

function frac_deriv(series) {
    const diff_order = -my_parse_float(document.getElementById("diff_order").value);
    
    let prev_prod = 1;
    let prod_terms = Array(series.length).fill(null).map((v, idx) => {
        if(idx>0) {
            prev_prod = prev_prod * ((idx-diff_order-1)/idx);
        }
        return prev_prod;
    });
    
    return convolution(series, prod_terms);
}

function generate_timeseries() {
    const sample = () => jStat.normal.sample(0, data.noise_scale);

    data.ar_coeffs = [];
    data.ma_coeffs = [];
    for(let idx=1; idx<=2; idx+=1) {
        data.ar_coeffs.push(my_parse_float(document.getElementById(`alpha${idx}`).value));
        data.ma_coeffs.push(my_parse_float(document.getElementById(`beta${idx}`).value));
    }

    let time = Array(data.ts_points).fill(null).map((v, i) => i);
    let noise_series = time.map(() => sample());
    let initial_condition = Array(data.ar_coeffs.length).fill(null).map(() => sample());
    let previous_noise = Array(data.ma_coeffs.length).fill(null).map(() => sample());
    let series = noise_series.reduce((acc, v) => {
            let internal_acc = acc.slice();
            let previous = internal_acc.slice(-data.ar_coeffs.length).reverse();
            let next = jStat.dot(data.ar_coeffs, previous);
            next = next + jStat.dot(data.ma_coeffs, previous_noise);
            next = next + v;
            internal_acc.push(next);
            previous_noise.pop();
            previous_noise.unshift(v);
            return internal_acc;
        }, initial_condition);
    series = series.slice(initial_condition.length);
    series = frac_deriv(series);
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
    let pacf_obj = ssci.ts.pacf()
        .data(data.timeseries)
        .x((d) => d[0])
        .y((d) => d[1])
        .maxlag(data.max_lag)
        .diff(0);
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
