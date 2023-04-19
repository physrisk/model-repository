const my_parse_float = (val) => parseFloat(("" + val).replace(",", "."));

let rng = new Random();

let dist_plot = new plotlyPlot(
    "distributionPlot",
    ["τ", "p(τ|0), p(τ|T)"],
    [10, 15, 40, 60]
);

const COLORS = ["#c11", "#47c"];

let start_btn = document.getElementById("start");
let resume_btn = document.getElementById("resume");

const TIMES_PER_UPDATE = 1000;
const UPDATE_INTERVAL = 100;
let continue_flag = false;

let waited_time = 5;
let avg_interarrival = 15;
let distribution_type = 0;

const MAX_GT_LENGTH = 30 * TIMES_PER_UPDATE;
let generated_times = [];
let generated_waiting_times = [];

function generate_arrival_time() {
    let time = avg_interarrival;
    if (distribution_type == 1) {
        time = rng.normal(avg_interarrival, 1);
    } else if (distribution_type == 2) {
        time = rng.uniform(0, 2 * avg_interarrival);
    } else {
        time = rng.exponential(1 / avg_interarrival);
    }
    return Math.max(time, 0);
}

function make_histogram(data, n_bins = 30) {
    let min_data = Math.min(...data);
    let range = Math.max(...data) - min_data;
    let step = range / n_bins;
    let histogram = jStat
        .histogram(data, n_bins)
        .map((v) => v / (step * data.length));
    let vals = jStat.arange(n_bins).map((k) => min_data + (k + 0.5) * step);
    return { x: vals, y: histogram };
}

function step() {
    let times = Array(TIMES_PER_UPDATE)
        .fill(null)
        .map((v) => generate_arrival_time());
    generated_times.push(...times);
    if (generated_times.length > MAX_GT_LENGTH) {
        generated_times = generated_times.slice(-MAX_GT_LENGTH);
    }

    times = times
        .filter((tau) => tau > waited_time)
        .map((tau) => tau - waited_time);
    generated_waiting_times.push(...times);
    if (generated_waiting_times.length > MAX_GT_LENGTH) {
        generated_waiting_times = generated_waiting_times.slice(-MAX_GT_LENGTH);
    }

    let histogram_arrival = make_histogram(generated_times);
    let histogram_waiting = make_histogram(generated_waiting_times);
    let value_maximum = Math.max(...histogram_arrival.x);
    let density_maximum = Math.max(
        ...histogram_arrival.y,
        ...histogram_waiting.y
    );
    dist_plot.setRanges([0, value_maximum * 1.05], [0, density_maximum * 1.05]);
    dist_plot.update(
        [histogram_arrival.x, histogram_waiting.x],
        [histogram_arrival.y, histogram_waiting.y],
        "lines",
        COLORS
    );

    // decide if to continue
    if (continue_flag) {
        setTimeout(step, UPDATE_INTERVAL);
    } else {
        resume_btn.disabled = false;
    }
}

// events
start_btn.addEventListener("click", () => {
    continue_flag = true;
    start_btn.disabled = true;
    resume_btn.disabled = false;
    resume_btn.innerHTML = "Pause";

    waited_time = my_parse_float(document.getElementById("waited_time").value);
    avg_interarrival = my_parse_float(
        document.getElementById("avg_interarrival").value
    );
    distribution_type = parseInt(
        document.getElementById("distribution_type").value
    );
    generated_times = [];
    generated_waiting_times = [];

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
