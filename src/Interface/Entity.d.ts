import { Vector2 } from "./Vector2";

export interface Entity {
    key: number,
    pos: Vector2,
    size: Vector2,
    public toPosVector2(): Vector2;
    public toSizeVector2(): Vector2;
}