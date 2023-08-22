import React, {useEffect, useRef, useState} from "react";
import {
    MdCloudUpload,
    MdDelete,
    MdPause,
    MdPlayArrow,
    MdSearch,
} from "react-icons/md";
import {Backdrop, CircularProgress} from "@mui/material";
import {useNavigate} from "react-router-dom";
import logo from "../assets/logo.png";
import {Bars3Icon, XMarkIcon} from "@heroicons/react/24/solid";

export function Home() {

    const navigate = useNavigate();

    const [nav, setNav] = useState(false)
    const handleClick = () => setNav(!nav)

    // preloader
    useEffect(() => {
        setIsLoading(false);
    }, []);
    const [isLoading, setIsLoading] = useState(true);


    //video-file
    let [videoFile, setVideoFile] = useState();
    let [videoURL, setVideoURL] = useState();
    const handleVideoChange = (e) => {
        setVideoFile(e.target.files[0]);
        setVideoURL(URL.createObjectURL(e.target.files[0]));
    };
    const videoRef = useRef();

    //player-button
    const handlePlay = () => {
        videoRef.current.play();
    };
    const handlePause = () => {
        videoRef.current.pause();
    };

    //video-upload-function
    const upload = async (event) => {
        event.preventDefault();

        setIsLoading(true);
        const formData = new FormData();
        formData.append("file", videoFile);
        console.log(videoFile);
        try {
            const response = await fetch(
                "http://127.0.0.1:5000/uploader",
                {
                    method: "POST",
                    //mode: "no-cors",
                    body: formData,
                }
            );

            if (response.ok) {
                const data = await response.json();
                //console.log(data.abnormals);
                navigate(`/detection?data=${data.abnormals}`);

            } else {

            }
        } catch (error) {

        }
    };


    return (
        <div>
            <div className="h-[80px] z-10 bg-zinc-200  drop-shadow-lg">
                <div className="px-2 flex justify-between items-center w-full h-full">
                    <div className="flex items-center">
                        <img className="mx-3" src={logo} width={60}/>
                        <h1 className="text text-3xl font-medium text-blue-500 mr-4  sm:text-4xl">Safe Vision</h1>
                    </div>
                </div>
            </div>
            <div
                className="bg-slate-900 flex h-screen justify-center items-center grid grid-cols-1 xl:px-[300px] lg:p-10 md:p-5 p-5">

                {isLoading ? (
                    <div>
                        <Backdrop
                            sx={{color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1}}
                            open
                        >
                            <CircularProgress color="inherit"/>
                        </Backdrop>
                    </div>
                ) : (
                    <div></div>
                )}

                <div
                    className="bg-white mt-[-250px] border-2 rounded-xl xl:h-[780px] lg:h-[600px] md:h-[500px] grid xl:p-5 lg:p-5 md:p-5 p-5">
                    <div
                        className="xl:h-[700px] lg:h-[550px] md:h-[450px]  flex justify-center items-center bg-slate-200 rounded-xl border-2 ">
                        <div>
                            <form action="frontend/src" encType="multipart/form-data">
                                <input
                                    type="file"
                                    accept="video/*"
                                    className="input-box"
                                    hidden
                                    onChange={handleVideoChange}
                                />

                                {videoFile ? (
                                    <video className="rounded-xl" ref={videoRef}>
                                        <source src={videoURL} height={500} type={videoFile.type}/>
                                    </video>
                                ) : (
                                    <div className="flex justify-center items-center">
                                        <h1 className="text-gray-700 text-4xl px-2">Upload video</h1>
                                        <MdCloudUpload
                                            className="cursor-pointer"
                                            onClick={() => document.querySelector(".input-box").click()}
                                            color="#1475cf"
                                            size={100}
                                        />
                                    </div>
                                )}
                            </form>
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
                                setVideoFile(null);
                            }}
                        >
                            <MdDelete size={30}/>
                        </button>
                        <button
                            onClick={upload}
                            className="p-1 text-lg w-20 rounded-md bg-indigo-600 text-white font-medium"
                        >
                            <MdSearch size={30}/>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

}

export default Home;
