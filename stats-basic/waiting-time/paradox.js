const my_parse_float = (val) => parseFloat(("" + val).replace(",", "."));

let rng = new Random();

let time_plot = new plotlyPlot("timePlot", ["t", "I(t)"], [10, 15, 40, 60]);
time_plot.setRanges(true, [0, 1.05]);
time_plot.reset();
let dist_plot = new plotlyPlot(
    "distributionPlot",
    ["T", "p(T)"],
    [10, 15, 40, 60]
);

const COLORS = ["#47c", "#c11"];

let start_btn = document.getElementById("start");
let resume_btn = document.getElementById("resume");

const TIMES_PER_UPDATE = 1000;
const UPDATE_INTERVAL = 100;
let continue_flag = false;

const DAY_DURATION = 720;
let avg_interarrival = 15;
let delta_arrival = 10;

const MAX_GT_LENGTH = 30 * TIMES_PER_UPDATE;
let generated_waiting_times = [];

function generate_day() {
    let events = [];
    let tau = generate_arrival_time();
    let t = tau;
    while (t < DAY_DURATION) {
        events.push(t);
        tau = generate_arrival_time();
        t = t + tau;
    }
    return events;
}

function convert(events) {
    let series = { time: [0], value: [0] };
    events.forEach((v) => {
        series.time.push(v, v, v);
        series.value.push(0, 1, 0);
    });
    series.time.push(DAY_DURATION);
    series.value.push(0);
    return series;
}

function generate_arrival_time() {
    return rng.uniform(
        avg_interarrival - delta_arrival,
        avg_interarrival + delta_arrival
    );
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

function simulate_single() {
    let day_events = generate_day();
    let day_series = convert(day_events);
    let arrival_time = rng.uniform(0, DAY_DURATION);
    let arrival_series = convert([arrival_time]);
    let wait_time = day_events.find((v) => v > arrival_time) - arrival_time;
    return {
        day_series: day_series,
        arrival_series: arrival_series,
        wait_time: wait_time,
    };
}

function step() {
    let sim = {};
    let times = Array(TIMES_PER_UPDATE)
        .fill(null)
        .map((v) => {
            sim = simulate_single();
            return sim.wait_time;
        })
        .filter((v) => !isNaN(v));
    generated_waiting_times.push(...times);
    if (generated_waiting_times.length > MAX_GT_LENGTH) {
        generated_waiting_times = generated_waiting_times.slice(-MAX_GT_LENGTH);
    }

    let histogram_waiting = make_histogram(generated_waiting_times);
    let value_maximum = Math.max(...histogram_waiting.x);
    let density_maximum = Math.max(...histogram_waiting.y);
    dist_plot.setRanges([0, value_maximum * 1.05], [0, density_maximum * 1.05]);
    dist_plot.update(
        [histogram_waiting.x],
        [histogram_waiting.y],
        "lines",
        COLORS[1]
    );
    time_plot.update(
        [sim.day_series.time, sim.arrival_series.time],
        [sim.day_series.value, sim.arrival_series.value],
        "lines",
        COLORS
    );
    document.getElementById("avg_wait").innerHTML =
        "" + jStat.mean(generated_waiting_times).toFixed(2);

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

    avg_interarrival = my_parse_float(
        document.getElementById("avg_interarrival").value
    );
    delta_arrival = my_parse_float(
        document.getElementById("delta_arrival").value
    );
    delta_arrival = Math.min(delta_arrival, avg_interarrival);
    document.getElementById("delta_arrival").value = delta_arrival;
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
