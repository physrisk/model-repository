const my_parse_float = (val) => parseFloat(("" + val).replace(",", "."));

let start_btn = document.getElementById("start");
let stop_btn = document.getElementById("stop");

let canvas = document.getElementById("adjacency");
const canvas_sq = 2;
const n_agents = Math.floor(Math.min(canvas.width, canvas.height) / canvas_sq);

let match_plot = new plotlyPlot("matchPlot", ["x_i", "x_j"], [10, 15, 40, 50]);
match_plot.setRanges([0, 1], [0, 1]);

let pool_plot = new plotlyPlot("poolPlot", ["x", "p(x)"], [10, 15, 40, 50]);
match_plot.setRanges([0, 1], true);

let model = null;

const update_steps = 1000;
const update_interval = 10;
let continue_flag = false;

function plot_figures() {
    let ctx = canvas.getContext("2d");
    const cur_max_pop = Math.max(model.get_max_popularity(), 0);
    const cur_min_pop = Math.min(model.get_min_popularity(), 0);
    for (let i = 0; i < n_agents; i += 1) {
        for (let j = 0; j < n_agents; j += 1) {
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
            ctx.fillRect(i * canvas_sq, j * canvas_sq, canvas_sq, canvas_sq);
        }
    }

    if (model.matched_pairs.length > 0) {
        match_plot.update(
            [model.matched_pairs.map((v) => v[0])],
            [model.matched_pairs.map((v) => v[1])],
            "markers",
            ["#46b"]
        );
    } else {
        match_plot.reset();
    }

    // process distribution of current participants
    const x_min = Math.min(...model.attractiveness);
    const x_max = Math.max(...model.attractiveness);
    const n_pool_bins = 10;
    const x_step = (x_max - x_min) / n_pool_bins;
    const x_bins = Array(n_pool_bins)
        .fill(null)
        .map((v, i) => x_min + (i + 0.5) * x_step);
    const x_pdf = jStat
        .histogram(model.attractiveness, n_pool_bins)
        .map((v) => v / (model.n_agents * x_step));
    // process distribution of matched participants
    const matched_data = model.matched_pairs.flat();
    const matched_min = Math.min(...matched_data);
    const matched_max = Math.max(...matched_data);
    const matched_step = (matched_max - matched_min) / n_pool_bins;
    const matched_bins = Array(n_pool_bins)
        .fill(null)
        .map((v, i) => matched_min + (i + 0.5) * matched_step);
    const matched_pdf = jStat
        .histogram(matched_data, n_pool_bins)
        .map((v) => v / (matched_data.length * matched_step));
    // theoretical distribution corresponding to population distribution
    let x_theory = [];
    if (model.distribution == 1) {
        x_theory = Array(n_pool_bins).fill(1);
    } else {
        x_theory = jStat
            .diff([
                0,
                ...x_bins
                    .map((v) =>
                        jStat.normal.cdf(
                            v + 0.5 * x_step,
                            model.normal_mean,
                            model.normal_sigma
                        )
                    )
                    .slice(0, -1),
                1,
            ])
            .map((v) => v / x_step);
    }
    pool_plot.update(
        [x_bins, matched_bins, x_bins],
        [x_pdf, matched_pdf, x_theory],
        "lines",
        ["#666", "#46b", "#c00"]
    );
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

    model = new ReplaceDatingModel(
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
