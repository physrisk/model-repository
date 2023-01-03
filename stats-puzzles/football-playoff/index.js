const my_parse_float = (val) => parseFloat(("" + val).replace(",", "."));

let dist_plot = new plotlyPlot(
    "distributionPlot",
    ["x", "lg[P(x)]"],
    [10, 15, 40, 50]
);
dist_plot.setRanges([0, 1], true);
dist_plot.reset();

let colors = ["#36b", "#c22", "#395", "#d73", "#333"];
let histograms = {
    step: 0.01,
    half_step: 0.005,
    seed_1: [],
    seed_2: [],
    seed_3: [],
    seed_4: [],
    winner: [],
    wins: Array(4).fill(0),
    elems: 0,
    mean: 0,
};

let alpha = 1;
let beta = 1;
let gamma = 1;

let per_step = 10;
let update_interval = 10;
let continue_flag = false;
let log_axis = true;

let canvas = document.getElementById("fractionPlot");

let stop_btn = document.getElementById("stop");
let step_btn = document.getElementById("step");
let start_btn = document.getElementById("start");
let axis_btn = document.getElementById("logaxis");

let team11_label = document.getElementById("team11");
let team12_label = document.getElementById("team12");
let team21_label = document.getElementById("team21");
let team22_label = document.getElementById("team22");
let team31_label = document.getElementById("team31");
let team32_label = document.getElementById("team32");

function update_simulation() {
    alpha = my_parse_float(document.getElementById("alpha").value);
    beta = my_parse_float(document.getElementById("beta").value);
    gamma = my_parse_float(document.getElementById("gamma").value);

    let n_elems = Math.floor((1 - histograms.half_step) / histograms.step) + 1;
    histograms.seed_1 = Array(n_elems).fill(0);
    histograms.seed_2 = Array(n_elems).fill(0);
    histograms.seed_3 = Array(n_elems).fill(0);
    histograms.seed_4 = Array(n_elems).fill(0);
    histograms.winner = Array(n_elems).fill(0);
    histograms.wins = Array(4).fill(0);
    histograms.mean = 0;
    histograms.elems = 0;
}

function play_game(team_1, team_2) {
    let prob_1 =
        Math.pow(team_1, gamma) /
        (Math.pow(team_1, gamma) + Math.pow(team_2, gamma));
    return jStat.uniform.sample(0, 1) < prob_1;
}

function simulate_playoff() {
    let teams = Array(4)
        .fill(null)
        .map(() => jStat.beta.sample(alpha, beta))
        .sort((x, y) => y - x);

    // half-finals
    let pair_1 = play_game(teams[0], teams[3]) ? 0 : 3;
    let pair_2 = play_game(teams[1], teams[2]) ? 1 : 2;

    // final
    let winner = play_game(teams[pair_1], teams[pair_2]) ? pair_1 : pair_2;

    return {
        teams: teams,
        finalist_ids: [pair_1, pair_2],
        finalists: [teams[pair_1], teams[pair_2]],
        winner_id: winner,
        winner: teams[winner],
    };
}

function step(single = false) {
    let playoff = {};

    let n_steps = single ? 1 : per_step;

    for (let i = 0; i < n_steps; i = i + 1) {
        playoff = simulate_playoff();
        histograms.elems += 1;
        histograms.seed_1[
            Math.floor(
                playoff.teams[3] / histograms.step + histograms.half_step
            )
        ] += 1;
        histograms.seed_2[
            Math.floor(
                playoff.teams[2] / histograms.step + histograms.half_step
            )
        ] += 1;
        histograms.seed_3[
            Math.floor(
                playoff.teams[1] / histograms.step + histograms.half_step
            )
        ] += 1;
        histograms.seed_4[
            Math.floor(
                playoff.teams[0] / histograms.step + histograms.half_step
            )
        ] += 1;
        histograms.winner[
            Math.floor(playoff.winner / histograms.step + histograms.half_step)
        ] += 1;
        if (histograms.elems > 0) {
            histograms.mean =
                histograms.mean +
                (1 / histograms.elems) * (playoff.winner - histograms.mean);
        } else {
            histograms.mean = playoff.winner;
        }
        histograms.wins[playoff.winner_id] += 1;
    }
    return playoff;
}

function plot_distributions() {
    let normalizer = histograms.elems > 0 ? histograms.elems : 1;
    let trans = log_axis
        ? (v) => {
              return Math.log10(v / normalizer);
          }
        : (v) => {
              return v / normalizer;
          };
    dist_plot.update(
        [
            Array(histograms.winner.length)
                .fill(null)
                .map((v, i) => i * histograms.step),
        ],
        [
            histograms.seed_4.map((v) => trans(v)),
            histograms.seed_3.map((v) => trans(v)),
            histograms.seed_2.map((v) => trans(v)),
            histograms.seed_1.map((v) => trans(v)),
            histograms.winner.map((v) => trans(v)),
        ],
        "lines+markers",
        colors
    );
}

function plot_fractions() {
    let ctx = canvas.getContext("2d");
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    let filled = 0;
    for (let i = 0; i < 4; i = i + 1) {
        let width = (canvas.width * histograms.wins[i]) / histograms.elems;
        ctx.fillStyle = colors[i];
        ctx.fillRect(filled, 0, width, canvas.height);
        filled = filled + width;
    }
    ctx.fillStyle = "#000";
    ctx.fillRect(canvas.width * 0.25, 0, 1, canvas.height);
    ctx.fillRect(canvas.width * 0.5, 0, 1, canvas.height);
    ctx.fillRect(canvas.width * 0.75, 0, 1, canvas.height);
}

function show_game_list(playoff) {
    if (playoff === null) {
        return;
    }
    team11_label.innerHTML = `Team #${Math.floor(
        playoff.teams[0] / histograms.step
    )}`;
    team11_label.style.fontStyle =
        playoff.finalist_ids[0] == 0 ? "italic" : "normal";
    team12_label.innerHTML = `Team #${Math.floor(
        playoff.teams[3] / histograms.step
    )}`;
    team12_label.style.fontStyle =
        playoff.finalist_ids[0] == 3 ? "italic" : "normal";
    team21_label.innerHTML = `Team #${Math.floor(
        playoff.teams[1] / histograms.step
    )}`;
    team21_label.style.fontStyle =
        playoff.finalist_ids[1] == 1 ? "italic" : "normal";
    team22_label.innerHTML = `Team #${Math.floor(
        playoff.teams[2] / histograms.step
    )}`;
    team22_label.style.fontStyle =
        playoff.finalist_ids[1] == 2 ? "italic" : "normal";
    team31_label.innerHTML = `Team #${Math.floor(
        playoff.finalists[0] / histograms.step
    )}`;
    team31_label.style.fontStyle =
        playoff.winner_id == playoff.finalist_ids[0] ? "italic" : "normal";
    team31_label.style.fontWeight =
        playoff.winner_id == playoff.finalist_ids[0] ? "bold" : "normal";
    team31_label.className = playoff.finalist_ids[0] == 3 ? "seed4" : "seed1";
    team32_label.innerHTML = `Team #${Math.floor(
        playoff.finalists[1] / histograms.step
    )}`;
    team32_label.style.fontStyle =
        playoff.winner_id == playoff.finalist_ids[1] ? "italic" : "normal";
    team32_label.style.fontWeight =
        playoff.winner_id == playoff.finalist_ids[1] ? "bold" : "normal";
    team32_label.className = playoff.finalist_ids[1] == 2 ? "seed3" : "seed2";
}

function plot_figures(playoff = null) {
    plot_distributions();
    plot_fractions();
    show_game_list(playoff);

    // iterations
    document.getElementById("iter").innerHTML = histograms.elems;

    // mean
    document.getElementById("mean").innerHTML = histograms.mean.toFixed(3);
}

function run(single = false) {
    let playoff = step(single);
    plot_figures(playoff);
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
    run(true);
});
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
