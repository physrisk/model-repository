const my_parse_float = (val) => parseFloat(("" + val).replace(",", "."));

let start_btn = document.getElementById("start");
let stop_btn = document.getElementById("stop");

let canvas = document.getElementById("adjacency");
const canvas_sq = 2;
const n_agents = Math.floor(Math.min(canvas.width, canvas.height) / canvas_sq);

let model = null;

const update_steps = 1000;
const update_interval = 10;
let continue_flag = false;

const match_type_mixed = 0;
const match_type_picky = 1;
const match_type_shy = 2;

let type_plot = new plotlyPlot("typePlot", ["matches", ""], [10, 15, 40, 50]);
type_plot.setRanges([0, 1], [-0.5, 2.5]);
type_plot.setYTicks([0, 1, 2], ["picky", "mixed", "shy"]);
type_plot.setXTicks(
    Array(11)
        .fill(null)
        .map((v, i) => i * 0.1),
    []
);
type_plot.reset();

let match_plot = new plotlyPlot("matchPlot", ["x_i", "x_j"], [10, 15, 40, 50]);
match_plot.setRanges([0, 1], [0, 1]);
match_plot.reset();

let delta_plot = new plotlyPlot("deltaPlot", ["δ_ij", ""], [10, 15, 40, 50]);
delta_plot.setRanges(true, [-0.5, 2.5]);
delta_plot.setYTicks([0, 1, 2], ["picky", "mixed", "shy"]);
delta_plot.reset();

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

    if (model.matched.attractiveness.length > 0) {
        let match_type_data = {};
        model.matched.types.forEach((v) => {
            if (typeof match_type_data[v] === "undefined") {
                match_type_data[v] = 0;
            }
            match_type_data[v] = match_type_data[v] + 1;
        });
        type_plot.update(
            [
                [
                    0,
                    match_type_data[match_type_picky] /
                        model.matched.types.length,
                ],
                [
                    0,
                    match_type_data[match_type_mixed] /
                        model.matched.types.length,
                ],
                [
                    0,
                    match_type_data[match_type_shy] /
                        model.matched.types.length,
                ],
            ],
            [Array(2).fill(0), Array(2).fill(1), Array(2).fill(2)],
            "lines+markers",
            ["#c00", "#835", "#46b"]
        );

        const matches_attractiveness_picky =
            model.matched.attractiveness.filter(
                (v, i) => model.matched.types[i] == match_type_picky
            );
        const matches_attractiveness_mixed =
            model.matched.attractiveness.filter(
                (v, i) => model.matched.types[i] == match_type_mixed
            );
        const matches_attractiveness_shy = model.matched.attractiveness.filter(
            (v, i) => model.matched.types[i] == match_type_shy
        );
        match_plot.update(
            [
                matches_attractiveness_picky.map((v) => v[0]),
                matches_attractiveness_mixed.map((v) => v[0]),
                matches_attractiveness_shy.map((v) => v[0]),
            ],
            [
                matches_attractiveness_picky.map((v) => v[1]),
                matches_attractiveness_mixed.map((v) => v[1]),
                matches_attractiveness_shy.map((v) => v[1]),
            ],
            "markers",
            ["#c00", "#835", "#46b"]
        );

        const matches_delta_picky = model.matched.deltas.filter(
            (v, i) => model.matched.types[i] == match_type_picky
        );
        const delta_picky = [
            jStat.percentile(matches_delta_picky, 0.25),
            jStat.percentile(matches_delta_picky, 0.5),
            jStat.percentile(matches_delta_picky, 0.75),
        ];
        const matches_delta_mixed = model.matched.deltas.filter(
            (v, i) => model.matched.types[i] == match_type_mixed
        );
        const delta_mixed = [
            jStat.percentile(matches_delta_mixed, 0.25),
            jStat.percentile(matches_delta_mixed, 0.5),
            jStat.percentile(matches_delta_mixed, 0.75),
        ];
        const matches_delta_shy = model.matched.deltas.filter(
            (v, i) => model.matched.types[i] == match_type_shy
        );
        const delta_shy = [
            jStat.percentile(matches_delta_shy, 0.25),
            jStat.percentile(matches_delta_shy, 0.5),
            jStat.percentile(matches_delta_shy, 0.75),
        ];
        delta_plot.update(
            [delta_picky, delta_mixed, delta_shy],
            [Array(3).fill(0), Array(3).fill(1), Array(3).fill(2)],
            "lines+markers",
            ["#c00", "#835", "#46b"]
        );
    } else {
        type_plot.reset();
        match_plot.reset();
        delta_plot.reset();
    }
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

    let beta_max = my_parse_float(document.getElementById("beta_max").value);
    let beta_min = my_parse_float(document.getElementById("beta_min").value);
    if (beta_max < beta_min) {
        document.getElementById("beta_max").value = beta_min;
        document.getElementById("beta_min").value = beta_max;
        [beta_min, beta_max] = [beta_max, beta_min];
    }
    const threshold = parseInt(document.getElementById("threshold").value);

    model = new PickyshyDatingModel(n_agents, beta_max, beta_min, threshold);

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
