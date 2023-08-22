import React from 'react';

class DownloadButton extends React.Component {
    downloadTextFile = () => {
        const url = 'http://127.0.0.1:5000/static/report.txt'; // Replace with your desired URL
        const fileName = 'report.txt'; // Replace with your desired file name

        // Fetch the text file contents from the URL
        fetch(url)
            .then(response => response.text())
            .then(text => {
                // Create a Blob from the fetched text data
                const blob = new Blob([text], { type: 'text/plain' });

                // Create a URL for the Blob object
                const blobUrl = URL.createObjectURL(blob);

                // Create a temporary anchor element to trigger the download
                const downloadLink = document.createElement('a');
                downloadLink.href = blobUrl;
                downloadLink.download = fileName;
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);

                // Clean up the Blob URL object
                URL.revokeObjectURL(blobUrl);
            })
            .catch(error => {
                console.error('Failed to download text file:', error);
            });
    }

    render() {
        return (
            <div>
                <button onClick={this.downloadTextFile}>Download Text File</button>
            </div>
        );
    }
}

export default DownloadButton;
