import React, { useEffect, useRef, useState } from 'react';
import { useUserAuth } from "../../../context/UserAuthContext";
import { Link, useNavigate } from "react-router-dom";
import { db } from "../../../firebase";
import { getDoc, doc, } from 'firebase/firestore';

import Payout from '../../../assets/icon/payouts_icon/payout.svg';
import search from '../../../assets/icon/payouts_icon/search.svg';
import account from '../../../assets/icon/payouts_icon/account.svg';
import notification from '../../../assets/icon/payouts_icon/notification.svg';

const PayoutHeader = ({ showLeftData = true, accountstatement = false, support = false, anylatics = false, children }) => {
    const { user } = useUserAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [usersdata, setusersdata] = useState([])
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    const getUserDetails = async () => {
        if (user.uid) {
            try {
                const UID = user.uid;

                const docRef = doc(db, "Users", UID);
                const docSnap = await getDoc(docRef);

                if (!docSnap.data()) {
                    // console.log("user does not exists");

                } else {
                    setusersdata(docSnap.data())
                }
            } catch (error) {
                // console.log("Error fetching user: ", error);
            }
        }
    };
    useEffect(() => {
        getUserDetails();
    }, [user])

    const handleDocumentClick = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setIsOpen(false);
        }
    };
    const payouts = () => {
        navigate("/payouts")
    }

    const bulking = () => {
        navigate("/payouts/bulk")
    }
    const showbulking = () => {
        navigate("/payouts/batch")
    }

    document.body.addEventListener('click', handleDocumentClick);
    // console.log("users detail from header", user);

    const [activeElement, setActiveElement] = useState('span'); // Set initial state to 'span'

    const handleClick = (element) => {
        setActiveElement(element);
    };

    return (
        <div className='home_page'>
            <header className='header flex justify-between pl-8 bg-[#ffffff0c] text-gray-400'>
                <div className='leftheader flex items-center gap-3 mt-4 mb-3'>
                    {anylatics && <h1 className=' my-2 mt-3 font-semibold pl-3 text-[#ffffff] text-2xl'>insights</h1>}
                    {support && <h1 className=' my-2 mt-3 font-semibold pl-3 text-[#ffffff] text-2xl'>Chat Support</h1>}
                    {accountstatement ? (
                        <h1 className='text-white text-2xl font-medium '>Storeshoppy</h1>
                    ) : (
                        <div className='leftheader flex items-center gap-3 mt-4 mb-3'>
                            {showLeftData && (
                                <>
                                    <img className='w-18 bg-gray-800 p-2 rounded' src={Payout} alt='' />
                                    <h2 className='text-xl font-bold'>Payouts</h2>
                                    <span>/</span>
                                    {/* <span className=' bg-blue-500 bg-opacity-10 rounded-md text-blue-300 px-6 py-2'>Single</span>
                                    <div>
                                    <h4 className='font-bold cursor-pointer flex' onClick={bulking}>
                                        Bulk
                                        <p className="ml-2 rounded-full px-2 py-[1px] text-black bg-[#83FF81] font-bold text-[12px] self-center">
                                            NEW
                                        </p>
                                    </h4>
                                    </div>
                                    <h4 className='font-bold cursor-pointer ml-5' onClick={showbulking}>ShowBulk</h4> */}
                                    <span
                                        className={`cursor-pointer ${activeElement === 'span' ? 'bg-blue-500 bg-opacity-10 rounded-md text-blue-300 px-6 py-2' : ' px-6 py-2'}`}
                                        onClick={() => {
                                            handleClick('span')
                                            payouts();
                                        }}
                                    >
                                        Single
                                    </span>

                                    <h4
                                        className={`font-bold cursor-pointer flex ${activeElement === 'h4' ? 'bg-blue-500 bg-opacity-10 rounded-md text-blue-300 px-3 py-[.6rem]' : ' cursor-pointer px-3 py-2'}`}
                                        onClick={() => {
                                            handleClick('h4');
                                            bulking(); // Call bulking function
                                        }}
                                    >
                                        Bulk
                                        <p className="ml-1 rounded-full px-2 py-[1px] text-black bg-[#83FF81]  text-[12px] self-center">NEW</p>
                                    </h4>

                                    <h4
                                        className={`font-bold cursor-pointer ml-5 ${activeElement === 'h4_show' ? 'bg-blue-500 bg-opacity-10 rounded-md text-blue-300 px-6 py-[.6rem]' : ' cursor-pointer ml- px-6 py-2'}`}
                                        onClick={() => {
                                            handleClick('h4_show')
                                            showbulking();
                                        }}
                                    >
                                        ShowBulk
                                    </h4>
                                </>
                            )}
                        </div>
                    )}
                </div>
                <div className='mr-12 flex items-center gap-5  mt-4 mb-3'>
                    <Link to='/payouts/CreateFundAccountForm'>
                        {/* bg-gradient-to-r from-[#5413b5] to-[#FA75F8]  */}
                        <button className=' cursor-pointer text-base font-bold rounded-sm border border-opacity-15  py-[12px] px-8 text-[#FFFFFF]'>+ PAYOUT</button>
                    </Link>
                    {/* <div class=" box ">
                        <p>+ PAYOUT</p>
                    </div> */}
                    <div className="relative inline-block" ref={dropdownRef}>
                        <img
                            className="w-6 cursor-pointer "
                            src={account}
                            alt="Account"
                            onClick={() => setIsOpen((prevState) => !prevState)}
                        />
                        {isOpen && (
                            <div className="absolute right-0 z-2 mt-3 w-64 bg-[#151719] border-[1px] border-opacity-10 border-gray-300">
                                <ul>
                                    <li className="py-2 px-4 hover:bg-[#25282E] cursor-pointer">
                                        <svg className='w-[15px] inline-block mr-[3px]' viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M20 21C20 19.6044 20 18.9067 19.8278 18.3389C19.44 17.0605 18.4395 16.06 17.1611 15.6722C16.5933 15.5 15.8956 15.5 14.5 15.5H9.5C8.10444 15.5 7.40665 15.5 6.83886 15.6722C5.56045 16.06 4.56004 17.0605 4.17224 18.3389C4 18.9067 4 19.6044 4 21M16.5 7.5C16.5 9.98528 14.4853 12 12 12C9.51472 12 7.5 9.98528 7.5 7.5C7.5 5.01472 9.51472 3 12 3C14.4853 3 16.5 5.01472 16.5 7.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        {usersdata.Name}</li>
                                    <li className="py-2 px-4 hover:bg-[#25282E] cursor-pointer">
                                        <svg className='w-[15px] inline-block mr-[3px]' viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M14.0497 6C15.0264 6.19057 15.924 6.66826 16.6277 7.37194C17.3314 8.07561 17.8091 8.97326 17.9997 9.95M14.0497 2C16.0789 2.22544 17.9713 3.13417 19.4159 4.57701C20.8606 6.01984 21.7717 7.91101 21.9997 9.94M10.2266 13.8631C9.02506 12.6615 8.07627 11.3028 7.38028 9.85323C7.32041 9.72854 7.29048 9.66619 7.26748 9.5873C7.18576 9.30695 7.24446 8.96269 7.41447 8.72526C7.46231 8.65845 7.51947 8.60129 7.63378 8.48698C7.98338 8.13737 8.15819 7.96257 8.27247 7.78679C8.70347 7.1239 8.70347 6.26932 8.27247 5.60643C8.15819 5.43065 7.98338 5.25585 7.63378 4.90624L7.43891 4.71137C6.90747 4.17993 6.64174 3.91421 6.35636 3.76987C5.7888 3.4828 5.11854 3.4828 4.55098 3.76987C4.2656 3.91421 3.99987 4.17993 3.46843 4.71137L3.3108 4.86901C2.78117 5.39863 2.51636 5.66344 2.31411 6.02348C2.08969 6.42298 1.92833 7.04347 1.9297 7.5017C1.93092 7.91464 2.01103 8.19687 2.17124 8.76131C3.03221 11.7947 4.65668 14.6571 7.04466 17.045C9.43264 19.433 12.295 21.0575 15.3284 21.9185C15.8928 22.0787 16.1751 22.1588 16.588 22.16C17.0462 22.1614 17.6667 22 18.0662 21.7756C18.4263 21.5733 18.6911 21.3085 19.2207 20.7789L19.3783 20.6213C19.9098 20.0898 20.1755 19.8241 20.3198 19.5387C20.6069 18.9712 20.6069 18.3009 20.3198 17.7333C20.1755 17.448 19.9098 17.1822 19.3783 16.6508L19.1835 16.4559C18.8339 16.1063 18.6591 15.9315 18.4833 15.8172C17.8204 15.3862 16.9658 15.3862 16.3029 15.8172C16.1271 15.9315 15.9523 16.1063 15.6027 16.4559C15.4884 16.5702 15.4313 16.6274 15.3644 16.6752C15.127 16.8453 14.7828 16.904 14.5024 16.8222C14.4235 16.7992 14.3612 16.7693 14.2365 16.7094C12.7869 16.0134 11.4282 15.0646 10.2266 13.8631Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        {usersdata.contactNumber}</li>
                                    <Link to='/' ><li className="py-2 px-4 hover:bg-[#25282E] cursor-pointer">
                                        <svg className='w-[15px] inline-block mr-[3px]' viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M3.41345 10.7445C2.81811 10.513 2.52043 10.3972 2.43353 10.2304C2.35819 10.0858 2.35809 9.91354 2.43326 9.76886C2.51997 9.60195 2.8175 9.48584 3.41258 9.25361L20.3003 2.66327C20.8375 2.45364 21.1061 2.34883 21.2777 2.40616C21.4268 2.45596 21.5437 2.57292 21.5935 2.72197C21.6509 2.8936 21.5461 3.16219 21.3364 3.69937L14.7461 20.5871C14.5139 21.1822 14.3977 21.4797 14.2308 21.5664C14.0862 21.6416 13.9139 21.6415 13.7693 21.5662C13.6025 21.4793 13.4867 21.1816 13.2552 20.5862L10.6271 13.8282C10.5801 13.7074 10.5566 13.647 10.5203 13.5961C10.4881 13.551 10.4487 13.5115 10.4036 13.4794C10.3527 13.4431 10.2923 13.4196 10.1715 13.3726L3.41345 10.7445Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        Go to Storeshoppy Dashboard</li></Link>
                                    <li className="py-2 px-4 hover:bg-[#424863] cursor-pointer bg-[#25282E]">Logged In as {usersdata.email}</li>
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </header>
            <div className=" ml-auto w-[95vw]">
                {children}
            </div>
        </div>
    );
};

export default PayoutHeader;
