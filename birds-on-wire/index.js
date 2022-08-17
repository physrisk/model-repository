let nbirds_plot = new plotlyPlot(
    "nbirdsPlot",
    ["events", "birds"],
    [10, 15, 40, 50]
);
let hist_plot = new plotlyPlot(
    "histPlot",
    ["gap length", "probability"],
    [10, 15, 40, 50]
);

let canvas = document.getElementById("wire");
let canvas_sq = 10;
let spaces = 510;

let update_interval = 30;
let continue_flag = false;

let stop_btn = document.getElementById("stop");
let start_btn = document.getElementById("start");

let data = {
    time: [],
    f_birds: [],
    gap_lens: [],
    gap_prob: [],
};

function get_theory_prob_gap(gap_lens) {
    let result = Array(gap_lens.length).fill(null);
    if (model.tolerance > 1) {
        let term_1 = 2;
        let term_2 = 2 * model.tolerance + 2;
        return result.map((v, i) => {
            if (gap_lens[i] > 2 * model.tolerance) {
                return null;
            }
            if (gap_lens[i] < model.tolerance) {
                return 0;
            }
            return term_1 / (term_2 + gap_lens[i]);
        });
    }
    let prev =
        (Math.pow(2, gap_lens[0]) * 3) / jStat.factorial(3 + gap_lens[0]);
    return result.map((v, i) => {
        let k = gap_lens[i];
        prev = (prev * 2 * k * (k + 3)) / (k + 4);
        if (k > 1) {
            prev = prev / ((k - 1) * (k + 2));
        }
        return prev;
    });
}

function plot_figures() {
    nbirds_plot.update([data.time], [data.f_birds], "lines", ["#333"]);
    let gap_theory = get_theory_prob_gap(data.gap_lens);
    hist_plot.update(
        [data.gap_lens, data.gap_lens],
        [data.gap_prob, gap_theory],
        ["markers", "lines"],
        ["#333", "#33c"]
    );
}

function draw_state() {
    let ctx = canvas.getContext("2d");

    let dims = [
        Math.floor(canvas.width / canvas_sq),
        Math.floor(canvas.height / canvas_sq),
    ];

    // fill in with sky blue background
    ctx.fillStyle = "#8ce";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // snaky wire
    ctx.fillStyle = "#aaa";
    ctx.fillRect(0, 0, canvas_sq, canvas_sq);
    for (let y = 0; y < canvas.height - canvas_sq; y += 2 * canvas_sq) {
        if (y > 0) {
            ctx.fillRect(0, y, canvas.width, canvas_sq);
        } else {
            ctx.fillRect(canvas_sq, y, canvas.width - canvas_sq, canvas_sq);
        }
    }
    for (let y = canvas_sq; y < canvas.height; y += 2 * canvas_sq) {
        if ((y / canvas_sq) % 4 == 3) {
            ctx.fillRect(0, y, canvas_sq, canvas_sq);
        } else {
            ctx.fillRect(canvas.width - canvas_sq, y, canvas_sq, canvas_sq);
        }
    }

    // sitting birds
    model.states.forEach((v, i) => {
        if (v != 0) {
            let h_pos = i % (dims[0] + 1);
            let v_pos = 2 * Math.floor(i / (dims[0] + 1));
            let flip = (v_pos / 2) % 2 == 1;
            if (h_pos == dims[0]) {
                v_pos = v_pos + 1;
                h_pos = h_pos - 1;
            }

            let x = h_pos * canvas_sq;
            let y = v_pos * canvas_sq;
            if (flip) {
                x = canvas.width - x - canvas_sq;
                y = v_pos * canvas_sq;
            }
            if (v > 0) {
                // bird present
                ctx.fillStyle = "#333";
            } else {
                // bird recently left
                ctx.fillStyle = "#d33";
            }
            ctx.fillRect(x, y, canvas_sq, canvas_sq);
        }
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
    data.f_birds.push(model.birds / model.spaces);

    if (data.time.length > 600) {
        data.time.shift(1);
        data.f_birds.shift(1);
    }

    let gaps = model.get_gaps();
    let min_gap = Math.min(...gaps);
    let max_gap = Math.max(...gaps);
    let n_bins = max_gap - min_gap + 1;
    data.gap_lens = Array(n_bins)
        .fill(null)
        .map((v, i) => min_gap + i);
    data.gap_prob = jStat.histogram(gaps, n_bins).map((v) => v / gaps.length);
}

start_btn.addEventListener("click", () => {
    start_btn.disabled = true;
    stop_btn.innerHTML = "Stop";

    let tolerance = parseInt(document.getElementById("tolerance").value);

    model = new pushyBirdsModel(spaces, tolerance);

    data = {
        time: [],
        f_birds: [],
        gap_lens: [],
        gap_prob: [],
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
let model = new pushyBirdsModel();

draw_state();
plot_figures();
