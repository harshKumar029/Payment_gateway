import React from 'react';
import SideBar from "./components/SideBar";
// import TopBar from './TopBar';

const AuthenticatedLayout = ({ children }) => {
    // console.log("AuthenticatedLayout rendering");
    // console.log("Child: ", children);
    return (
        <div className="flex m-auto">
            <SideBar />
            <div className=" ml-auto w-[95vw]">
                {children}
            </div>
        </div>
    );
};

export default AuthenticatedLayout;