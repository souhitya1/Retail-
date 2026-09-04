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


// ============================================
// VARIABLES
// ============================================

let cameraStarted = false;

let drawingEnabled = false;

let drawing = false;

let startX = 0;

let startY = 0;

let currentZone = null;


// ============================================
// START CAMERA
// ============================================

startCameraBtn.addEventListener("click", async () => {

    try {

        const stream =
            await navigator.mediaDevices.getUserMedia({

                video: true,

                audio: false

            });


        // Put camera stream inside video element

        video.srcObject = stream;


        cameraStarted = true;


        // Wait until camera knows its resolution

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


            },
            {
                once: true
            }
        );


        zoneStatus.innerText =
            "Camera started. Click 'Draw Zone'.";


    } catch (error) {

        console.error(
            "Camera error:",
            error
        );


        alert(
            "Camera permission denied or camera unavailable."
        );

    }

});


// ============================================
// ENABLE DRAWING
// ============================================

drawZoneBtn.addEventListener("click", () => {

    // Check camera

    if (!cameraStarted) {

        alert(
            "Please start the camera first."
        );

        return;

    }


    drawingEnabled = true;


    zoneStatus.innerText =
        "Click and drag on the camera to draw the zone.";

});


// ============================================
// MOUSE DOWN
// ============================================

canvas.addEventListener("mousedown", (event) => {

    if (!drawingEnabled) {

        return;

    }


    const rect =
        canvas.getBoundingClientRect();


    // Convert displayed coordinates
    // to actual video coordinates

    const scaleX =
        canvas.width / rect.width;

    const scaleY =
        canvas.height / rect.height;


    startX =
        (event.clientX - rect.left) * scaleX;

    startY =
        (event.clientY - rect.top) * scaleY;


    drawing = true;

});


// ============================================
// MOUSE MOVE
// ============================================

canvas.addEventListener("mousemove", (event) => {

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
        (event.clientX - rect.left) * scaleX;

    const currentY =
        (event.clientY - rect.top) * scaleY;


    const width =
        currentX - startX;

    const height =
        currentY - startY;


    // Clear canvas

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    // Draw rectangle

    ctx.beginPath();

    ctx.strokeStyle = "red";

    ctx.lineWidth = 4;

    ctx.strokeRect(
        startX,
        startY,
        width,
        height
    );

});


// ============================================
// MOUSE UP
// ============================================

canvas.addEventListener("mouseup", (event) => {

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
        (event.clientX - rect.left) * scaleX;

    const endY =
        (event.clientY - rect.top) * scaleY;


    // Make coordinates correct
    // regardless of drawing direction

    const x1 =
        Math.min(startX, endX);

    const y1 =
        Math.min(startY, endY);

    const x2 =
        Math.max(startX, endX);

    const y2 =
        Math.max(startY, endY);


    // Get zone name

    let zoneName =
        zoneNameInput.value.trim();


    if (zoneName === "") {

        zoneName = "Coke";

    }


    // Create zone object

    currentZone = {

        name: zoneName,

        x1: Math.round(x1),

        y1: Math.round(y1),

        x2: Math.round(x2),

        y2: Math.round(y2)

    };


    // Draw final rectangle

    drawFinalZone();


    // Update status

    zoneStatus.innerText =
        `Zone "${zoneName}" created successfully.`;


    // Show coordinates

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

});


// ============================================
// DRAW FINAL ZONE
// ============================================

function drawFinalZone() {

    // Clear canvas

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    // Check zone

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


    // Draw rectangle

    ctx.beginPath();

    ctx.strokeStyle = "red";

    ctx.lineWidth = 4;

    ctx.strokeRect(
        x,
        y,
        width,
        height
    );


    // Draw zone name

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
// CLEAR ZONE
// ============================================

clearZoneBtn.addEventListener("click", () => {

    // Remove zone

    currentZone = null;


    // Clear canvas

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    // Reset information

    zoneStatus.innerText =
        "No zone created.";


    zoneData.innerText =
        "";

});