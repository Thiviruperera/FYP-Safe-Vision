import React, {useRef, useEffect, useState} from 'react';
import {useLocation} from "react-router-dom";
import logo from "../assets/logo.png";
import nomalImg from "../assets/green.png";
import abnormalImg from "../assets/red.png"
import {Bars3Icon, XMarkIcon} from "@heroicons/react/24/solid";
import {MdPause, MdPlayArrow} from "react-icons/md";

// Main component for video anomaly detection
export function Detection() {

    // Function to navigate back to the home page
    function homeNavigate() {
        window.location.href = "http://127.0.0.1:3000";
    }
    
    // URL of the video to be played
    const videoURL = "http://127.0.0.1:5000/static/output.mp4";

    // State and handler for navigation
    const [nav, setNav] = useState(false)
    const handleClick = () => setNav(!nav)

    // Reference to the video element
    const videoElementRef = useRef(null);

    // Handlers for play and pause buttons
    const handlePlay = () => {
        videoElementRef.current.play();
    };
    const handlePause = () => {
        videoElementRef.current.pause();
    };

    // Get query params from the URL
    const location = useLocation();

    const queryParams = new URLSearchParams(location.search);
    const data = queryParams.get('data');
    const dataArray = data.split(",");
    let dataTimeArray = [];
    for (const dataArrayKey in dataArray) {
        // console.log(dataArrayKey);
        // console.log(Math.round(dataArrayKey / 30));
        dataTimeArray.push(Math.round(dataArrayKey / 30));
    }
    dataTimeArray = [...new Set(dataTimeArray)];
    // console.log(dataTimeArray);
    // console.log(data);
    //dataTimeArray = [1, 2, 3, 4, 5, 6, 8, 16, 18, 20];

    // Function to slice the array of data
    function arraySlice(data) {
        const dataArray2 = data;
        const slicedDataArray = [];

        let tempArray = [];
        for (let i = 0; i < dataArray2.length; i++) {
            const currentNum = dataArray2[i];
            const nextNum = dataArray2[i + 1];
            tempArray.push(currentNum);

            if (nextNum !== currentNum + 1) {
                slicedDataArray.push(tempArray);
                tempArray = [];
            }
        }
        return (slicedDataArray);
    }

    // Determine the range of non-anomalous time points
    const notIn = [];

    for (let i = 0; i < dataTimeArray.length - 1; i++) {
        const currentNum = dataTimeArray[i];
        const nextNum = dataTimeArray[i + 1];

        if (nextNum !== currentNum + 1) {
            for (let j = currentNum + 1; j < nextNum; j++) {
                notIn.push(j);
            }
        }
    }

    
    // Compute the abnormal and normal ranges
    const abnormal = arraySlice(dataTimeArray);
    const normal = arraySlice(notIn);
    console.log(abnormal);
    console.log(normal);

    let normal2 = true;
    if (abnormal.length > 0 && normal.length > 0) {
        if (normal[0][0] < abnormal[0][0]) {
            normal2 = true;
        } else {
            normal2 = false;
        }
    } else {
        if (normal.length > 0) {
            normal2 = true;
        } else {
            normal2 = false;
        }
    }
    // console.log(normal2);

    // anomaly detection result
    const handleTimeUpdate = () => {
        const currentTime = Math.round(videoElementRef.current.currentTime);
        // console.log('Current frame number:', currentTime);
        const bulb = document.getElementById('bulb');
        let videoLength = document.getElementById('videolength');
        
        // If the current time is in the list of abnormal times, set the bulb image to abnormal
        if (dataTimeArray.includes(currentTime)) {
            console.log('Abnormal');
            bulb.src = abnormalImg;

        } else {
            // Otherwise, set the bulb image to normal
            console.log('Normal');
            bulb.src = nomalImg;
        }

        const url = 'http://127.0.0.1:5000/static/report.txt';

    };


    useEffect(() => {
        readText();
        // Add event listener for "timeupdate" on component mount
        videoElementRef.current.addEventListener('timeupdate', handleTimeUpdate);
        return () => {
            // Remove event listener on component unmount
            videoElementRef.current.removeEventListener('timeupdate', handleTimeUpdate);
        };

    }, []);

    let detectionText = "";

    // Function to read detection report text file
    function readText() {

        const url = 'http://127.0.0.1:5000/static/report.txt';
        let detect = document.getElementById('detect');
        let detectBox = document.getElementById('detectBox');
        let anomalP = document.getElementById('anomalPerecentage');


        fetch(url)
            .then(response => response.text())
            .then(text => {

                console.log(text);
                const lines = text.split(/\r\n|\n/);
                
                // Change the color of the detection box based on the detection result
                detectionText = lines[0];
                if (detectionText === 'Anomaly Detected') {
                    console.log("abnormal");
                    detect.innerText = detectionText;
                    detectBox.className = "bg-red-600 p-2";
                } else {
                    console.log("normal");
                    detect.innerText = detectionText;
                    detectBox.className = "bg-green-600 p-2";
                }

                let anomalPercentage = lines[3];
                anomalPercentage = Math.round(anomalPercentage.split(":")[1].trim()*100)/100;
                console.log(anomalPercentage);
                anomalP.innerText = "Anomaly Percentage :  " + anomalPercentage;



            })
            .catch(error => {
                console.error('Failed to download text file:', error);
            });
    }

    // Function to download the detection report text file
    function downloadTextFile() {

        const url = 'http://127.0.0.1:5000/static/report.txt';
        const fileName = 'report.txt'; //

        fetch(url)
            .then(response => response.text())
            .then(text => {

                const blob = new Blob([text], {type: 'text/plain'});
                const blobUrl = URL.createObjectURL(blob);
                const downloadLink = document.createElement('a');
                downloadLink.href = blobUrl;
                downloadLink.download = fileName;
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
                URL.revokeObjectURL(blobUrl);

            })
            .catch(error => {
                console.error('Failed to download text file:', error);
            });
    }
    // Render the video player, the bulb image, and the detection box
    return (
        <div>
            <div className="h-[80px] z-10 bg-zinc-200  drop-shadow-lg">
                <div className="px-2 flex justify-between items-center w-full h-full">
                    <div className="flex items-center">
                        <img className="mx-3" src={logo} width={60}/>
                        <h1 className="text text-3xl font-medium text-blue-500 mr-4  sm:text-4xl">Safe Vision</h1>
                        <ul className='hidden md:flex'>

                        </ul>
                    </div>
                    <div className="hidden md:flex pr-4">
                        <button onClick={downloadTextFile}
                                className="px-8 py-3 text-white bg-blue-500 hover:bg-blue-600 rounded-xl">Generate
                            Report
                        </button>
                    </div>
                    <div className="md:hidden mr-4" onClick={handleClick}>
                        {!nav ? <Bars3Icon className="w-6"/> : <XMarkIcon className="w-6"/>}

                    </div>
                </div>
                <ul className={!nav ? 'hidden' : 'absolute bg-zinc-200 w-full px-8'}>

                    <div className="flex flex-col my-4">
                        <button className="px-8 py-3" onClick={downloadTextFile}>Generate Report</button>
                    </div>
                </ul>
            </div>
            <div
                className="bg-slate-900 flex  justify-center items-center grid grid-cols-2 xl:px-[20px] lg:p-10 md:p-5 p-5">
                <div
                    className="bg-white border-2 rounded-xl xl:w-[1500px] lg:w-[800px] md:w-[650px] xl:h-[780px] lg:h-[600px] md:h-[500px] grid xl:p-5 lg:p-5 md:p-5 p-5">
                    <div
                        className="xl:h-[700px] lg:h-[550px] md:h-[450px]  flex justify-center items-center bg-slate-200 rounded-xl border-2 ">
                        <div>
                            <video className="xl:w-[900px] lg:w-[720px] md:w-[590px] rounded-xl" ref={videoElementRef}
                                   autoPlay controls>
                                <source src={videoURL}/>
                            </video>
                        </div>
                    </div>
                    <div className="mt-3 flex-row flex gap-2 justify-center items-center h-[35px] rounded">
                        <button
                            onClick={handlePlay}
                            className="p-1 text-lg w-20 rounded-md bg-green-500 text-white font-medium"
                        >
                            <MdPlayArrow size={30}/>
                        </button>
                        <button
                            onClick={handlePause}
                            className="p-1 text-lg w-20 rounded-md bg-yellow-400 text-gray-800 font-medium"
                        >
                            <MdPause size={30}/>
                        </button>
                        <button
                            className="p-1 w-20 text-lg rounded-md bg-red-500 text-white font-medium"
                            onClick={() => {
                                homeNavigate();
                            }}
                        >
                            BACK
                        </button>
                    </div>
                </div>
                <div className="flex grid grid-rows-2 justify-end items-center xl:mx-16 mb-3">
                    <img id="bulb" className="round h-[170px] w-[170px]"/>
                    <div className="mt-[150px]">
                        <div id="detectBox">
                            <h4 id="detect" className="text-white"></h4>
                        </div>
                        <h4 id="anomalPerecentage" className="text-white mt-2"> </h4>
                    </div>
                </div>

            </div>

        </div>
    );

}
