const my_parse_float = (val) => parseFloat(("" + val).replace(",", "."));

let start_btn = document.getElementById("start");
let stop_btn = document.getElementById("stop");

let canvas = document.getElementById("adjacency");
const canvas_sq = 2;
const n_agents = Math.floor(Math.min(canvas.width, canvas.height) / canvas_sq);

let match_plot = new plotlyPlot("matchPlot", ["x_i", "x_j"], [10, 15, 40, 50]);
match_plot.setRanges([0, 1], [0, 1]);

let delta_plot = new plotlyPlot(
    "deltaPlot",
    ["δ_ij", "lg[P(δ_ij)]"],
    [10, 15, 40, 50]
);

let model = null;

const update_steps = 1000;
const update_interval = 10;
let continue_flag = false;

function plot_figures() {
    let ctx = canvas.getContext("2d");
    const cur_max_pop = Math.max(model.get_max_popularity(), 0);
    const cur_min_pop = Math.min(model.get_min_popularity(), 0);
    for (let i = 0; i < n_agents; i += 1) {
        if (model.active[i]) {
            for (let j = 0; j < n_agents; j += 1) {
                if (!model.active[j]) {
                    continue;
                }
                if (model.popularity[i][j] > 0) {
                    const pop_value = model.popularity[i][j] / cur_max_pop;
                    const shade = Math.floor(255 * (1 - pop_value));
                    ctx.fillStyle = `rgb(${shade},${shade},255)`;
                    if (model.is_matched(i, j)) {
                        ctx.fillStyle = `rgb(255,${shade},${shade})`;
                    }
                } else {
                    if (cur_min_pop < 0) {
                        const pop_value = model.popularity[i][j] / cur_min_pop;
                        const shade = Math.floor(205 * (1 - pop_value) + 50);
                        ctx.fillStyle = `rgb(${shade},${shade},${shade})`;
                    } else {
                        ctx.fillStyle = "rgb(255,255,255)";
                    }
                }
                ctx.fillRect(
                    i * canvas_sq,
                    j * canvas_sq,
                    canvas_sq,
                    canvas_sq
                );
            }
        } else {
            ctx.fillStyle = "#000";
            ctx.fillRect(i * canvas_sq, 0, canvas_sq, canvas.height);
            ctx.fillRect(0, i * canvas_sq, canvas.width, canvas_sq);
        }
    }

    if (model.matched_pairs.length > 0) {
        match_plot.update(
            [model.matched_pairs.map((v) => model.attractiveness[v[0]])],
            [model.matched_pairs.map((v) => model.attractiveness[v[1]])],
            "markers",
            ["#46b"]
        );
    } else {
        match_plot.reset();
    }

    const matches_deltas = model.matched_pairs.map((v) =>
        Math.abs(model.attractiveness[v[0]] - model.attractiveness[v[1]])
    );
    const delta_min = Math.min(...matches_deltas);
    const delta_max = Math.max(...matches_deltas);
    const n_delta_bins = 10;
    const delta_step = (delta_max - delta_min) / n_delta_bins;
    const delta_bins = Array(n_delta_bins)
        .fill(null)
        .map((v, i) => delta_min + (i + 0.5) * delta_step);
    const delta_freqs = jStat
        .histogram(matches_deltas, n_delta_bins)
        .map((v) => Math.log10(v / matches_deltas.length));
    delta_plot.update([delta_bins], [delta_freqs], "lines", ["#46b"]);
}

function run() {
    let fast_stop = false;
    for (let i = 0; i < update_steps; i += 1) {
        if (!model.step()) {
            fast_stop = true;
            stop_btn.click();
            break;
        }
    }
    plot_figures();
    if (continue_flag && !fast_stop) {
        setTimeout(run, update_interval);
    }
}

start_btn.addEventListener("click", () => {
    start_btn.disabled = true;
    stop_btn.innerHTML = "Stop";

    let pickiness = my_parse_float(document.getElementById("pickiness").value);
    let diff_method = my_parse_float(
        document.getElementById("diff_method").value
    );
    let distribution = my_parse_float(
        document.getElementById("distribution").value
    );
    let threshold = parseInt(document.getElementById("threshold").value);

    model = new DropoutDatingModel(
        n_agents,
        distribution,
        diff_method,
        pickiness,
        threshold
    );

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
