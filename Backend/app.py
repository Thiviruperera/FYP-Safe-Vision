
# Import necessary libraries
import json
from flask import Flask, render_template, request, url_for, send_from_directory, jsonify
from werkzeug.utils import secure_filename
from flask_cors import CORS, cross_origin
import service as serve

app = Flask(__name__) # Create an instance of Flask
cors = CORS(app) # Enable CORS for the app

# Define the default route for the app
@app.route('/')
def hello_world():
    # When the root route is accessed, return the string 'Safe Vision'
    return 'Safe Vision'

# Define a new route for file uploading
@app.route('/uploader', methods=['GET', 'POST'])
def upload_file():
    abFrames = []  # Initialize an empty list for abnormal frames
    if request.method == 'POST': # If the request method is POST, process the uploaded file
        f = request.files['file'] # Retrieve the file from the request
        f.save(secure_filename("input." + f.filename.split('.')[-1]))  # Save the file securely
        filename = str("input." + f.filename.split('.')[-1])  # Store the filename for later use
        abFrames = serve.makePredict(filename) # Call a function to make a prediction on the uploaded file
        # serve.makeVideo()
        serve.objectDetection(filename)  # Call a function to perform object detection on the uploaded file
        # Prepare a response with the video and report file URLs and prediction results
        result = jsonify(
            {"url": url_for('static', filename='output.mp4'), "report": url_for('static', filename='report.txt'),
             "abnormals": abFrames})
        f = open("static/data.json", "w")  # Open a file to save the response
        json.dump(result.get_json(), f)  # Write the response to the file
        f.close()  # Close the file
        return result # Return the result

# Define a new route for serving video files
@app.route('/videos/<path:path>')
def serve_static(path):
    # When the route is accessed, return the corresponding video file
    return send_from_directory('videos', path, mimetype='video/mp4')

# Run the Flask app only if the script is executed directly
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
