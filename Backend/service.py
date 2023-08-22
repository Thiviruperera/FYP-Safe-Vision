# Import the necessary libraries
import tensorflow as tf
import numpy as np
import cv2
import os
from os.path import isfile, join
import glob
import shutil
from imageai.Detection import VideoObjectDetection
import subprocess
from datetime import timedelta

img_height, img_width = 64, 64  # Define the dimensions of the input images for the model

# Load the pre-trained anomaly detection model
model = tf.keras.models.load_model('model/anomality_detection.h5')

# Function to convert seconds into hours, minutes and seconds
def secInHours(sec):
    return str(timedelta(seconds=sec))

# Perform anomaly detection on a video file
def makePredict(filename):
    abFrame = []  # Initialize an empty list to store the frames identified as anomalies
    os.remove("static/output.mp4")  # Remove the previous output video if it exists
    video_file = filename
    cap = cv2.VideoCapture(video_file)  # Capturing the video file using OpenCV
    count = 1  # Initialize a counter to keep track of the current frame number
    while cap.isOpened():   # Read the video file frame by frame until there are no more frames

        ret, frame = cap.read()  # Read the next frame
        if not ret:  # If the frame could not be read (e.g., because it is the end of the video), break the loop
            break
        # Resize the frame to 64x64 resolution
        resized_frame = cv2.resize(frame, (64, 64))
        # Add an extra dimension to the frame array for batch size
        preprocessed_frame = np.expand_dims(resized_frame, axis=0)
        # Make a prediction on the preprocessed frame using the model
        prediction = model.predict(preprocessed_frame)
        # Postprocess the prediction as needed
        # Get the index of the class with the highest probability
        class_index = np.argmax(prediction)
        # Look up the corresponding label from a predefined list
        # If the class index is 0, the frame is considered an anomaly
        if class_index == 0:
            abFrame.append(count)  # Add the current frame number to the list of anomalous frames
        count += 1  # Increment the frame counter
    cap.release()  # Close the video file
    anomaly = (len(abFrame) / count) * 100  # Calculate the percentage of frames that were anomalies
    # Determine if an anomaly was detected based on the percentage of anomalous frames
    isDetected = ""
    if anomaly > 25:
        isDetected = "Anomaly Detected"
    else:
        isDetected = "Anomaly Not Detected"

    # Calculate the start and end times of the anomaly
    timestamp = secInHours(abFrame[0] / 30) + " hours - " + secInHours(abFrame[-1] / 30) + " hours"
    # Assign a priority level to the anomaly based on the percentage of anomalous frames
    priority = ""
    if anomaly > 75:
        priority = "Very High"
    elif anomaly > 50:
        priority = "High"
    elif anomaly > 25:
        priority = "Low"
    else:
        priority = "Very Low"

    # Writing a report for the detected anomaly
    report = open('static/report.txt', 'w')
    report.write(isDetected + "\n\n")
    report.write("Anomaly Timestamp : " + timestamp + "\n")
    report.write("Anomaly Percentage : " + str(anomaly) + "\n")
    report.write("Anomaly Priority: " + priority + "\n")
    report.close()
    return abFrame

# Function to perform object detection on a video file
def objectDetection(filename):
    vid_obj_detect = VideoObjectDetection()  # Initialize a VideoObjectDetection instance
    vid_obj_detect.setModelTypeAsYOLOv3()  # Set the model type to YOLOv3
    vid_obj_detect.setModelPath('model/yolov3.pt')  # Set the path to the pre-trained YOLOv3 model
    vid_obj_detect.loadModel()  # Load the model

    # Detect objects in the video
    detected_vid_obj = vid_obj_detect.detectObjectsFromVideo(
        input_file_path=filename,
        output_file_path="videos/output",
        frames_per_second=30,
        log_progress=True,
        return_detected_frame=True
    )

    # Set the path of the input and output files for the ffmpeg command
    input_file = "videos/output.mp4"
    output_file = "static/output.mp4"
    # Set the options for the ffmpeg command
    ffmpeg_cmd = [
        "ffmpeg",
        "-i", input_file,
        "-c:v", "libx264",
        "-crf", "23",
        "-preset", "medium",
        "-c:a", "aac",
        "-b:a", "128k",
        "-movflags", "+faststart",
        "-vf", "scale=1280:-2",
        output_file
    ]
    # Execute the ffmpeg command
    subprocess.call(ffmpeg_cmd)
