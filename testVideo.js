const { desktopCapturer } = require('electron')

let btnEnableVideo;
let videoEl;
let selectEl;

let localVideoStream;

let isVideoCapturing = false;

const init = () => {
    videoEl = document.querySelector('video');
    btnEnableVideo = document.querySelector("#btnEnableVideo");
    btnEnableVideo.addEventListener("click", () => { toggleCaptureVideo() });

    selectEl = document.querySelector("#selectSource");

    showSources();
}

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

const handleVideoStream = (stream) => {
    localVideoStream = stream;
    videoEl.srcObject = stream
    videoEl.onloadedmetadata = () => videoEl.play()
};

const toggleCaptureVideo = () => {
    if (!isVideoCapturing) {
        var id = selectEl.value;
        captureVideo(id);
    } else {
        isVideoCapturing = false;

        if (localVideoStream)
            localVideoStream.getTracks()[0].stop();
        localVideoStream = null;

        btnEnableVideo.innerHTML = "Enable Video Capture";
    }
};

const captureVideo = async (sourceId) => {
    if (!sourceId) {
        console.log('Desktop Capture access rejected.');
        return;
    }
    
    console.log("Desktop sharing started.. sourceId:" + sourceId);
    btnEnableVideo.innerHTML = "...";
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
        handleVideoStream(stream);
        isVideoCapturing = true;
        btnEnableVideo.innerHTML = "Disable Video Capture";
    } catch (e) {
        handleError(e);
    }
};

init();