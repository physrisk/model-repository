const my_parse_float = (val) => parseFloat((""+val).replace(",","."));

let timeSeriesPlot = new plotlyPlot("timeSeries", ["t", "x(t)"]);
let acfPlot = new plotlyPlot("acfPlot", ["lag", "ACF"]);
let pacfPlot = new plotlyPlot("pacfPlot", ["lag", "PACF"]);

let data = {
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
    const alpha = my_parse_float(document.getElementById("alpha").value);
    let sample = () => jStat.normal.sample(0, data.noise_scale);
    if(alpha == 1) {
        sample = () => jStat.cauchy.sample(0, data.noise_scale);
    } else if(alpha<2) {
        // generate sample from stable distribution
        // according to https://en.wikipedia.org/wiki/Stable_distribution#Simulation_of_stable_variables
        // with beta = 0
        sample = () => {
            let unif = jStat.uniform.sample(-Math.PI/2, Math.PI/2);
            let exp = jStat.exponential.sample(1);
            let rvs = Math.sin(alpha*unif)/Math.pow(Math.cos(unif), 1/alpha);
            rvs = rvs*Math.pow( Math.cos((1-alpha)*unif)/exp, (1-alpha)/alpha);
            return data.noise_scale*rvs;
        };
    }

    let time = Array(data.ts_points).fill(null).map((v, i) => i);
    let noise_series = time.map(() => sample());
    let series = [];
    const use_flsn = document.getElementById("use_flsn").checked;
    if(use_flsn) {
        series = noise_series.slice();
    } else {
        series = noise_series.reduce((acc, v) => {
            let internal_acc = acc.slice();
            internal_acc.push(acc[acc.length-1] + v);
            return internal_acc;
        }, [0]);
        series = series.slice(1);
    }
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

function generate(gen, eva) {
    generate_timeseries();
    evaluate_acf();
    evaluate_pacf();
}
document.getElementById("generate").addEventListener("click", () => generate());

// on load
generate();
