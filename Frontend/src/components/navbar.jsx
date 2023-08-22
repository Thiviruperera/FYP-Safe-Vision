import React, {useState} from "react";
import {Bars3Icon, XMarkIcon} from '@heroicons/react/24/solid'
import logo from '../assets/logo.png';

function Navbar() {
    const [nav, setNav] = useState(false)
    const handleClick = () => setNav(!nav)

    return (
        <div className="h-[80px] z-10 bg-zinc-200  drop-shadow-lg">
            <div className="px-2 flex justify-between items-center w-full h-full">
                <div className="flex items-center">
                    <img className="mx-3" src={logo} width={60}/>
                    <h1 className="text text-3xl font-medium text-blue-500 mr-4  sm:text-4xl">Safe Vision</h1>
                    <ul className='hidden md:flex'>

                    </ul>
                </div>
                <div className="hidden md:flex pr-4">
                    <button className="px-8 py-3 text-white bg-blue-500 hover:bg-blue-600 rounded-xl">Generate Report</button>
                </div>
                <div className="md:hidden mr-4" onClick={handleClick}>
                    {!nav ? <Bars3Icon className="w-6"/> : <XMarkIcon className="w-6"/>}

                </div>
            </div>
            <ul className={!nav ? 'hidden' : 'absolute bg-zinc-200 w-full px-8'}>

                <div className="flex flex-col my-4">
                    <button className="px-8 py-3">Generate Report</button>
                </div>
            </ul>

        </div>);
}

export default Navbar;