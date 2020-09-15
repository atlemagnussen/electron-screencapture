// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.
// In the renderer process.

let btnEnableAudio;

let isAudioCapturing = false;

let localAudioStream;

const padding = 15;
const paddingBottom = 60;
const barNumber = 27;
let anim;
let WIDTH, HEIGHT;

const ecart = 10;
let barWidth;

let canvas;

const init = () => {
    canvas = document.querySelector("canvas");
    canvas.width = window.innerWidth - padding;
    canvas.height = window.innerHeight - paddingBottom;
    
    WIDTH = canvas.width - 2*padding;
    HEIGHT = canvas.height - 2*padding;
    barWidth = (WIDTH / barNumber) -ecart;
    
    btnEnableAudio = document.querySelector("#btnEnableAudio");
    
    btnEnableAudio.addEventListener("click", () => { toggleCaptureAudio() });
};



const toggleCaptureAudio = () => {
    if (!isAudioCapturing) {
        captureAudio();
    } else {
        isAudioCapturing = false;

        if (localAudioStream)
            localAudioStream.getTracks()[0].stop();
        localAudioStream = null;

        btnEnableAudio.innerHTML = "Enable Audio Capture";
    }
}

const captureAudio = async () => {
    console.log("Desktop audio capturing");

    if(anim){
        window.cancelAnimationFrame(anim);
    }

    btnEnableAudio.innerHTML = "...";
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: {
                mandatory: {
                    chromeMediaSource: 'desktop'
                }
            },
            video: {
                mandatory: {
                    chromeMediaSource: 'desktop'
                }
            }
        });
        handleAudioStream(stream);
        isAudioCapturing = true;
        btnEnableAudio.innerHTML = "Disable Audio Capture";
    } catch (e) {
        handleError(e);
    }
};


const handleAudioStream = (stream) => {
    localAudioStream = stream;

    const context = new AudioContext();
    const src = context.createMediaStreamSource(stream);
    const analyser = context.createAnalyser();
    const ctx = canvas.getContext("2d");

    src.connect(analyser);
    analyser.fftSize = 512;

    const bufferLength = analyser.frequencyBinCount;
    const bufferByBar = Math.round(bufferLength/barNumber);
    const dataArray = new Uint8Array(bufferLength);

    var barHeight;
    var x = 0;

    const renderFrame = () => {
        anim = requestAnimationFrame(renderFrame);

        x = padding;

        analyser.getByteFrequencyData(dataArray);

        ctx.fillStyle = "#0f0";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for (var i = 0; i < barNumber; i++) {
            barHeight = 0
            for (var j = 0; j < bufferByBar; j++) {
                barHeight += dataArray[i*bufferByBar+j];
            }
            barHeight = barHeight/bufferByBar;

            barHeight = barHeight/700*HEIGHT;

            var r = barHeight + (25 * (i/bufferLength));
            var g = 250 * (i/bufferLength);
            var b = 50;

            // var fillStyle = "rgb(" + r + "," + g + "," + b + ")";
            var fillStyle = "#F00";

            ctx.fillStyle = fillStyle;
            // ctx.fillStyle = "#F00";
            ctx.fillRect(x, HEIGHT - 2*barHeight - barWidth/2, barWidth, 2*barHeight);

            ctx.beginPath();
            ctx.arc(x+(barWidth/2), HEIGHT - 2*barHeight -barWidth/2 , barWidth/2, 0, 2 * Math.PI, false);
            ctx.arc(x+(barWidth/2), HEIGHT - barWidth/2 , barWidth/2, 0, 2 * Math.PI, false);
            ctx.fill();
            ctx.lineWidth = 0;
            ctx.strokeStyle = fillStyle;
            ctx.stroke();


            x += barWidth + ecart;
        }
    }
    renderFrame();
};


const handleError = (e) => {
    console.log(e)
};

init();