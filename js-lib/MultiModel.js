class MultiModel {
    constructor(n, Model, ...args) {
        this.models = (new Array(n)).fill(null).map(() => {
            return new Model(...args);
        });
    }
    step(...args) {
        return this.models.map(v => v.step(...args));
    }
}
