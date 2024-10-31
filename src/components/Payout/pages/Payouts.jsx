// import React, { useState, useEffect } from 'react';
// import { useUserAuth } from '../../../context/UserAuthContext';
// import { db } from '../../../firebase';
// import { collection, doc, getDoc } from 'firebase/firestore';
// import Payoutsrightbar from './Payoutsrightbar';
// import Nodata from '../../../assets/homepage_icons/nodata.svg'

// const PayoutHomePage = () => {

//     const [data, setData] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [payoutData, setPayoutData] = useState([]);
//     const [selectedUserData, setSelectedUserData] = useState(null);
//     const [fundaccount, setfundaccount] = useState([])
//     const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//     const { user } = useUserAuth();

//     useEffect(() => {
//         payoutsid();
//     }, [user]);

//     const payoutsid = async () => {
//         setLoading(true);
//         if (user.uid) {
//             try {
//                 const docRef = doc(db, "UserTransactionDetails", user.uid);
//                 const docSnap = await getDoc(docRef);

//                 if (docSnap.exists()) {
//                     const userData = {
//                         id: docSnap.id,
//                         payoutId: docSnap.data().payoutId
//                     };
//                     setData(userData.payoutId);
//                     // console.log("User id: ", userData.payoutId);
//                     setPayoutData(userData.payoutId.reverse())
//                     setLoading(false);

//                     // Call PayoutsData after setting the data state
//                     // PayoutsData(userData.payoutId);
//                 } else {
//                     // console.log("No such document!");
//                     setLoading(false);
//                 }
//             } catch (error) {
//                 // console.error('Error fetching data:', error);
//             }
//         }
//     };

//     // Function to close the sidebar
//     const closeSidebar = () => {
//         setIsSidebarOpen(false);
//     };



//     const handalclick = (userData) => {
//         setIsSidebarOpen(true);

//         // console.log("userData:", userData);

//         const selectedPayoutData = payoutData.filter(item => item.id === userData.id);
//         const selectedFundAccount = fundaccount.filter(account => account.id === userData.fund_account_id);
//         // console.log("this is selectedFundAccount", selectedFundAccount);

//         // Set the selected user data in the state
//         setSelectedUserData({
//             payoutData: selectedPayoutData,
//             fundaccount: selectedFundAccount
//         });
//     };

//     // console.log("feach payoutData of all_id", data, payoutData, fundaccount)

//     return (
//         <div className='bg-[#1B1E21] h-screen'>
//             <Payoutsrightbar userData={selectedUserData} isOpen={isSidebarOpen} onClose={closeSidebar} />
//             {loading && (
//                 <div className="relative bg-light-dasboard-gray">
//                     <div className="loader-line"></div>
//                 </div>
//             )}
//             <div className='pl-8'>
//                 <div className='flex justify-between pt-4'>
//                     <div className='flex items-center'>
//                         <h4 className=' text-stone-300'>Showing 1- {data.length} Payouts</h4>
//                     </div>
//                 </div>

//                 <div className="mt-4 py-2 border-y border-stone-300 border-opacity-20 max-w-[95%]">
//                 {payoutData.length > 0 ?
//                     <table className='w-full table-auto text-stone-300'>
//                         <thead>
//                             <tr className='text-left'>
//                                 <th className='py-2 text-sm'>CREATED AT</th>
//                                 <th className='py-2'>AMOUNT</th>
//                                 <th className=' py-2'>STATUS</th>
//                                 <th className=' py-2'>CONTACT</th>
//                                 <th className='py-2'>UTR</th>
//                             </tr>
//                         </thead>
//                         {loading ? (
//                             <></>
//                         ) : (
//                             <tbody>
//                                 {payoutData.map((item, id) => (
//                                     <tr className='hover:bg-[#25282E] cursor-pointer' key={id} onClick={() => handalclick(item)}>
//                                         {/* Convert Unix timestamp to formatted date string */}
//                                         <td className='py-2'>{new Date(item.created_at * 1000).toLocaleString('en-US', {
//                                             weekday: 'short',
//                                             month: 'short',
//                                             day: 'numeric',
//                                             hour: 'numeric',
//                                             minute: 'numeric',
//                                             hour12: true
//                                         })}</td>
//                                         <td className='py-2'>-{item.amount / 100}</td>
//                                         <td className='py-2'>{item.status}</td>
//                                         <td className='py-2' >
//                                             {item.bank_account ? item.bank_account.name : item.vpa.username}
//                                         </td>
//                                         <td className='py-2'>{item.utr}</td>
//                                     </tr>
//                                 ))}


//                             </tbody>
//                         )}

//                     </table>
//                     :
//                     <div className=' my-28'>
//                     <div className=" w-[35rem] m-auto space-y-4 my-5" style={{ textAlign: '-webkit-center' }}>
//                       <img className="" src={Nodata} alt="no data" />
//                       <h1 className="text-[.82rem] text-[#fff] font-bold">LOOKS LIKE THERE ARE NO TRANSACTIONS YET</h1>
//                       <p className="text-xs text-gray-500">You can View the latest payouts generated over here. Stay informed about recent payments and transactions made through Reduxpay platform.</p>
//                     </div>
//                     </div>
//                     }
//                 </div>
//             </div>
//             {/* )} */}

//         </div>

//     )
// }

// export default PayoutHomePage



import React, { useState, useEffect } from 'react';
import { useUserAuth } from '../../../context/UserAuthContext';
import { db } from '../../../firebase';
import { doc, getDoc } from 'firebase/firestore';
import Payoutsrightbar from './Payoutsrightbar';
import Nodata from '../../../assets/homepage_icons/nodata.svg';
import Pagination from './Pagination'; // Import the Pagination component

const PayoutHomePage = () => {
    const [payoutData, setPayoutData] = useState([]);
    const [selectedUserData, setSelectedUserData] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { user } = useUserAuth();
    const [currentPage, setCurrentPage] = useState(1); // Current page state
    const [itemsPerPage] = useState(10); // Items per page

    useEffect(() => {
        payoutsid();
    }, [user]);

    const payoutsid = async () => {
        if (user.uid) {
            try {
                const docRef = doc(db, "UserTransactionDetails", user.uid);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const userData = {
                        id: docSnap.id,
                        payoutId: docSnap.data().payoutId
                    };
                    setPayoutData(userData.payoutId.reverse());
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        }
    };

    const handalclick = (userData) => {
        setIsSidebarOpen(true);
        const selectedPayoutData = payoutData.filter(item => item.id === userData.id);
        setSelectedUserData({
            payoutData: selectedPayoutData,
            fundaccount: [] // Assuming fund account data is not used in this component
        });
    };

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = payoutData.slice(indexOfFirstItem, indexOfLastItem);

    const paginate = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    return (
        <div className='bg-_blugradient'>
            <Payoutsrightbar userData={selectedUserData} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            <div className=' p-4 rounded card_bg_gradient mt-5 mx-auto max-w-[96%] min-h-[50vh]'>
                <div className='flex justify-between pt-4'>
                    <div className='flex items-center'>
                        <h4 className='text-stone-300'>Showing {indexOfFirstItem + 1} - {indexOfLastItem} Payouts</h4>
                    </div>
                </div>

                <div className="mt-4 py-2 border-y border-stone-300 border-opacity-20 max-w-[95%] min-h-[75vh]">
                    {currentItems.length > 0 ?
                        <table className='w-full table-auto text-stone-300'>
                            <thead>
                                <tr className='text-left'>
                                    <th className='py-2 text-sm'>CREATED AT</th>
                                    <th className='py-2'>AMOUNT</th>
                                    <th className='py-2'>STATUS</th>
                                    <th className='py-2'>CONTACT</th>
                                    <th className='py-2'>UTR</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentItems.map((item, id) => (
                                    <tr className='hover:bg-[#25282E] cursor-pointer' key={id} onClick={() => handalclick(item)}>
                                        <td className='py-2'>{new Date(item.created_at * 1000).toLocaleString('en-US', {
                                            weekday: 'short',
                                            month: 'short',
                                            day: 'numeric',
                                            hour: 'numeric',
                                            minute: 'numeric',
                                            hour12: true
                                        })}</td>
                                        <td className='py-2'>-{item.amount / 100}</td>
                                        <td className='py-2'>{item.status}</td>
                                        <td className='py-2'>{item.bank_account ? item.bank_account.name : item.vpa.username}</td>
                                        <td className='py-2'>{item.utr}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        :
                        <div className='my-28'>
                            <div className="w-[35rem] m-auto space-y-4 my-5" style={{ textAlign: '-webkit-center' }}>
                                <img className="" src={Nodata} alt="no data" />
                                <h1 className="text-[.82rem] text-[#fff] font-bold">LOOKS LIKE THERE ARE NO TRANSACTIONS YET</h1>
                                <p className="text-xs text-gray-500">You can View the latest payouts generated over here. Stay informed about recent payments and transactions made through Reduxpay platform.</p>
                            </div>
                        </div>
                    }
                </div>
                <div className='max-w-[95%]'>
                <Pagination totalItems={payoutData.length} itemsPerPage={itemsPerPage} currentPage={currentPage} onPageChange={paginate} />
                </div>
            </div>
        </div>
    );
};

export default PayoutHomePage;
