// ============================================
// DWELL TIME - FRONTEND JAVASCRIPT
// ============================================


// ============================================
// GET HTML ELEMENTS
// ============================================

const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const startCameraBtn =
    document.getElementById("startCamera");

const drawZoneBtn =
    document.getElementById("drawZone");

const clearZoneBtn =
    document.getElementById("clearZone");

const zoneNameInput =
    document.getElementById("zoneName");

const zoneStatus =
    document.getElementById("zoneStatus");

const zoneData =
    document.getElementById("zoneData");

const visitorCountElement = document.getElementById("visitorCount");
const dwellSecondsElement = document.getElementById("dwellSeconds");


// ============================================
// VARIABLES
// ============================================

let cameraStarted = false;
let drawingEnabled = false;
let drawing = false;

let startX = 0;
let startY = 0;

let currentZone = null;

let model = null;
let personInsideZone = false;
let dwellStartTime = null;
let dwellTimer = null;

let visitorCount = 0;
let alreadyCounted = false;


// ============================================
// LOAD AI MODEL
// ============================================

async function loadModel() {

    try {

        zoneStatus.innerText =
            "Loading person detection model...";

        model = await cocoSsd.load();

        console.log(
            "Person detection model loaded"
        );

        zoneStatus.innerText =
            "AI model loaded. Draw your zone.";

    } catch (error) {

        console.error(
            "Model loading error:",
            error
        );

    }

}


// ============================================
// START CAMERA
// ============================================

startCameraBtn.addEventListener(
    "click",
    async () => {

        try {

            const stream =
                await navigator.mediaDevices.getUserMedia({

                    video: true,
                    audio: false

                });


            video.srcObject = stream;

            cameraStarted = true;


            video.addEventListener(
                "loadedmetadata",
                () => {

                    canvas.width =
                        video.videoWidth;

                    canvas.height =
                        video.videoHeight;


                    console.log(
                        "Camera resolution:",
                        video.videoWidth,
                        "x",
                        video.videoHeight
                    );


                    // Start AI detection

                    detectPerson();

                },
                {
                    once: true
                }
            );


            zoneStatus.innerText =
                "Camera started. Loading AI...";


            // Load model

            loadModel();


        } catch (error) {

            console.error(
                "Camera error:",
                error
            );


            alert(
                "Camera permission denied or camera unavailable."
            );

        }

    }
);


// ============================================
// ENABLE DRAWING
// ============================================

drawZoneBtn.addEventListener(
    "click",
    () => {

        if (!cameraStarted) {

            alert(
                "Please start the camera first."
            );

            return;

        }


        drawingEnabled = true;


        zoneStatus.innerText =
            "Click and drag on the camera to draw the zone.";

    }
);


// ============================================
// MOUSE DOWN
// ============================================

canvas.addEventListener(
    "mousedown",
    (event) => {

        if (!drawingEnabled) {

            return;

        }


        const rect =
            canvas.getBoundingClientRect();


        const scaleX =
            canvas.width / rect.width;

        const scaleY =
            canvas.height / rect.height;


        startX =
            (event.clientX - rect.left)
            * scaleX;

        startY =
            (event.clientY - rect.top)
            * scaleY;


        drawing = true;

    }
);


// ============================================
// MOUSE MOVE
// ============================================

canvas.addEventListener(
    "mousemove",
    (event) => {

        if (!drawing) {

            return;

        }


        const rect =
            canvas.getBoundingClientRect();


        const scaleX =
            canvas.width / rect.width;

        const scaleY =
            canvas.height / rect.height;


        const currentX =
            (event.clientX - rect.left)
            * scaleX;

        const currentY =
            (event.clientY - rect.top)
            * scaleY;


        const width =
            currentX - startX;

        const height =
            currentY - startY;


        // Clear

        ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );


        // Draw temporary rectangle

        ctx.beginPath();

        ctx.strokeStyle = "red";

        ctx.lineWidth = 4;

        ctx.strokeRect(
            startX,
            startY,
            width,
            height
        );

    }
);


// ============================================
// MOUSE UP
// ============================================

canvas.addEventListener(
    "mouseup",
    (event) => {

        if (!drawing) {

            return;

        }


        drawing = false;

        drawingEnabled = false;


        const rect =
            canvas.getBoundingClientRect();


        const scaleX =
            canvas.width / rect.width;

        const scaleY =
            canvas.height / rect.height;


        const endX =
            (event.clientX - rect.left)
            * scaleX;

        const endY =
            (event.clientY - rect.top)
            * scaleY;


        // Normalize coordinates

        const x1 =
            Math.min(startX, endX);

        const y1 =
            Math.min(startY, endY);

        const x2 =
            Math.max(startX, endX);

        const y2 =
            Math.max(startY, endY);


        // Zone name

        let zoneName =
            zoneNameInput.value.trim();


        if (zoneName === "") {

            zoneName = "Coke";

        }


        // Save zone

        currentZone = {

            name: zoneName,

            x1: Math.round(x1),

            y1: Math.round(y1),

            x2: Math.round(x2),

            y2: Math.round(y2)

        };


        // Draw final zone

        drawFinalZone();


        zoneStatus.innerText =
            `Zone "${zoneName}" created successfully.`;


        zoneData.innerText =
            JSON.stringify(
                currentZone,
                null,
                4
            );


        console.log(
            "Created zone:",
            currentZone
        );

    }
);


// ============================================
// DRAW FINAL ZONE
// ============================================

function drawFinalZone() {

    if (!currentZone) {

        return;

    }


    const x =
        currentZone.x1;

    const y =
        currentZone.y1;

    const width =
        currentZone.x2 -
        currentZone.x1;

    const height =
        currentZone.y2 -
        currentZone.y1;


    ctx.beginPath();

    ctx.strokeStyle = "red";

    ctx.lineWidth = 4;

    ctx.strokeRect(
        x,
        y,
        width,
        height
    );


    ctx.font =
        "24px Arial";

    ctx.fillStyle =
        "red";


    ctx.fillText(
        currentZone.name,
        x + 10,
        y + 30
    );

}


// ============================================
// CHECK PERSON INSIDE ZONE
// ============================================

function isPersonInsideZone(
    person
) {

    if (!currentZone) {

        return false;

    }


    const [x, y, width, height] =
        person.bbox;


    // Find center of person

    const centerX =
        x + width / 2;

    const centerY =
        y + height / 2;


    // Check center against rectangle

    return (
        centerX >= currentZone.x1 &&
        centerX <= currentZone.x2 &&
        centerY >= currentZone.y1 &&
        centerY <= currentZone.y2
    );

}


// ============================================
// PERSON DETECTION
// ============================================

async function detectPerson() {

    if (!model) {

        setTimeout(
            detectPerson,
            500
        );

        return;

    }


    if (
        video.readyState <
        2
    ) {

        requestAnimationFrame(
            detectPerson
        );

        return;

    }


    try {

        const predictions =
            await model.detect(video);


        // Find people

        const people =
            predictions.filter(
                prediction =>
                    prediction.class === "person" &&
                    prediction.score > 0.5
            );


        let personInside = false;


        // Check every detected person

        for (
            const person of people
        ) {

            if (
                isPersonInsideZone(
                    person
                )
            ) {

                personInside = true;

                break;

            }

        }


        console.log(
            "People detected:",
            people.length,
            "Inside zone:",
            personInside
        );


        // Draw zone again

        ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );


        drawFinalZone();


        // Show status

        if (personInside) {

            zoneStatus.innerText =
                "PERSON IS INSIDE THE ZONE";

        } else {

            zoneStatus.innerText =
                "No person inside the zone";

        }
        updateDwellTime(personInside);


    } catch (error) {

        console.error(
            "Detection error:",
            error
        );

    }


    // Continue detection

    requestAnimationFrame(
        detectPerson
    );

}


// ============================================
// CLEAR ZONE
// ============================================

clearZoneBtn.addEventListener(
    "click",
    () => {

        currentZone = null;


        ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );


        zoneStatus.innerText =
            "No zone created.";


        zoneData.innerText =
            "";

    }
);
function updateDwellTime(personInside) {

    // Person entered the zone
    if (personInside && !personInsideZone) {

        personInsideZone = true;

        dwellStartTime = Date.now();

        alreadyCounted = false;

        console.log("Person entered zone");

        dwellTimer = setInterval(() => {

            const elapsed =
                (Date.now() - dwellStartTime) / 1000;

            const seconds = Math.floor(elapsed);

            // Update dwell time on webpage
            if (dwellSecondsElement) {
                dwellSecondsElement.innerText = seconds;
            }

            console.log(
                "Dwell time:",
                seconds,
                "seconds"
            );

            // TEST: count after 15 seconds
            if (
                elapsed >= 15 &&
                !alreadyCounted
            ) {

                visitorCount++;

                alreadyCounted = true;

                // Update visitor count on webpage
                if (visitorCountElement) {
                    visitorCountElement.innerText =
                        visitorCount;
                }

                console.log(
                    "Visitor counted!",
                    visitorCount
                );
            }

        }, 500);
    }


    // Person left the zone
    if (!personInside && personInsideZone) {

        personInsideZone = false;

        clearInterval(dwellTimer);

        dwellTimer = null;

        dwellStartTime = null;

        alreadyCounted = false;

        // Reset displayed dwell time
        if (dwellSecondsElement) {
            dwellSecondsElement.innerText = "0";
        }

        console.log("Person left zone");
    }
}