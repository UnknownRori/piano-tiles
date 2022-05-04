import { Vector2D } from "../Helpers/Vector2.js";
export class Control {
    constructor(pos, key) {
        this.active = false;
        this.x = pos.x;
        this.y = pos.y;
        this.key = key;
    }
    toVector2() {
        return Vector2D(this.x, this.y);
    }
}
//# sourceMappingURL=Control.js.map