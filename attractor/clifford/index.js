const my_parse_float = (val) => parseFloat((""+val).replace(",","."));

let rng = new Random();

let canvas = document.getElementById("attractorPlot");

let continue_flag = true;
let update_interval = 10; // setTimeout(..., update_interval)
let update_points = 1000; // number of points per update

let search_flag = false;
let search_interval = 1000; // setTimeout(..., search_interval)

let density_plot = null;
let attractor = null;

let max_iters = 1e6; // allow for maximum of 1 million iterations

let bad_threshold = 0.01; // density > bad_threshold is BAD!
let bad_limit = 1e4; // check density after bad_limit points are generated

let last_points = [];
let n_last_points = 5000; // points to remember for autorize feature
let plot_padding = 0.03; // % to pad the plot when doing auto resizing

// UI buttons
let generate_btn = document.getElementById("generate");
let randomize_btn = document.getElementById("randomize");
let resize_btn = document.getElementById("resize");
let search_btn = document.getElementById("search");
let stop_btn = document.getElementById("stop");

// UI fields
let amp_1_field = document.getElementById("amp_1");
let amp_2_field = document.getElementById("amp_2");
let freq_1_field = document.getElementById("freq_1");
let freq_2_field = document.getElementById("freq_2");

// density plot coloring function
function color_fn(x, n, max) {
    let c = 250;
    if(x > 0) {
        c = c - Math.floor(200*Math.log(x)/Math.log(max));
    }
    if(is_bad_attractor()) {
        return `rgb(${c}, 150, 150)`;
    }
    return `rgb(${c}, ${c}, ${c})`;
}

// setup the app for generation of a density plot
function setup() {
    let freq_1 = my_parse_float(freq_1_field.value);
    let freq_2 = my_parse_float(freq_2_field.value);
    let amp_1 = my_parse_float(amp_1_field.value);
    let amp_2 = my_parse_float(amp_2_field.value);
    
    attractor = new cliffordAttractor(freq_1, amp_1, freq_2, amp_2, [0, 0]);

    let size = plot_size_params(amp_1, amp_2);
    
    density_plot = new densityPlot(canvas, 1, size);
    density_plot.set_color_fn(color_fn);

    continue_flag = true;

    last_points = [];
}

function continue_run() {
    setTimeout(run, update_interval);
}

function plot_size_params(amp_1, amp_2) {
    let detected_size = [[0, 0], [0, 0]];
    if(amp_1 < 0) {
        detected_size[0][0] = -1 + amp_1;
    } else {
        detected_size[0][0] = -1 - amp_1;
    }
    detected_size[0][1] = -detected_size[0][0];
    if(amp_2 < 0) {
        detected_size[1][0] = -1 + amp_2;
    } else {
        detected_size[1][0] = -1 - amp_2;
    }
    detected_size[1][1] = -detected_size[1][0];
    return detected_size;
}

function plot_size_points(points) {
    let x = points.map(v => v[0]);
    let y = points.map(v => v[1]);
    let size = [
        [Math.min(...x), Math.max(...x)],
        [Math.min(...y), Math.max(...y)],
    ];
    let padding = (size[0][1] - size[0][0])*plot_padding;
    size[0][0] -= padding;
    size[0][1] += padding;
    padding = (size[1][1] - size[1][0])*plot_padding;
    size[1][0] -= padding;
    size[1][1] += padding;
    return size;
}

function is_bad_attractor() {
    return (density_plot.n_points > bad_limit) && ((density_plot.max_points/density_plot.n_points) > bad_threshold);
}

function run() {
    let coords = [0, 0];
    let i = 0;
    for(; i<update_points; i+=1) {
        coords = attractor.next();
        density_plot.add_point(coords);
        last_points.push(coords);
    }
    if(last_points.length > n_last_points) {
        last_points = last_points.slice(-n_last_points);
    }
    density_plot.update();
    if(is_bad_attractor() || (density_plot.n_points > max_iters)) {
        stop_btn.click();
    }
    if(continue_flag) {
        continue_run();
    } else {
        generate_btn.disabled = false;
        randomize_btn.disabled = false;
        search_btn.disabled = false;
    }
}

function randomize() {
    let freq_1 = 6*rng.random()-3;
    let freq_2 = 6*rng.random()-3;
    let amp_1 = Math.pow(10, 2*rng.random()-1);
    if(rng.random() > 0.5) {
        amp_1 = -amp_1;
    }
    let amp_2 = Math.pow(10, 2*rng.random()-1);
    if(rng.random() > 0.5) {
        amp_2 = -amp_2;
    }
    freq_1_field.value = freq_1;
    freq_2_field.value = freq_2;
    amp_1_field.value = amp_1;
    amp_2_field.value = amp_2;
}

function search() {
    if(!continue_flag) {
        if(is_bad_attractor()) {
            randomize_btn.click();
            generate_btn.click();
        } else {
            search_flag = false;
            search_btn.innerHTML = "Search";
        }
    } 
    if(search_flag) {
        setTimeout(search, search_interval);
    }
}

generate_btn.addEventListener("click", () => {
    stop_btn.disabled = false;
    resize_btn.disabled = true;
    generate_btn.disabled = true;
    randomize_btn.disabled = true;
    search_btn.disabled = true;
    
    setup();
    
    continue_run();
});
randomize_btn.addEventListener("click", () => {
    randomize();
   
    generate_btn.click();
});
stop_btn.addEventListener("click", () => {
    continue_flag = false;
    stop_btn.disabled = true;
    resize_btn.disabled = (last_points.length < n_last_points);
});
resize_btn.addEventListener("click", () => {
    stop_btn.disabled = false;
    resize_btn.disabled = true;
    generate_btn.disabled = true;
    randomize_btn.disabled = true;
    search_btn.disabled = true;
    
    let points = last_points.slice(0);
    setup();
    
    let size = plot_size_points(points);
    density_plot.set_plot_size(size);
    
    continue_run();
});
search_btn.addEventListener("click", () => {
    search_flag = !search_flag;
    if(search_flag) {
        search_btn.innerHTML = "Stop search";
        randomize_btn.click();
        generate_btn.click();
        search();
    } else {
        search_btn.innerHTML = "Search";
    }
});
