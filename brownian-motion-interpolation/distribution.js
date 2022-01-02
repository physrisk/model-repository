let dist_plot = new plotlyPlot("distPlot", ["Δx","p(Δx)"], [10,15,40,50]);

let dist_shown = false;

function plot_increment_pdf() {
    if(dist_shown || !curve_generated) {
        if(!curve_generated) {
            dist_shown = false;
        }
        return ;
    }
    dist_shown = true;
    
    let increments = series.map((val, idx, arr) => {
        if(idx == 0) {
            return null;
        }
        return arr[idx] - arr[idx-1];
    }).slice(1);
    let mean = (series[256] - series[0]) / 256;

    let pdf = commonFunctions.makePdf(increments, -5+mean, 5+mean, 51, true);
    pdf = pdf.map(v => v/0.2);
    
    let obs = jStat.arange(-5+mean, 5.1+mean, 0.2);
    obs = obs.map(v => v + 0.1);

    let teor_pdf = obs.map(v => jStat.normal.pdf(v, mean, 1));

    dist_plot.update([obs, obs], [pdf, teor_pdf], "lines", ["#cc2222", "#222222"]);
}

// on load
setInterval(plot_increment_pdf, 100);
