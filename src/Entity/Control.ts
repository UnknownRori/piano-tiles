import { Vector2D } from "../Helpers/Vector2.js";
import { Entity } from "../Interface/Entity.js";
import { Vector2 } from "../Interface/Vector2.js";

export class Control implements Entity {
    public x: number;
    public y: number;
    public key: number;
    public active: boolean = false;

    constructor(pos: Vector2, key: number) {
        this.x = pos.x;
        this.y = pos.y;
        this.key = key;
    }

    public toVector2(): Vector2 {
        return Vector2D(this.x, this.y);
    }
}