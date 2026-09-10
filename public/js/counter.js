// ==========================================
// COUNTER MANAGEMENT
// ==========================================

// HTML ELEMENTS
const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const startCameraBtn =
    document.getElementById("startCamera");

const drawZoneBtn =
    document.getElementById("drawZone");

const counterNameInput =
    document.getElementById("counterName");

const capacityInput =
    document.getElementById("counterCapacity");

const displayCounterName =
    document.getElementById("displayCounterName");

const displayCapacity =
    document.getElementById("displayCapacity");

const currentPeople =
    document.getElementById("currentPeople");

const counterStatus =
    document.getElementById("counterStatus");


// ==========================================
// VARIABLES
// ==========================================

let model = null;

let cameraStarted = false;

let drawingEnabled = false;
let drawing = false;

let startX = 0;
let startY = 0;

let counterZone = null;


// ==========================================
// START CAMERA
// ==========================================

startCameraBtn.addEventListener("click", async () => {

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
            async () => {

                // Set canvas size equal to camera resolution
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;

                console.log(
                    "Camera:",
                    video.videoWidth,
                    "x",
                    video.videoHeight
                );

                counterStatus.innerText =
                    "Loading AI...";

                // Load COCO-SSD
                model = await cocoSsd.load();

                console.log("COCO-SSD loaded");

                counterStatus.innerText =
                    "AI Loaded";

                // Start detection
                detectPeople();

            },
            {
                once: true
            }
        );

    } catch (error) {

        console.error(
            "Camera error:",
            error
        );

        alert(
            "Camera could not start. Please allow camera permission."
        );
    }
});


// ==========================================
// DRAW ZONE BUTTON
// ==========================================

drawZoneBtn.addEventListener("click", () => {

    // Camera check
    if (!cameraStarted) {

        alert(
            "Start camera first."
        );

        return;
    }


    // Counter name check
    if (
        counterNameInput.value.trim() === ""
    ) {

        alert(
            "Enter counter name."
        );

        return;
    }


    // Capacity check
    if (
        capacityInput.value === "" ||
        Number(capacityInput.value) <= 0
    ) {

        alert(
            "Enter maximum capacity."
        );

        return;
    }


    // Update dashboard
    displayCounterName.innerText =
        counterNameInput.value.trim();

    displayCapacity.innerText =
        capacityInput.value;


    // Enable drawing
    drawingEnabled = true;

    counterStatus.innerText =
        "Draw the counter zone on camera.";

});


// ==========================================
// MOUSE DOWN
// ==========================================

canvas.addEventListener(
    "mousedown",
    (event) => {

        if (!drawingEnabled) {
            return;
        }


        const rect =
            canvas.getBoundingClientRect();


        // Convert displayed canvas coordinates
        // into actual canvas coordinates

        const scaleX =
            canvas.width / rect.width;

        const scaleY =
            canvas.height / rect.height;


        startX =
            (event.clientX - rect.left) *
            scaleX;

        startY =
            (event.clientY - rect.top) *
            scaleY;


        drawing = true;

    }
);


// ==========================================
// MOUSE MOVE
// ==========================================

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
            (event.clientX - rect.left) *
            scaleX;

        const currentY =
            (event.clientY - rect.top) *
            scaleY;


        // Clear canvas
        ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );


        // Draw rectangle
        ctx.strokeStyle = "red";
        ctx.lineWidth = 4;


        ctx.strokeRect(
            startX,
            startY,
            currentX - startX,
            currentY - startY
        );

    }
);


// ==========================================
// MOUSE UP
// ==========================================

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
            (event.clientX - rect.left) *
            scaleX;

        const endY =
            (event.clientY - rect.top) *
            scaleY;


        // Make sure x1 < x2
        // and y1 < y2

        counterZone = {

            x1: Math.min(
                startX,
                endX
            ),

            y1: Math.min(
                startY,
                endY
            ),

            x2: Math.max(
                startX,
                endX
            ),

            y2: Math.max(
                startY,
                endY
            )

        };


        console.log(
            "Counter zone:",
            counterZone
        );


        // Save counter to database
        saveCounter();


        counterStatus.innerText =
            "Counter zone created.";

    }
);


// ==========================================
// CHECK WHETHER PERSON IS INSIDE ZONE
// ==========================================

function isInside(person) {

    if (!counterZone) {
        return false;
    }


    // COCO-SSD bbox:
    // [x, y, width, height]

    const [
        x,
        y,
        width,
        height
    ] = person.bbox;


    // Calculate center of person

    const centerX =
        x + width / 2;

    const centerY =
        y + height / 2;


    // Check whether center is inside zone

    return (

        centerX >= counterZone.x1 &&

        centerX <= counterZone.x2 &&

        centerY >= counterZone.y1 &&

        centerY <= counterZone.y2

    );

}


// ==========================================
// DETECT PEOPLE
// ==========================================

async function detectPeople() {

    if (!model) {
        return;
    }


    try {

        // Detect objects
        const predictions =
            await model.detect(video);


        let count = 0;


        // Check every detected object

        for (
            const person of predictions
        ) {


            // Only detect people

            if (

                person.class === "person" &&

                person.score > 0.5

            ) {


                // Check if person is inside
                // counter zone

                if (
                    isInside(person)
                ) {

                    count++;

                }

            }

        }


        // ==================================
        // UPDATE CURRENT PEOPLE
        // ==================================

        currentPeople.innerText =
            count;


        // ==================================
        // GET CAPACITY
        // ==================================

        const capacity =
            Number(
                capacityInput.value
            );


        // ==================================
        // UPDATE STATUS
        // ==================================

        if (
            capacity > 0 &&
            count == capacity
        ) {

            counterStatus.innerText =
                "FULL";

        } else if(count>capacity){

            counterStatus.innerText =
                `OVERCROWDED`;

        }else{
            counterStatus.innerText=
            "AVAILABLE"
        }


        // ==================================
        // DRAW COUNTER ZONE
        // ==================================

        ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );


        if (counterZone) {

            ctx.strokeStyle = "red";

            ctx.lineWidth = 4;


            ctx.strokeRect(

                counterZone.x1,

                counterZone.y1,

                counterZone.x2 -
                    counterZone.x1,

                counterZone.y2 -
                    counterZone.y1

            );

        }

    } catch (error) {

        console.error(
            "Detection error:",
            error
        );

    }


    // Continue detection

    requestAnimationFrame(
        detectPeople
    );

}


// ==========================================
// SAVE COUNTER
// ==========================================

async function saveCounter() {

    const name =
        counterNameInput.value.trim();


    const capacity =
        Number(
            capacityInput.value
        );


    // Validate zone

    if (!counterZone) {

        alert(
            "Please draw counter zone first."
        );

        return;
    }


    // Validate name

    if (name === "") {

        alert(
            "Counter name is required."
        );

        return;
    }


    // Validate capacity

    if (
        !capacity ||
        capacity <= 0
    ) {

        alert(
            "Enter a valid maximum capacity."
        );

        return;
    }


    try {

        // Send data to Node.js

        const response =
            await fetch(
                "/retail/counter",
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        name: name,

                        capacity: capacity,

                        x1: counterZone.x1,

                        y1: counterZone.y1,

                        x2: counterZone.x2,

                        y2: counterZone.y2

                    })

                }
            );


        // Convert response to JSON

        const data =
            await response.json();


        // ==================================
        // SUCCESS
        // ==================================

        if (data.success) {

            console.log(
                "Counter saved:",
                data.counter
            );


            counterStatus.innerText =
                "Counter saved successfully!";


        } else {


            // ==================================
            // FAILED
            // ==================================

            console.error(
                "Save failed:",
                data.message
            );


            alert(
                data.message ||
                "Failed to save counter."
            );

        }


    } catch (error) {

        console.error(
            "Save counter error:",
            error
        );


        alert(
            "Server error while saving counter."
        );

    }

}