import { Game } from "./Game.js";

const canvas = <HTMLCanvasElement>document.querySelector('[data-canvas]');
const beatmapsrc = './data/雪翼の系譜/01 Genealogy of Ice wings/map.json';
const musicsrc = './data/雪翼の系譜/01 Genealogy of Ice wings/01 Genealogy of Ice wings.ogg';

const PianoTilesGame = new Game(canvas, beatmapsrc, musicsrc);
PianoTilesGame.init();