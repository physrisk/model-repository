const my_parse_float = (val) => parseFloat(("" + val).replace(",", "."));

let rng = new Random();

const OBSERVATION_STEPS = 1048576;
const PSD_POINTS = 128;
const PERIOD = 1;
const OBSERVATION_TIME = OBSERVATION_STEPS * PERIOD;

let series_plot = new plotlyPlot("seriesPlot", ["t", "I(t)"], [10, 15, 40, 60]);
let psd_plot = new plotlyPlot("psdPlot", ["lg[f]", "lg[S(f)]"], [10, 15, 40, 60]);

const COLORS = ["#c11", "#444"];

function generate_series(rate = 1) {
    let series = Array(OBSERVATION_STEPS).fill(0);
    let n_events = 0;
    let tau = rng.exponential(rate);
    let event_time = tau;
    while (event_time < OBSERVATION_TIME) {
        series[Math.floor(event_time / PERIOD)] += 1;
        n_events += 1;
        tau = rng.exponential(rate);
        event_time = event_time + tau;
    }
    return {
        series: series,
        n_events: n_events,
    };
}

function convert_series(series) {
    if (series.n_events > 1000) {
        return null;
    }
    let plot_series = { time: [0], value: [0] };
    series.series.forEach((v, i) => {
        if (
            v == 0 &&
            ((plot_series.value.length > 1 &&
                plot_series.value[plot_series.value.length - 2] == 0) ||
                plot_series.value.length == 1)
        ) {
            return;
        }
        let time = i * PERIOD;
        plot_series.time.push(time, time, time);
        plot_series.value.push(0, v, 0);
    });
    plot_series.time.push(PERIOD * series.series.length);
    plot_series.value.push(0);
    return plot_series;
}

function run(rate = 1e-4) {
    let series = generate_series(rate);
    let plot_series = convert_series(series);
    let psd = get_psd(series.series);

    if (plot_series != null) {
        series_plot.update(
            [plot_series.time],
            [plot_series.value],
            "lines",
            COLORS
        );
    } else {
        series_plot.update(
            [
                Array(series.series.length)
                    .fill(null)
                    .map((v, i) => {
                        return i * PERIOD;
                    }),
            ],
            [series.series],
            "lines",
            COLORS
        );
    }

    let freqs = psd.freq.map((v) => Math.log10(v));
    let theory = Math.log10((6 * series.n_events) / OBSERVATION_TIME);
    psd_plot.update(
        [freqs, freqs],
        [psd.psd.map((v) => Math.log10(v)), freqs.map((v) => theory)],
        "lines",
        COLORS
    );
}

function get_psd(series) {
    let bin_factor = Math.pow(OBSERVATION_STEPS, 1 / (PSD_POINTS + 1));
    let bin_edges = jStat.unique(
        Array(PSD_POINTS)
            .fill(null)
            .map((v, i) => {
                return Math.floor(Math.pow(bin_factor, i + 1));
            })
    );
    let bin_mids = bin_edges.map((v, i) => {
        if (i == 0) {
            return v / OBSERVATION_TIME;
        }
        return (v + bin_edges[i - 1] + 1) / (2 * OBSERVATION_TIME);
    });

    let raw_psd = real_psd(series);
    let norm_psd = rescale_psd(
        raw_psd.map((v) => (2 * Math.PI * v) / OBSERVATION_TIME),
        bin_edges
    );
    return {
        freq: bin_mids,
        psd: norm_psd,
    };
}

let generate_btn = document.getElementById("generate");

// events
generate_btn.addEventListener("click", () => {
    let rate = Math.pow(
        10,
        my_parse_float(document.getElementById("event_rate").value)
    );
    run(rate);
});
