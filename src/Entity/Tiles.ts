import { Vector2D } from "../Helpers/Vector2.js";
import { Vector2 } from "../Interface/Vector2";

export class Tiles implements Vector2 {
    public x: number;
    public y: number;
    public width: number;
    public height: number;
    public key: number;

    constructor(pos: Vector2, size: Vector2, key: number) {
        this.x = pos.x;
        this.y = pos.y;
        this.width = size.x;
        this.height = size.y;
        this.key = key;
    }

    public toVector2(): Vector2 {
        return Vector2D(this.x, this.y);
    }
}