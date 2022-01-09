class densityPlot {
    constructor(canvas_obj, cell_size, plot_size) {
        this.canvas = canvas_obj;
        this.ctx = this.canvas.getContext("2d");

        this.w = this.canvas.width;
        this.h = this.canvas.height;
        this.r = cell_size;

        this.wc = Math.floor(this.w / this.r);
        this.hc = Math.floor(this.h / this.r);
        this.data = Array(this.wc).fill(null).map(v => Array(this.hc).fill(0));
        this.n_points = 0;
        this.max_points = 0;

        this.set_plot_size(plot_size);

        this.color_fn = (v, n, max) => {
            let c = 250 - Math.floor(200*v/max);
            return `rgb(${c}, ${c}, ${c})`;
        };
    }
    set_color_fn(color_fn) {
        this.color_fn = color_fn;
    }
    set_plot_size(plot_size) {
        this.x_min = plot_size[0][0];
        this.x_max = plot_size[0][1];
        this.dx = (this.x_max - this.x_min) / (this.wc);
        this.y_min = plot_size[1][0];
        this.y_max = plot_size[1][1];
        this.dy = (this.y_max - this.y_min) / (this.hc);

        this.ctx.clearRect(0, 0, this.w, this.h);
    }
    update() {
        if(this.n_points == 0) {
            return ;
        }
        let x = 0;
        let y = 0;
        for(x=0; x<this.wc; x+=1) {
            for(y=0; y<this.hc; y+=1) {
                this.local_update(x, y);
            }
        }
    }
    local_update(x, y) {
        this.ctx.fillStyle = this.color_fn(
            this.data[x][y],
            this.n_points,
            this.max_points
        );
        this.ctx.fillRect(x*this.r, y*this.r, this.r, this.r);
    }
    add_point(coords) {
        if(coords[0] <= this.x_min || this.x_max <= coords[0] ||
           coords[1] <= this.y_min || this.y_max <= coords[1]) {
            return ;
        }
        let x = Math.floor((coords[0]- this.x_min) / this.dx);
        let y = Math.floor((this.y_max - coords[1]) / this.dy);
        let prev = this.data[x][y];
        this.data[x][y] = this.data[x][y] + 1;
        this.n_points = this.n_points + 1;
        this.max_points = Math.max(this.max_points, this.data[x][y]);
    }
}
