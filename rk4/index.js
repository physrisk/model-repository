const my_parse_float = (val) => parseFloat((""+val).replace(",","."));

let series_plot = new plotlyPlot("seriesPlot", ["t","x(t)"], [10,15,40,50]);
let data = null;

function true_sol(t, a) {
    return t.map(v => {
        let denom = 1 + v + a*v;
        if(Math.abs(denom) < 1e-3) {
            return null;
        }
        let nom = 1-a*v-a*a*v;
        return nom/denom;
    });
}

function equation(x, a) {
    return -(x+a)*(x+a);
}

function run_model(method, a, t_step, t_max) {
    let steps = Math.round(t_max / t_step) + 1;
    if(method == 0) {
        return commonFunctions.eulerODE(v => equation(v, a),
                                        1, 0, t_max, steps);
    }
    return commonFunctions.rungeKutta4(v => equation(v, a),
                                       1, 0, t_max, steps);
}

function plot_figure() {
    let method = parseInt(document.getElementById("method").value);

    let a = my_parse_float(document.getElementById("par_a").value);
    let t_max = my_parse_float(document.getElementById("par_t_max").value);
    let t_step = my_parse_float(document.getElementById("par_step").value);

    let t = jStat.seq(0, t_max, 100);

    let x_true = true_sol(t, a);

    let model = run_model(method, a, t_step, t_max);

    series_plot.update(
        [t, model.t], [x_true, model.y],
        ["lines", "markers"], ["#222222", "#cc2222"]);
}

document.getElementById("par_a").addEventListener("change", () => plot_figure());
document.getElementById("method").addEventListener("change", () => plot_figure());
document.getElementById("par_t_max").addEventListener("change", () => plot_figure());
document.getElementById("par_step").addEventListener("change", () => plot_figure());

// on load
plot_figure()
