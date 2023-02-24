const my_parse_float = (val) => parseFloat(("" + val).replace(",", "."));

let rng = new Random();

let canvas = document.getElementById("forest");
const CANVAS_COLORS = ["#333", "#3d3", "#3d3", "#f63"];
const CANVAS_BURNT = 3;
const CANVAS_MARKED = 2;
const CANVAS_TREE = 1;
const CANVAS_EMPTY = 0;
const CANVAS_SIZE = 5;

let start_btn = document.getElementById("start");
let resume_btn = document.getElementById("resume");

const UPDATE_INTERVAL = 100;

let forest = Array(canvas.height)
    .fill(null)
    .map(() => Array(canvas.width).fill(null));

let rho = 0;
let next = [];
let continue_flag = false;

function plant_forest(rho) {
    let f = Array(Math.floor(canvas.width / CANVAS_SIZE))
        .fill(null)
        .map(() =>
            Array(Math.floor(canvas.height / CANVAS_SIZE))
                .fill(null)
                .map(() => {
                    if (rng.random() < rho) {
                        return CANVAS_TREE;
                    }
                    return CANVAS_EMPTY;
                })
        );
    return f;
}

function plot_forest(dx = 0, dy = 0) {
    let ctx = canvas.getContext("2d");
    let effective_x = 0;
    let effective_y = 0;
    for (let x = 0; x < forest.length; x = x + 1) {
        effective_x = (x + dx + forest.length) % forest.length;
        for (let y = 0; y < forest[x].length; y = y + 1) {
            effective_y = (y + dy + forest[x].length) % forest[x].length;
            ctx.fillStyle = CANVAS_COLORS[forest[effective_x][effective_y]];
            ctx.fillRect(
                x * CANVAS_SIZE,
                y * CANVAS_SIZE,
                CANVAS_SIZE,
                CANVAS_SIZE
            );
        }
    }
}

function pick_tree() {
    let x = Math.floor(rng.uniform(0, forest.length));
    let y = Math.floor(rng.uniform(0, forest[0].length));

    while (forest[x][y] != CANVAS_TREE) {
        x = Math.floor(rng.uniform(0, forest.length));
        y = Math.floor(rng.uniform(0, forest[0].length));
    }
    return [x, y];
}

function burn_tree(positions) {
    let neighbors = positions.map((p) => {
        forest[p[0]][p[1]] = CANVAS_BURNT;
        let n = [];
        let x = (p[0] + forest.length - 1) % forest.length;
        let y = p[1];
        if (forest[x][y] == CANVAS_TREE) {
            forest[x][y] = CANVAS_MARKED;
            n.push([x, y]);
        }
        x = (p[0] + forest.length + 1) % forest.length;
        y = p[1];
        if (forest[x][y] == CANVAS_TREE) {
            forest[x][y] = CANVAS_MARKED;
            n.push([x, y]);
        }
        x = p[0];
        y = (p[1] + forest[0].length - 1) % forest[0].length;
        if (forest[x][y] == CANVAS_TREE) {
            forest[x][y] = CANVAS_MARKED;
            n.push([x, y]);
        }
        x = p[0];
        y = (p[1] + forest[0].length + 1) % forest[0].length;
        if (forest[x][y] == CANVAS_TREE) {
            forest[x][y] = CANVAS_MARKED;
            n.push([x, y]);
        }
        return n;
    });
    return neighbors.flat();
}

function burn_forest() {
    next = burn_tree(next);
    plot_forest();
}

function burn() {
    if (next.length == 0) {
        rho = my_parse_float(document.getElementById("density").value);
        forest = plant_forest(rho);
        next = [pick_tree()];
    }
    burn_forest();
    if (next.length > 0 && continue_flag) {
        setTimeout(burn, UPDATE_INTERVAL);
    } else {
        resume_btn.disabled = next.length == 0;
        start_btn.disabled = false;
        continue_flag = false;
    }
}

// events
start_btn.addEventListener("click", () => {
    next = [];
    continue_flag = true;
    start_btn.disabled = true;
    resume_btn.disabled = false;
    resume_btn.innerHTML = "Pause";
    burn();
});
resume_btn.addEventListener("click", () => {
    if (continue_flag) {
        continue_flag = false;
        start_btn.disabled = false;
        resume_btn.disabled = true;
        resume_btn.innerHTML = "Resume";
    } else {
        continue_flag = true;
        start_btn.disabled = true;
        resume_btn.disabled = false;
        resume_btn.innerHTML = "Pause";
        setTimeout(burn, UPDATE_INTERVAL);
    }
});

// on load
burn();
