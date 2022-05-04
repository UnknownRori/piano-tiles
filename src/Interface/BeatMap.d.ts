import { Beat } from "./Beat";

export interface BeatMap {
    title: string,
    artist: string,
    album: string,
    beats: Array<Beat>
}