import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDoc, setDoc, doc, onSnapshot, getDocs, query, where, addDoc, serverTimestamp } from 'firebase/firestore';

import { useUserAuth } from "../context/UserAuthContext";
import LineChart from "./LineChart";
import PayoutHeader from './Payout/pages/PayoutHeader'
import { DatePicker } from 'antd';
import moment from 'moment';
import CryptoJS from 'crypto-js';



const Analytics = () => {
    const [accountBalance, setAccountBalance] = useState(0);
    const [userPayoutData, setuserPayoutData] = useState([])
    const [loading, setLoading] = useState(true);
    const { user } = useUserAuth();
    const [Dates, setDates] = useState([])
    const { RangePicker } = DatePicker;

    const [depotransaction, setDepoTransaction] = useState([])

    const [filteredPayoutsData, setfilteredPayoutsData] = useState({})
    const [filteredDepositData, setfilteredDepositData] = useState({})
    const [depositcount, setdepositCount] = useState(0);
    const [totaldepositSum, settotalDepositSum] = useState(0);
    const [payoutscount, setpayoutsCount] = useState(0);
    const [totalSum, settotalSum] = useState(0);
    const [selectedOption, setSelectedOption] = useState("");

    const [Payoutsdata, setPayoutsdata] = useState({});
    const [depositdata, setdepositdata] = useState({});

    useEffect(() => {
        if (user.uid) {
            Promise.all([getUserDetails(), payoutsid(), DepositTransaction()]);
        }
    }, [user]);

    // useEffect(() => {
    //     console.log("depositDataArray depositDataArray", Payoutsdata);
    // }, [depotransaction, userPayoutData]);

    useEffect(() => {
        async function fetchData() {
            // await getUserDetails();
            // await payoutsid();
            // await DepositTransaction();
            // Function to format the date
            const formatDate = (timestamp) => {
                const date = new Date(timestamp * 1000); // Convert timestamp to milliseconds
                const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
                return date.toLocaleDateString('en-US', options);
            };



            // Convert depotransaction object into an array of objects
            const depositDataArray = Object.keys(depotransaction).map((key) => ({
                ...depotransaction[key],
                id: key
            }));

            const depositformatDate = (timestamp) => {
                const milliseconds = timestamp.seconds * 1000;
                const date = new Date(milliseconds);
                const formattedDate = date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                return formattedDate;
            };
            // Group payouts by date and calculate total amount for each date
            const depositdat = depositDataArray.reduce((acc, payout) => {
                const date = depositformatDate(payout.timestamp); // Format date
                acc[date] = acc[date] || { count: 0, totalAmount: 0 };
                acc[date].count += 1; // Increment payout count for the date
                acc[date].totalAmount += parseFloat(payout.amount) * 100;
                return acc;
            }, {});


            const Payoutsdat = userPayoutData.reduce((acc, payout) => {
                const date = formatDate(payout.created_at); // Format date
                acc[date] = acc[date] || { count: 0, totalAmount: 0 };
                acc[date].count += 1; // Increment payout count for the date
                acc[date].totalAmount += payout.amount; // Add payout amount to total amount for the date
                return acc;
            }, {});
            setPayoutsdata(Payoutsdat)
            setdepositdata(depositdat);
            console.log('Selected Date user new Range:', Payoutsdat, depositdat);
            console.log('Selected Date user inside featch data new Range:', Payoutsdata, depositdata);
        }

        fetchData();



    }, [depotransaction, userPayoutData]);
    // console.log('Selected Date user outside new Range:', Payoutsdata, depositdata);

    const getUserDetails = async () => {
        if (user.uid) {
            try {
                const UID = user.uid;

                // console.log("Home user: ", user);
                const docRef = doc(db, "Users", UID);
                const docSnap = await getDoc(docRef);

                // checking for user existence
                if (!docSnap.data()) {
                    // console.log("user does not exists");

                } else {
                    setAccountBalance(docSnap.data().Balance || 0);
                }
            } catch (error) {
                // console.log("Error fetching user: ", error);
            }
        }
    };
    const decryptBalance = (encryptedBalance) => {
        const bytes = CryptoJS.AES.decrypt(encryptedBalance, import.meta.env.VITE_APP_secretKey);
        return bytes.toString(CryptoJS.enc.Utf8);
    };

    const payoutsid = async () => {
        setLoading(true);
        let payoutid = [];
        if (user.uid) {

            try {
                const docRef = doc(db, "BulkPayments", user.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const batches = docSnap.data();
                    const successfulIds = [];

                    for (const key in batches) {
                        if (Object.hasOwnProperty.call(batches, key)) {
                            const batch = batches[key];
                            if (batch.successfulIds && batch.successfulIds.length > 0) {
                                successfulIds.push(...batch.successfulIds);
                            }
                        }
                    }
                    //   console.log("All successfulIds:", successfulIds);
                    //   console.log("Nodfgdfbdfb dfbdfbnt!");
                    payoutid.push(...successfulIds);
                } else {
                    //   console.log("No such document!");
                }
            } catch (error) {
                // console.error('Error fetching data:', error);
            }

            try {
                const docRef = doc(db, "UserTransactionDetails", user.uid);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const userData = {
                        id: docSnap.id,
                        payoutId: docSnap.data().payoutId
                    };
                    payoutid.push(...userData.payoutId);
                } else {
                    //   console.log("No such document!");
                    setLoading(false);
                }
            } catch (error) {
                // console.error('Error fetching data:', error);
            }
            // PayoutsData(payoutid);
        }

        setuserPayoutData(payoutid);
        setLoading(false);
    };

    const DepositTransaction = async () => {
        if (user.uid) {
            try {
                const docRef = doc(db, "UserDepositTransactions", user.uid);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const userData = {
                        // id: docSnap.id,
                        transaction: docSnap.data()
                    };
                    // setDepoTransaction(userData.transaction);

                    // Filter the transactions where isVerified is true
                    const verifiedTransactions = Object.values(userData.transaction)
                        .filter(transaction => transaction.isVerified);

                    setDepoTransaction(verifiedTransactions);


                } else {
                    // console.log("No such document!");
                    setLoading(false);
                }
            } catch (error) {
                // console.error('Error fetching data:', error);
            }
        }
    }

    // console.log('Selected Date user new Range:', Payoutsdata, depositdata);
    useEffect(() => {
        // if( Object.values(Payoutsdata).length>0){
        myFunction()
        // }

    }, [user.uid, Payoutsdata, depositdata, Dates]);

    const myFunction = () => {
        // Your code here
        // await new Promise(resolve => setTimeout(resolve, 8000));
        // console.log('payouts in filter finction:', Payoutsdata, depositdata);
        // Filter depositdata based on the selected date range
        const filterddepdata = filterDataByDateRange(depositdata, Dates[0], Dates[1])
        const filterdpayoutdata = filterDataByDateRange(Payoutsdata, Dates[0], Dates[1])
        Dates.length !== 0 ? setfilteredDepositData(filterddepdata) : setfilteredDepositData(depositdata);
        Dates.length !== 0 ? setfilteredPayoutsData(filterdpayoutdata) : setfilteredPayoutsData(Payoutsdata);

        // console.log("Dates.length !== 0", Dates.length !== 0)

        // console.log('Filtered Deposit Data:', filteredDepositData);
        // console.log('Filtered Payouts Data:', filteredPayoutsData);
        // console.log("feqfew dc ", Object.keys(filteredDepositData).length !== 0 ? "hello this is filter" : "this is deposit", Object.keys(filteredDepositData).length);
        let payoutsDataToUse = Dates.length !== 0 ? filterdpayoutdata : Payoutsdata;
        let depoToUse = Dates.length !== 0 ? filterddepdata : depositdata;

        setdepositCount(Object.values(depoToUse).reduce((acc, { count }) => acc + count, 0))
        settotalDepositSum(Object.values(depoToUse).reduce((acc, { totalAmount }) => acc + totalAmount, 0))

        // console.log(payoutsDataToUse, Payoutsdata, "this is payout data")

        setpayoutsCount(Object.values(payoutsDataToUse).reduce((acc, { count }) => acc + count, 0))
        settotalSum(Object.values(payoutsDataToUse).reduce((acc, { totalAmount }) => acc + totalAmount, 0))
    }
    const filterDataByDateRange = (data, startDate, endDate) => {
        // Convert start and end date strings to Date objects
        const startDateObj = new Date(startDate);
        const endDateObj = new Date(endDate);

        const filteredData = {};

        // Iterate over the keys (dates) in the data object
        for (const dateKey in data) {
            if (data.hasOwnProperty(dateKey)) {
                // Convert the current date key to a Date object
                const currentDateObj = new Date(dateKey);
                // console.log("dvjds ,", currentDateObj, startDateObj, endDateObj)
                // Check if the current date falls within the specified range
                if (currentDateObj >= startDateObj && currentDateObj <= endDateObj) {
                    // If it does, include it in the filteredData object
                    filteredData[dateKey] = data[dateKey];
                }
            }
        }

        return filteredData;
    };

    const handleTodayClick = () => {
        const today = new Date();
        setSelectedOption("Daily");
        setDates([formatDate(today), formatDate(today)]);
    };

    const handleThisWeekClick = () => {
        setSelectedOption("Weekly");
        const today = new Date();
        const dayOfWeek = today.getDay(); // 0 for Sunday, 1 for Monday, ..., 6 for Saturday

        // Calculate the difference between today and the first day of the week (Monday)
        const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
        const startOfWeek = new Date(today.setDate(diff));

        // Calculate the end of the week (Sunday)
        const endOfWeek = new Date(today.setDate(today.getDate() + 6));

        setDates([formatDate(startOfWeek), formatDate(endOfWeek)]);
    };

    const handleThisMonthClick = () => {
        setSelectedOption("Monthly");
        const today = new Date();
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        setDates([formatDate(firstDayOfMonth), formatDate(today)]);
    };

    const formatDate = (date) => {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    };

    return (
        <div className='bg-[#1B1E21] h-full'>
            <PayoutHeader showLeftData={false} anylatics={true} />
            {loading && (
                <div className="relative bg-light-dasboard-gray">
                    <div className="loader-line"></div>
                </div>
            )}
            <div className="h-[5rem]   flex ">
                <div className=" w-[93%] m-auto">
                    <RangePicker
                    className=" rounded-none border-[#1F243D] placeholder-red-500 custom-range-picker"
                        onChange={(dates, dateStrings) => {
                            if (!dates || dates.length === 0) {
                                setDates('');
                            } else {
                                const formattedDateStrings = dateStrings.map(dateString =>
                                    moment(dateString).format('dddd, MMMM DD, YYYY')
                                );
                                setDates(formattedDateStrings);
                            }
                        }}
                    />
                </div>
            </div>
            <div className='bg-[#1B1E21] max-w-[93%] m-auto pb-5'>

                <div>
                    <div className=' flex justify-between'>
                        <h1 className='text-white mt-5 mb-4'>Overview</h1>
                        <h1 className='text-white mt-5 mb-4 '>
                            <span className='text-xl font-semibold'>Account Balance:</span>
                            <span className="text-s text-gray-500 font-semibold ml-2">₹</span>
                            <span className="text-white text-xl ml-1 font-semibold">{Number(decryptBalance(accountBalance)).toLocaleString('en-IN')}</span>
                        </h1>
                    </div>
                    <div className=' flex justify-between max-w-[100%] m-auto'>
                        <div className='bg-[#2D3136] flex justify-between border-l-2 border-[#E26363] py-3 w-[45%]'>
                            <div className='pl-6  '>
                                <h1 className='text-white text-sm'>Payouts volume</h1>
                                <span className="text-s text-gray-500 font-semibold">₹</span>
                                <span className="text-white text-2xl ml-1 font-semibold">{`${(totalSum / 100).toLocaleString('en-IN')}`}</span>
                            </div>
                            <div className=' pr-[30%] pl-5 py-2 border-l-2 border-gray-500'>
                                <h1 className='text-white text-sm'>Number of Payouts</h1>
                                <p className="text-white text-xl font-semibold">{payoutscount}</p>
                            </div>
                        </div>

                        <div className='bg-[#2D3136] flex justify-between border-l-2 border-[#83FF81] py-3 w-[45%]'>
                            <div className='pl-6  '>
                                <h1 className='text-white text-sm'>Inflow volume</h1>
                                <span className="text-s text-gray-500 font-semibold">₹</span>
                                <span className="text-white text-2xl ml-1 font-semibold">{`${(totaldepositSum / 100).toLocaleString('en-IN')}`}</span>
                            </div>
                            <div className=' pr-[30%] pl-5 py-2 border-l-2 border-gray-500'>
                                <h1 className='text-white text-sm'>Number of Inflow</h1>
                                <p className="text-white text-xl font-semibold">{depositcount}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex justify-end mt-4">
            <div className="bg-[#2f3337] flex">
                <button
                    className={`px-[1.5rem] py-[.5rem] text-[#fff] font-[700] transition duration-500 ${selectedOption === "Daily" ? "border-b-2 border-red-500" : "border-b-2 border-[#2f3337]"}`}
                    onClick={handleTodayClick}
                >
                    Daily
                </button>
                <span className="ml-1 mt-2 text-red-800">|</span>
                <button
                    className={`px-[1.5rem] py-[.5rem] text-[#fff] font-[700] transition duration-500 ${selectedOption === "Weekly" ? "border-b-2 border-red-500" : "border-b-2 border-[#2f3337]"}`}
                    onClick={handleThisWeekClick}
                >
                    Weekly
                </button>
                <span className="ml-1 mt-2 text-red-800">|</span>
                <button
                    className={`px-[1.5rem] py-[.5rem] text-[#fff] font-[700] transition duration-500 ${selectedOption === "Monthly" ? "border-b-2 border-red-500" : "border-b-2 border-[#2f3337]"}`}
                    onClick={handleThisMonthClick}
                >
                    Monthly
                </button>
            </div>
        </div>
                <div className="mt-[4rem]">
                    <h1 className='text-[#fff] text-xl font-semibold '>Payout Trend</h1>
                    <div className=" pt-3 rounded bg-[#25282E] mt-4 mx-auto max-w-[100%]">
                        <div className=" ml-6">
                            <div className=" inline-flex mt-2">
                                <h2 className="  font-semibold">
                                    <span className=" text-[#fff] text-[18px]">₹</span>
                                    <span className="text-white ml-1 text-[18px]">{`${(totalSum / 100).toLocaleString('en-IN')}`}</span>
                                </h2>
                            </div>
                            <h1 className=" text-[#FFFFFF] text-[12px] mt-1">{payoutscount} Payouts</h1>
                        </div>
                        <div >
                            <LineChart groupedPayouts={filteredPayoutsData} payoutscolor={"red"} />
                        </div>
                    </div>
                </div>
                <div>
                    <h1 className='text-[#fff] text-xl font-semibold mt-5 mb-4'>Inflow Trend</h1>
                    <div className=" pt-3 rounded bg-[#25282E] mt-4 mx-auto max-w-[100%]">
                        <div className=" ml-6">
                            <div className=" inline-flex mt-2">
                                <h2 className="  font-semibold">
                                    <span className=" text-[#fff] text-[18px]">₹</span>
                                    <span className="text-white ml-1 text-[18px]">{`${(totaldepositSum / 100).toLocaleString('en-IN')}`}</span>
                                </h2>
                            </div>
                            <h1 className=" text-[#FFFFFF] text-[12px] mt-1">{depositcount} Inflow</h1>
                        </div>
                        <div >
                            <LineChart groupedPayouts={filteredDepositData} insitsscolor={"green"} />
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}

export default Analytics