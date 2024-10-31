import React, { Fragment, useEffect, useState } from "react";
import { useUserAuth } from "../context/UserAuthContext";
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import Logo from "../assets/logo.svg";
import storeshoppy from "../assets/storeshoppy.svg";
import HomeIcon from "../assets/icon/Sidebarsvg/home.svg";
import AnalyticsIcon from "../assets/icon/Sidebarsvg/Analytics.svg";
import StatementIcon from "../assets/icon/Sidebarsvg/Statement.svg";
import SupportIcon from "../assets/icon/Sidebarsvg/support.svg";
import LogoutIcon from "../assets/icon/Sidebarsvg/Logout.svg";

const SideBar = () => {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();
    const { logOut } = useUserAuth();

    const handleLogout = async () => {
        try {
            await logOut();
            navigate("/");
        } catch (error) {
            // console.log(error.message);
        }
    };

    const handleMouseEnter = () => {
        setOpen(true);
    };

    const handleMouseLeave = () => {
        setOpen(false);
    };


    return (
        <div className="flex z-50" style={{ textAlign: !open ? '-webkit-center' : 'left' }}>
            <div
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                className={`${open ? "w-72 px-3 py-2" : "w-[5vw] p-2"} bg-dark-purple h-screen fixed duration-300 border-r-[1px] border-opacity-15  border-gray-300`}
            >
                <div className=" w-max">
                    {!open ? (
                        // <img className="pt-2 mb-[2rem] mt-[1rem] w-[1.89rem] " src={Logo} alt="Logo" />
                        <svg className="pt-2 mb-[2rem] mt-[1rem] w-[1.89rem] " viewBox="0 0 68 74" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M7.78125 35.7812C7.78125 28.5625 7.90625 22.1562 8.15625 16.5625L1.82812 15.5781C1.42188 14.4219 1.10938 13.1406 0.890625 11.7344C0.671875 10.3281 0.5625 8.96875 0.5625 7.65625C0.5625 6.65625 0.640625 5.5625 0.796875 4.375C4.89062 2.9375 10.2969 1.90625 17.0156 1.28125C23.7344 0.65625 30.2969 0.34375 36.7031 0.34375C41.4844 0.34375 45.5938 0.71875 49.0312 1.46875C52.4688 2.21875 55.3438 3.92187 57.6562 6.57812C60 9.20312 61.1719 13.1406 61.1719 18.3906C61.1719 20.5469 60.8281 22.9375 60.1406 25.5625C59.4531 28.1562 58.5 30.75 57.2812 33.3438C56.1562 35.7188 54.875 37.9844 53.4375 40.1406C52.0312 42.2656 50.5625 44.0938 49.0312 45.625C49.9375 48 50.875 50.1719 51.8438 52.1406C52.8125 54.0781 54.2969 56.4375 56.2969 59.2188L62.8594 56.4531C65.2969 58.5469 66.7188 61.3281 67.125 64.7969C67.125 64.9844 66.375 65.875 64.875 67.4688C63.4062 69.0625 61.4844 70.5469 59.1094 71.9219C56.7344 73.2656 54.0625 73.9375 51.0938 73.9375C48.7812 73.9375 46.7031 73.5312 44.8594 72.7188C43.0469 71.9062 41.5469 70.4844 40.3594 68.4531C39.2031 66.4531 38.2812 64.0781 37.5938 61.3281C36.9062 58.5781 36.4219 55.8594 36.1406 53.1719L25.4531 52.7031C25.7344 55.1406 26.0938 57.6562 26.5312 60.25C26.9688 62.8125 27.2344 64.3594 27.3281 64.8906C27.8594 67.9844 28.2031 70.0938 28.3594 71.2188C26.9219 72.0938 25.1719 72.7656 23.1094 73.2344C21.0781 73.7031 19 73.9375 16.875 73.9375C14.4375 73.9375 12.0781 73.6094 9.79688 72.9531C9.10938 70.2031 8.59375 65.3906 8.25 58.5156C7.9375 51.6094 7.78125 44.0312 7.78125 35.7812ZM36.9375 41.4062C38.0312 38.2812 38.8906 34.8906 39.5156 31.2344C40.1719 27.5469 40.7656 23.1562 41.2969 18.0625C40.3906 17.7188 39.2031 17.4531 37.7344 17.2656C36.2656 17.0781 34.8438 16.9844 33.4688 16.9844C30.3438 16.9844 28 17.0625 26.4375 17.2188C26.0938 28.9688 25.7188 37.2969 25.3125 42.2031L36.9375 41.4062Z" fill="#326DDF" fillOpacity="0.66"/>
                        </svg>

                    ) : (
                        // <img className="pt-2 pl-[%] mt-[1rem] mb-4 w-[10.5rem]" src={storeshoppy} alt="logo" />
                        <svg className="pt-2 pl-[%] mt-[1rem] mb-4 w-[10.5rem]" viewBox="0 0 463 98" fill="none" xmlns="http://www.w3.org/2000/svg">
                         <path d="M7.78125 39.7812C7.78125 32.5625 7.90625 26.1562 8.15625 20.5625L1.82812 19.5781C1.42188 18.4219 1.10938 17.1406 0.890625 15.7344C0.671875 14.3281 0.5625 12.9688 0.5625 11.6562C0.5625 10.6563 0.640625 9.5625 0.796875 8.375C4.89062 6.9375 10.2969 5.90625 17.0156 5.28125C23.7344 4.65625 30.2969 4.34375 36.7031 4.34375C41.4844 4.34375 45.5938 4.71875 49.0312 5.46875C52.4688 6.21875 55.3438 7.92187 57.6562 10.5781C60 13.2031 61.1719 17.1406 61.1719 22.3906C61.1719 24.5469 60.8281 26.9375 60.1406 29.5625C59.4531 32.1562 58.5 34.75 57.2812 37.3438C56.1562 39.7188 54.875 41.9844 53.4375 44.1406C52.0312 46.2656 50.5625 48.0938 49.0312 49.625C49.9375 52 50.875 54.1719 51.8438 56.1406C52.8125 58.0781 54.2969 60.4375 56.2969 63.2188L62.8594 60.4531C65.2969 62.5469 66.7188 65.3281 67.125 68.7969C67.125 68.9844 66.375 69.875 64.875 71.4688C63.4062 73.0625 61.4844 74.5469 59.1094 75.9219C56.7344 77.2656 54.0625 77.9375 51.0938 77.9375C48.7812 77.9375 46.7031 77.5312 44.8594 76.7188C43.0469 75.9062 41.5469 74.4844 40.3594 72.4531C39.2031 70.4531 38.2812 68.0781 37.5938 65.3281C36.9062 62.5781 36.4219 59.8594 36.1406 57.1719L25.4531 56.7031C25.7344 59.1406 26.0938 61.6562 26.5312 64.25C26.9688 66.8125 27.2344 68.3594 27.3281 68.8906C27.8594 71.9844 28.2031 74.0938 28.3594 75.2188C26.9219 76.0938 25.1719 76.7656 23.1094 77.2344C21.0781 77.7031 19 77.9375 16.875 77.9375C14.4375 77.9375 12.0781 77.6094 9.79688 76.9531C9.10938 74.2031 8.59375 69.3906 8.25 62.5156C7.9375 55.6094 7.78125 48.0312 7.78125 39.7812ZM36.9375 45.4062C38.0312 42.2812 38.8906 38.8906 39.5156 35.2344C40.1719 31.5469 40.7656 27.1562 41.2969 22.0625C40.3906 21.7188 39.2031 21.4531 37.7344 21.2656C36.2656 21.0781 34.8438 20.9844 33.4688 20.9844C30.3438 20.9844 28 21.0625 26.4375 21.2188C26.0938 32.9688 25.7188 41.2969 25.3125 46.2031L36.9375 45.4062ZM69.2344 49.7656C69.2344 44.3594 70.1406 39.5312 71.9531 35.2812C73.7656 31.0312 76.5625 27.6719 80.3438 25.2031C84.1562 22.7031 88.9062 21.4531 94.5938 21.4531C97.5625 21.4531 100.531 21.8125 103.5 22.5312C106.469 23.2188 108.984 24.375 111.047 26C112.953 27.5312 114.328 29.5625 115.172 32.0938C116.047 34.5938 116.484 37.375 116.484 40.4375C116.484 42.4688 116.312 44.5469 115.969 46.6719C115.594 47.2969 114.859 48.125 113.766 49.1562C112.672 50.1562 111.391 51.1406 109.922 52.1094C108.453 53.0781 107.031 53.8281 105.656 54.3594C104.344 54.4531 102.984 54.5 101.578 54.5C99.1094 54.5 96.6094 54.3906 94.0781 54.1719C91.5469 53.9531 89.3281 53.7031 87.4219 53.4219C87.6719 56.0781 88.4844 58.3906 89.8594 60.3594C91.2344 62.3281 93.4219 63.3125 96.4219 63.3125C96.7031 63.3125 97.1562 63.2812 97.7812 63.2188C99.6875 63.0312 101.906 62.5312 104.438 61.7188C107 60.875 109.547 59.9062 112.078 58.8125C113.266 60 114.141 61.1875 114.703 62.375C115.266 63.5625 115.656 65.2656 115.875 67.4844C114.906 68.6094 113.328 69.9844 111.141 71.6094C108.984 73.2344 106.344 74.7031 103.219 76.0156C100.094 77.2969 96.8281 77.9375 93.4219 77.9375C88.2969 77.9375 83.9062 76.7031 80.25 74.2344C76.625 71.7344 73.875 68.3594 72 64.1094C70.1562 59.8281 69.2344 55.0469 69.2344 49.7656ZM99.4219 38.9844C98.9844 38.5156 98.25 38.1562 97.2188 37.9062C96.1875 37.625 95.1094 37.4844 93.9844 37.4844C93.0781 37.4844 92.1562 37.5625 91.2188 37.7188C90.3125 37.875 89.7656 38.0469 89.5781 38.2344C88.5156 40.3281 87.8438 42.7031 87.5625 45.3594L100.078 44.1406L99.4219 38.9844ZM122.906 49.9531C122.906 45.2031 123.562 40.6562 124.875 36.3125C126.219 31.9688 128.312 28.4062 131.156 25.625C134.031 22.8438 137.641 21.4531 141.984 21.4531C146.859 21.4531 151.516 23 155.953 26.0938L156.703 25.625C156.609 21.9688 156.156 18.6562 155.344 15.6875L145.828 15.0781C145.391 14.5156 145.047 13.6875 144.797 12.5938C144.547 11.4688 144.422 10.3125 144.422 9.125C144.422 7.53125 144.609 6.15625 144.984 5C146.859 3.65625 149.266 2.64063 152.203 1.95312C155.141 1.26562 158.078 0.921875 161.016 0.921875C164.266 0.921875 166.719 1.60938 168.375 2.98438C170.031 4.32813 171.141 6.375 171.703 9.125C172.297 11.8438 172.594 15.625 172.594 20.4688C172.594 26.8438 172.328 34.0781 171.797 42.1719C171.266 50.2656 170.578 56.875 169.734 62L169.547 62.7969L174.984 60.4531C175.891 61.4219 176.688 62.6094 177.375 64.0156C178.094 65.3906 178.547 66.9844 178.734 68.7969C178.297 69.7344 177.344 70.9375 175.875 72.4062C174.406 73.8438 172.609 75.125 170.484 76.25C168.359 77.375 166.141 77.9375 163.828 77.9375C161.234 77.9375 159.234 77.1719 157.828 75.6406C156.453 74.0781 155.766 72.0938 155.766 69.6875C155.766 69.0625 155.922 67.7812 156.234 65.8438C156.578 63.9062 156.859 62.5625 157.078 61.8125L155.672 61.3906C154.078 66.9844 151.969 71.1406 149.344 73.8594C146.719 76.5781 143.469 77.9375 139.594 77.9375C135.438 77.9375 132.109 76.5625 129.609 73.8125C127.141 71.0312 125.406 67.5469 124.406 63.3594C123.406 59.1719 122.906 54.7031 122.906 49.9531ZM155.062 49.1094C155.25 47.9844 155.344 46.6719 155.344 45.1719C155.344 44.2031 155.297 43.2812 155.203 42.4062C155.141 41.5312 155.062 40.9062 154.969 40.5312C153.719 39.625 152.297 38.9844 150.703 38.6094C149.141 38.2344 147.703 38.0469 146.391 38.0469C145.578 38.0469 144.703 38.125 143.766 38.2812C143.141 38.9062 142.641 40.2656 142.266 42.3594C141.891 44.4219 141.703 46.75 141.703 49.3438C141.703 52.125 141.891 54.8281 142.266 57.4531C142.672 60.0469 143.234 62.0781 143.953 63.5469C144.453 63.5469 145.422 62.7812 146.859 61.25C148.328 59.6875 149.844 57.7812 151.406 55.5312C152.969 53.25 154.188 51.1094 155.062 49.1094ZM181.5 36.5938C180.969 34.3125 180.625 32.6406 180.469 31.5781C180.312 30.5156 180.234 28.9062 180.234 26.75C182.078 25 184.062 23.6875 186.188 22.8125C188.312 21.9062 190.703 21.4531 193.359 21.4531C201.422 21.4531 205.453 25.5 205.453 33.5938C205.453 35.75 205.25 38.25 204.844 41.0938C204.469 43.9375 203.922 47.5156 203.203 51.8281C203.109 52.3906 202.859 53.9062 202.453 56.375C202.047 58.8438 201.766 60.9062 201.609 62.5625C202.141 63.125 202.797 63.5156 203.578 63.7344C203.953 63.7344 204.812 62.9688 206.156 61.4375C207.531 59.875 209 57.9844 210.562 55.7656C212.125 53.5469 213.406 51.5 214.406 49.625C214.656 45.1562 215 41.0469 215.438 37.2969L210.516 36.3125C210.109 34.75 209.828 33.375 209.672 32.1875C209.516 31 209.438 29.7344 209.438 28.3906L209.484 27.0781C210.609 25.6406 212.297 24.3438 214.547 23.1875C216.797 22.0312 219.375 21.4531 222.281 21.4531C230.344 21.4531 234.375 25.5 234.375 33.5938C234.375 36.875 233.828 41.2031 232.734 46.5781C231.641 51.9219 230.359 57.3281 228.891 62.7969L234.281 60.4531C235.188 61.4219 235.984 62.6094 236.672 64.0156C237.391 65.3906 237.844 66.9844 238.031 68.7969C237.594 69.7344 236.641 70.9375 235.172 72.4062C233.703 73.8438 231.906 75.125 229.781 76.25C227.656 77.375 225.438 77.9375 223.125 77.9375C220.531 77.9375 218.531 77.1719 217.125 75.6406C215.75 74.0781 215.062 72.0938 215.062 69.6875C215.062 69.0625 215.219 67.7812 215.531 65.8438C215.875 63.9062 216.156 62.5625 216.375 61.8125L215.062 61.3906C213.5 66.8594 211.344 70.9844 208.594 73.7656C205.875 76.5469 202.766 77.9375 199.266 77.9375C194.234 77.9375 190.688 76.2812 188.625 72.9688C186.562 69.625 185.531 65.4844 185.531 60.5469C185.531 51.2656 185.844 43.5156 186.469 37.2969L181.5 36.5938ZM239.906 59.8438C241.406 58 242.891 56.6719 244.359 55.8594C245.828 55.0469 247.703 54.5312 249.984 54.3125C250.391 54.6562 250.984 55.3906 251.766 56.5156C252.547 57.6094 253 58.25 253.125 58.4375L254.109 59.8906L258.047 50.1406L251.766 40.6719L246.141 43.7188L240.281 37.3438C240.812 35.0938 241.75 32.7656 243.094 30.3594C244.438 27.9219 246.219 25.8438 248.438 24.125C250.656 22.4062 253.219 21.5469 256.125 21.5469C262.688 21.5469 266.469 28.0469 267.469 41.0469H268.219C269.031 36.2031 269.75 32.5469 270.375 30.0781C271 27.6094 271.812 25.7812 272.812 24.5938C274.531 22.5312 276.672 21.5 279.234 21.5C281.016 21.5 282.734 22.0469 284.391 23.1406C286.047 24.2344 287.453 25.8281 288.609 27.9219C289.672 29.9219 290.516 31.875 291.141 33.7812C291.797 35.6562 292.141 37.6094 292.172 39.6406C290.828 41.2656 289.281 42.5625 287.531 43.5312C285.812 44.4688 283.969 45.0625 282 45.3125C281.531 44.875 280.797 44 279.797 42.6875C278.797 41.375 278.094 40.2969 277.688 39.4531L272.25 49.9531L279.609 59.6094L285.562 55.1562L291.891 60.2188C291.641 63 290.906 65.75 289.688 68.4688C288.469 71.1875 286.781 73.4531 284.625 75.2656C282.5 77.0469 280 77.9375 277.125 77.9375C274.281 77.9375 271.969 76.9844 270.188 75.0781C268.438 73.1719 267.125 70.9844 266.25 68.5156C265.375 66.0469 264.516 62.9844 263.672 59.3281H262.641C262.078 62.5469 261.438 65.4219 260.719 67.9531C260.031 70.4531 258.891 72.75 257.297 74.8438C255.703 76.9062 253.609 77.9375 251.016 77.9375C248.859 77.9375 246.938 76.9219 245.25 74.8906C243.594 72.8281 242.297 70.3594 241.359 67.4844C240.422 64.6094 239.938 62.0625 239.906 59.8438ZM300.984 42.3125C300.984 32.875 301.125 25.625 301.406 20.5625H301.359L294.656 19.5781C294.25 18.4219 293.938 17.1406 293.719 15.7344C293.5 14.3281 293.391 12.9688 293.391 11.6562C293.391 10.6563 293.469 9.5625 293.625 8.375C297.469 7 302.766 5.98438 309.516 5.32812C316.266 4.67188 322.766 4.34375 329.016 4.34375C333.797 4.34375 337.906 4.71875 341.344 5.46875C344.781 6.21875 347.656 7.92187 349.969 10.5781C352.312 13.2031 353.484 17.1406 353.484 22.3906C353.484 25.0156 352.922 28.0781 351.797 31.5781C350.703 35.0469 349.297 38.4375 347.578 41.75C345.891 45.0312 344.188 47.6875 342.469 49.7188C339.938 52.75 337.125 54.5312 334.031 55.0625C328.906 55.875 323.484 56.2812 317.766 56.2812C317.641 59.5 317.594 61.8125 317.625 63.2188L324.609 62.75C326.047 65.0938 326.844 67.875 327 71.0938C327 71.25 326.297 71.9219 324.891 73.1094C323.484 74.2969 321.625 75.3906 319.312 76.3906C317.031 77.3906 314.406 77.8906 311.438 77.8906C308.5 77.8906 306.156 77.0938 304.406 75.5C302.688 73.875 301.828 71.0781 301.828 67.1094C301.297 60.6094 301.031 52.3594 301.031 42.3594L300.984 42.3125ZM330.656 43.1094C331.469 39.6719 332.141 36.0312 332.672 32.1875C333.234 28.3125 333.547 24.9375 333.609 22.0625C333.453 21.7812 332.656 21.5312 331.219 21.3125C329.781 21.0938 327.922 20.9844 325.641 20.9844C324.047 20.9844 322.062 21.0469 319.688 21.1719C319.406 30.6094 319.031 38.1875 318.562 43.9062L330.656 43.1094ZM371.953 46.1094C373.797 46.1094 375.828 46.2969 378.047 46.6719C380.297 47.0469 382.359 47.5 384.234 48.0312V46.5781C384.234 45.6094 384.203 44.5312 384.141 43.3438C384.109 42.1562 384.047 41.375 383.953 41C383.672 40.4688 382.859 39.9219 381.516 39.3594C380.203 38.7969 378.047 38.5156 375.047 38.5156C373.203 38.5156 371.297 38.75 369.328 39.2188C367.391 39.6562 365.234 40.25 362.859 41C361.578 38.875 360.547 36.8594 359.766 34.9531C359.016 33.0156 358.641 31.0781 358.641 29.1406C358.641 28.5469 358.688 27.9531 358.781 27.3594C363.844 23.4219 370.391 21.4531 378.422 21.4531C382.859 21.4531 386.797 21.9531 390.234 22.9531C393.672 23.9531 396.5 25.8906 398.719 28.7656C400.938 31.6406 402.047 35.7188 402.047 41C402.047 46.1562 401.438 51.1562 400.219 56C399.031 60.8125 398.422 63.2656 398.391 63.3594L405.188 60.4531C406.094 61.4219 406.891 62.6094 407.578 64.0156C408.297 65.3906 408.75 66.9844 408.938 68.7969C408.5 69.7344 407.547 70.9375 406.078 72.4062C404.609 73.8438 402.812 75.125 400.688 76.25C398.562 77.375 396.344 77.9375 394.031 77.9375C391.438 77.9375 389.469 77.1719 388.125 75.6406C386.812 74.1094 386.156 72.125 386.156 69.6875C386.156 68.3125 386.359 66.9219 386.766 65.5156L385.359 65.0938C384.484 70.0312 382.625 73.4062 379.781 75.2188C376.938 77.0312 373.797 77.9375 370.359 77.9375C368.109 77.9375 365.938 77.3125 363.844 76.0625C361.75 74.7812 360.047 72.9375 358.734 70.5312C357.422 68.0938 356.766 65.25 356.766 62C356.766 56.8125 358.062 52.875 360.656 50.1875C363.25 47.4688 367.016 46.1094 371.953 46.1094ZM377.297 63.9688C378.078 63.8125 379 63.375 380.062 62.6562C381.156 61.9375 382.125 61.0781 382.969 60.0781C383.812 59.0781 384.312 58.125 384.469 57.2188L384.188 56.0938C382.531 55.875 380.766 55.7656 378.891 55.7656C377.297 55.7656 376.203 55.8906 375.609 56.1406C374.609 57.2656 374.109 58.5156 374.109 59.8906C374.109 60.8906 374.359 61.7969 374.859 62.6094C375.391 63.4219 376.203 63.875 377.297 63.9688ZM427.875 71.1406C427.281 68.8281 426.172 65.4844 424.547 61.1094C422.922 56.7031 421.219 52.4688 419.438 48.4062C417.656 44.3438 416.25 41.5469 415.219 40.0156L410.906 39.2656C410.469 38.0469 410.125 36.7031 409.875 35.2344C409.656 33.7344 409.469 32 409.312 30.0312C409.844 28.5625 410.656 27.1719 411.75 25.8594C412.844 24.5469 414.156 23.4844 415.688 22.6719C417.25 21.8594 418.938 21.4531 420.75 21.4531C423.719 21.4531 426.172 22.2969 428.109 23.9844C430.078 25.6406 431.594 27.7344 432.656 30.2656C433.75 32.7656 434.703 35.7188 435.516 39.125C437.172 45.7188 438.234 53.8906 438.703 63.6406L439.734 63.4531C440.953 60.7344 441.984 56.8438 442.828 51.7812C443.703 46.7188 444.172 41.8594 444.234 37.2031L438.375 36.3125C437.688 33.6875 437.344 30.6094 437.344 27.0781C438.031 26.2344 439.016 25.3906 440.297 24.5469C441.609 23.6719 443.156 22.9375 444.938 22.3438C446.719 21.75 448.609 21.4531 450.609 21.4531C458.672 21.4531 462.703 25.5 462.703 33.5938C462.703 39.9688 461.547 46.1562 459.234 52.1562C456.953 58.1562 453.516 63.5781 448.922 68.4219C444.328 73.2656 438.734 77.0781 432.141 79.8594L432.516 81.4062C433.359 81.5 434.188 81.5469 435 81.5469C437.656 81.5469 440.859 81.1094 444.609 80.2344C446.734 82.6094 447.797 85.2031 447.797 88.0156C447.797 88.8594 447.703 89.7188 447.516 90.5938C445.641 92.4062 443.297 93.9688 440.484 95.2812C437.672 96.5938 434.578 97.25 431.203 97.25C426.297 97.25 422.328 96.1406 419.297 93.9219C416.266 91.7031 414.75 88.3281 414.75 83.7969C414.75 81.7656 415.359 79.9844 416.578 78.4531C417.828 76.9531 419.266 75.7344 420.891 74.7969C422.547 73.8281 424.875 72.6094 427.875 71.1406Z" fill="#326DDF" fillOpacity="0.66"/>
                        </svg>

                    )}
                </div>

                <ul className="pt-">
                    <li
                        onClick={() => { navigate('/'); }}
                        className={`flex ${!open && 'justify-center'} rounded-md p-2 cursor-pointer hover:bg-light-white text-gray-300 text-sm items-center gap-x-4 
                                mt-2 transition-all`}
                    >
                        <div className="flex items-center gap-x-4">
                            <img className="w-6" src={HomeIcon} alt="Home" />
                            <span className={`origin-left text-nowrap duration-200 transition-opacity ${!open && "hidden"}`}>
                                Home
                            </span>
                        </div>
                    </li>
                    <li
                        onClick={() => { navigate('/payouts'); }}
                        className={`flex ${!open && 'justify-center'} rounded-md p-2 cursor-pointer hover:bg-light-white text-gray-300 text-sm items-center gap-x-4 
                                mt-2 transition-all`}
                    >
                        <div className="flex items-center gap-x-4">
                            <img className="w-6" src={AnalyticsIcon} alt="Payouts" />
                            <span className={`origin-left text-nowrap duration-200 transition-opacity ${!open && "hidden"}`}>
                                Payouts
                            </span>
                        </div>
                    </li>
                    <li
                        onClick={() => { navigate('/ledger'); }}
                        className={`flex ${!open && 'justify-center'} rounded-md p-2 cursor-pointer hover:bg-light-white text-gray-300 text-sm items-center gap-x-4 
                                mt-2 transition-all`}
                    >
                        <div className="flex items-center gap-x-4">
                            <img className="w-6" src={StatementIcon} alt="Account Statement" />
                            <span className={`origin-left text-nowrap duration-200 transition-opacity ${!open && "hidden"}`}>
                                Account Statement
                            </span>
                        </div>
                    </li>
                    <li
                        onClick={() => { navigate('/analytics'); }}
                        className={`flex ${!open && 'justify-center'} rounded-md p-2 cursor-pointer hover:bg-light-white text-gray-300 text-sm items-center gap-x-4 
                                mt-2 transition-all`}
                    >
                        <div className="flex items-center gap-x-4">
                            <img className="w-6" src={AnalyticsIcon} alt="Analytics" />
                            <span className={`origin-left text-nowrap duration-200 transition-opacity ${!open && "hidden"}`}>
                                Analytics
                            </span>
                        </div>
                    </li>
                    <li
                        onClick={() => { navigate('/requestcall'); }}
                        className={`flex ${!open && 'justify-center'} rounded-md p-2 cursor-pointer hover:bg-light-white text-gray-300 text-sm items-center gap-x-4 
                                mt-2 transition-all`}
                    >
                        <div className="flex items-center gap-x-4">
                            <img className="w-6" src={SupportIcon} alt="Support" />
                            <span className={`origin-left text-nowrap duration-200 transition-opacity ${!open && "hidden"}`}>
                                Support
                            </span>
                        </div>
                    </li>
                    <li
                        onClick={handleLogout}
                        className={`flex ${!open && 'justify-center'} rounded-md p-2 cursor-pointer hover:bg-light-white text-gray-300 text-sm items-center gap-x-4 
                                mt-2 transition-all`}
                    >
                        <div className="flex items-center gap-x-4">
                            <img className="w-6" src={LogoutIcon} alt="Logout" />
                            <span className={`origin-left text-nowrap duration-200 transition-opacity ${!open && "hidden"}`}>
                                Logout
                            </span>
                        </div>
                    </li>
                </ul>
            </div>
            {/* <div className='h-full overflow-y-scroll w-full hide-scrollbar '>
                <TopBar />
                <UserBankAccountForm />
            </div> */}
        </div>

    );
};

export default SideBar;