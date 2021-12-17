const my_parse_float = (val) => parseFloat((""+val).replace(",","."));

let opinionPlot = new plotlyPlot("opinionPlot", ["x", "n(x)"]);
let opinions = Array(101).fill(null).map((v, i) => i/100);
let density = Array(101).fill(null);
let density_1 = Array(101).fill(null);
let density_ai = Array(101).fill(null);

let ai = { };

function ai_reset() {
    ai = {
        prev: {
            pos: null,
            vote_diff: -999,
        },
        cur: {
            pos: null,
            vote_diff: 0,
        },
        left: true,
        right: true,
        last: 0,
    };
}
ai_reset();

function ai_move() {
    if(ai.cur.pos === null) {
        ai.cur.pos = my_parse_float(document.getElementById("ai_pos").value);
    }
    let votes = calculate_votes();
    ai.cur.vote_diff = votes[1] - votes[0];
    if(ai.cur.vote_diff < ai.prev.vote_diff) {
        ai.cur.vote_diff = ai.prev.vote_diff;
        ai.cur.pos = ai.prev.pos;
        if(ai.last < 0) {
            ai.left = false;
        }
        if(ai.last > 0) {
            ai.right = false;
        }
    } else {
        ai.prev.vote_diff = ai.cur.vote_diff;
        ai.prev.pos = ai.cur.pos;
        if(Math.random() > 0.5) {
            if(ai.right) {
                ai.cur.pos = ai.cur.pos + 0.01;
                ai.last = 1;
            }
        } else {
            if(ai.left) {
                ai.cur.pos = ai.cur.pos - 0.01;
                ai.last = -1;
            }
        }
        ai.cur.pos = Math.min(1, Math.max(0, ai.cur.pos));
    }
    document.getElementById("ai_pos").value = ai.cur.pos.toFixed(2);
    update_vote_density();
    plot_curves();
    setTimeout(ai_move, 100);
}

function plot_curves() {
    let pos = my_parse_float(document.getElementById("pos").value);
    let ai_pos = my_parse_float(document.getElementById("ai_pos").value);
    
    let max_dens = Math.max(...density);
    
    opinionPlot.update(
        [opinions, opinions, [pos, pos], opinions, [ai_pos, ai_pos]],
        [density, density_1, [-0.1*max_dens, 1.1*max_dens], density_ai, [-0.1*max_dens, 1.1*max_dens]],
        "lines",
        ["#222222", "#cc2222", "#cc2222", "#3366bb", "#3366bb"]);
    
    votes = calculate_votes();
    document.getElementById("player_votes").innerHTML = votes[0].toFixed(2);
    document.getElementById("ai_votes").innerHTML = votes[1].toFixed(2);
}

function generate_opinion_space() {
    let peak_distance = my_parse_float(document.getElementById("alpha").value);
    let peak_sprawl = my_parse_float(document.getElementById("sigma").value);

    let peak_1 = 0.5 - peak_distance/2;
    let peak_2 = 0.5 + peak_distance/2;

    density = opinions.map(v => jStat.normal.pdf(v, peak_1, peak_sprawl) + jStat.normal.pdf(v, peak_2, peak_sprawl));

    let normalization = density.reduce((acc, val) => acc + val, 0);
    density = density.map(v => v/normalization);
}

function update_vote_density() {
    let P = my_parse_float(document.getElementById("pragmatism").value);
    let Q = my_parse_float(document.getElementById("cost").value);
    let R = my_parse_float(document.getElementById("rebel").value);
    let pos = my_parse_float(document.getElementById("pos").value);
    let ai_pos = my_parse_float(document.getElementById("ai_pos").value);

    let abstention = opinions.map(v => (1 - Math.abs(Math.abs(pos - v) - Math.abs(ai_pos - v)))*Q);
    let third_party = opinions.map(v => Math.pow(1-v+1e-3, -R) + Math.pow(v + 1e-3, -R));
    let player_1 = opinions.map(v => Math.pow(Math.abs(pos - v) + 1e-3, -P));
    let player_ai = opinions.map(v => Math.pow(Math.abs(ai_pos - v) + 1e-3, -P));

    let total_utility = opinions.map((v, i) => abstention[i] + third_party[i] + player_1[i] + player_ai[i]); 

    density_1 = opinions.map((v, i) => density[i] * player_1[i] / total_utility[i]); 
    density_ai = opinions.map((v, i) => density[i] * player_ai[i] / total_utility[i]); 
}

function calculate_votes() {
    let votes_1 = density_1.reduce((acc, v) => acc+v, 0) * 100; 
    let votes_ai = density_ai.reduce((acc, v) => acc+v, 0) * 100; 
    return [votes_1, votes_ai];
}

document.getElementById("alpha").addEventListener("change", () => {
    generate_opinion_space();
    update_vote_density();
    plot_curves();
    ai_reset();
});
document.getElementById("sigma").addEventListener("change", () => {
    generate_opinion_space();
    update_vote_density();
    plot_curves();
    ai_reset();
});

document.getElementById("pos").addEventListener("change", () => {
    update_vote_density();
    plot_curves();
    ai_reset();
});
document.getElementById("cost").addEventListener("change", () => {
    update_vote_density();
    plot_curves();
    ai_reset();
});
document.getElementById("rebel").addEventListener("change", () => {
    update_vote_density();
    plot_curves();
    ai_reset();
});
document.getElementById("pragmatism").addEventListener("change", () => {
    update_vote_density();
    plot_curves();
    ai_reset();
});

// on load
generate_opinion_space();
update_vote_density();
plot_curves();

setTimeout(ai_move, 100);
