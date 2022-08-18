const my_parse_float = (val) => parseFloat(("" + val).replace(",", "."));

let game_plot = new plotlyPlot(
    "gamePlot",
    ["possesion", "score-diff"],
    [10, 15, 40, 50]
);

let rng = new Random();

let end_game = 200;

let advantage = 0;
let possesion = 0;
let score_diff = 0;

let game_data = [0];

let iteration = 0;
let red_results = [0, 0, 0];

let update_game_interval = 10;
let update_sim_interval = 100;
let steps_slow = 2;
let steps_fast = end_game;
let run_steps = steps_slow;
let continue_flag = false;

let stop_btn = document.getElementById("stop");
let start_btn = document.getElementById("start");
let speed_btn = document.getElementById("speed");

let iter_label = document.getElementById("iter");
let win_label = document.getElementById("winloss");

function plot_figures() {
    game_plot.update(
        [
            Array(game_data.length)
                .fill(null)
                .map((v, i) => i),
        ],
        [game_data]
    );
    iter_label.innerHTML = `${iteration}`;
    win_label.innerHTML = `${red_results[0]}-${red_results[1]}-${red_results[2]}`;
}

function take_shot(prob) {
    return rng.random() < prob ? 2 : 0;
}

function step() {
    let prob_score = 0.5;
    // red team possesion
    possesion = possesion + 1;
    prob_score = 0.5;
    if (score_diff < 0) {
        prob_score = 0.5 + advantage;
    } else if (score_diff > 0) {
        prob_score = 0.5 - advantage;
    }
    score_diff = score_diff + take_shot(prob_score);
    game_data[possesion] = score_diff;
    // blue team possesion
    possesion = possesion + 1;
    prob_score = 0.5;
    if (score_diff > 0) {
        prob_score = 0.5 + advantage;
    } else if (score_diff < 0) {
        prob_score = 0.5 - advantage;
    }
    score_diff = score_diff - take_shot(prob_score);
    game_data[possesion] = score_diff;
    if (possesion >= end_game) {
        iteration = iteration + 1;
        if (score_diff > 0) {
            red_results[0] = red_results[0] + 1;
        } else if (score_diff < 0) {
            red_results[2] = red_results[2] + 1;
        } else {
            red_results[1] = red_results[1] + 1;
        }
    }
}

function restart_game() {
    if (!continue_flag) {
        return;
    }

    possesion = 0;
    score_diff = 0;

    game_data = Array(201).fill(null);
    game_data[0] = 0;

    setTimeout(run_game, update_sim_interval);
}

function run_game() {
    for (let i = 0; i < run_steps; i += 2) {
        step();
    }
    plot_figures();
    if (possesion < end_game) {
        setTimeout(run_game, update_game_interval);
    }
    if (continue_flag && possesion >= end_game) {
        restart_game();
    }
    if (!continue_flag && possesion >= end_game) {
        start_btn.disabled = false;
        stop_btn.disabled = false;
        speed_btn.disabled = false;
    }
}

start_btn.addEventListener("click", () => {
    continue_flag = true;

    start_btn.disabled = true;
    stop_btn.innerHTML = "Stop";

    advantage = my_parse_float(document.getElementById("advantage").value);

    iteration = 0;
    red_results = [0, 0, 0];

    restart_game();

    stop_btn.disabled = false;
    speed_btn.disabled = true;
});
stop_btn.addEventListener("click", () => {
    stop_btn.disabled = true;
    continue_flag = !continue_flag;
    if (continue_flag) {
        restart_game();
        stop_btn.innerHTML = "Stop";
        start_btn.disabled = true;
        stop_btn.disabled = false;
    } else {
        stop_btn.innerHTML = "Resume";
        start_btn.disabled = possesion < end_game;
        stop_btn.disabled = possesion < end_game;
    }
});
speed_btn.addEventListener("click", () => {
    if (run_steps == steps_fast) {
        run_steps = steps_slow;
        speed_btn.innerHTML = "Fast";
    } else {
        run_steps = steps_fast;
        speed_btn.innerHTML = "Slow";
    }
});
stop_btn.disabled = true;

// on load
step();
plot_figures();
