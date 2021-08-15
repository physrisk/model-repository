const my_parse_float = (val) => parseFloat((""+val).replace(",","."));

let mainPlot = new plotlyPlot("mainPlot", ["x", "f(x), f'(x), F(x)+1, D[f(x), d]"], [10, 10, 40, 60]);
let x_step = 2*Math.PI/63;
let x_vals = Array(64).fill(null).map((v, idx) => x_step*idx);

function func(x) {
    return Array(x.length).fill(0).map((v, idx) => Math.sin(x[idx]));
}

function deriv(x) {
    return Array(x.length).fill(0).map((v, idx) => Math.cos(x[idx]));
}

function prime(x) {
    return Array(x.length).fill(0).map((v, idx) => 1-Math.cos(x[idx]));
}

function frac_deriv(series) {
    const diff_order = my_parse_float(document.getElementById("diff_order").value);
    
    let prev_prod = 1;
    let prod_terms = Array(series.length).fill(null).map((v, idx) => {
        if(idx>0) {
            prev_prod = prev_prod * ((idx-diff_order-1)/idx);
        }
        return prev_prod;
    });
    
    let deriv = convolution(series, prod_terms);
    
    let norm = Math.pow(x_step, -diff_order);
    deriv = deriv.map(v => v*norm);
    
    deriv[0] = null; // it seems that the first value is always equal to series[0]
   
    return deriv;
}

function plot() {
    let func_vals = func(x_vals);
    let deriv_vals = deriv(x_vals);
    let prime_vals = prime(x_vals);
    let frac_vals = frac_deriv(func_vals);
    mainPlot.update(
        [x_vals],
        [func_vals, deriv_vals, prime_vals, frac_vals],
        ["lines", "lines", "lines", "markers"],
        ["#888", "#ccc", "#333", "#b00"]
    );
}

document.getElementById("diff_order").addEventListener("change", () => plot());

// on load
plot();
