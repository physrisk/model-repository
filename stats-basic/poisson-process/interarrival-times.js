const my_parse_float = (val) => parseFloat(("" + val).replace(",", "."));

let rng = new Random();

let dist_plot = new plotlyPlot("distributionPlot", ["τ", "p(τ)"]);

const COLORS = ["#c11", "#333"];

let start_btn = document.getElementById("start");
let resume_btn = document.getElementById("resume");

const TIMES_PER_UPDATE = 1000;
const UPDATE_INTERVAL = 100;
let continue_flag = false;

let arrival_rate = 4;
let delta_t = 0.04;

const MAX_GT_LENGTH = 30 * TIMES_PER_UPDATE;
let generated_times = [];

function generate_arrival_time() {
    let step_idx = 0;
    let arrived = false;
    let prob = arrival_rate * delta_t;
    while (!arrived) {
        step_idx = step_idx + 1;
        arrived = rng.random() < prob;
    }
    return step_idx;
}

function step() {
    let times = Array(TIMES_PER_UPDATE)
        .fill(null)
        .map((v) => generate_arrival_time());
    generated_times.push(...times);
    if (generated_times.length > MAX_GT_LENGTH) {
        generated_times = generated_times.slice(-MAX_GT_LENGTH);
    }

    let n_bins =
        Math.max(...generated_times) - Math.min(...generated_times) + 1;
    let histogram = jStat.histogram(generated_times, n_bins);
    let vals = jStat.arange(n_bins);
    dist_plot.update(
        [vals.map((v) => v * delta_t)],
        [
            histogram.map((v) => v / (delta_t * generated_times.length)),
            vals.map((v) => jStat.exponential.pdf(v * delta_t, arrival_rate)),
        ],
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

    arrival_rate = my_parse_float(document.getElementById("rate").value);
    delta_t = my_parse_float(document.getElementById("delta_t").value);
    generated_times = [];

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
