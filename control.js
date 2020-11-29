document.onkeydown = function (evt) {
    evt = evt || window.event;
    if (evt.keyCode == 32) {
        var box = document.getElementById("messageBox");
        box.style.visibility = "hidden";
    }
};

$(document).ready(function () {
    alert('Welcome fo the Smiley T-Rex Runner\n\n😁 Smile to your camera to play the game.\n😡Make an angry face to restart the game when you lose.')
    run()
})

async function run() {
    // load the model
    await faceapi.loadTinyFaceDetectorModel('/models')
    await faceapi.loadFaceExpressionModel('/models')

    // Try to access users webcam and stream the images
    const videoEl = document.getElementById('inputVideo')
    if (navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true })
          .then(function (stream) {
            videoEl.srcObject = stream;
          })
          .catch(function (error) {
            console.log(error)
            console.log("Something went wrong!");
          });
      }
}

async function onPlay(videoEl) {
    const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 256, scoreThreshold: 0.5 })

    const result = await faceapi.detectSingleFace(videoEl, options).withFaceExpressions()

    if (result) {
        const canvas = $('#overlay').get(0)
        const dims = faceapi.matchDimensions(canvas, videoEl, true)

        const resizedResult = faceapi.resizeResults(result, dims)
        const minConfidence = 0.5

        faceapi.draw.drawDetections(canvas, resizedResult)
        faceapi.draw.drawFaceExpressions(canvas, resizedResult, minConfidence)

        if (result.expressions.happy > 0.7) {
            // Simulate the action of pressing down spacebar
            var e = new KeyboardEvent("keydown", {
                bubbles: true,
                cancelable: true,
                key: " ",
                shiftKey: true,
                keyCode: 32
            })
            document.dispatchEvent(e)
        }

        else if (result.expressions.angry > 0.7) {
            // Simulate the action of pressing down spacebar
            var e = new KeyboardEvent("keyup", {
                bubbles: true,
                cancelable: true,
                key: " ",
                shiftKey: true,
                keyCode: 32
            })
            document.dispatchEvent(e)
        }
    }

    setTimeout(() => onPlay(videoEl))
}
