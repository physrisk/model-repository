const my_parse_float = (val) => parseFloat(("" + val).replace(",", "."));

let probs_plot = new plotlyPlot(
    "probsPlot",
    ["mid-pin row", "lg[prob. down]"],
    [10, 15, 40, 50]
);

let rng = new Random();
let fall_prob = 0.5;
let threshold_level = 5;
let total_levels = 0;

let canvas = document.getElementById("pins");
let canvas_default_top_padding = 10;
let canvas_desired_bottom_padding = 5;
let canvas_side_padding = 10;
let board_width = 15;
let canvas_top_padding = 0;
let pin_radius = 0;

let update_interval = 10;
let continue_flag = false;

let data = Array(threshold_level).fill(0);

let stop_btn = document.getElementById("stop");
let step_btn = document.getElementById("step");
let start_btn = document.getElementById("start");

function update_simulation_setup() {
    total_levels = 2 * threshold_level - 1;
    pin_radius =
        Math.min(
            (canvas.width - 2 * canvas_side_padding) / threshold_level,
            (canvas.height - canvas_default_top_padding) / total_levels
        ) / 2;
    canvas_top_padding = Math.max(
        200 - canvas_desired_bottom_padding - 2 * total_levels * pin_radius,
        canvas_default_top_padding
    );

    probs_plot.setRanges([1, total_levels], true);
}

function knock_pin() {
    return rng.random() < fall_prob ? 1 : 0;
}

function knock_down(from_level, pin_states) {
    if (from_level <= threshold_level - 1) {
        let states = Array(pin_states.length + 1).fill(0);
        for (let i = 0; i < pin_states.length; i += 1) {
            if (pin_states[i]) {
                if (!states[i]) {
                    states[i] = knock_pin();
                }
                if (!states[i + 1]) {
                    states[i + 1] = knock_pin();
                }
            }
        }
        return states;
    }
    // from_level > threshold_level - 1
    let states = Array(pin_states.length - 1).fill(0);
    for (let i = 0; i < pin_states.length; i += 1) {
        if (pin_states[i]) {
            if (i > 0 && !states[i - 1]) {
                states[i - 1] = knock_pin();
            }
            if (i < pin_states.length - 1 && !states[i]) {
                states[i] = knock_pin();
            }
        }
    }
    return states;
}

function plot_figures() {
    probs_plot.update(
        [
            Array(data.length)
                .fill(null)
                .map((v, i) => 2 * i + 1),
        ],
        [data.map((v) => Math.log10(v / data[0]))],
        "lines+markers",
        ["#36b"]
    );
}

function draw_floor(ctx) {
    // general color
    ctx.fillStyle = "#dc8";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // board boundaries
    for (
        let board_x = Math.floor(board_width / 2);
        board_x < canvas.width;
        board_x += board_width
    ) {
        ctx.beginPath();
        ctx.moveTo(board_x, 0);
        ctx.lineTo(board_x, canvas.height);
        ctx.lineWidth = 0.5;
        ctx.strokeStyle = "#666";
        ctx.stroke();
    }
}

function draw_pin(ctx, pin_x, pin_y, is_fallen, is_highlighted) {
    ctx.beginPath();
    ctx.arc(pin_x, pin_y, pin_radius, 0, 2 * Math.PI);
    ctx.fillStyle = is_fallen ? "#333" : "#fff";
    ctx.fill();
    if (is_highlighted) {
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#f00";
        ctx.stroke();
    }
}

function step() {
    let ctx = canvas.getContext("2d");
    let ctx_middle = canvas.width / 2;
    let ctx_top = canvas_top_padding;

    draw_floor(ctx);

    let observed_states = [];
    let state = [1];
    let pin_x = 0;
    let pin_y = 0;
    let mid_pin_id = 0;
    let is_odd_level = false;
    for (let pin_level = 1; pin_level <= total_levels; pin_level += 1) {
        // modeling part
        if (pin_level > 1) {
            state = knock_down(pin_level - 1, state);
        }
        mid_pin_id = Math.floor(state.length / 2);
        is_odd_level = pin_level % 2 == 1;
        if (is_odd_level) {
            observed_states.push(state[mid_pin_id]);
        }
        if (pin_level <= threshold_level) {
            pin_x = ctx_middle - (pin_level - 1) * pin_radius;
        } else {
            pin_x = ctx_middle + (pin_level - total_levels) * pin_radius;
        }
        pin_y = ctx_top + (2 * pin_level - 1) * pin_radius;
        // drawing part
        for (let pin_id = 0; pin_id < state.length; pin_id += 1) {
            draw_pin(
                ctx,
                pin_x + 2 * pin_id * pin_radius,
                pin_y,
                state[pin_id] == 1,
                is_odd_level && pin_id == mid_pin_id
            );
        }
    }

    observed_states.forEach((v, i) => {
        data[i] = data[i] + v;
    });

    document.getElementById("iter").innerHTML = `${data[0]}`;
}

function run() {
    step();
    plot_figures();
    if (continue_flag) {
        setTimeout(run, update_interval);
    }
}

start_btn.addEventListener("click", () => {
    start_btn.disabled = true;
    step_btn.disabled = true;
    stop_btn.innerHTML = "Stop";

    threshold_level = parseInt(
        document.getElementById("threshold_level").value
    );
    update_simulation_setup();

    fall_prob = my_parse_float(document.getElementById("prob").value);
    data = Array(threshold_level).fill(0);

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
step_btn.addEventListener("click", () => {
    run();
});
stop_btn.disabled = true;

// on load
update_simulation_setup();
step();
plot_figures();
