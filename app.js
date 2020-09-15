// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.
// In the renderer process.
const { desktopCapturer } = require('electron')

let btnEnable;
let selectEl;
let desktopSharing = false;
let localStream;

const init = () => {
    btnEnable = document.querySelector("#btnEnable");
    btnEnable.addEventListener("click", () => { toggle() });
    selectEl = document.querySelector("#selectSource");
    showSources();
};

const toggle = () => {
    if (!desktopSharing) {
        var id = selectEl.value;
        onAccessApproved(id);
    } else {
        desktopSharing = false;

        if (localStream)
            localStream.getTracks()[0].stop();
        localStream = null;

        btnEnable.innerHTML = "Enable Capture";

        // showSources();
    }
};

const showSources = () => {
    desktopCapturer.getSources({ types: ['window', 'screen'] }).then(async sources => {
        for (let source of sources) {
            console.log("Name: " + source.name);
            addSource(source);
        }
    });
};

const addSource = (source) => {
    const optionEl = document.createElement("option");
    optionEl.value = source.id;
    optionEl.innerText = source.name;
    selectEl.appendChild(optionEl);
};

const onAccessApproved = async (sourceId) => {
    if (!sourceId) {
        console.log('Desktop Capture access rejected.');
        return;
    }
    desktopSharing = true;
    btnEnable.innerHTML = "Disable Capture";
    console.log("Desktop sharing started.. sourceId:" + sourceId);

    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: {
                mandatory: {
                    chromeMediaSource: 'desktop',
                    chromeMediaSourceId: sourceId,
                    minWidth: 1280,
                    maxWidth: 1280,
                    minHeight: 720,
                    maxHeight: 720
                }
            }
        });
        handleStream(stream)
    } catch (e) {
        handleError(e);
    }
};

const handleStream = (stream) => {
    localStream = stream;
    const video = document.querySelector('video')
    video.srcObject = stream
    video.onloadedmetadata = (e) => video.play()
};

const handleError = (e) => {
    console.log(e)
};




init();