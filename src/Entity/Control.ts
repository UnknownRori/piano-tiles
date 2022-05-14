import { Entity } from "../Interface/Entity.js";
import { Vector2 } from "../Interface/Vector2.js";

export class Control implements Entity {
    public pos: Vector2;
    public size: Vector2;
    public key: number;
    public active: boolean = false;

    constructor(pos: Vector2, size: Vector2, key: number) {
        this.pos = pos;
        this.size = size;
        this.key = key;
    }
}