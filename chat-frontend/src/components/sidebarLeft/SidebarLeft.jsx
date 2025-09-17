import React from "react";
import { MdChat, MdHistory } from "react-icons/md";
import { IoMdAddCircleOutline, IoMdPeople } from "react-icons/io";
import { IoSettingsOutline } from "react-icons/io5";
import { CgProfile } from "react-icons/cg";

const SidebarLeft = () => {
  return (
    <div className="w-14 bg-white flex flex-col items-center py-4 border border-collapse border-gray-300">
      <div className="flex flex-col space-y-2">
        {/* Chat */}
        <div className="relative group">
          <button className="text-black hover:text-black p-2 rounded-full hover:bg-gray-200">
            <MdChat className="w-5 h-5" />
          </button>
          <div
            className="absolute left-full top-1/2 -translate-y-1/2 ml-3 
            bg-black text-white text-[14px] px-3 py-0.5 rounded-full z-50
           hidden group-hover:flex transition-opacity whitespace-nowrap shadow-lg"
          >
            Chat
          </div>
        </div>

        {/* Invite */}
        <div className="relative group">
          <button className="text-black hover:text-black p-2 rounded-full hover:bg-gray-200">
            <IoMdAddCircleOutline className="w-5 h-5" />
          </button>
          <div
            className="absolute left-full top-1/2 -translate-y-1/2 ml-3
           bg-black text-white text-[14px] px-3 py-0.5 rounded-full z-50
           hidden group-hover:flex transition-opacity whitespace-nowrap shadow-lg"
          >
            Invite
          </div>
        </div>

        {/* Status */}
        <div className="relative group">
          <button className="text-black p-2 rounded-full hover:bg-gray-200">
            <MdHistory className="w-5 h-5" />
          </button>
          <div
            className="absolute left-full top-1/2 -translate-y-1/2 ml-3 
            bg-black text-white text-[14px] px-3 py-0.5 rounded-full  z-50
          hidden group-hover:flex transition-opacity whitespace-nowrap shadow-lg"
          >
            Status
          </div>
        </div>

        {/* Communities */}
        <div className="relative group">
          <button className="text-black p-2 rounded-full hover:bg-gray-200">
            <IoMdPeople className="w-5 h-5" />
          </button>
          <div
            className="absolute left-full top-1/2 -translate-y-1/2 ml-3 
           bg-black text-white text-[14px] px-3 py-0.5 rounded-full  z-50
           hidden group-hover:flex transition-opacity whitespace-nowrap shadow-lg"
          >
            Communities
          </div>
        </div>

        {/* Settings */}
        <div className="relative group">
          <button className="text-black p-2 rounded-full hover:bg-gray-200">
            <IoSettingsOutline className="w-4.5 h-4.5 ml-0.5" />
          </button>
          <div
            className="absolute left-full top-1/2 -translate-y-1/2 ml-3 
            bg-black text-white text-[14px] px-3 py-0.5 rounded-full  z-50
            hidden group-hover:flex transition-opacity whitespace-nowrap shadow-lg"
          >
            Settings
          </div>
        </div>
      </div>

      <div className="w-9 h-[0.5px] bg-slate-400 mt-2 cursor-pointer"></div>

      <div className="mt-auto">
        {/* Profile */}
        <div className="relative group">
          <button className="text-black p-2 rounded-full hover:bg-gray-200">
            <CgProfile className="w-5 h-5" />
          </button>
          <div
            className="absolute left-full top-1/2 -translate-y-1/2 ml-3 
           bg-black text-white text-[14px] px-3 py-0.5 rounded-full  z-50
           hidden group-hover:flex transition-opacity whitespace-nowrap shadow-lg"
          >
            Profile
          </div>
        </div>
      </div>
    </div>
  );
};

export default SidebarLeft;
