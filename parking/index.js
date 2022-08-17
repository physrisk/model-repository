const my_parse_float = (val) => parseFloat(("" + val).replace(",", "."));

let ncars_plot = new plotlyPlot(
    "ncarsPlot",
    ["events", "Total, Last"],
    [10, 15, 40, 50]
);
let cost_plot = new plotlyPlot(
    "costPlot",
    ["events", "norm. avg. Cost"],
    [10, 15, 40, 50]
);

let canvas = document.getElementById("parking");
let update_interval = 100;
let continue_flag = false;

let stop_btn = document.getElementById("stop");
let start_btn = document.getElementById("start");

let data = {
    time: [],
    n_cars: [],
    end_car: [],
    cost: [],
};

let strategy = null;

function plot_figures() {
    ncars_plot.update(
        [data.time, data.time],
        [data.n_cars, data.end_car],
        "lines",
        ["#2222cc", "#222222"]
    );
    cost_plot.update([data.time], [data.cost], "lines", ["#cc2222"]);
}

function draw_state() {
    let ctx = canvas.getContext("2d");

    let size_sq = 10;
    let car_size = 10;
    let car_padding = 0;

    let dims = [
        Math.floor(canvas.width / size_sq),
        Math.floor(canvas.height / size_sq),
    ];

    // fill in with green background
    ctx.fillStyle = "#226622";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // "target" square
    ctx.fillStyle = "#cc2222";
    ctx.fillRect(0, 0, size_sq, size_sq);

    // winding road
    ctx.fillStyle = "#cccccc";
    for (let y = 0; y < canvas.height - size_sq; y += 2 * size_sq) {
        if (y > 0) {
            ctx.fillRect(0, y, canvas.width, size_sq);
        } else {
            ctx.fillRect(size_sq, y, canvas.width - size_sq, size_sq);
        }
    }
    for (let y = size_sq; y < canvas.height; y += 2 * size_sq) {
        if ((y / size_sq) % 4 == 3) {
            ctx.fillRect(0, y, size_sq, size_sq);
        } else {
            ctx.fillRect(canvas.width - size_sq, y, size_sq, size_sq);
        }
    }

    // parked cars
    model.states.forEach((v, i) => {
        if (v > 0) {
            let pos = i + 1;
            let h_pos = pos % (dims[0] + 1);
            let v_pos = 2 * Math.floor(pos / (dims[0] + 1));
            let flip = (v_pos / 2) % 2 == 1;
            if (h_pos == dims[0]) {
                v_pos = v_pos + 1;
                h_pos = h_pos - 1;
            }

            let x = h_pos * size_sq;
            let y = v_pos * size_sq;
            if (flip) {
                x = canvas.width - x - size_sq;
                y = (v_pos + 1) * size_sq - car_size - 2 * car_padding;
            }
            ctx.fillStyle = "#777777";
            ctx.fillRect(x + car_padding, y + car_padding, car_size, car_size);
        }
    });
}

function append_data() {
    data.time.push(model.time);
    data.n_cars.push(model.n);
    data.end_car.push(find_end(model.states) + 1);
    data.cost.push(model.get_mean_cost());

    if (data.time.length > 1000) {
        data.time.shift(1);
        data.n_cars.shift(1);
        data.end_car.shift(1);
        data.cost.shift(1);
    }
}

function run() {
    model.step(strategy);
    append_data();
    draw_state();
    plot_figures();
    if (continue_flag) {
        setTimeout(run, update_interval);
    }
}

start_btn.addEventListener("click", () => {
    start_btn.disabled = true;
    stop_btn.innerHTML = "Stop";

    let arrival_rate = my_parse_float(
        document.getElementById("arrival_rate").value
    );
    let walk_cost = my_parse_float(document.getElementById("walk_cost").value);

    model = new parkingModel(508, arrival_rate, 1, walk_cost, 1);

    let strategy_idx = parseInt(document.getElementById("strategy").value);
    if (strategy_idx == 0) {
        strategy = strategy_meek;
    } else if (strategy_idx == 1) {
        strategy = strategy_prudent;
    } else if (strategy_idx == 2) {
        strategy = strategy_optimist;
    } else {
        strategy = strategy_half;
    }

    data = {
        time: [],
        n_cars: [],
        end_car: [],
        cost: [],
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
let model = new parkingModel();

draw_state();
