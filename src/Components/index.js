import React, { useState, useRef, useEffect } from "react";
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-webgl";
import { load } from "@tensorflow-models/coco-ssd";

function App() {
  const [isCameraInitialized, setIsCameraInitialized] = useState(false);
  const [model, setModel] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Load the pre-trained object detection model (COCO-SSD)
  useEffect(() => {
    const loadModel = async () => {
      const loadedModel = await load();
      setModel(loadedModel);
    };
    loadModel();
  }, []);

  // Initialize the webcam stream
  useEffect(() => {
    const initializeCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          setIsCameraInitialized(true);
        };
      } catch (error) {
        console.error("Error accessing webcam:", error);
      }
    };
    initializeCamera();
  }, []);

  // Perform object detection and log identified cards
  useEffect(() => {
    const detectObjects = async () => {
      if (isCameraInitialized && model) {
        const ctx = canvasRef.current.getContext("2d");
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        ctx.drawImage(
          videoRef.current,
          0,
          0,
          videoRef.current.videoWidth,
          videoRef.current.videoHeight
        );
        const detectedObjects = await model.detect(canvasRef.current);
        setPredictions(detectedObjects);

        // Log identified cards
        detectedObjects.forEach((object) => {
          if (object.class === "playing card") {
            console.log("Identified Card:", object);
          }
        });
      }
      requestAnimationFrame(detectObjects);
    };
    requestAnimationFrame(detectObjects);
  }, [isCameraInitialized, model]);

  return (
    <div>
      <video ref={videoRef} autoPlay playsInline muted />
      <canvas ref={canvasRef} style={{ display: "none" }} />
      {/* Display detected objects (optional) */}
      <div>
        {predictions.map((prediction, index) => (
          <div key={index}>
            {prediction.class} - {prediction.score.toFixed(2)}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
