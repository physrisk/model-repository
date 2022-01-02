const my_parse_float = (val) => parseFloat((""+val).replace(",","."));

let series_plot = new plotlyPlot("seriesPlot", ["t","x(t)"], [10,15,40,60]);

let rng = new Random();

let cur_level = 8;
let series = Array(257).fill(null);

let continue_flag = true;
let curve_generated = false;
let update_interval = 1000;

function reset() {
    continue_flag = true;
    curve_generated = false;

    cur_level = 8;
    series = series.fill(null);
    series[0] = my_parse_float(document.getElementById("xstart").value);
    series[256] = my_parse_float(document.getElementById("xend").value);

    let mid_val = 0.5*(series[0] + series[256]);

    series_plot.setRanges([0, 256], [
        Math.min(mid_val-12, series[0]-6),
        Math.max(mid_val+12, series[256]+6)
    ]);
    update_plot();
}

function update_plot() {
    let time = series.map((v, i) => {
        if(v!==null) {
            return i;
        }
        return -1;
    }).filter(v => v>-1);
    let series_shown = series.filter(v => v!==null);
    series_plot.update([time], [series_shown], "lines", ["#cc2222"]);
}

function get_mid_point(xstart, xend, dt) {
    return (xstart + xend)/2 + rng.normal(0, Math.sqrt(dt/4));
}

function fill_level(level) {
    let idx = Math.pow(2, level-1);
    let fill_step = Math.pow(2, level);
    for(; idx<series.length; idx+=fill_step) {
        series[idx] = get_mid_point(series[idx - fill_step/2],
                                    series[idx + fill_step/2],
                                    fill_step);
    }
}

function generate() {
    fill_level(cur_level);
    update_plot();
    
    cur_level = cur_level - 1;
    if(cur_level > 0 && continue_flag) {
        setTimeout(generate, update_interval);
    } else {
        curve_generated = true;
        generate_btn.disabled = false;
        stop_btn.disabled = true;
        continue_flag = true;
        series_plot.setRanges(true, true);
        update_plot();
    }
}

// on load
let generate_btn = document.getElementById("generate")
generate_btn.addEventListener("click", () => {
    stop_btn.disabled = false;
    generate_btn.disabled = true;
    reset();
    generate();
});
let stop_btn = document.getElementById("stop")
stop_btn.addEventListener("click", () => {
    continue_flag = false;
});
stop_btn.disabled = true;

reset();
