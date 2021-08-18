const my_parse_float = (val) => parseFloat((""+val).replace(",","."));

let timeSeriesPlot = new plotlyPlot("timeSeries", ["t", "x(t)"]);
let acfPlot = new plotlyPlot("acfPlot", ["lag", "ACF"]);
let pacfPlot = new plotlyPlot("pacfPlot", ["lag", "PACF"]);

let data = {
    'ar_coeffs': [],
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

    let diff_order = parseInt(document.getElementById("diff_order").value);
    for(let idx=0; idx<diff_order; idx+=1) {
        series = jStat.cumsum(series);
    }
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

function update_stationarity_label(ar_coeffs) {
    let stationarity_label = document.getElementById("stationary");
    if(is_stationary(ar_coeffs)) {
        stationarity_label.innerHTML = "Parameters indicate stationary regime.";
        stationarity_label.style.background = "#bfb";
    } else {
        stationarity_label.innerHTML = "Parameters indicate non-stationary regime!";
        stationarity_label.style.background = "#fbb";
    }
}

function is_stationary(ar_coeffs) {
    if(typeof ar_coeffs == "undefined") {
        ar_coeffs = [];
        for(let idx=1; idx<=2; idx+=1) {
            ar_coeffs.push(my_parse_float(document.getElementById(`alpha${idx}`).value));
        }
    }
    let diff_order = parseInt(document.getElementById("diff_order").value);
    return (!ar_coeffs.some(v => Math.abs(v) > 1)) && (ar_coeffs.reduce((acc, v) => acc + v) < 1) && (diff_order==0);
}

function generate() {
    generate_timeseries();
    evaluate_acf();
    evaluate_pacf();
    update_stationarity_label(data.ar_coeffs);
}
document.getElementById("generate").addEventListener("click", () => generate());

document.querySelectorAll("#alpha input[type='number']").forEach(elem => {
    elem.addEventListener("change", () => update_stationarity_label());
});
document.getElementById("diff_order").addEventListener("change", () => update_stationarity_label());

// on load
generate();
