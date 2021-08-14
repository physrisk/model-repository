const my_parse_float = (val) => parseFloat((""+val).replace(",","."));

let timeSeriesPlot = new plotlyPlot("timeSeries", ["t", "x(t)"]);
let acfPlot = new plotlyPlot("acfPlot", ["lag", "ACF"]);
let pacfPlot = new plotlyPlot("pacfPlot", ["lag", "PACF"]);

let data = {
    'ar_coeffs': [],
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
    for(let idx=1; idx<=5; idx+=1) {
        data.ar_coeffs.push(my_parse_float(document.getElementById(`alpha${idx}`).value));
    }

    let time = Array(data.ts_points).fill(null).map((v, i) => i);
    let noise_series = time.map(() => sample());
    let initial_condition = Array(data.ar_coeffs.length).fill(null).map(() => sample());
    let series = noise_series.reduce((acc, v) => {
            let internal_acc = acc.slice();
            let previous = internal_acc.slice(-data.ar_coeffs.length).reverse();
            let next = jStat.dot(data.ar_coeffs, previous) + v;
            internal_acc.push(next);
            return internal_acc;
        }, initial_condition);
    series = series.slice(initial_condition.length);
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
    data.pacf = pacf_obj.output();

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
        for(let idx=1; idx<=5; idx+=1) {
            ar_coeffs.push(my_parse_float(document.getElementById(`alpha${idx}`).value));
        }
    }
    return (!ar_coeffs.some(v => Math.abs(v) > 1)) && (ar_coeffs.reduce((acc, v) => acc + v) <= 1);
}

function generate(gen, eva) {
    generate_timeseries();
    evaluate_acf();
    evaluate_pacf();
}
document.getElementById("generate").addEventListener("click", () => generate());

document.querySelectorAll("#alpha input[type='number']").forEach(elem => {
    elem.addEventListener("change", () => update_stationarity_label());
});

// on load
generate();
