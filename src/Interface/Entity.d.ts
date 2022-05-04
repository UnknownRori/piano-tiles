import { Vector2 } from "./Vector2";

export interface Entity extends Vector2 {
    key: number
    public toVector2(): Vector2;
}