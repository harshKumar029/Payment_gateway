// import React, { useEffect, useState } from 'react'
// import { useUserAuth } from "../context/UserAuthContext";
// import { db } from "../firebase";
// import { collection, getDoc, setDoc, doc, onSnapshot, getDocs, query, where, addDoc, serverTimestamp } from 'firebase/firestore';
// import PayoutHeader from './Payout/pages/PayoutHeader'
// import debits from '../assets/icon/payouts_icon/debits.svg'
// import all from '../assets/icon/payouts_icon/all.svg'
// import credits from '../assets/icon/payouts_icon/credits.svg'
// import Pagination from '../components/Payout/pages/Pagination'

// function AccountStatementPage() {
//   const [depotransaction, setDepoTransaction] = useState([])
//   const [userPayoutData, setuserPayoutData] = useState([])
//   const [loading, setLoading] = useState(true);
//   const { user } = useUserAuth();
//   const [filterType, setFilterType] = useState("all");


//   useEffect(() => {
//     payoutsid();
//     DepositTransaction();
//   }, [user]);

//   const payoutsid = async () => {
//     setLoading(true);
//     if (user.uid) {
//       try {
//         const docRef = doc(db, "UserTransactionDetails", user.uid);
//         const docSnap = await getDoc(docRef);

//         if (docSnap.exists()) {
//           const userData = {
//             id: docSnap.id,
//             payoutId: docSnap.data().payoutId
//           };
//           // setpayoutid(userData.payoutId);

//           // Call PayoutsData after setting the data state
//           // PayoutsData(userData.payoutId);
//           setuserPayoutData(userData.payoutId)
//           // console.log("advdsvdsvds dsavds adscvd",userData.payoutId)
//           setLoading(false);
//         } else {
//           // console.log("No such document!");
//           setLoading(false);
//         }
//       } catch (error) {
//         // console.error('Error fetching data:', error);
//       }
//     }
//   };


//   const DepositTransaction = async () => {
//     if (user.uid) {
//       try {
//         const docRef = doc(db, "UserDepositTransactions", user.uid);
//         const docSnap = await getDoc(docRef);

//         if (docSnap.exists()) {
//           const userData = {
//             // id: docSnap.id,
//             transaction: docSnap.data()
//           };
//           // setDepoTransaction(userData.transaction);

//           // Filter the transactions where isVerified is true
//           const verifiedTransactions = Object.values(userData.transaction)
//             .filter(transaction => transaction.isVerified);

//           setDepoTransaction(verifiedTransactions);


//         } else {
//           // console.log("No such document!");
//           setLoading(false);
//         }
//       } catch (error) {
//         // console.error('Error fetching data:', error);
//       }
//     }
//   }

//   function formatTime(unixTimestamp) {
//     const date = new Date(unixTimestamp * 1000); // Convert seconds to milliseconds
//     return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
//   }

//   const formatDate = (timestamp) => {
//     const date = new Date(timestamp * 1000); // Convert timestamp to milliseconds
//     const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
//     return date.toLocaleDateString('en-US', options);
//   };

//   function mergeDataByDate(payoutData, depositData) {
//     const mergedData = {};

//     // Process payouts data
//     payoutData.forEach((data) => {
//       const dateKey = formatDate(data.created_at); // Format the date as needed
//       if (!mergedData[dateKey]) {
//         mergedData[dateKey] = [];
//       }
//       mergedData[dateKey].push({ type: 'payout', ...data }); // Adding type to distinguish payouts from deposits
//     });

//     // Process deposit transaction data
//     depositData.forEach((data) => {
//       const dateKey = formatDate(data.timestamp.seconds); // Format the date as needed
//       if (!mergedData[dateKey]) {
//         mergedData[dateKey] = [];
//       }
//       mergedData[dateKey].push({ type: 'deposit', ...data }); // Adding type to distinguish deposits from payouts
//     });

//     // Sort mergedData by keys (dates) in descending order
//     const sortedMergedData = Object.fromEntries(
//       Object.entries(mergedData).sort(([dateA], [dateB]) => new Date(dateB) - new Date(dateA))
//     );

//     return sortedMergedData;
//   }

//   // Convert depotransaction object into an array of objects
//   const depositDataArray = Object.keys(depotransaction).map((key) => ({
//     ...depotransaction[key],
//     id: key
//   }));

//   const mergedData = mergeDataByDate(userPayoutData, depositDataArray);

//   const handleFilterChange = (type) => {
//     setFilterType(type);
//   };


//       // // State variables for pagination
//       // const [currentPage, setCurrentPage] = useState(1);
//       // const itemsPerPage = 10; // Maximum items per page

//       // // Handle page change
//       // const onPageChange = (pageNumber) => {
//       //   setCurrentPage(pageNumber);
//       // };

//       // // Paginate mergedData based on currentPage and itemsPerPage
//       // const indexOfLastItem = currentPage * itemsPerPage;
//       // const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//       // const paginatedData = Object.entries(mergedData)
//       //   .slice(indexOfFirstItem, indexOfLastItem)
//       //   .reduce((obj, [key, value]) => {
//       //     obj[key] = value;
//       //     return obj;
//       //   }, {});


//   return (
//     <div className='bg-[#1B1E21] min-h-screen'>
//       <PayoutHeader accountstatement={true} />
//       {/* {loading ? (
//         <div className="  bg-light-dasboard-gray">
//                 <Loading />
//                 </div>
//             ) : ( */}
//       <div className='mx-auto max-w-[95%]'>
//         <div className="flex mt-3">
//           <button className={` text-gray-300 font-bold  inline-flex py-2 px-5 ${filterType === "all" ? "bg-[#25282E]  border-b border-blue-500" : "bg-[#1B1E21] border-b border-[#1F253F]"}`} onClick={() => handleFilterChange("all")}>
//             <img className=' mr-1 w-4 self-center' src={all} alt='debits' />
//             All
//           </button>
//           <span className='text-gray-500 self-center relative left-[-3px] opacity-40'>|</span>
//           <button className={`  text-gray-300 font-bold inline-flex py-2 px-5 ${filterType === "deposit" ? "bg-[#25282E] border-b border-blue-500" : "bg-[#1B1E21] border-b border-[#1F253F]"}`} onClick={() => handleFilterChange("deposit")}>
//             <img className=' mr-1 w-3 self-center' src={debits} alt='debits' />Debits
//           </button>
//           <span className='text-gray-500 self-center relative left-[-3px] opacity-40'>|</span>
//           <button className={`  text-gray-300 font-bold inline-flex py-2 px-5 ${filterType === "payout" ? "bg-[#25282E] border-b border-blue-500" : "bg-[#1B1E21] border-b border-[#1F253F]"}`} onClick={() => handleFilterChange("payout")}>
//           <img className=' mr-1 w-3 self-center' src={credits} alt='debits' />
//             Credits
//           </button>
//         </div>
//         <div className='mt-3 pb-4'>
//           {loading && (
//             <div className="relative top-[5px] bg-light-dasboard-gray">
//               <div className="loader-line"></div>
//             </div>
//           )}
//           <div className='pl-8 bg-[#25282E] rounded min-h-[75vh]'>

//             <div className='flex justify-between  pt-4'>
//               <div className='flex items-center gap-3'>
//                 {filterType == "payout" ?
//                   <h4 className='text-stone-300'>Showing Credits transactions</h4> :
//                   <h4 className='text-stone-300'>Showing Debits transactions</h4>}
//                 <h4 className='text-stone-300'>• Sort by <span className=' font-bold'>newest transactions first</span></h4>
//               </div>
//             </div>
//             <div className='mt-4 pt-2  border-t border-stone-300 border-opacity-20 max-w-[95%]'>
//               <table className='w-full table-auto text-stone-300'>
//                 <thead>
//                   <tr className='text-left'>
//                     <th className='font-medium py-2'>DATE</th>
//                     <th className=' font-medium py-2'>AMOUNT</th>
//                     <th className='font-medium py-2'>CONTACT</th>
//                     <th className='font-medium py-2'>VIA</th>
//                     <th className='font-medium py-2'>SOURCE</th>
//                     <th className='font-medium py-2'>UTR</th>
//                   </tr>
//                 </thead>
//                 {/* {loading ? (
//                   <></>
//                 ) : ( */}
//                 <tbody>
//                   {Object.entries(mergedData).map(([date, data]) => (
//                     <React.Fragment key={date}>
//                       {data
//                         .filter((item) => filterType === "all" || item.type === filterType)
//                         .length > 0 && (
//                           <tr className=' text-base font-medium'>
//                             <td >{date}</td>
//                             <td colSpan="5"></td>
//                           </tr>
//                         )}
//                       {/* {console.log("data of users", data, date)} */}
//                       {data
//                         .filter((item) => filterType === "all" || item.type === filterType)
//                         // .filter(item => item.type === 'deposit' && item.isVerified)
//                         .sort((a, b) => {
//                           const timeA = a.type === "payout" ? a.created_at : a.timestamp.seconds;
//                           const timeB = b.type === "payout" ? b.created_at : b.timestamp.seconds;
//                           return timeB - timeA;
//                         })
//                         .map((item, index) => (
//                           <tr className=' max-w[100px]' key={`${date}-${index}`}>
//                             {item.type === "payout" ? (
//                               <>
//                                 <td className='text-[#8F93A4] inline-flex py-2'><img className=' mr-1 w-3' src={credits} alt='debits' />{formatTime(item.created_at)}</td>
//                                 <td className='py-2'>
//                                   <svg className="w-[10px] inline-block mr-[3px]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                                     <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
//                                   </svg>
//                                   <span className=' text-xs font-bold text-[#8F93A4]'>₹</span>
//                                   {item.amount/100 || ""}</td>
//                               </>
//                             ) : (
//                               <>
//                                 <td className='text-[#8F93A4] inline-flex py-2'><img className=' mr-1 w-3' src={debits} alt='credits' />{formatTime(item.timestamp.seconds)}</td>
//                                 <td className=' py-2 '>
//                                   <svg className="w-[10px] inline-block mr-[3px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
//                                     <path fillRule="evenodd" d="M10 3a1 1 0 0 1 1 1v5h5a1 1 0 1 1 0 2h-5v5a1 1 0 1 1-2 0v-5H4a1 1 0 1 1 0-2h5V4a1 1 0 0 1 1-1z" clipRule="evenodd" />
//                                   </svg>
//                                   <span className=' text-xs font-bold text-[#8F93A4]'>₹</span>
//                                   {item.amount || ""}</td>
//                               </>
//                             )}

//                             <td className=' text-[#8F93A4] py-2'>contact</td>
//                             <td className=' text-[#8F93A4] py-2'>{item.mode || "--"}</td>
//                             <td className=' text-[#8F93A4] py-2'>source</td>
//                             <td className=' text-[#8F93A4] py-2'>{item.utr || "--"}</td>
//                           </tr>
//                         ))}
//                     </React.Fragment>
//                   ))}
//                 </tbody>
//                 {/* )} */}
//               </table>
//             </div>
//           </div>
//         </div>
//         {/* <Pagination
//           totalItems={Object.keys(mergedData).length}
//           itemsPerPage={itemsPerPage}
//           currentPage={currentPage}
//           onPageChange={onPageChange}
//         /> */}
//       </div>
//       {/* )} */}
//     </div>

//   )
// }

// export default AccountStatementPage



import React, { useEffect, useState } from 'react';
import { useUserAuth } from "../context/UserAuthContext";
import { db } from "../firebase";
import { doc, getDoc } from 'firebase/firestore';
import PayoutHeader from './Payout/pages/PayoutHeader';
import debits from '../assets/icon/payouts_icon/debits.svg';
import all from '../assets/icon/payouts_icon/all.svg';
import credits from '../assets/icon/payouts_icon/credits.svg';
import Pagination from '../components/Payout/pages/Pagination';

function AccountStatementPage() {
  const [depotransaction, setDepoTransaction] = useState([]);
  const [userPayoutData, setuserPayoutData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUserAuth();
  const [filterType, setFilterType] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  useEffect(() => {
    payoutsid();
    DepositTransaction();
  }, [user]);

  const payoutsid = async () => {
    setLoading(true);
    if (user.uid) {
      try {
        const docRef = doc(db, "UserTransactionDetails", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const userData = {
            id: docSnap.id,
            payoutId: docSnap.data().payoutId
          };
          setuserPayoutData(userData.payoutId);
          setLoading(false);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }
  };

  const DepositTransaction = async () => {
    if (user.uid) {
      try {
        const docRef = doc(db, "UserDepositTransactions", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const userData = {
            transaction: docSnap.data()
          };

          const verifiedTransactions = Object.values(userData.transaction)
            .filter(transaction => transaction.isVerified);

          setDepoTransaction(verifiedTransactions);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }
  };

  function formatTime(unixTimestamp) {
    const date = new Date(unixTimestamp * 1000); // Convert seconds to milliseconds
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }

  const formatDate = (timestamp) => {
    const date = new Date(timestamp * 1000); // Convert timestamp to milliseconds
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  function mergeDataByDate(payoutData, depositData) {
    const mergedData = {};

    payoutData.forEach((data) => {
      const dateKey = formatDate(data.created_at);
      if (!mergedData[dateKey]) {
        mergedData[dateKey] = [];
      }
      mergedData[dateKey].push({ type: 'payout', ...data });
    });

    depositData.forEach((data) => {
      const dateKey = formatDate(data.timestamp.seconds);
      if (!mergedData[dateKey]) {
        mergedData[dateKey] = [];
      }
      mergedData[dateKey].push({ type: 'deposit', ...data });
    });

    const sortedMergedData = Object.fromEntries(
      Object.entries(mergedData).sort(([dateA], [dateB]) => new Date(dateB) - new Date(dateA))
    );

    return sortedMergedData;
  }

  const depositDataArray = Object.keys(depotransaction).map((key) => ({
    ...depotransaction[key],
    id: key
  }));

  const mergedData = mergeDataByDate(userPayoutData, depositDataArray);

  const handleFilterChange = (type) => {
    setFilterType(type);
    setCurrentPage(1)
  };

  const onPageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // const indexOfLastItem = currentPage * itemsPerPage;
  // const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  // const paginatedData = Object.entries(mergedData)
  //   .slice(indexOfFirstItem, indexOfLastItem)
  //   .reduce((obj, [key, value]) => {
  //     obj[key] = value;
  //     return obj;
  //   }, {});

  const indexOfLastItem = currentPage * itemsPerPage;
const indexOfFirstItem = indexOfLastItem - itemsPerPage;

// Filter the merged data before paginating
const filteredMergedData = Object.entries(mergedData)
  .filter(([date, data]) => {
    return data.some(item => filterType === "all" || item.type === filterType);
  });

const paginatedData = filteredMergedData
  .slice(indexOfFirstItem, indexOfLastItem)
  .reduce((obj, [key, value]) => {
    obj[key] = value;
    return obj;
  }, {});
  
  return (
    <div className='bg-_blugradient'>
      <PayoutHeader accountstatement={true} />
      <div className='mx-auto max-w-[95%]'>
        <div className="flex mt-3">
          <button className={`text-gray-300 font-bold inline-flex py-2 px-5 ${filterType === "all" ? "bg-[#25282E] border-b border-blue-500" : "bg-[#1b1e2100] border-b border-[#1F253F]"}`} onClick={() => handleFilterChange("all")}>
            <img className='mr-1 w-4 self-center' src={all} alt='debits' />
            All
          </button>
          <span className='text-gray-500 self-center relative left-[-3px] opacity-40'>|</span>
          <button className={`text-gray-300 font-bold inline-flex py-2 px-5 ${filterType === "deposit" ? "bg-[#25282E] border-b border-blue-500" : "bg-[#1b1e2100] border-b border-[#1F253F]"}`} onClick={() => handleFilterChange("deposit")}>
            <img className='mr-1 w-3 self-center' src={debits} alt='debits' />Debits
          </button>
          <span className='text-gray-500 self-center relative left-[-3px] opacity-40'>|</span>
          <button className={`text-gray-300 font-bold inline-flex py-2 px-5 ${filterType === "payout" ? "bg-[#25282E] border-b border-blue-500" : "bg-[#1b1e2100] border-b border-[#1F253F]"}`} onClick={() => handleFilterChange("payout")}>
            <img className='mr-1 w-3 self-center' src={credits} alt='debits' />
            Credits
          </button>
        </div>
        <div className='mt-3 pb-4'>
          {loading && (
            <div className="relative top-[5px] bg-light-dasboard-gray">
              <div className="loader-line"></div>
            </div>
          )}
          <div className='pl-8 card_bg_gradient rounded min-h-[75vh]'>
            <div className='flex justify-between  pt-4'>
              <div className='flex items-center gap-3'>
                {filterType === "payout" ?
                  <h4 className='text-stone-300'>Showing Credits transactions</h4> :
                  <h4 className='text-stone-300'>Showing Debits transactions</h4>}
                <h4 className='text-stone-300'>• Sort by <span className='font-bold'>newest transactions first</span></h4>
              </div>
            </div>
            <div className='mt-4 pt-2  border-t border-stone-300 border-opacity-20 max-w-[95%]'>
              <table className=' w-full table-auto text-stone-300'>
                <thead className='rounded bg-gradient-to-r from-[#2d4e686c] to-[#FA75F86c] border-gradient'>
                  <tr className='text-left'>
                    <th className=' rounded-l pl-2 font-medium py-2'>DATE</th>
                    <th className='font-medium py-2'>AMOUNT</th>
                    <th className='font-medium py-2'>CONTACT</th>
                    <th className='font-medium py-2'>VIA</th>
                    <th className='font-medium py-2'>SOURCE</th>
                    <th className=' rounded-r font-medium py-2'>UTR</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(paginatedData).map(([date, data]) => (
                    <React.Fragment key={date}>
                      {data
                        .filter((item) => filterType === "all" || item.type === filterType)
                        .length > 0 && (
                          <tr className='text-base  font-medium'>
                            <td className=''>{date}</td>
                            <td colSpan="5"></td>
                          </tr>
                        )}
                      {data
                        .filter((item) => filterType === "all" || item.type === filterType)
                        .sort((a, b) => {
                          const timeA = a.type === "payout" ? a.created_at : a.timestamp.seconds;
                          const timeB = b.type === "payout" ? b.created_at : b.timestamp.seconds;
                          return timeB - timeA;
                        })
                        .map((item, index) => (
                          <tr className='max-w[100px]' key={`${date}-${index}`}>
                            {item.type === "payout" ? (
                              <>
                                <td className='text-[#8F93A4] pl-2 inline-flex py-2'><img className='mr-1 w-3' src={credits} alt='debits' />{formatTime(item.created_at)}</td>
                                <td className='py-2'>
                                  <svg className="w-[10px] inline-block mr-[3px]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                  <span className='text-xs font-bold text-[#8F93A4]'>₹</span>
                                  {item.amount / 100 || ""}
                                </td>
                              </>
                            ) : (
                              <>
                                <td className='text-[#8F93A4] pl-2 inline-flex py-2'><img className='mr-1 w-3' src={debits} alt='credits' />{formatTime(item.timestamp.seconds)}</td>
                                <td className='py-2'>
                                  <svg className="w-[10px] inline-block mr-[3px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 3a1 1 0 0 1 1 1v5h5a1 1 0 1 1 0 2h-5v5a1 1 0 1 1-2 0v-5H4a1 1 0 1 1 0-2h5V4a1 1 0 0 1 1-1z" clipRule="evenodd" />
                                  </svg>
                                  <span className='text-xs font-bold text-[#8F93A4]'>₹</span>
                                  {item.amount || ""}
                                </td>
                              </>
                            )}

                            <td className='text-[#8F93A4] py-2'>contact</td>
                            <td className='text-[#8F93A4] py-2'>{item.mode || "--"}</td>
                            <td className='text-[#8F93A4] py-2'>source</td>
                            <td className='text-[#8F93A4] py-2'>{item.utr || "--"}</td>
                          </tr>
                        ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
            <div className='text-[#8F93A4] pr-3 py-3'>
            <Pagination
        className=" mb-2"
            totalItems={
              (() => {
                const totalItems = Object.keys(mergedData)
  .filter(date => {
    const data = mergedData[date];
    const filteredData = data.filter(item => filterType === "all" || item.type === filterType);
    console.log("Filtered Data for Date", date, filteredData);
    return filteredData.length > 0;
  })
  .length;
          
                return totalItems;
              })()
          }

          // totalItems={itemsPerPage * }
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          onPageChange={onPageChange}
        />
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AccountStatementPage;


// import React, { useEffect, useState } from 'react';
// import { useUserAuth } from "../context/UserAuthContext";
// import { db } from "../firebase";
// import { doc, getDoc } from 'firebase/firestore';
// import PayoutHeader from './Payout/pages/PayoutHeader';
// import debits from '../assets/icon/payouts_icon/debits.svg';
// import all from '../assets/icon/payouts_icon/all.svg';
// import credits from '../assets/icon/payouts_icon/credits.svg';
// import Pagination from '../components/Payout/pages/Pagination';

// function AccountStatementPage() {
//   const [depotransaction, setDepoTransaction] = useState([]);
//   const [userPayoutData, setuserPayoutData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const { user } = useUserAuth();
//   const [filterType, setFilterType] = useState("all");
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 10; // Maximum items per page

//   useEffect(() => {
//     payoutsid();
//     DepositTransaction();
//   }, [user]);

//   const payoutsid = async () => {
//     setLoading(true);
//     if (user.uid) {
//       try {
//         const docRef = doc(db, "UserTransactionDetails", user.uid);
//         const docSnap = await getDoc(docRef);

//         if (docSnap.exists()) {
//           const userData = {
//             id: docSnap.id,
//             payoutId: docSnap.data().payoutId
//           };
//           setuserPayoutData(userData.payoutId);
//           setLoading(false);
//         } else {
//           setLoading(false);
//         }
//       } catch (error) {
//         console.error('Error fetching data:', error);
//       }
//     }
//   };

//   const DepositTransaction = async () => {
//     if (user.uid) {
//       try {
//         const docRef = doc(db, "UserDepositTransactions", user.uid);
//         const docSnap = await getDoc(docRef);

//         if (docSnap.exists()) {
//           const userData = {
//             transaction: docSnap.data()
//           };

//           const verifiedTransactions = Object.values(userData.transaction)
//             .filter(transaction => transaction.isVerified);

//           setDepoTransaction(verifiedTransactions);
//         } else {
//           setLoading(false);
//         }
//       } catch (error) {
//         console.error('Error fetching data:', error);
//       }
//     }
//   };

//   function formatTime(unixTimestamp) {
//     const date = new Date(unixTimestamp * 1000); // Convert seconds to milliseconds
//     return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
//   }

//   const formatDate = (timestamp) => {
//     const date = new Date(timestamp * 1000); // Convert timestamp to milliseconds
//     const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
//     return date.toLocaleDateString('en-US', options);
//   };

//   function mergeDataByDate(payoutData, depositData) {
//     const mergedData = {};

//     payoutData.forEach((data) => {
//       const dateKey = formatDate(data.created_at);
//       if (!mergedData[dateKey]) {
//         mergedData[dateKey] = [];
//       }
//       mergedData[dateKey].push({ type: 'payout', ...data });
//     });

//     depositData.forEach((data) => {
//       const dateKey = formatDate(data.timestamp.seconds);
//       if (!mergedData[dateKey]) {
//         mergedData[dateKey] = [];
//       }
//       mergedData[dateKey].push({ type: 'deposit', ...data });
//     });

//     const sortedMergedData = Object.fromEntries(
//       Object.entries(mergedData).sort(([dateA], [dateB]) => new Date(dateB) - new Date(dateA))
//     );

//     return sortedMergedData;
//   }

//   const depositDataArray = Object.keys(depotransaction).map((key) => ({
//     ...depotransaction[key],
//     id: key
//   }));

//   const mergedData = mergeDataByDate(userPayoutData, depositDataArray);

//   const handleFilterChange = (type) => {
//     setFilterType(type);
//     setCurrentPage(1); // Reset current page when filter changes
//   };

//   const onPageChange = (pageNumber) => {
//     setCurrentPage(pageNumber);
//   };

//   const filteredData = Object.entries(mergedData)
//     .map(([date, data]) => data.filter(item => filterType === "all" || item.type === filterType))
//     .flat(); // Flatten the array of arrays

//   const totalFilteredItems = filteredData.length;

//   const indexOfLastItem = currentPage * itemsPerPage;
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//   const paginatedData = filteredData.slice(indexOfFirstItem, indexOfLastItem);

//   console.log(paginatedData, mergedData)
//   return (
//     <div className='bg-[#1B1E21] min-h-screen'>
//       <PayoutHeader accountstatement={true} />
//       <div className='mx-auto max-w-[95%]'>
//         <div className="flex mt-3">
//           <button className={`text-gray-300 font-bold inline-flex py-2 px-5 ${filterType === "all" ? "bg-[#25282E] border-b border-blue-500" : "bg-[#1B1E21] border-b border-[#1F253F]"}`} onClick={() => handleFilterChange("all")}>
//             <img className='mr-1 w-4 self-center' src={all} alt='debits' />
//             All
//           </button>
//           <span className='text-gray-500 self-center relative left-[-3px] opacity-40'>|</span>
//           <button className={`text-gray-300 font-bold inline-flex py-2 px-5 ${filterType === "deposit" ? "bg-[#25282E] border-b border-blue-500" : "bg-[#1B1E21] border-b border-[#1F253F]"}`} onClick={() => handleFilterChange("deposit")}>
//             <img className='mr-1 w-3 self-center' src={debits} alt='debits' />Debits
//           </button>
//           <span className='text-gray-500 self-center relative left-[-3px] opacity-40'>|</span>
//           <button className={`text-gray-300 font-bold inline-flex py-2 px-5 ${filterType === "payout" ? "bg-[#25282E] border-b border-blue-500" : "bg-[#1B1E21] border-b border-[#1F253F]"}`} onClick={() => handleFilterChange("payout")}>
//             <img className='mr-1 w-3 self-center' src={credits} alt='debits' />
//             Credits
//           </button>
//         </div>
//         <div className='mt-3 pb-4'>
//           {loading && (
//             <div className="relative top-[5px] bg-light-dasboard-gray">
//               <div className="loader-line"></div>
//             </div>
//           )}
//           <div className='pl-8 bg-[#25282E] rounded min-h-[75vh]'>
//             <div className='flex justify-between  pt-4'>
//               <div className='flex items-center gap-3'>
//                 {filterType === "payout" ?
//                   <h4 className='text-stone-300'>Showing Credits transactions</h4> :
//                   <h4 className='text-stone-300'>Showing Debits transactions</h4>}
//                 <h4 className='text-stone-300'>• Sort by <span className='font-bold'>newest transactions first</span></h4>
//               </div>
//             </div>
//             <div className='mt-4 pt-2  border-t border-stone-300 border-opacity-20 max-w-[95%]'>
//               <table className='w-full table-auto text-stone-300'>
//                 <thead>
//                   <tr className='text-left'>
//                     <th className='font-medium py-2'>DATE</th>
//                     <th className='font-medium py-2'>AMOUNT</th>
//                     <th className='font-medium py-2'>CONTACT</th>
//                     <th className='font-medium py-2'>VIA</th>
//                     <th className='font-medium py-2'>SOURCE</th>
//                     <th className='font-medium py-2'>UTR</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {paginatedData.map((item, index) => (
//                     <tr key={index} className='max-w[100px]'>
//                       {item.type === "payout" ? (
//                         <>
//                           {/* {console.log("Item: ", item, index)} */}
//                           <td className='text-[#8F93A4] inline-flex py-2'><img className='mr-1 w-3' src={credits} alt='debits' />{formatTime(item.created_at)}</td>
//                           <td className='py-2'>
//                             <svg className="w-[10px] inline-block mr-[3px]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                               <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
//                             </svg>
//                             <span className='text-xs font-bold text-[#8F93A4]'>₹</span>
//                             {item.amount / 100 || ""}
//                           </td>
//                         </>
//                       ) : (
//                         <>
//                           <td className='text-[#8F93A4] inline-flex py-2'><img className='mr-1 w-3' src={debits} alt='credits' />{formatTime(item.timestamp.seconds)}</td>
//                           <td className='py-2'>
//                             <svg className="w-[10px] inline-block mr-[3px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
//                               <path fillRule="evenodd" d="M10 3a1 1 0 0 1 1 1v5h5a1 1 0 1 1 0 2h-5v5a1 1 0 1 1-2 0v-5H4a1 1 0 1 1 0-2h5V4a1 1 0 0 1 1-1z" clipRule="evenodd" />
//                             </svg>
//                             <span className='text-xs font-bold text-[#8F93A4]'>₹</span>
//                             {item.amount || ""}
//                           </td>
//                         </>
//                       )}

//                       <td className='text-[#8F93A4] py-2'>contact</td>
//                       <td className='text-[#8F93A4] py-2'>{item.mode || "--"}</td>
//                       <td className='text-[#8F93A4] py-2'>source</td>
//                       <td className='text-[#8F93A4] py-2'>{item.utr || "--"}</td>
//                     </tr>
//                   ))}
                  
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </div>
//         <Pagination
//           totalItems={totalFilteredItems}
//           itemsPerPage={itemsPerPage}
//           currentPage={currentPage}
//           onPageChange={onPageChange}
//         />
//       </div>
//     </div>
//   );
// }

// export default AccountStatementPage;
