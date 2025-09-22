import React, { memo } from "react";
import { MdChat, MdHistory } from "react-icons/md";
import { IoMdAddCircleOutline, IoMdPeople } from "react-icons/io";
import { IoSettingsOutline } from "react-icons/io5";
import { CgProfile } from "react-icons/cg";

const TooltipButton = ({ icon: Icon, label, onClick }) => (
  <div className="relative group">
    <button
      onClick={onClick}
      className="text-black p-2 rounded-full hover:bg-gray-200"
    >
      <Icon className="w-5 h-5" />
    </button>
    <div
      className="absolute left-full top-1/2 -translate-y-1/2 ml-3 
        bg-black text-white text-[13px] px-3 py-0.5 rounded-full z-50
        hidden group-hover:flex transition-opacity whitespace-nowrap shadow-lg"
    >
      {label}
    </div>
  </div>
);

const SidebarLeft = ({ setActiveView }) => {
  const menuItems = [
    { icon: MdChat, label: "Chat" },
    { icon: IoMdAddCircleOutline, label: "Invite", action: () => setActiveView("invite") },
    { icon: MdHistory, label: "Status" },
    { icon: IoMdPeople, label: "Communities" },
    { icon: IoSettingsOutline, label: "Settings" },
  ];

  return (
    <div className="w-14 bg-white flex flex-col items-center py-4 border border-gray-300">
      {/* Top Menu */}
      <div className="flex flex-col space-y-2">
        {menuItems.map((item, idx) => (
          <TooltipButton
            key={idx}
            icon={item.icon}
            label={item.label}
            onClick={item.action}
          />
        ))}
      </div>

      {/* Divider */}
      <div className="w-9 h-[0.5px] bg-slate-400 mt-2 cursor-pointer"></div>

      {/* Profile */}
      <div className="mt-auto">
        <TooltipButton
          icon={CgProfile}
          label="Profile"
          onClick={() => setActiveView("profile")}
        />
      </div>
    </div>
  );
};

export default memo(SidebarLeft);
