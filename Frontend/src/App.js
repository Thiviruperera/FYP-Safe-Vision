import React from "react";
import Home from "./components/home";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import {Detection} from "./components/detection";
import Navbar from "./components/navbar";
import DownloadButton from "./components/test";


function App() {
    return (
        <Router>
            <div>
                <Routes>
                    <Route exact path="/" element={<Home/>}/>
                    <Route exact path="/detection" element={<Detection/>}/>
                </Routes>
            </div>
        </Router>
    );
}

export default App;