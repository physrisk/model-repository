const my_parse_float = (val) => parseFloat(("" + val).replace(",", "."));

let start_btn = document.getElementById("start");
let stop_btn = document.getElementById("stop");

let canvas = document.getElementById("adjacency");
const canvas_sq = 2;
const n_agents = Math.floor(Math.min(canvas.width, canvas.height) / canvas_sq);

let pop_plot = new plotlyPlot("popPlot", ["x_i", "P_i"], [10, 15, 40, 50]);
let like_plot = new plotlyPlot("likePlot", ["P_i", "L_i"], [10, 15, 40, 50]);
let match_plot = new plotlyPlot("matchPlot", ["P_i", "M_i"], [10, 15, 40, 50]);

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

    const pop_data = Array(model.n_agents)
        .fill(null)
        .map((v, i) => {
            return model.get_popularity(i);
        });
    pop_plot.update([model.attractivness], [pop_data], "lines", ["#46b"]);

    const like_data = Array(model.n_agents)
        .fill(null)
        .map((v, i) => {
            return model.get_likes(i);
        });
    like_plot.update([pop_data], [like_data], "markers", ["#46b"]);

    const match_data = Array(model.n_agents)
        .fill(null)
        .map((v, i) => {
            return model.get_matches(i);
        });
    match_plot.update([pop_data], [match_data], "markers", ["#46b"]);
}

function run() {
    for (let i = 0; i < update_steps; i += 1) {
        model.step();
    }
    plot_figures();
    if (continue_flag) {
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

    model = new DynamicDatingModel(
        n_agents,
        distribution,
        diff_method,
        pickiness
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
