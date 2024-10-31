import React, { useState, useEffect } from 'react';
import { useUserAuth } from '../../../context/UserAuthContext';
import { db } from '../../../firebase';
import { collection, doc, getDoc } from 'firebase/firestore';
import Payoutsrightbar from './Payoutsrightbar';
import './BatchPayouts.css';
const BatchPayouts = () => {

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [payoutData, setPayoutData] = useState([]);
    const [selectedUserData, setSelectedUserData] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [failedData, setFailedData] = useState([])
    const [batchOptions, setBatchOptions] = useState([]);
    const { user } = useUserAuth();
    const [batchId, setBatchId] = useState(''); // Add state for selected batch ID

    useEffect(() => {
        payoutsid();
    }, [user, batchId]);

    useEffect(() => {
        fetchBatchOptions();
    }, [user]);
    const fetchBatchOptions = async () => {
        if (user.uid) {
            try {
                const docRef = doc(db, "BulkPayments", user.uid);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const batchIds = docSnap.data().batchId || [];
                    setBatchOptions(batchIds.reverse());
                    setBatchId(batchIds[0]);
                } else {
                    // console.log("No such document!");
                }
            } catch (error) {
                // console.error('Error fetching batch options:', error);
            }
        }
    };
    const selectbatchid = (e) => {
        setBatchId(e.target.value);
    };
    const formatDate = (dateString) => {
        const options = { weekday: 'short', month: 'short', day: '2-digit', hour: 'numeric', minute: 'numeric', hour12: true };
        const date = new Date(dateString);
        return date.toLocaleString('en-US', options);
      };
    const payoutsid = async () => {
        setLoading(true);
        if (user.uid) {
            try {
                const docRef = doc(db, "BulkPayments", user.uid);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const userData = docSnap.data();
                    if (userData && batchId in userData) {
                        const batchData = userData[batchId];
                        setData(batchData.successfulIds || []);
                        setPayoutData(batchData.successfulIds || []);
                        setFailedData(batchData.failed || []);
                    } else {
                        // console.log("No data found for batchId:", batchId);
                    }
                } else {
                    // console.log("No such document!");
                }
            } catch (error) {
                // console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        }
    };




    // Function to close the sidebar
    const closeSidebar = () => {
        setIsSidebarOpen(false);
    };



    const handalclick = (userData) => {
        setIsSidebarOpen(true);

        // console.log("userData:", userData);

        const selectedPayoutData = payoutData.filter(item => item.id === userData.id);

        // Set the selected user data in the state
        setSelectedUserData({
            payoutData: selectedPayoutData,
        });

    };

    return (
        <div className='  bg-[#1B1E21] '>
            <Payoutsrightbar userData={selectedUserData} isOpen={isSidebarOpen} onClose={closeSidebar} />
            {/* <PayoutHeader /> */}
            {loading && (
                <div className="relative top-[0px] bg-light-dasboard-gray">
                    <div className="loader-line"></div>
                </div>
            )}
            <div className='flex  h-screen '>
                <div className='bg-[#25282E] pt-4 pl-6 pr-2 pb-10 flex w-[12vw] flex-col mt2 ml4 '>
                    <label className='text-stone-300 text-center mb-3 font-bold'>Payouts Batch</label>
                    <div className='flex flex-col gap-1 overflow-y-scroll scroll-container mt-1'>
                        {batchOptions.map((batch, index) => (
                            <button
                                key={index}
                                className={`p-2 rounded text-sm border-stone-300 border-opacity-20 hover:bg-[#fdfbfb16] ${batchId === batch ? ' bg-[#fdfbfb16] text-stone-300' : 'text-stone-300'}`}
                                onClick={() => selectbatchid({ target: { value: batch } })}
                            >
                                {batch}
                            </button>
                        ))}
                    </div>
                </div>

                <div className=' pl-8'>
                    {/* <div className='flex justify-between mt-4'>
                    <div className='flex items-center'>
                        
                    </div>
                </div> */}

                    {/* <div className="mt-4 ml-auto mr-auto py-2 border-y border-stone-300 border-opacity-20">
                            <table className='table-auto text-stone-300'> */}
                    <div className='flex justify-between mt-4'>
                        <div className='flex items-center'>
                            <h4 className=' text-stone-300'>Showing Bulk {payoutData.length} Payouts Transaction</h4>
                        </div>
                    </div>
                    <div className="mt-4 py-2 border-t mr-auto border-stone-300 border-opacity-20 w-[78vw]">
                        <table className='w-full table-auto text-stone-300'>
                            <thead>
                                <tr className='text-left'>
                                    <th className='py-2 px-2'>CREATED AT</th>
                                    <th className='py-2 px-2'>AMOUNT</th>
                                    <th className='py-2 px-2'>STATUS</th>
                                    <th className='py-2 px-2'>CONTACT</th>
                                    <th className='py-2 px-2'>UTR</th>
                                </tr>
                            </thead>
                            {loading ? (
                                <></>
                            ) : (
                                <>
                                    <tbody>
                                        {payoutData.map((item, id) => (
                                            <tr key={id} className='hover:bg-[#25282E] cursor-pointer' onClick={() => handalclick(item)}>
                                                {/* {console.log("dcdsvdsvdsv",item)} */}
                                                {/* Convert Unix timestamp to formatted date string */}
                                                <td className='py-2 px-2 w-[20rem]'>{new Date(item.created_at * 1000).toLocaleString('en-US', {
                                                    weekday: 'short',
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: 'numeric',
                                                    minute: 'numeric',
                                                    hour12: true
                                                })}</td>
                                                <td className='py-2 px-2'>{item.amount / 100}</td>
                                                <td className='py-2 px-2'>{item.status}</td>
                                                <td className='py-2 px-2'>{item.bank_account.name}</td>
                                                <td className='py-2 px-2'>{item.utr}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tbody>
                                        {failedData.map((data, id) => (
                                            <tr key={id} className='hover:bg-light-gray cursor-pointer' onClick={() => handalclick(data)}>
                                                <td className='py-2 px-2 w-[20rem]'>{formatDate(data.created_at)}</td>
                                                <td className='py-2 px-2'>{data.amount / 100}</td>
                                                <td className='py-2 px-2'>Failed</td>
                                                <td className='py-2 px-2'>{data.fund_account.bank_account.name}</td>
                                                <td className='py-2 px-2'>{data.utr}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </>
                            )}
                        </table>

                    </div>
                </div>
            </div>
        </div>

    )
}

export default BatchPayouts