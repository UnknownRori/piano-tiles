import { Vector2D } from "../Helpers/Vector2.js";
export class Tiles {
    constructor(pos, key) {
        this.x = pos.x;
        this.y = pos.y;
        this.key = key;
    }
    toVector2() {
        return Vector2D(this.x, this.y);
    }
}
//# sourceMappingURL=Tiles.js.map