let dist_plot = new plotlyPlot(
    "distributionPlot",
    ["x", "lg[p(x)]"],
    [10, 15, 40, 50]
);
dist_plot.setRanges([0, 1], true);
dist_plot.reset();

let colors = ["#36b", "#333"];
let symbols = ["markers", "lines"];
let histograms = {
    step: 0.01,
    half_step: 0.005,
    hist: [],
    elems: 0,
};

let rank = 1;
let sample = 1;

let per_step = 10;
let update_interval = 10;
let continue_flag = false;
let log_axis = true;

let stop_btn = document.getElementById("stop");
let start_btn = document.getElementById("start");
let axis_btn = document.getElementById("logaxis");

function update_simulation() {
    rank = parseInt(document.getElementById("rank").value);
    sample = parseInt(document.getElementById("sample").value);
    if (rank > sample) {
        rank = sample;
        document.getElementById("rank").value = rank;
    }

    let n_elems = Math.floor((1 - histograms.half_step) / histograms.step) + 1;
    histograms.hist = Array(n_elems).fill(0);
    histograms.elems = 0;
}

function take_sample() {
    let rvs = Array(sample)
        .fill(null)
        .map(() => jStat.uniform.sample(0, 1))
        .sort((x, y) => x - y);

    return rvs[rank - 1];
}

function step(single = false) {
    let ranked_value = 0;
    let n_steps = single ? 1 : per_step;

    for (let i = 0; i < n_steps; i = i + 1) {
        ranked_value = take_sample();
        histograms.hist[Math.floor(ranked_value / histograms.step)] += 1;
        histograms.elems += 1;
    }
}

function plot_figures() {
    let normalizer = histograms.elems > 0 ? histograms.elems : 1;
    normalizer = normalizer * histograms.step;
    let norm = (v) => v / normalizer;
    let trans = log_axis
        ? (v) => {
              return Math.log10(v);
          }
        : (v) => {
              return v;
          };
    let X = Array(histograms.hist.length)
        .fill(null)
        .map((v, i) => i * histograms.step);
    dist_plot.update(
        [X],
        [
            histograms.hist.map((v) => trans(norm(v))),
            X.map((v) => trans(jStat.beta.pdf(v, rank, sample + 1 - rank))),
        ],
        symbols,
        colors
    );
}

function run(single = false) {
    step(single);
    plot_figures();
    if (continue_flag) {
        setTimeout(run, update_interval);
    }
}

start_btn.addEventListener("click", () => {
    start_btn.disabled = true;
    stop_btn.innerHTML = "Stop";

    update_simulation();

    continue_flag = true;
    setTimeout(run, update_interval);

    stop_btn.disabled = false;
});
stop_btn.addEventListener("click", () => {
    stop_btn.disabled = true;
    continue_flag = !continue_flag;
    if (continue_flag) {
        setTimeout(run, update_interval);
        stop_btn.innerHTML = "Stop";
    } else {
        stop_btn.innerHTML = "Resume";
    }
    start_btn.disabled = continue_flag;
    stop_btn.disabled = false;
});
stop_btn.disabled = true;
axis_btn.addEventListener("click", () => {
    log_axis = !log_axis;
    axis_btn.innerHTML = log_axis ? "Lin-axis" : "Log-axis";
    if (log_axis) {
        dist_plot.setLabels(["x", "lg[P(x)]"]);
    } else {
        dist_plot.setLabels(["x", "P(x)"]);
    }
    if (!continue_flag) {
        plot_figures();
    }
});
axis_btn.innerHTML = log_axis ? "Lin-axis" : "Log-axis";

// on load
update_simulation();
plot_figures();
