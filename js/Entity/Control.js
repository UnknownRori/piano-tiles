export class Control {
    constructor(pos, size, key) {
        this.active = false;
        this.pos = pos;
        this.size = size;
        this.key = key;
    }
    toPosVector2() {
        return this.pos;
    }
    toSizeVector2() {
        return this.size;
    }
}
//# sourceMappingURL=Control.js.map