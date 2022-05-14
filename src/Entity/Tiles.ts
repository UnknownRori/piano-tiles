import { Entity } from "../Interface/Entity.js";
import { Vector2 } from "../Interface/Vector2";

export class Tiles implements Entity {
    public pos: Vector2;
    public size: Vector2;
    public key: number;
    public velocity: Vector2;

    constructor(pos: Vector2, size: Vector2, velocity: Vector2, key: number) {
        this.pos = pos;
        this.size = size;
        this.key = key;
        this.velocity = velocity;
    }
}