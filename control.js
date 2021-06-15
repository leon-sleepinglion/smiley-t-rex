document.onkeydown = function (evt) {
    evt = evt || window.event
    if (evt.keyCode == 32) {
        var box = document.getElementById("messageBox");
        box.style.visibility = "hidden";
    }
};

$(document).ready(function () {
    alert('Welcome fo the Smiley T-Rex Runner\n\n😁 Smile to start/jump.\n😲 Make a surprised face to duck.\n😐 Show a poker face to "unduck".\n😡 Show an angry face to restart.')
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
    const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 256, scoreThreshold: 0.7 })

    const result = await faceapi.detectSingleFace(videoEl, options).withFaceExpressions()

    if (result) {
        const canvas = $('#overlay').get(0)
        const dims = faceapi.matchDimensions(canvas, videoEl, true)

        const resizedResult = faceapi.resizeResults(result, dims)
        const minConfidence = 0.7

        faceapi.draw.drawDetections(canvas, resizedResult)
        faceapi.draw.drawFaceExpressions(canvas, resizedResult, minConfidence)

        if (result.expressions.happy > 0.7) {
            registerExpression('happy')
            unduck()
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
            registerExpression('angry')
            // Simulate the action of releasing spacebar
            var e = new KeyboardEvent("keyup", {
                bubbles: true,
                cancelable: true,
                key: " ",
                shiftKey: true,
                keyCode: 32
            })
            document.dispatchEvent(e)
        }

        else if (result.expressions.surprised > 0.7) {
            registerExpression('surprised')
            // Simulate the action of pressing down arrow down
            var e = new KeyboardEvent("keydown", {
                bubbles: true,
                cancelable: true,
                key: " ",
                shiftKey: true,
                keyCode: 40
            })
            document.dispatchEvent(e)
        }

        else if (result.expressions.neutral > 0.7) {
            registerExpression('neutral')
            if (globalDucking) {
                unduck()                
            }
        }

        else if (result.expressions.sad > 0.7) {
            registerExpression('sad')
        }
    }

    setTimeout(() => onPlay(videoEl))
}

const unduck = () => {
    // Simulate the action of releasing arrow down
    var e = new KeyboardEvent("keyup", {
        bubbles: true,
        cancelable: true,
        key: " ",
        shiftKey: true,
        keyCode: 40
    })
    document.dispatchEvent(e)
    globalDucking = false
}

const expression_queue = []
const easter_egg_expression_sequence = ['angry', 'neutral', 'happy', 'neutral', 'surprised', 'neutral', 'sad', 'neutral']
const registerExpression = (expression) => {
    if (expression_queue.length >= 8) {
        expression_queue.shift()
    }

    if (expression_queue[expression_queue.length - 1] !== expression) {
        expression_queue.push(expression)
    }

    if (expression_queue.length === easter_egg_expression_sequence.length && expression_queue.every((value, index) => value === easter_egg_expression_sequence[index])) {
        window.location.href = "https://www.youtube.com/watch?v=-xDCWEi3D4s"
    }

    console.debug(expression_queue)
};