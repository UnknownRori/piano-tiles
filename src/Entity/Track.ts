import { Vector2D } from "../Helpers/Vector2.js";
import { Vector2 } from "../Interface/Vector2";

export class Track implements Vector2 {
    public x: number;
    public y: number;
    public key: number;

    constructor(pos: Vector2, key: number) {
        this.x = pos.x;
        this.y = pos.y;
        this.key = key;
    }

    public toVector2(): Vector2 {
        return Vector2D(this.x, this.y);
    }
}