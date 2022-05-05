import { Control } from "./Entity/Control.js";
import { Tiles } from "./Entity/Tiles.js";
import { Track } from "./Entity/Track.js";
import { Vector2D } from "./Helpers/Vector2.js";
import { Beat } from "./Interface/Beat.js";
import { BeatMap } from "./Interface/BeatMap.js";
import { Vector2 } from "./Interface/Vector2.js";

export class Game {

    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private canvasGradient?: CanvasGradient;
    private size: Vector2;

    private beatmapSrc: string;
    private audioSrc: string;
    private audio?: HTMLAudioElement;
    private data?: BeatMap;

    private isPaused: boolean = false;
    private isStarted: boolean = false;
    private perfomance: number = 0;

    private score: number = 0;
    private baseScore: number = 50;
    private combo: number = 0;
    private speedMultiplier: number = 1;
    private currentSpeed: number = 20;
    private baseSpeed: number = 20;

    private tileWidth: number = 100;

    private track: Array<Track> = []
    private control: Array<Control> = [];
    private keybinds: Array<string> = ['D', 'F', 'J', 'K'];
    private tiles: Array<Array<Tiles>> = [
        [], [], [], []
    ];

    private tileColor: string = 'rgba(39, 123, 202, 0.75)';

    constructor(canvas: HTMLCanvasElement, beatmapSrc: string, audioSrc: string) {
        this.canvas = canvas;
        this.ctx = <CanvasRenderingContext2D>canvas.getContext('2d');
        if (!this.ctx) throw new Error("Cannot get canvas 2D Context");

        this.canvas.height = window.innerHeight;
        this.canvas.width = window.innerWidth;

        this.size = Vector2D(window.innerWidth, window.innerHeight);

        this.drawBackground();
        this.drawLoading();

        this.beatmapSrc = beatmapSrc;
        this.audioSrc = audioSrc;
    }

    public init() {
        this.audio = new Audio(this.audioSrc);
        this.loadMap();
    }

    protected async loadMap() {
        await fetch(this.beatmapSrc).then((res) => res.json()).then((data) => {
            this.data = <BeatMap>data;

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

    protected start() {
        this.isStarted = true;
        this.audio?.play();
    }

    protected pause() {
        this.isPaused = true;
        this.audio?.pause();
    }

    protected resume() {
        this.isPaused = false;
        this.audio?.play();
    }

    protected update() {
        const start = performance.now();

        this.ctx.clearRect(0, 0, this.size.x, this.size.y);

        this.drawBackground();
        this.drawTrack();
        this.drawTile();
        this.drawControl();
        this.drawInfo();

        if (!this.isPaused && !this.isStarted) this.drawStart();
        if (this.isPaused && this.isStarted) this.drawPause();
        if (!this.isPaused && this.isStarted) {
            this.spawnTiles();
            this.calculateNewTilesPos()
        };

        this.perfomance = performance.now() - start;

        requestAnimationFrame(this.update.bind(this));
    }

    protected calculateNewTilesPos() {
        this.tiles.forEach((tiles, firstIndex) => {
            tiles.forEach((tile, secondIndex) => {
                if (tile.y > this.size.y) this.tiles[firstIndex].shift();
                tile.y += this.currentSpeed;
            });
        })
    }

    private MilisecondsToTime(miliseconds: number): string {
        let hours: number | string = Math.floor(miliseconds / 3600);
        let minutes: number | string = Math.floor((miliseconds - (hours * 3600)) / 60);
        let seconds: number | string = Math.floor(miliseconds - (hours * 3600) - (minutes * 60));

        if (minutes < 10) { minutes = "0" + minutes; }
        if (seconds < 10) { seconds = "0" + seconds; }

        return `${minutes}:${seconds}`;
    }

    private initEventListener() {
        document.body.addEventListener('keydown', (event) => {
            this.handlePress(event.key, 'keydown');
        });

        document.body.addEventListener('keyup', (event) => {
            this.handlePress(event.key, 'keyup');
        });
    }

    private calculateScore() {
        this.score += this.baseScore * this.speedMultiplier;
    }

    private spawnTiles() {
        this.data?.beats.forEach((tile) => {
            if (tile.start_time < parseFloat(<string>this.audio?.currentTime.toFixed(3))) {
                this.data?.beats.shift();
                this.tiles?.[tile.key].push(new Tiles(Vector2D(this.control[tile.key].x, -this.tileWidth), Vector2D(this.tileWidth, this.tileWidth), 0));
            }
        })
    }

    private handlePress(key: string, type: string) {
        switch (key) {
            case 'd':
                if (type == 'keydown') {
                    this.control[0].active = true
                    this.collisionHandler(0);
                }
                else this.control[0].active = false;
                break;
            case 'f':
                if (type == 'keydown') {
                    this.control[1].active = true;
                    this.collisionHandler(1);
                }
                else this.control[1].active = false;
                break;
            case 'j':
                if (type == 'keydown') {
                    this.control[2].active = true;
                    this.collisionHandler(2);
                }
                else this.control[2].active = false;
                break;
            case 'k':
                if (type == 'keydown') {
                    this.control[3].active = true;
                    this.collisionHandler(3);
                }
                else this.control[3].active = false;
                break;
            case 'Enter':
                if (this.isPaused && this.isStarted && type == 'keydown') this.resume();
                else if (!this.isPaused && this.isStarted && type == 'keydown') this.pause();
                else if (!this.isPaused && !this.isStarted && type == 'keydown') this.start();
                break;
            case '-':
                if (type == 'keydown') this.updateSpeed('-');
                break;
            case '=':
                if (type == 'keydown') this.updateSpeed('=');
                break;
            default:
                console.log({ 'key': key, 'type': type });
                break;
        }
    }

    private updateSpeed(key: string) {
        if (key == '-') {
            this.speedMultiplier -= 0.5;
        } else {
            this.speedMultiplier += 0.5;
        }
        this.currentSpeed = this.baseSpeed * this.speedMultiplier;
    }

    private collisionHandler(key: number) {
        this.tiles[key].map((tile, index) => {
            if ((tile.y + this.tileWidth) > this.control[0].y && (this.control[0].y + this.tileWidth) > tile.y) {
                this.tiles[key].shift();
                this.calculateScore();
            };
        });
    }

    private drawTile() {
        this.tiles.forEach((tiles) => {
            tiles.forEach((beat) => {
                this.drawRect(beat.toVector2(), this.tileColor, Vector2D(beat.width, beat.height));
            });
        })
    }

    private generateBackground() {
        this.canvasGradient = <CanvasGradient>this.ctx.createLinearGradient(0, 0, window.innerWidth, window.innerHeight);
        this.canvasGradient.addColorStop(0, 'rgba(2, 0, 36, 1)');
        this.canvasGradient.addColorStop(0.5, 'rgba(9, 9, 121, 1)');
        this.canvasGradient.addColorStop(1, 'rgba(0, 212, 255, 1)');
    }

    private drawBackground() {
        if (!this.canvasGradient) this.generateBackground();
        this.ctx.fillStyle = <CanvasGradient>this.canvasGradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    private drawInfo() {
        this.drawText(<string>this.data?.album, Vector2D(0, this.size.y - 5), '14px monospace');
        this.drawText(<string>this.data?.title, Vector2D(0, this.size.y - (5 + 14)), '12px monospace');
        this.drawText(<string>this.data?.artist, Vector2D(0, this.size.y - (19 + 12)), '10px monospace');

        this.drawText('Score : ' + <string>this.score.toString(), Vector2D(0, 24), '24px monospace');
        this.drawText('Time  : ' + <string>this.MilisecondsToTime(<number>this.audio?.currentTime), Vector2D(0, 24 * 2), '24px monospace');
        this.drawText(`${this.perfomance}`, Vector2D(this.size.x - 12, 12), '12px monospace');
        this.drawText(`${this.speedMultiplier}`, Vector2D(this.size.x - 20, this.size.y - 5), '12px monospace');
        this.drawText(`${this.combo}x`, Vector2D(this.size.x - 200, this.size.y - 40), '8rem monospace');
    }

    private drawPause() {
        this.drawRect(Vector2D(0, 0), 'rgba(116, 116, 116, 0.600)', Vector2D(this.size.x, this.size.y));
        this.drawText('Game Paused', Vector2D((this.size.x / 2) - 110, this.size.y / 2), '38px monospace');
    }

    private drawStart() {
        this.drawRect(Vector2D(0, 0), 'rgba(116, 116, 116, 0.600)', Vector2D(this.size.x, this.size.y));
        this.drawText('Press Enter to Start!', Vector2D((this.size.x / 2) - 210, this.size.y / 2), '38px monospace');
    }

    private drawLoading() {
        this.drawRect(Vector2D(0, 0), 'rgba(116, 116, 116, 0.400)', Vector2D(this.size.x, this.size.y));
        this.drawText('Loading...', Vector2D((this.size.x / 2) - 110, this.size.y / 2), '38px monospace');
    }

    private generateControl() {
        const middleWidth = (this.size.x / 2);
        const bottomHeight = this.size.y - this.tileWidth;

        Array(4).fill(1).forEach((_, index) => {
            let convertMiddleWidth = (middleWidth - this.tileWidth * 2) + ((2 + this.tileWidth) * index);
            this.control.push(new Control(Vector2D(convertMiddleWidth, bottomHeight), index));
        })

        this.drawControl();
    }

    private drawControl() {
        let color = 'blue';
        let secondary = 'red';
        this.control.forEach((control, index) => {
            const centerControl: Vector2 = Vector2D(control.x + (this.tileWidth / 2 - 5), control.y + (this.tileWidth / 2 + 5));
            if (control.active) {
                color = 'rgba(31, 102, 255, 0.8)';
                secondary = 'rgb(0, 204, 255)';
            } else {
                color = 'rgba(0, 4, 255, 0.600)';
                secondary = 'rgba(0, 204, 255, 0.750)';
            }
            this.drawRect(control.toVector2(), color, Vector2D(this.tileWidth, this.tileWidth));
            this.drawRect(control.toVector2(), secondary, Vector2D(this.tileWidth, this.tileWidth / 4));
            this.drawText(this.keybinds[index], centerControl, '24px monospace');
        })
    }

    private generateTrack() {
        const middleWidth = (this.size.x / 2);

        Array(4).fill(1).forEach((_, index) => {
            const convertMiddleWidth = (middleWidth - this.tileWidth * 2) + ((2 + this.tileWidth) * index);

            this.track.push(new Track(Vector2D(convertMiddleWidth, 0), index));
        })

        this.drawTrack();
    }

    private drawTrack() {
        this.track.forEach((track, index) => {
            this.drawRect(track.toVector2(), 'rgba(68, 87, 199, 0.616)', Vector2D(this.tileWidth, this.size.y - this.tileWidth));
        })
    }

    private drawText(text: string, pos: Vector2, style: string) {
        this.ctx.fillStyle = 'white';
        this.ctx.font = style;
        this.ctx.fillText(text, pos.x, pos.y);
    }

    private drawRect(pos: Vector2, style: string, size: Vector2) {
        this.ctx.fillStyle = style;
        this.ctx.fillRect(pos.x, pos.y, size.x, size.y);
    }
}