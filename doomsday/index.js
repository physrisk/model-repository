const my_parse_float = (val) => parseFloat((""+val).replace(",","."));

let pop_plot = new plotlyPlot("popPlot", ["lg[doomsday - year]","lg[population]"], [10,15,40,50]);
let data = null;

function fit_func(years) {
    let t_doom = my_parse_float(document.getElementById("doomsday").value);
    let k = my_parse_float(document.getElementById("exponent").value);
    let t_ref = parseInt(document.getElementById("reference").value);
    let ref_idx = data.year.findIndex(v => v==t_ref);
    let pop_ref = 0;
    if(ref_idx < 0) {
        ref_idx = data.year_old.findIndex(v => v==t_ref);
        pop_ref = data.population_old[ref_idx];
    } else {
        pop_ref = data.population[ref_idx];
    }
    let alpha = (k*Math.pow(pop_ref, -1/k)*1e12)/(t_doom - t_ref);
    document.getElementById("alpha").value = alpha.toFixed(3);
    return years.map(v => pop_ref*Math.pow((t_doom - t_ref)/Math.pow(10, v), k));
}

function plot_figure() {
    let t_doom = my_parse_float(document.getElementById("doomsday").value);
    
    let log_year = data.year.map(v => Math.log10(t_doom-v));
    let log_year_old = data.year_old.map(v => Math.log10(t_doom-v));
    
    let log_pop = data.population.map(v => Math.log10(v));
    let log_pop_old = data.population_old.map(v => Math.log10(v));

    let fit_year = jStat.seq(Math.log10(t_doom - 2020),
                             Math.log10(t_doom - 200), 11);
    let fit_pop = fit_func(fit_year);

    let log_fit_pop = fit_pop.map(v => Math.log10(v));

    pop_plot.update(
        [log_year, log_year_old, fit_year],
        [log_pop, log_pop_old, log_fit_pop],
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
    par_obj.value = 1927;
}

document.getElementById("doomsday").addEventListener("change", () => {
    plot_figure();
});
document.getElementById("exponent").addEventListener("change", () => {
    plot_figure();
});
document.getElementById("reference").addEventListener("change", () => {
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
