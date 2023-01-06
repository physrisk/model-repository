let series_plot = new plotlyPlot("seriesPlot", ["i", "N(i)"], [10, 15, 40, 50]);
let dist_plot = new plotlyPlot("distPlot", ["n", "p(n)"], [10, 15, 40, 50]);

let symbols = ["markers", "markers", "lines", "lines"];
let colors = ["#36b", "#c22", "#36b", "#c22"];

let data = {
    current: {
        red: [],
        blue: [],
    },
    mean: {
        red: [],
        blue: [],
    },
    dist_buses: [],
    max_buses: 0,
    n_sims: -1,
    n_reds: -1,
    n_blues: -1,
    last_blues: 0,
};

let per_step = 10;
let update_interval = 100;
let continue_flag = false;

let stop_btn = document.getElementById("stop");
let step_btn = document.getElementById("step");
let start_btn = document.getElementById("start");

function reset_params() {
    if (data.n_sims < 0) {
        update_simulation();
        return;
    }
    document.getElementById("n_reds").value = data.n_reds;
    document.getElementById("n_blues").value = data.n_blues;
}

function update_simulation() {
    data.current.red = [];
    data.current.blue = [];
    data.mean.red = [];
    data.mean.blue = [];
    data.n_sims = 0;
    data.n_reds = parseInt(document.getElementById("n_reds").value);
    data.n_blues = parseInt(document.getElementById("n_blues").value);
    data.last_blues = 0;
    data.max_buses = data.n_reds + data.n_blues;
    data.dist_buses = Array(data.max_buses).fill(0);
}

function call_bus(state) {
    let prob_blue = state.blue / state.n;
    let prob_red = state.red / state.n;
    let called = jStat.uniform.sample(0, 1);
    let n_called = 0;
    let n_red = 0;
    let n_blue = 0;
    if (called <= prob_blue) {
        while (called <= prob_blue) {
            n_called = n_called + 1;
            prob_blue = (state.blue - n_called) / (state.n - n_called);
            called = jStat.uniform.sample(0, 1);
        }
        n_blue = n_called;
    } else if (called > prob_blue) {
        called = 1 - called;
        while (called < prob_red) {
            n_called = n_called + 1;
            prob_red = (state.red - n_called) / (state.n - n_called);
            called = jStat.uniform.sample(0, 1);
        }
        n_red = n_called;
    }
    return {
        blue: state.blue - n_blue,
        red: state.red - n_red,
        n: state.n - n_called,
    };
}

function step() {
    let state = {
        blue: data.n_blues,
        red: data.n_reds,
        n: 0,
    };
    state.n = state.blue + state.red;

    data.current.blue = [state.blue];
    data.current.red = [state.red];

    let n_buses = 0;
    while (state.n > 0) {
        state = call_bus(state);
        data.current.blue.push(state.blue);
        data.current.red.push(state.red);
        n_buses = n_buses + 1;
    }
    data.n_sims = data.n_sims + 1;
    data.dist_buses[n_buses - 1] += 1;

    data.last_blues =
        data.last_blues +
        (data.current.blue[data.current.blue.length - 2] -
            data.current.blue[data.current.blue.length - 1] >
            0);

    if (data.n_sims > 1) {
        if (data.mean.red.length < data.current.red.length) {
            let copy = data.mean.red.slice();
            data.mean.red = Array(data.current.red.length)
                .fill(0)
                .map((v, i) => {
                    if (i < copy.length) {
                        return copy[i];
                    }
                    return v;
                });
            copy = data.mean.blue.slice();
            data.mean.blue = Array(data.current.blue.length)
                .fill(0)
                .map((v, i) => {
                    if (i < copy.length) {
                        return copy[i];
                    }
                    return v;
                });
        }
        for (let i = 1; i < data.current.red.length; i = i + 1) {
            data.mean.red[i] =
                data.mean.red[i] +
                (1 / data.n_sims) * (data.current.red[i] - data.mean.red[i]);
        }
        for (let i = 1; i < data.current.blue.length; i = i + 1) {
            data.mean.blue[i] =
                data.mean.blue[i] +
                (1 / data.n_sims) * (data.current.blue[i] - data.mean.blue[i]);
        }
    } else {
        data.mean.red = data.current.red.slice();
        data.mean.blue = data.current.blue.slice();
    }
}

function plot_figures() {
    let bus_idx = Array(data.current.red.length)
        .fill(null)
        .map((v, i) => i);
    let mean_idx = Array(data.mean.red.length)
        .fill(null)
        .map((v, i) => i);
    series_plot.update(
        [bus_idx, bus_idx, mean_idx, mean_idx],
        [data.current.blue, data.current.red, data.mean.blue, data.mean.red],
        symbols,
        colors
    );

    dist_plot.update(
        [
            Array(data.max_buses)
                .fill(null)
                .map((v, i) => i + 1),
        ],
        [data.dist_buses.map((v) => v / data.n_sims)]
    );

    document.getElementById("iter").innerHTML = data.n_sims;
    document.getElementById("lastPerc").innerHTML = (
        (100 * data.last_blues) /
        data.n_sims
    ).toFixed(1);
}

function run(single = false) {
    let n_steps = single ? 1 : per_step;
    for (let i = 0; i < n_steps; i = i + 1) {
        step();
    }
    plot_figures();
    if (continue_flag) {
        setTimeout(run, update_interval);
    }
}

start_btn.addEventListener("click", () => {
    start_btn.disabled = true;
    step_btn.disabled = true;
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
    step_btn.disabled = continue_flag;
    stop_btn.disabled = false;
});
stop_btn.disabled = true;
step_btn.addEventListener("click", () => {
    reset_params();
    run(true);
});

// on load
update_simulation();
plot_figures();
