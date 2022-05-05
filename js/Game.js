import { Control } from "./Entity/Control.js";
import { Tiles } from "./Entity/Tiles.js";
import { Track } from "./Entity/Track.js";
import { Vector2D } from "./Helpers/Vector2.js";
export class Game {
    constructor(canvas, beatmapSrc, audioSrc) {
        this.isPaused = false;
        this.isStarted = false;
        this.perfomance = 0;
        this.score = 0;
        this.baseScore = 50;
        this.combo = 0;
        this.speedMultiplier = 1;
        this.currentSpeed = 20;
        this.baseSpeed = 20;
        this.tileWidth = 100;
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
        this.loadMap();
    }
    async loadMap() {
        await fetch(this.beatmapSrc).then((res) => res.json()).then((data) => {
            this.data = data;
            this.generateControl();
            this.generateTrack();
            // this.data.beats.forEach((beat) => {
            //     this.tiles?.[beat.key].push(new Tiles(Vector2D(this.control[beat.key].x, 0), 0));
            // })
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
                if (tile.y > this.size.y)
                    this.tiles[firstIndex].shift();
                tile.y += this.currentSpeed;
            });
        });
    }
    MilisecondsToTime(miliseconds) {
        let hours = Math.floor(miliseconds / 3600);
        let minutes = Math.floor((miliseconds - (hours * 3600)) / 60);
        let seconds = Math.floor(miliseconds - (hours * 3600) - (minutes * 60));
        if (minutes < 10) {
            minutes = "0" + minutes;
        }
        if (seconds < 10) {
            seconds = "0" + seconds;
        }
        return `${minutes}:${seconds}`;
    }
    initEventListener() {
        document.body.addEventListener('keydown', (event) => {
            this.handlePress(event.key, 'keydown');
        });
        document.body.addEventListener('keyup', (event) => {
            this.handlePress(event.key, 'keyup');
        });
    }
    calculateScore() {
        this.score += this.baseScore * this.speedMultiplier;
    }
    spawnTiles() {
        this.data?.beats.forEach((tile) => {
            if (tile.start_time < parseFloat(this.audio?.currentTime.toFixed(3))) {
                this.data?.beats.shift();
                this.tiles?.[tile.key].push(new Tiles(Vector2D(this.control[tile.key].x, -this.tileWidth), Vector2D(this.tileWidth, this.tileWidth), 0));
            }
        });
    }
    handlePress(key, type) {
        switch (key) {
            case 'd':
                if (type == 'keydown') {
                    this.control[0].active = true;
                    this.collisionHandler(0);
                }
                else
                    this.control[0].active = false;
                break;
            case 'f':
                if (type == 'keydown') {
                    this.control[1].active = true;
                    this.collisionHandler(1);
                }
                else
                    this.control[1].active = false;
                break;
            case 'j':
                if (type == 'keydown') {
                    this.control[2].active = true;
                    this.collisionHandler(2);
                }
                else
                    this.control[2].active = false;
                break;
            case 'k':
                if (type == 'keydown') {
                    this.control[3].active = true;
                    this.collisionHandler(3);
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
            default:
                console.log({ 'key': key, 'type': type });
                break;
        }
    }
    updateSpeed(key) {
        if (key == '-') {
            this.speedMultiplier -= 0.5;
        }
        else {
            this.speedMultiplier += 0.5;
        }
        this.currentSpeed = this.baseSpeed * this.speedMultiplier;
    }
    collisionHandler(key) {
        this.tiles[key].map((tile, index) => {
            if ((tile.y + this.tileWidth) > this.control[0].y && (this.control[0].y + this.tileWidth) > tile.y) {
                this.tiles[key].shift();
                this.calculateScore();
            }
            ;
        });
    }
    drawTile() {
        this.tiles.forEach((tiles) => {
            tiles.forEach((beat) => {
                this.drawRect(beat.toVector2(), this.tileColor, Vector2D(beat.width, beat.height));
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
        this.drawText('Score : ' + this.score.toString(), Vector2D(0, 24), '24px monospace');
        this.drawText('Time  : ' + this.MilisecondsToTime(this.audio?.currentTime), Vector2D(0, 24 * 2), '24px monospace');
        this.drawText(`${this.perfomance}`, Vector2D(this.size.x - 12, 12), '12px monospace');
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
            this.control.push(new Control(Vector2D(convertMiddleWidth, bottomHeight), index));
        });
        this.drawControl();
    }
    drawControl() {
        let color = 'blue';
        let secondary = 'red';
        this.control.forEach((control, index) => {
            const centerControl = Vector2D(control.x + (this.tileWidth / 2 - 5), control.y + (this.tileWidth / 2 + 5));
            if (control.active) {
                color = 'rgba(31, 102, 255, 0.8)';
                secondary = 'rgb(0, 204, 255)';
            }
            else {
                color = 'rgba(0, 4, 255, 0.600)';
                secondary = 'rgba(0, 204, 255, 0.750)';
            }
            this.drawRect(control.toVector2(), color, Vector2D(this.tileWidth, this.tileWidth));
            this.drawRect(control.toVector2(), secondary, Vector2D(this.tileWidth, this.tileWidth / 4));
            this.drawText(this.keybinds[index], centerControl, '24px monospace');
        });
    }
    generateTrack() {
        const middleWidth = (this.size.x / 2);
        Array(4).fill(1).forEach((_, index) => {
            const convertMiddleWidth = (middleWidth - this.tileWidth * 2) + ((2 + this.tileWidth) * index);
            this.track.push(new Track(Vector2D(convertMiddleWidth, 0), index));
        });
        this.drawTrack();
    }
    drawTrack() {
        this.track.forEach((track, index) => {
            this.drawRect(track.toVector2(), 'rgba(68, 87, 199, 0.616)', Vector2D(this.tileWidth, this.size.y - this.tileWidth));
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
}
//# sourceMappingURL=Game.js.map