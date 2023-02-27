const my_parse_float = (v) => parseFloat(`${v}`.replace(",", "."));

let prob_graph = new plotlyPlot("probGraph", ["N", "p(N)"]);
let modes = "lines";
let colors = ["#22d", "#d55", "#393"];

function get_params() {
    let p1, p2;
    p1 = my_parse_float(document.getElementById("p1").value);
    p2 = my_parse_float(document.getElementById("p2").value);
    if (p1 > p2) {
        return [p1, p2, true];
    }
    return [p2, p1, false];
}

function calculate_probability(n, params, which = 1) {
    if (params[0] == params[1]) {
        // no difference
        return 0.5;
    }
    let c = params[0] / (params[0] - params[1]);
    let upper_bound = (50 * c) / (c - 1);
    let lower_bound = (50 * (1 + c)) / c;
    let result = 0;

    // best
    if ((which == 1 && params[2]) || (which == -1 && !params[2])) {
        result = 0 + (n < upper_bound);
        if (!params[2]) {
            return 1 - result;
        }
        return result;
    }

    // worst
    if ((which == -1 && params[2]) || (which == 1 && !params[2])) {
        result = 1 - (n > lower_bound);
        if (!params[2]) {
            return 1 - result;
        }
        return result;
    }

    // medium
    if (lower_bound < n && n < upper_bound) {
        result = 50 / (50 - n) + c;
    } else if (n <= lower_bound) {
        result = 1;
    } else {
        result = 0;
    }
    if (!params[2]) {
        return 1 - result;
    }
    return result;
}

function update_view() {
    let params = get_params();
    let n_arr = new Array(501).fill(null).map((v, i) => 50 + i * 0.1);
    let best_response = n_arr.map((n) => calculate_probability(n, params, 1));
    let worst_response = n_arr.map((n) => calculate_probability(n, params, -1));
    let mid_response = n_arr.map((n) => calculate_probability(n, params, 0));
    prob_graph.update(
        [n_arr],
        [mid_response, worst_response, best_response],
        modes,
        colors
    );
    return true;
}

document.querySelectorAll("#controlWrapper input").forEach((e) => {
    e.addEventListener("change", () => update_view());
});

/* onLoad */
update_view();
