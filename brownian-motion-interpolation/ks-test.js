let dist_plot = new plotlyPlot("distPlot", ["Δx","P(Δx)"], [10,15,40,50]);

let dist_shown = false;

function plot_increment_cdf() {
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
    let cdf = jStat.cumsum(pdf);
    
    let obs = jStat.arange(-5+mean, 5.1+mean, 0.2);
    obs = obs.map(v => v + 0.1);

    let teor_cdf = obs.map(v => jStat.normal.cdf(v, mean, 1));

    dist_plot.update([obs, obs], [cdf, teor_cdf], "lines", ["#cc2222", "#222222"]);

    let max_diff = teor_cdf.reduce((acc, val, idx) => {
        return Math.max(acc, Math.abs(val - cdf[idx]));
    }, 0);
    document.getElementById("diff").innerHTML = `D = ${max_diff.toFixed(3)} &lt; 0.085`;
    
    if(max_diff < 0.085) {
        document.getElementById("diff").style.color = "#22cc22";
    } else {
        document.getElementById("diff").style.color = "#cc2222";
    }
}

// on load
setInterval(plot_increment_cdf, 100);
