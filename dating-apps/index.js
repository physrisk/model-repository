const my_parse_float = (val) => parseFloat(("" + val).replace(",", "."));

let attractiveness_plot = new plotlyPlot(
    "attractivenessPlot",
    ["x_i", "L_i, M_i"],
    [10, 15, 40, 50]
);
let delta_plot = new plotlyPlot(
    "deltaPlot",
    ["δ_ij", "lg[P(δ_ij)]"],
    [10, 15, 40, 50]
);

let start_btn = document.getElementById("start");

let rng = new Random();

const normal_mean = 0.5;
const normal_sigma = 0.25;

let canvas = document.getElementById("adjacency");
const canvas_sq = 2;
const n_agents = Math.floor(Math.min(canvas.width, canvas.height) / canvas_sq);
const n_agents_bins = Array(
    0,
    0.2 * n_agents,
    0.4 * n_agents,
    0.6 * n_agents,
    0.8 * n_agents,
    n_agents
).map((v) => Math.floor(v));

const rel_default = -1;
const rel_default_color = "#666";
const rel_self = 0;
const rel_self_color = "#000";
const rel_like = 1;
const rel_like_color = "#57d";
const rel_match = 2;
const rel_match_color = "#f43";
const rel_bin_color = "#000";

const n_delta_bins = 30;

//attractiveness_plot.setRanges(true, [-1, n_agents + 1]);
delta_plot.setRanges([0, 1], true);

function plot_figures(relations, agent_status, matches_deltas) {
    const is_self = (i, j) => relations[i][j] == rel_self;
    const is_like = (i, j) => relations[i][j] == rel_like;
    const is_match = (i, j) => relations[i][j] == rel_match;

    let ctx = canvas.getContext("2d");
    ctx.fillStyle = rel_default_color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < n_agents; i += 1) {
        for (let j = 0; j < n_agents; j += 1) {
            let draw_square = false;
            if (is_self(i, j)) {
                ctx.fillStyle = rel_self_color;
                draw_square = true;
            } else if (is_like(i, j)) {
                ctx.fillStyle = rel_like_color;
                draw_square = true;
            } else if (is_match(i, j)) {
                ctx.fillStyle = rel_match_color;
                draw_square = true;
            }
            if (draw_square) {
                ctx.fillRect(
                    i * canvas_sq,
                    j * canvas_sq,
                    canvas_sq,
                    canvas_sq
                );
            }
        }
    }

    attractiveness_plot.update(
        [
            agent_status.attractiveness,
            agent_status.attractiveness,
            agent_status.binned_attractiveness,
            agent_status.binned_attractiveness,
        ],
        [
            agent_status.likes,
            agent_status.matches,
            agent_status.binned_likes,
            agent_status.binned_matches,
        ],
        ["markers", "markers", "lines+markers", "lines+markers"],
        [rel_like_color, rel_match_color, rel_bin_color, rel_bin_color]
    );

    const delta_min = Math.min(...matches_deltas);
    const delta_max = Math.max(...matches_deltas);
    const delta_step = (delta_max - delta_min) / n_delta_bins;
    const delta_bins = Array(n_delta_bins)
        .fill(null)
        .map((v, i) => delta_min + (i + 0.5) * delta_step);
    const delta_freqs = jStat
        .histogram(matches_deltas, n_delta_bins)
        .map((v) => Math.log10(v / matches_deltas.length));
    delta_plot.update([delta_bins], [delta_freqs], "markers", rel_match_color);
}

function generate_attractiveness(distribution) {
    if (distribution == 1) {
        return rng.random();
    }
    return Math.min(Math.max(rng.normal(normal_mean, normal_sigma), 0), 1);
}

function biased_like_decision(diff_method, pickiness, x_i, x_j) {
    let diff = 0;
    if (diff_method == 1) {
        diff = Math.abs(x_j - x_i);
    } else {
        diff = x_j - x_i;
    }
    let prob = Math.min(1, Math.exp(-pickiness * diff));
    return rng.random() < prob ? 1 : -1;
}

function put_like(diff_method, pickiness, x_i, x_j) {
    return biased_like_decision(diff_method, pickiness, x_i, x_j);
}

function run(distribution, diff_method, pickiness) {
    let agent_bin_size = jStat.diff(n_agents_bins);
    let agent_status = {
        attractiveness: [],
        likes: [],
        matches: [],
        binned_attractiveness: [],
        binned_likes: [],
        binned_matches: [],
    };

    agent_status.attractiveness = Array(n_agents)
        .fill(0)
        .map(() => generate_attractiveness(distribution))
        .sort((a, b) => a > b);

    let likes = Array(n_agents)
        .fill(null)
        .map((v, i) => {
            return Array(n_agents)
                .fill(null)
                .map((vv, j) => {
                    if (i == j) {
                        return 0;
                    }
                    return put_like(
                        diff_method,
                        pickiness,
                        agent_status.attractiveness[i],
                        agent_status.attractiveness[j]
                    );
                });
        });

    let matches_deltas = [];
    let relationship_state = likes.map((row, i, arr) => {
        return row.map((v, j) => {
            if (i == j) {
                return rel_self;
            }
            if (arr[i][j] > 0 && arr[j][i] > 0) {
                if (i > j) {
                    matches_deltas.push(
                        Math.abs(
                            agent_status.attractiveness[i] -
                                agent_status.attractiveness[j]
                        )
                    );
                }
                return rel_match;
            }
            if (arr[i][j] > 0) {
                return rel_like;
            }
            return rel_default;
        });
    });

    agent_status.likes = relationship_state.map((row) => {
        return jStat.sum(row.map((v) => v == rel_like || v == rel_match));
    });
    agent_status.matches = relationship_state.map((row) => {
        return jStat.sum(row.map((v) => v == rel_match));
    });

    agent_status.binned_attractiveness = Array(n_agents_bins.length - 1)
        .fill(null)
        .map((v, i) => {
            let output_id = (n_agents_bins[i] + n_agents_bins[i + 1]) / 2;
            return agent_status.attractiveness[Math.floor(output_id)];
        });

    let cum_likes = [0, ...jStat.cumsum(agent_status.likes)];
    agent_status.binned_likes = jStat
        .diff(n_agents_bins.map((v) => cum_likes[v]))
        .map((v, i) => v / agent_bin_size[i]);
    let cum_matches = [0, ...jStat.cumsum(agent_status.matches)];
    agent_status.binned_matches = jStat
        .diff(n_agents_bins.map((v) => cum_matches[v]))
        .map((v, i) => v / agent_bin_size[i]);

    plot_figures(relationship_state, agent_status, matches_deltas);
}

start_btn.addEventListener("click", () => {
    start_btn.disabled = true;

    let pickiness = my_parse_float(document.getElementById("pickiness").value);
    let diff_method = my_parse_float(
        document.getElementById("diff_method").value
    );
    let distribution = my_parse_float(
        document.getElementById("distribution").value
    );
    run(distribution, diff_method, pickiness);

    start_btn.disabled = false;
});

// on load
start_btn.click();
