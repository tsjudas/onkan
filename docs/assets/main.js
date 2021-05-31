const AudioContext = window.AudioContext || window.webkitAudioContext;
let isPlaying = false;
const playingHz = 48;
let zure = 0.3;
let waitTime = 1500;
let consoleCnt = 0;
let consoleTxt = "";
const ctx = new AudioContext();
const gainNode = ctx.createGain();
let sources = [];
let randData = [];
const onkai = [
    'C',
    'C#',
    'D',
    'D#',
    'E',
    'F',
    'F#',
    'G',
    'G#',
    'A',
    'A#',
    'B',
];
const onkai_q = [0,2,4,5,7,9,11];

gainNode.gain.value = 0.2;

function initAudio() {
    return new Promise((resolve) => {
        const xhr = new XMLHttpRequest();
        xhr.responseType = "arraybuffer";
        xhr.open("GET", "assets/c4.wav", true);
        let audioBuf;
        xhr.onload = async () => {
            resolve(await ctx.decodeAudioData(xhr.response));
        }
        xhr.send();
    });
}

async function sleep(milliSec) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve();
        }, milliSec);
    });
}

async function createSource(note, zure, isdown) {
    const source = ctx.createBufferSource();
    source.buffer = await initAudio();
    if (isdown) {
        source.playbackRate.value = 2 ** ((playingHz + note - zure - 48) / 12);
    } else {
        source.playbackRate.value = 2 ** ((playingHz + note + zure - 48) / 12);
    }
    source.connect(gainNode);
    gainNode.connect(ctx.destination);
    return source;
}

async function init(reset) {
    if (isPlaying) playStop();
    sources = [];
    if(reset) {
        randData = [];
    }
    const zureIndex = Math.floor(Math.random() * 3);
    for (let i = 0; i < 3; i++) {
        let rand = reset ? {
            zureFlg: zureIndex === i,
            isdown: Math.floor(Math.random() * 100) == 1,
            note: onkai_q[Math.floor(Math.random() * onkai_q.length)],
        } : randData[i];
        source = await createSource(rand.note, rand.zureFlg ? zure : 0, rand.isdown);
        sources.push({playing: false, src: source});
        if (reset) randData.push(rand);
    }
    await playStart();
}

async function playStart() {
    isPlaying = true;
    if (ctx.state === "suspended") {
        ctx.resume();
    }
    for (source of sources) {
        if (!source.playing) source.src.start(0);
        source.playing = true;
        await sleep(waitTime);
    }
}

function playStop() {
    if (!isPlaying) return;
    sources.forEach(source => {
        if (source.playing) source.src.stop();
        source.playing = false;
    });
    isPlaying = false;
}

function answer() {
    const outStr = randData.map(rand => `${onkai[rand.note]}${rand.zureFlg ? `[${rand.isdown ? '下' : '上'}]`:''}`).join(" , ")
    consoleOut(outStr);
}

function zureChange(value) {
    zure = Number(value);
    document.querySelector('#zuretext').value = zure;
    document.querySelector('#zure').value = zure;
}

function waitChange(value) {
    waitTime = Number(value);
    document.querySelector('#waittext').value = waitTime;
    document.querySelector('#wait').value = waitTime;
}

function consoleOut(text) {
    if (consoleCnt++ % 5 == 0) document.querySelector('#console').value = "";
    document.querySelector('#console').value += text + "\n";
}
