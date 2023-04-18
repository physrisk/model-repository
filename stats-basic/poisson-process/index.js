const my_parse_float = (val) => parseFloat(("" + val).replace(",", "."));

let rng = new Random();

let series_plot = new plotlyPlot("seriesPlot", ["t [hours]", "S(t)"]);
let dist_plot = new plotlyPlot("distributionPlot", ["S", "p(S)"]);

const COLORS = ["#47c", "#c11", "#333"];

let start_btn = document.getElementById("start");
let resume_btn = document.getElementById("resume");

const UPDATE_INTERVAL = 100;
let continue_flag = false;

const DURATION = 1;
let arrival_rate = 4;

const HISTORY_LENGTH = 100;
let iterations = 0;
let average_series = Array(HISTORY_LENGTH) // history
    .fill(null)
    .map((v, i) => [(DURATION * (i + 0.5)) / HISTORY_LENGTH, 0]);
const HIST_MULT = 4;
let histogram = Array(Math.ceil(HIST_MULT * arrival_rate))
    .fill(null)
    .map((v, i) => [i, 0, jStat.poisson.pdf(i, arrival_rate)]);

function step() {
    iterations = iterations + 1;
    let series = [[0, 0]];
    let interval = rng.exponential(arrival_rate);
    let elapsed = interval;
    let arrivals = 0;
    let hist_idx = 0;
    while (elapsed < DURATION) {
        // append interval
        series.push(
            ...[
                [elapsed, arrivals],
                [elapsed, arrivals + 1],
            ]
        );
        arrivals = arrivals + 1;
        // append to history
        hist_idx = Math.floor((HISTORY_LENGTH * elapsed) / DURATION);
        average_series[hist_idx][1] = average_series[hist_idx][1] + 1;
        // general new interval
        interval = rng.exponential(arrival_rate);
        elapsed = elapsed + interval;
    }
    // plot series
    series.push([DURATION, arrivals]);
    series_plot.update(
        [jStat.cola(series, 0), jStat.cola(average_series, 0)],
        [
            jStat.cola(series, 1),
            jStat.cumsum(
                jStat.cola(average_series, 1).map((v) => v / iterations)
            ),
        ],
        "lines",
        [COLORS[0], COLORS[1]]
    );
    // plot histogram
    if (arrivals < histogram.length) {
        histogram[arrivals][1] = histogram[arrivals][1] + 1;
    }
    dist_plot.update(
        [jStat.cola(histogram, 0)],
        [
            jStat.cola(histogram, 1).map((v) => v / iterations),
            jStat.cola(histogram, 2),
        ],
        "lines",
        [COLORS[1], COLORS[2]]
    );
    // decide if to continue
    if (continue_flag) {
        setTimeout(step, UPDATE_INTERVAL);
    }
}

// events
start_btn.addEventListener("click", () => {
    continue_flag = true;
    start_btn.disabled = true;
    resume_btn.disabled = false;
    resume_btn.innerHTML = "Pause";

    arrival_rate = my_parse_float(document.getElementById("rate").value);

    iterations = 0;
    average_series = Array(HISTORY_LENGTH)
        .fill(null)
        .map((v, i) => [(DURATION * (i + 0.5)) / HISTORY_LENGTH, 0]);
    histogram = Array(Math.ceil(HIST_MULT * arrival_rate))
        .fill(null)
        .map((v, i) => [i, 0, jStat.poisson.pdf(i, arrival_rate)]);

    step();
});
resume_btn.addEventListener("click", () => {
    if (continue_flag) {
        continue_flag = false;
        start_btn.disabled = false;
        resume_btn.disabled = true;
        resume_btn.innerHTML = "Resume";
    } else {
        continue_flag = true;
        start_btn.disabled = true;
        resume_btn.disabled = false;
        resume_btn.innerHTML = "Pause";
        setTimeout(step, UPDATE_INTERVAL);
    }
});
