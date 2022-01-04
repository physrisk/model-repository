const my_parse_float = (val) => parseFloat((""+val).replace(",","."));

let pop_plot = new plotlyPlot("popPlot", ["lg[2026 - year]","lg[population]"], [10,15,40,50]);
let data = null;

function run_model() {
    let alpha = my_parse_float(document.getElementById("alpha").value)*1e-12;
    let k = my_parse_float(document.getElementById("exponent").value);
    let mu = my_parse_float(document.getElementById("exponent_2").value);
    let pop_max = my_parse_float(document.getElementById("pop_max").value)*1e9;
    
    let t_ref = parseInt(document.getElementById("reference").value);
    let ref_idx = data.year.findIndex(v => v==t_ref);
    let pop_ref = 0;
    if(ref_idx < 0) {
        ref_idx = data.year_old.findIndex(v => v==t_ref);
        pop_ref = data.population_old[ref_idx];
    } else {
        pop_ref = data.population[ref_idx];
    }

    // ensure that maximum is not smaller than reference population
    // otherwise nonsense results are obtained
    if(pop_max < pop_ref) {
        pop_max = pop_ref;
        document.getElementById("pop_max").value = pop_max/1e9;
    }

    // solution for t in (t_1, max year)
    let model_forward = commonFunctions.rungeKutta4(v => {
        return alpha*Math.pow(v, 1/k+1)*(1 - Math.pow(v/pop_max, mu));
    }, pop_ref, t_ref, data.year[0], 1000);
    
    // solution for t in (min year, t_1)
    let model_back = commonFunctions.rungeKutta4(v => {
        return alpha*Math.pow(v, 1/k+1)*(1 - Math.pow(v/pop_max, mu));
    }, pop_ref, t_ref, data.year_old[data.year_old.length-1], 1000);

    return {
        "year": [...model_forward.t.reverse(), ...model_back.t],
        "population": [...model_forward.y.reverse(), ...model_back.y]
    }
}

function plot_figure() {
    let t_doom = 2026;

    let model = run_model();
    
    let log_year = data.year.map(v => Math.log10(t_doom-v));
    let log_year_old = data.year_old.map(v => Math.log10(t_doom-v));
    let log_year_model = model.year.map(v => Math.log10(t_doom-v));
    
    let log_pop = data.population.map(v => Math.log10(v));
    let log_pop_old = data.population_old.map(v => Math.log10(v));
    let log_pop_model = model.population.map(v => Math.log10(v));

    pop_plot.update(
        [log_year, log_year_old, log_year_model],
        [log_pop, log_pop_old, log_pop_model],
        ["markers", "markers", "lines"],
        ["#cc2222", "#22cc22", "#222222"]);
}

function fill_reference_selector() {
    let par_obj = document.getElementById("reference");
    data.year.forEach(v => {
        let node = document.createElement("option");
        node.value = parseInt(v);
        node.innerHTML = v;
        par_obj.appendChild(node);
    });
    data.year_old.forEach(v => {
        let node = document.createElement("option");
        node.value = parseInt(v);
        node.innerHTML = v;
        par_obj.appendChild(node);
    });
    par_obj.value = 1500;
}

document.getElementById("exponent").addEventListener("change", () => {
    plot_figure();
});
document.getElementById("reference").addEventListener("change", () => {
    plot_figure();
});
document.getElementById("alpha").addEventListener("change", () => {
    plot_figure();
});
document.getElementById("pop_max").addEventListener("change", () => {
    plot_figure();
});
document.getElementById("exponent_2").addEventListener("change", () => {
    plot_figure();
});

// on load
fetch("./population.json")
    .then(response => response.json())
    .then(result => {
        data = result;
        fill_reference_selector();
        plot_figure();
    });
