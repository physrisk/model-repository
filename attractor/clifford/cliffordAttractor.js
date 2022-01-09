class cliffordAttractor {
    constructor(freq_1, amp_1, freq_2, amp_2, p) {
        this.freq_1 = freq_1;
        this.freq_2 = freq_2;
        this.amp_1 = amp_1;
        this.amp_2 = amp_2;
        this.p = p.slice(0);

        this.x_max = this.amp_1 + 1;
        this.x_min = -this.x_max;
        this.x_step = (this.x_max - this.x_min) / (this.w + 1);
        this.y_max = this.amp_2 + 1;
        this.y_min = -this.y_max;
        this.y_step = (this.y_max - this.y_min) / (this.h + 1);
    }
    next() {
        let x = this.p[0];
        let y = this.p[1];
        this.p = [
            Math.sin(this.freq_1*y) + this.amp_1*Math.cos(this.freq_1*x),
            Math.sin(this.freq_2*x) + this.amp_2*Math.cos(this.freq_2*y),
        ];
        return this.p;
    }
}
