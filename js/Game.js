import { Control } from "./Entity/Control.js";
import { Tiles } from "./Entity/Tiles.js";
import { Track } from "./Entity/Track.js";
import { MilisecondsToTime } from "./Helpers/MilisecondsToTime.js";
import { Vector2D } from "./Helpers/Vector2.js";
export class Game {
    constructor(canvas, beatmapSrc, audioSrc) {
        this.recordMode = false;
        this.recordData = [];
        this.isPaused = false;
        this.isStarted = false;
        this.perfomance = 0;
        this.score = 0;
        this.baseScore = 50;
        this.comboThreshold = 0;
        this.combo = 0;
        this.speedMultiplier = 4;
        this.speed = 20;
        this.tileWidth = 100;
        this.tileHeight = 65;
        this.track = [];
        this.control = [];
        this.keybinds = ['D', 'F', 'J', 'K'];
        this.tiles = [
            [], [], [], []
        ];
        this.tileColor = 'rgba(39, 123, 202, 0.75)';
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        if (!this.ctx)
            throw new Error("Cannot get canvas 2D Context");
        this.canvas.height = window.innerHeight;
        this.canvas.width = window.innerWidth;
        this.size = Vector2D(window.innerWidth, window.innerHeight);
        this.drawBackground();
        this.drawLoading();
        this.beatmapSrc = beatmapSrc;
        this.audioSrc = audioSrc;
    }
    init() {
        this.audio = new Audio(this.audioSrc);
        if (!this.recordMode)
            this.loadMap();
        else {
            this.generateControl();
            this.generateTrack();
            this.initEventListener();
            this.update();
        }
    }
    async loadMap() {
        await fetch(this.beatmapSrc).then((res) => res.json()).then((data) => {
            this.data = data;
            this.comboThreshold = Math.floor(this.data.beats.length / 2);
            this.generateControl();
            this.generateTrack();
        }).then(() => {
            this.initEventListener();
            this.update();
        });
    }
    start() {
        this.isStarted = true;
        this.audio?.play();
    }
    pause() {
        this.isPaused = true;
        this.audio?.pause();
    }
    resume() {
        this.isPaused = false;
        this.audio?.play();
    }
    update() {
        const start = performance.now();
        this.ctx.clearRect(0, 0, this.size.x, this.size.y);
        this.drawBackground();
        this.drawTrack();
        this.drawTile();
        this.drawControl();
        this.drawInfo();
        if (!this.isPaused && !this.isStarted)
            this.drawStart();
        if (this.isPaused && this.isStarted)
            this.drawPause();
        if (!this.isPaused && this.isStarted) {
            this.spawnTiles();
            this.calculateNewTilesPos();
        }
        ;
        this.perfomance = performance.now() - start;
        requestAnimationFrame(this.update.bind(this));
    }
    calculateNewTilesPos() {
        this.tiles.forEach((tiles, firstIndex) => {
            tiles.forEach((tile, secondIndex) => {
                if (tile.pos.y > this.size.y) {
                    this.combo = 0;
                    this.tiles[firstIndex].shift();
                }
                tile.pos.y += tile.velocity.y;
            });
        });
    }
    initEventListener() {
        document.body.addEventListener('keydown', (event) => {
            this.handlePress(event.key, 'keydown');
        });
        document.body.addEventListener('keyup', (event) => {
            this.handlePress(event.key, 'keyup');
        });
        document.body.addEventListener('click', (event) => {
            this.handleTouch(Vector2D(event.clientX, event.clientY));
        });
    }
    calculateScore() {
        this.score += ((this.baseScore * this.speedMultiplier) * (this.combo / this.comboThreshold));
    }
    spawnTiles() {
        this.data?.beats.forEach((tile) => {
            const speed = Vector2D(0, (this.size.y / this.tileWidth) * this.speedMultiplier);
            if (tile.start_time - (speed.y + 10) / 100 < parseFloat(this.audio?.currentTime.toFixed(3))) {
                this.data?.beats.shift();
                const size = Vector2D(this.tileWidth, this.tileHeight);
                this.tiles?.[tile.key].push(new Tiles(Vector2D(this.control[tile.key].pos.x, -this.tileHeight), size, speed, tile.key));
            }
        });
    }
    handlePress(key, type) {
        switch (key) {
            case 'd':
                if (!this.isStarted || this.isPaused)
                    return;
                if (type == 'keydown') {
                    this.control[0].active = true;
                    this.collisionHandler(0);
                    if (this.recordMode)
                        this.Record(0);
                }
                else
                    this.control[0].active = false;
                break;
            case 'f':
                if (!this.isStarted || this.isPaused)
                    return;
                if (type == 'keydown') {
                    this.control[1].active = true;
                    this.collisionHandler(1);
                    if (this.recordMode)
                        this.Record(1);
                }
                else
                    this.control[1].active = false;
                break;
            case 'j':
                if (!this.isStarted || this.isPaused)
                    return;
                if (type == 'keydown') {
                    this.control[2].active = true;
                    this.collisionHandler(2);
                    if (this.recordMode)
                        this.Record(2);
                }
                else
                    this.control[2].active = false;
                break;
            case 'k':
                if (!this.isStarted || this.isPaused)
                    return;
                if (type == 'keydown') {
                    this.control[3].active = true;
                    this.collisionHandler(3);
                    if (this.recordMode)
                        this.Record(3);
                }
                else
                    this.control[3].active = false;
                break;
            case 'Enter':
                if (this.isPaused && this.isStarted && type == 'keydown')
                    this.resume();
                else if (!this.isPaused && this.isStarted && type == 'keydown')
                    this.pause();
                else if (!this.isPaused && !this.isStarted && type == 'keydown')
                    this.start();
                break;
            case '-':
                if (type == 'keydown')
                    this.updateSpeed('-');
                break;
            case '=':
                if (type == 'keydown')
                    this.updateSpeed('=');
                break;
            case ' ':
                this.exportRecord();
                break;
            default:
                console.log({ 'key': key, 'type': type });
                break;
        }
    }
    handleTouch(position) {
        if (!this.isStarted)
            this.start();
        this.control.forEach((control, index) => {
            if (this.collisionControlDetector(position.y, 0, index) &&
                (control.pos.x + this.tileWidth) > position.x && control.pos.x < position.x) {
                this.collisionHandler(index);
            }
        });
    }
    updateSpeed(key) {
        if (key == '-') {
            this.speedMultiplier += 0.5;
        }
        else {
            this.speedMultiplier -= 0.5;
        }
        this.tiles.map((tiles) => {
            tiles.map((tile) => {
                tile.velocity = Vector2D(0, (this.size.y / this.tileWidth) * this.speedMultiplier);
            });
        });
    }
    collisionHandler(key) {
        this.tiles[key].map((tile, index) => {
            if (this.collisionControlDetector(tile.pos.y, tile.size.y, key)) {
                this.tiles[key].shift();
                this.combo += 1;
                this.calculateScore();
            }
        });
    }
    collisionControlDetector(y, height, key) {
        if ((y + height) > this.control[key].pos.y && (this.control[key].pos.y + this.tileWidth) > y)
            return true;
        return false;
    }
    drawTile() {
        this.tiles.forEach((tiles) => {
            tiles.forEach((beat) => {
                this.drawRect(beat.pos, this.tileColor, beat.size);
            });
        });
    }
    generateBackground() {
        this.canvasGradient = this.ctx.createLinearGradient(0, 0, window.innerWidth, window.innerHeight);
        this.canvasGradient.addColorStop(0, 'rgba(2, 0, 36, 1)');
        this.canvasGradient.addColorStop(0.5, 'rgba(9, 9, 121, 1)');
        this.canvasGradient.addColorStop(1, 'rgba(0, 212, 255, 1)');
    }
    drawBackground() {
        if (!this.canvasGradient)
            this.generateBackground();
        this.ctx.fillStyle = this.canvasGradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    drawInfo() {
        this.drawText(this.data?.album, Vector2D(0, this.size.y - 5), '14px monospace');
        this.drawText(this.data?.title, Vector2D(0, this.size.y - (5 + 14)), '12px monospace');
        this.drawText(this.data?.artist, Vector2D(0, this.size.y - (19 + 12)), '10px monospace');
        this.drawText(Math.floor(this.score).toString(), Vector2D(0, 20), '24px monospace');
        this.drawText(MilisecondsToTime(this.audio?.currentTime), Vector2D(this.size.x - 72, 24), '24px monospace');
        this.drawText(`${this.perfomance}`, Vector2D(this.size.x / 2, 12), '12px monospace');
        this.drawText(`${this.speedMultiplier}`, Vector2D(this.size.x - 20, this.size.y - 5), '12px monospace');
        this.drawText(`${this.combo}x`, Vector2D(this.size.x - 200, this.size.y - 40), '8rem monospace');
    }
    drawPause() {
        this.drawRect(Vector2D(0, 0), 'rgba(116, 116, 116, 0.600)', Vector2D(this.size.x, this.size.y));
        this.drawText('Game Paused', Vector2D((this.size.x / 2) - 110, this.size.y / 2), '38px monospace');
    }
    drawStart() {
        this.drawRect(Vector2D(0, 0), 'rgba(116, 116, 116, 0.600)', Vector2D(this.size.x, this.size.y));
        this.drawText('Press Enter to Start!', Vector2D((this.size.x / 2) - 210, this.size.y / 2), '38px monospace');
    }
    drawLoading() {
        this.drawRect(Vector2D(0, 0), 'rgba(116, 116, 116, 0.400)', Vector2D(this.size.x, this.size.y));
        this.drawText('Loading...', Vector2D((this.size.x / 2) - 110, this.size.y / 2), '38px monospace');
    }
    generateControl() {
        const middleWidth = (this.size.x / 2);
        const bottomHeight = this.size.y - this.tileWidth;
        Array(4).fill(1).forEach((_, index) => {
            let convertMiddleWidth = (middleWidth - this.tileWidth * 2) + ((2 + this.tileWidth) * index);
            this.control.push(new Control(Vector2D(convertMiddleWidth, bottomHeight), Vector2D(this.tileWidth, this.tileWidth), index));
        });
        this.drawControl();
    }
    drawControl() {
        let color = 'blue';
        let secondary = 'red';
        this.control.forEach((control, index) => {
            const centerControl = Vector2D(control.pos.x + (this.tileWidth / 2 - 5), control.pos.y + (this.tileWidth / 2 + 5));
            const topBox = Vector2D(control.size.x, control.size.y / 4);
            if (control.active) {
                color = 'rgba(31, 102, 255, 0.8)';
                secondary = 'rgb(0, 204, 255)';
            }
            else {
                color = 'rgba(0, 4, 255, 0.600)';
                secondary = 'rgba(0, 204, 255, 0.750)';
            }
            this.drawRect(control.pos, color, control.size);
            this.drawRect(control.pos, secondary, topBox);
            this.drawText(this.keybinds[index], centerControl, '24px monospace');
        });
    }
    generateTrack() {
        const middleWidth = (this.size.x / 2);
        Array(4).fill(1).forEach((_, index) => {
            const convertMiddleWidth = (middleWidth - this.tileWidth * 2) + ((2 + this.tileWidth) * index);
            this.track.push(new Track(Vector2D(convertMiddleWidth, 0), Vector2D(this.tileWidth, this.size.y - this.tileWidth), index));
        });
        this.drawTrack();
    }
    drawTrack() {
        this.track.forEach((track, index) => {
            this.drawRect(track.pos, 'rgba(68, 87, 199, 0.616)', track.size);
        });
    }
    drawText(text, pos, style) {
        this.ctx.fillStyle = 'white';
        this.ctx.font = style;
        this.ctx.fillText(text, pos.x, pos.y);
    }
    drawRect(pos, style, size) {
        this.ctx.fillStyle = style;
        this.ctx.fillRect(pos.x, pos.y, size.x, size.y);
    }
    Record(key) {
        this.recordData.push({
            'start_time': this.audio?.currentTime,
            'end_time': 0,
            'key': key
        });
    }
    exportRecord() {
        console.log(this.recordData);
    }
}
//# sourceMappingURL=Game.js.map