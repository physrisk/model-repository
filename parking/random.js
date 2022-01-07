const my_parse_float = (val) => parseFloat((""+val).replace(",","."));

let ncars_plot = new plotlyPlot("ncarsPlot", ["events", "Total, Last"], [10,15,40,50]);
let cost_plot = new plotlyPlot("costPlot", ["events", "avg. Cost"], [10,15,40,50]);

let canvas = document.getElementById("parking");
let update_interval = 100;
let continue_flag = false;
let resume_flag = false;

let stop_btn = document.getElementById("stop");
let start_btn = document.getElementById("start");

let data = {
    time: [],
    n_cars: [],
    end_car: [],
    cost: [],
    cost_meek: [],
    cost_prud: [],
    cost_opt: [],
    cost_half: [],
    cost_avg_meek: [],
    cost_avg_prud: [],
    cost_avg_opt: [],
    cost_avg_half: [],
}

let probs = [];

function plot_figures() {
    ncars_plot.update(
        [data.time, data.time], [data.n_cars, data.end_car], "lines",
        ["#2222cc", "#222222"],
    );
    cost_plot.update(
    //    [data.time], [data.cost], "lines", ["#cc2222"],
        [data.time, data.time, data.time, data.time],
        [data.cost_avg_meek, data.cost_avg_prud, data.cost_avg_opt, data.cost_avg_half],
        "lines",
        ["#222222", "#2222cc", "#22cc22", "#cc2222"]
    );
}

function draw_state() {
    let ctx = canvas.getContext("2d");
    
    let size_sq = 10;
    let car_size = 10;
    let car_padding = 0;

    let dims = [Math.floor(canvas.width/size_sq),
                Math.floor(canvas.height/size_sq)];

    // fill in with green background
    ctx.fillStyle = "#226622";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // "target" square
    ctx.fillStyle = "#cc2222";
    ctx.fillRect(0, 0, size_sq, size_sq);

    // winding road
    ctx.fillStyle = "#cccccc";
    for(let y=0; y<canvas.height-size_sq; y+=2*size_sq) {
        if(y>0) {
            ctx.fillRect(0, y, canvas.width, size_sq);
        } else {
            ctx.fillRect(size_sq, y, canvas.width-size_sq, size_sq);
        }
    }
    for(let y=size_sq; y<canvas.height; y+=2*size_sq) {
        if((y / size_sq) % 4 == 3) {
            ctx.fillRect(0, y, size_sq, size_sq);
        } else {
            ctx.fillRect(canvas.width - size_sq, y, size_sq, size_sq);
        }
    }

    // parked cars
    model.states.forEach((v, i) => {
        if(v>0) {
            let pos = i + 1;
            let h_pos = pos % (dims[0]+1);
            let v_pos = 2*Math.floor(pos / (dims[0]+1));
            let rotate = false;
            let flip = ((v_pos / 2) % 2 == 1);
            if(h_pos == dims[0]) {
                v_pos = v_pos + 1;
                h_pos = h_pos - 1;
                rotate = true;
            }

            let x = h_pos*size_sq;
            let y = v_pos*size_sq;
            if(flip) {
                x = canvas.width - x - size_sq;
                y = (v_pos+1)*size_sq - car_size - 2*car_padding;
            }
            ctx.fillStyle="#777777";
            ctx.fillRect(x+car_padding, y+car_padding, car_size, car_size);
        }
    });
}

function append_data() {
    data.time.push(model.time);
    data.n_cars.push(model.n);
    data.end_car.push(find_end(model.states)+1);
    data.cost.push(model.get_mean_cost());
    data.cost_avg_meek.push(jStat.mean(data.cost_meek));
    data.cost_avg_prud.push(jStat.mean(data.cost_prud));
    data.cost_avg_opt.push(jStat.mean(data.cost_opt));
    data.cost_avg_half.push(jStat.mean(data.cost_half));

    if(data.time.length > 1000) {
        data.time.shift(1);
        data.n_cars.shift(1);
        data.end_car.shift(1);
        data.cost.shift(1);
    }
    if(data.cost_meek.length > 50) {
        data.cost_meek.shift();
    }
    if(data.cost_prud.length > 50) {
        data.cost_prud.shift();
    }
    if(data.cost_opt.length > 50) {
        data.cost_opt.shift();
    }
    if(data.cost_half.length > 50) {
        data.cost_half.shift();
    }
}

function run() {
    let strategy = null;
    let strategy_idx = Math.random();
    if(strategy_idx<probs[0]) {
        strategy = strategy_meek;
    } else if(strategy_idx<probs[1]) {
        strategy = strategy_prudent;
    } else if(strategy_idx<probs[2]) {
        strategy = strategy_optimist;
    } else {
        strategy = strategy_half;
    }
    
    let out = model.step(strategy);
    if(out !== null) {
        if(strategy_idx<probs[0]) {
            data.cost_meek.push(out[1]);
        } else if(strategy_idx<probs[1]) {
            data.cost_prud.push(out[1]);
        } else if(strategy_idx<probs[2]) {
            data.cost_opt.push(out[1]);
        } else {
            data.cost_half.push(out[1]);
        }
    }

    append_data();
    draw_state();
    plot_figures();
    if(continue_flag) {
        setTimeout(run, update_interval);
    }
}

function validate_probs(changed) {
    let ps = [];
    ps.push(my_parse_float(document.getElementById("prob_meek").value));
    ps.push(my_parse_float(document.getElementById("prob_prud").value));
    ps.push(my_parse_float(document.getElementById("prob_opt").value));
    ps.push(my_parse_float(document.getElementById("prob_half").value));
    ps[changed] = Math.min(Math.max(ps[changed], 0), 1);
    let dp = jStat.sum(ps) - 1;
    if(ps[3] >= dp) {
        ps[3] -= dp;
    } else {
        ps[changed] -= dp;
    }
    document.getElementById("prob_meek").value = ps[0];
    document.getElementById("prob_prud").value = ps[1];
    document.getElementById("prob_opt").value = ps[2];
    document.getElementById("prob_half").value = ps[3];
}

start_btn.addEventListener("click", () => {
    start_btn.disabled = true;
    stop_btn.innerHTML = "Stop";
    
    let arrival_rate = my_parse_float(document.getElementById("arrival_rate").value);
    let walk_cost = my_parse_float(document.getElementById("walk_cost").value);
    probs = [];
    probs.push(my_parse_float(document.getElementById("prob_meek").value));
    probs.push(my_parse_float(document.getElementById("prob_prud").value));
    probs.push(my_parse_float(document.getElementById("prob_opt").value));
    probs.push(my_parse_float(document.getElementById("prob_half").value));
    probs = jStat.cumsum(probs);

    model = new parkingModel(508, arrival_rate, 1, walk_cost, 1);

    data = {
        time: [],
        n_cars: [],
        end_car: [],
        cost: [],
        cost_meek: [],
        cost_prud: [],
        cost_opt: [],
        cost_half: [],
        cost_avg_meek: [],
        cost_avg_prud: [],
        cost_avg_opt: [],
        cost_avg_half: [],
    }
    
    continue_flag = true;
    setTimeout(run, update_interval);
    
    stop_btn.disabled = false;
});
stop_btn.addEventListener("click", () => {
    stop_btn.disabled = true;
    continue_flag = !continue_flag;
    if(continue_flag) {
        setTimeout(run, update_interval);
        stop_btn.innerHTML = "Stop";
    } else {
        stop_btn.innerHTML = "Resume";
    }
    start_btn.disabled = continue_flag;
    stop_btn.disabled = false;
});
stop_btn.disabled = true;

document.getElementById("prob_meek").addEventListener("change", () => {
    validate_probs(0);
});
document.getElementById("prob_prud").addEventListener("change", () => {
    validate_probs(1);
});
document.getElementById("prob_opt").addEventListener("change", () => {
    validate_probs(2);
});

// on load
let model = new parkingModel();

draw_state();
