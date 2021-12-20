const my_parse_float = (val) => parseFloat((""+val).replace(",","."));

let opinionPlot = new plotlyPlot("opinionPlot", ["x", "n(x)"]);
let opinions = Array(101).fill(null).map((v, i) => i/100);
let voter_density = Array(101).fill(null);
let supporters_1 = Array(101).fill(null);
let supporters_2 = Array(101).fill(null);

let ai = { };

function update_ui() {
    let position_p1 = my_parse_float(document.getElementById("position_p1").value);
    let position_p2 = my_parse_float(document.getElementById("position_p2").value);
    
    let max_dens = Math.max(...voter_density);
    
    opinionPlot.update(
        [opinions, opinions, [position_p1, position_p1],
            opinions, [position_p2, position_p2]],
        [voter_density, supporters_1, [-0.1*max_dens, 1.1*max_dens],
            supporters_2, [-0.1*max_dens, 1.1*max_dens]],
        "lines",
        ["#222222", "#cc2222", "#cc2222", "#3366bb", "#3366bb"]);
    
    let votes = calculate_votes();
    document.getElementById("votes_p1").innerHTML = votes[0].toFixed(2);
    document.getElementById("votes_p2").innerHTML = votes[1].toFixed(2);
}

function generate_opinions() {
    let peak_distance = my_parse_float(document.getElementById("alpha").value);
    let peak_sprawl = my_parse_float(document.getElementById("sigma").value);

    let peak_1 = 0.5 - peak_distance/2;
    let peak_2 = 0.5 + peak_distance/2;

    voter_density = opinions.map(v => jStat.normal.pdf(v, peak_1, peak_sprawl) + jStat.normal.pdf(v, peak_2, peak_sprawl));

    let normalization = voter_density.reduce((acc, val) => acc + val, 0);
    voter_density = voter_density.map(v => v/normalization);
}

function update_support() {
    let P = my_parse_float(document.getElementById("pragmatism").value);
    let Q = my_parse_float(document.getElementById("cost").value);
    let R = my_parse_float(document.getElementById("rebel").value);
    let position_p1 = my_parse_float(document.getElementById("position_p1").value);
    let position_p2 = my_parse_float(document.getElementById("position_p2").value);

    // utilities
    let abstention = opinions.map(v => (1 - Math.abs(Math.abs(position_p1 - v) - Math.abs(position_p2 - v)))*Q);
    let third_party = opinions.map(v => Math.pow(1-v+1e-3, -R) + Math.pow(v + 1e-3, -R));
    let player_1 = opinions.map(v => Math.pow(Math.abs(position_p1 - v) + 1e-3, -P));
    let player_2 = opinions.map(v => Math.pow(Math.abs(position_p2 - v) + 1e-3, -P));
    let total_utility = opinions.map((v, i) => abstention[i] + third_party[i] + player_1[i] + player_2[i]); 

    supporters_1 = opinions.map((v, i) => voter_density[i] * player_1[i] / total_utility[i]); 
    supporters_2 = opinions.map((v, i) => voter_density[i] * player_2[i] / total_utility[i]); 
}

function calculate_votes() {
    return [
        supporters_1.reduce((acc, v) => acc+v, 0) * 100,
        supporters_2.reduce((acc, v) => acc+v, 0) * 100,
    ];
}

function ai_reset() {
    ai = {
        previous: {
            pos: null,
            vote_diff: -999,
        },
        current: {
            pos: null,
            vote_diff: 0,
        },
        move_left: true,
        move_right: true,
        last_dir: 0,
    };
}

function ai_move() {
    if(ai.move_right || ai.move_left) {
        if(ai.current.pos === null) {
            ai.current.pos = my_parse_float(document.getElementById("position_p2").value);
        }
        let votes = calculate_votes();
        ai.current.vote_diff = votes[1] - votes[0];
        if(ai.current.vote_diff < ai.previous.vote_diff) {
            ai.current.vote_diff = ai.previous.vote_diff;
            ai.current.pos = ai.previous.pos;
            if(ai.last_dir < 0) {
                ai.move_left = false;
            }
            if(ai.last_dir > 0) {
                ai.move_right = false;
            }
        } else {
            ai.previous.vote_diff = ai.current.vote_diff;
            ai.previous.pos = ai.current.pos;
            if(Math.random() > 0.5) {
                if(ai.move_right) {
                    ai.current.pos = ai.current.pos + 0.01;
                    ai.last_dir = 1;
                }
            } else {
                if(ai.move_left) {
                    ai.current.pos = ai.current.pos - 0.01;
                    ai.last_dir = -1;
                }
            }
            ai.current.pos = Math.min(1, Math.max(0, ai.current.pos));
        }
        document.getElementById("position_p2").value = ai.current.pos.toFixed(2);
        update_support();
        update_ui();
    }
    setTimeout(ai_move, 100);
}

document.getElementById("alpha").addEventListener("change", () => {
    generate_opinions();
    update_support();
    update_ui();
    ai_reset();
});
document.getElementById("sigma").addEventListener("change", () => {
    generate_opinions();
    update_support();
    update_ui();
    ai_reset();
});

document.getElementById("position_p1").addEventListener("change", () => {
    update_support();
    update_ui();
    ai_reset();
});
document.getElementById("cost").addEventListener("change", () => {
    update_support();
    update_ui();
    ai_reset();
});
document.getElementById("rebel").addEventListener("change", () => {
    update_support();
    update_ui();
    ai_reset();
});
document.getElementById("pragmatism").addEventListener("change", () => {
    update_support();
    update_ui();
    ai_reset();
});

// on load
generate_opinions();
update_support();
update_ui();
ai_reset();

setTimeout(ai_move, 100);
