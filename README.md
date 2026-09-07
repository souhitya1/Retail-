# 🏪 Intelligent Retail Analytics System

An AI-powered retail analytics system designed to help store owners monitor **product availability, empty shelf spaces, and customer activity** using computer vision and edge AI.

The system uses camera-based object detection to identify products such as **Coke and Fanta**, detect empty spaces, and analyze people inside the retail environment.

---

## 🚀 Features

### 👤 Person Detection
- Detects people using computer vision.
- Counts people present in the camera view.
- Can be used for customer footfall and queue analysis.

### 🥤 Product Detection
The system can detect specific retail products, including:

- Coke
- Fanta
- Other trained products

The product detection module can be extended by training the model with additional product classes.

### 📦 Empty Space Detection
- Detects empty spaces on shelves.
- Helps identify products that need replenishment.
- Can assist store owners in maintaining shelf availability.

### 📊 Retail Analytics
The detection results can be integrated into a retail dashboard to provide:

- Product availability
- Empty shelf/space detection
- Customer count
- Store activity monitoring
- Inventory insights

---

## 🧠 Technology Stack

### AI / Computer Vision

- Python
- YOLO
- OpenCV
- Ultralytics
- Computer Vision

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose

### Frontend

- HTML
- CSS
- JavaScript
- EJS
- Bootstrap

### Hardware

The system is designed to support edge deployment using:

- Raspberry Pi
- Raspberry Pi Camera

---

## 🏗️ System Architecture

```text
                Camera
                  │
                  ▼
          ┌────────────────┐
          │ Computer Vision│
          │   / YOLO Model │
          └───────┬────────┘
                  │
       ┌──────────┼───────────┐
       │          │           │
       ▼          ▼           ▼
   Person      Product     Empty Space
  Detection   Detection     Detection
       │          │           │
       └──────────┼───────────┘
                  │
                  ▼
          Detection Results
                  │
                  ▼
          Node.js / Express
                  │
                  ▼
              MongoDB
                  │
                  ▼
           Retail Dashboard
