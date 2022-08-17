let nbirds_plot = new plotlyPlot(
    "nbirdsPlot",
    ["events", "birds"],
    [10, 15, 40, 50]
);

let canvas = document.getElementById("wire");
let canvas_sq = 5;
let size = [50, 40];
let spaces = size[0] * size[1];

let update_interval = 10;
let continue_flag = false;

let stop_btn = document.getElementById("stop");
let start_btn = document.getElementById("start");

let data = {
    time: [],
    f_birds: [],
};

function plot_figures() {
    nbirds_plot.update([data.time], [data.f_birds], "lines", ["#333"]);
}

function draw_state() {
    let ctx = canvas.getContext("2d");

    // fill in with grass green background
    ctx.fillStyle = "#0a1";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // sitting birds
    model.states.forEach((v, x) => {
        v.forEach((vv, y) => {
            if (vv != 0) {
                let loc_x = x * canvas_sq;
                let loc_y = y * canvas_sq;
                if (vv > 0) {
                    // bird present
                    ctx.fillStyle = "#333";
                } else {
                    // bird recently left
                    ctx.fillStyle = "#d33";
                }
                ctx.fillRect(loc_x, loc_y, canvas_sq, canvas_sq);
            }
        });
    });
}

function run() {
    model.step();
    append_data();
    draw_state();
    plot_figures();
    if (continue_flag) {
        setTimeout(run, update_interval);
    }
}

function append_data() {
    data.time.push(model.time);
    data.f_birds.push(model.birds / spaces);

    if (data.time.length > 1200) {
        data.time.shift(1);
        data.f_birds.shift(1);
    }
}

start_btn.addEventListener("click", () => {
    start_btn.disabled = true;
    stop_btn.innerHTML = "Stop";

    let tolerance = parseInt(document.getElementById("tolerance").value);

    model = new pushyBirds2DModel(size, tolerance);

    data = {
        time: [],
        f_birds: [],
    };

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

// on load
let model = new pushyBirds2DModel(size);

draw_state();
plot_figures();
