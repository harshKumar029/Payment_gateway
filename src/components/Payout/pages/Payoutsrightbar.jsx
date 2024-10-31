import React from 'react'
import Payout from '../../../assets/icon/payouts_icon/payout.svg';

const Payoutsrightbar = ({ userData, isOpen, onClose }) => {
    // console.log("userData in Payoutsrightbar:", userData);
    const { payoutData = [], fundaccount = [] } = userData || {};
    const formatDate = (timestamp) => {
        const createdAtMillis = timestamp * 1000;
        const createdAtDate = new Date(createdAtMillis);
        return ` ${createdAtDate.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
      };

    return (
        <div className={`sidebar ${isOpen ? 'open' : 'closed'} absolute right-0 z-10 bg-[#1B1E21] min-h-full border-l border-gray-700`}>
            {/* <div className=' absolute right-0 bg-BLACK-MARKET min-h-full border-l border-gray-700 '> */}
            <button className=' fixed p-2' type="button" aria-label="Close" onClick={onClose}>
                <svg aria-hidden="true" data-blade-component="icon" height="20px" viewBox="0 0 24 24" width="20px" fill="#8f93a4" className="Svgweb__StyledSvg-vcmjs8-0">
                    <path d="M18.7071 6.70711C19.0976 6.31658 19.0976 5.68342 18.7071 5.29289C18.3166 4.90237 17.6834 4.90237 17.2929 5.29289L12 10.5858L6.70711 5.29289C6.31658 4.90237 5.68342 4.90237 5.29289 5.29289C4.90237 5.68342 4.90237 6.31658 5.29289 6.70711L10.5858 12L5.29289 17.2929C4.90237 17.6834 4.90237 18.3166 5.29289 18.7071C5.68342 19.0976 6.31658 19.0976 6.70711 18.7071L12 13.4142L17.2929 18.7071C17.6834 19.0976 18.3166 19.0976 18.7071 18.7071C19.0976 18.3166 19.0976 17.6834 18.7071 17.2929L13.4142 12L18.7071 6.70711Z" fill="#8f93a4" data-blade-component="svg-path"></path>
                </svg>
            </button>
            <div className=' pl-10 pr-10 mt-12 '>
                <div className='  mb-4 border-gray-700'>
                    <div className=''>
                        <h2 className="font-bold "><span className='text-stone-300'>₹</span><span className=" text-white text-2xl">{payoutData && payoutData.length > 0 ? payoutData[0].amount/100 : '--'}</span></h2>
                        <p className='text-stone-300 text-xs mt-2'>Created on {payoutData && payoutData.length > 0 ? formatDate(payoutData[0].created_at) : '--'} • {payoutData && payoutData.length > 0 ? payoutData[0].id : '--'}</p>
                    </div>
                    <div className=' flex justify-between mt-4'>
                        <h5 className=' flex text-white text-sm items-end'>
                        {/* {payoutData && payoutData.length > 0 && payoutData[0].status ? ( */}

                            <div className="w-3 h-3 mr-2 rounded-full bg-red-500 bg-opacity-50"></div>
                            {/* ):'hello'} */}

                            {payoutData && payoutData.length > 0 ? payoutData[0].status : '--'}</h5>
                        <p className='text-stone-300 font-bold text-xs self-end'>{payoutData && payoutData.length > 0 ? formatDate(payoutData[0].created_at) : '--'}</p>
                    </div>
                </div>
                <div className=' flex py-8 border-y border-gray-700 '>
                    <div>
                        <div>
                            <h3 className=' mb-3'>
                                <span className='text-white font-bold'>Payout</span>
                                <span className='text-stone-300 ml-1'>details</span>
                            </h3>
                            <div className="flex  text-sm flex-col space-y-4">
                                <p className="flex justify-between">
                                    <span className='text-stone-300'>UTR Number</span>
                                    <span className='text-white'>{payoutData && payoutData.length > 0 && payoutData[0].utr ? payoutData[0].utr : '--'}</span>
                                </p>
                                <p className="flex justify-between">
                                    <span className='text-stone-300'>Debit From</span>
                                    <span className='text-white'>Storeshoppy</span>
                                </p>
                                <p className="flex justify-between">
                                    <span className='text-stone-300'>Purpose</span>
                                    <span className='text-white'>{payoutData && payoutData.length > 0 && payoutData[0].refund ? payoutData[0].refund : '--'}</span>
                                </p>
                                <p className="flex justify-between">
                                    <span className='text-stone-300'>Transfer Method</span>
                                    <span className='text-white'>{payoutData && payoutData.length > 0 && payoutData[0].mode ? payoutData[0].mode : '--'}</span>
                                </p>
                                <p className="flex justify-between">
                                    <span className='text-stone-300'>Payout ID</span>
                                    <span className='text-white ml-4'>{payoutData && payoutData.length > 0 && payoutData[0].id ? payoutData[0].id : '--'}</span>
                                </p>
                                <p className="flex justify-between">
                                    <span className='text-stone-300'>Status</span>
                                    <span className='text-white'>{payoutData && payoutData.length > 0 && payoutData[0].status ? payoutData[0].status : '--'}</span>
                                </p>
                                <p className="flex justify-between">
                                    <span className='text-stone-300'>Amount</span>
                                    <span className='text-white'>{payoutData && payoutData.length > 0 && payoutData[0].amount ? payoutData[0].amount/100 : '--'}</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className=' my-4'>
                    <h3>
                        <span className='text-white font-bold'>Contact</span>
                        <span className='text-stone-300 ml-1'>details</span>
                    </h3>
                    {/* <h3 >Contactdetails</h3> */}

                    <div className=' flex mt-3'>
                        <img src={Payout} alt='acount_transfer_logo' />
                        <h4 className='text-white self-end ml-2'>{payoutData && payoutData.length > 0 && payoutData[0].mode ? payoutData[0].mode : '--'}</h4>
                        {/* <p className=' text-stone-300 ml-2'>xyz@ybl</p> */}
                        {fundaccount && fundaccount.length > 0 && fundaccount[0].bank_account ? (
                            <p className='text-stone-300 ml-2'>{fundaccount[0].bank_account.account_number}</p>
                        ) : fundaccount && fundaccount.length > 0 && fundaccount[0].vpa ? (
                            <p className='text-stone-300 ml-2'>{fundaccount[0].vpa.address}</p>
                        ) : (
                            '--'
                        )}
                    </div>
                </div>
            </div>
        </div>
        // </div>
    )
}

export default Payoutsrightbar