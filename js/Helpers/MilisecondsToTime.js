export function MilisecondsToTime(miliseconds) {
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
//# sourceMappingURL=MilisecondsToTime.js.map