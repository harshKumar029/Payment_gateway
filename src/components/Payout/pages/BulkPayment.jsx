import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PayoutHeader from './PayoutHeader';

const BulkPayment = () => {
  const location = useLocation();
  const [rowCount, setRowCount] = useState(10);
  const [payoutModels, setPayoutModels] = useState(Array.from({ length: 10 }, () => '')); // Default payout models
  const [totalAmount, setTotalAmount] = useState(0);
  const navigate = useNavigate();
  const [payoutData, setPayoutData] = useState([]);
  const { backpayout } = location.state || {}
  const [missingFields, setMissingFields] = useState([]);
  const { backtotal } = location.state || {}

  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (backpayout && backpayout !== null) {
      setPayoutData(backpayout)
    }
    if (backtotal && backtotal !== null) {
      setTotalAmount(backtotal)
    }

  }

    , [backpayout]
  )
  const updateMissingFields = () => {
    const updatedMissingFields = payoutData.map(data => {
      const missingFields = [];

      if (!data.beneficiaryName) missingFields.push('Beneficiary Name');
      if (!data.beneficiaryaccountNumber) missingFields.push('Beneficiary Account Number');
      if (!data.ifscCode) missingFields.push('IFSC Code');
      if (!data.payoutAmount) missingFields.push('Payout Amount');
      if (!data.payoutModel) missingFields.push('Payout Model');

      return missingFields;
    });

    setMissingFields(updatedMissingFields);
  };

  useEffect(() => {
    updateMissingFields();
  }, [payoutData]);
  const isValidIFSC = (ifscCode) => {
    // Add your regex pattern for IFSC code validation
    const regexPattern = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    return regexPattern.test(ifscCode);
  };
  const isValidAccountNumber = (beneficiaryaccountNumber) => {
    const regexAccountPattern = /^\d{9,18}$/
    return regexAccountPattern.test(beneficiaryaccountNumber)
  }
  const handlePayoutModelChange = (e, index) => {
    const newPayoutModels = [...payoutModels];
    newPayoutModels[index] = e.target.value;
    setPayoutModels(newPayoutModels);

    // Calculate total amount
    const total = newPayoutModels.reduce((acc, model, i) => {
      const payoutAmount = payoutData[i]?.payoutAmount || 0;
      return acc + parseFloat(payoutAmount);
    }, 0);
    setTotalAmount(total);
    if (parseFloat(payoutData[index]?.payoutAmount || 0) > 0) {
      const updatedPayoutData = [...payoutData];
      updatedPayoutData[index] = {
        ...updatedPayoutData[index],
        payoutModel: e.target.value === 'NEFT' ? 'NEFT' :'IMPS',
      };
      setPayoutData(updatedPayoutData);
    }
  };

  // (parseFloat(updatedPayoutData[index]?.payoutAmount) > 500000 ? 'RTGS' : 

  const handleInputChange = (e, index, field) => {
    let isValidIFSC = true;
    let isValidAccountNumber = true
    let isValidAccountName = true
    let isValidAmount = true
    const newValue = e.target.value;
    // Convert IFSC code to uppercase
    const updatedValue = field === 'ifscCode' ? newValue.toUpperCase() : newValue;
    const updatedPayoutData = [...payoutData];


    if (field === 'beneficiaryaccountNumber') {
      if (!(newValue.match(/^[0-9]{0,18}$/))) {
        isValidAccountNumber = false;
      }
    }
    if (!isValidAccountNumber) {
      // console.log('Invalid accountnumber code');
      return;
    }
    if (field === 'beneficiaryName') {
      if (!(newValue.match(/^[A-Za-z ]*$/))) {
        isValidAccountName = false;
      }
    }
    if (!isValidAccountName) {
      // console.log('Invalid name');
      return;
    }
    if (field === 'ifscCode') {
      // Use updatedValue instead of newValue
      if (!(updatedValue.match(/^[A-Z]{0,4}[A-Z0-9]{0,7}$/))) {
        isValidIFSC = false;
      }
    }
    // if (field === 'ifscCode') {
    //   if (!(updatedValue.match(/^[A-Z]{4}[0][A-Z0-9]{6}$/))) {
    //     isValidIFSC = false;
    //   }
    // }
    // if (field === 'ifscCode') {
    //   if (!(newValue.match(/^[A-Z]{0,4}[0-9]{0,7}$/))) {
    //     isValidIFSC = false;
    //   }
    // }
    if (!isValidIFSC) {
      // console.log("wrong ifsc")
      return
    }
    // if (field === 'payoutAmount') {
    //   if (!(newValue.match(/^$|^(?!0)\d+$/))) {
    //     isValidAmount = false;
    //   }
    //   if(newValue >= 500000){
    //     setShowPopup(true)
    //     setIsError(true);
    //     setPopupMessage("Iadkhcgiudegvbbj");
    //   }
    // }
    if (field === 'payoutAmount') {
  // Check if newValue is not empty and is a non-zero positive integer
  if (!(newValue.match(/^$|^(?!0)\d+$/))) {
    isValidAmount = false;
  }
  
  // (!(newValue.match(/^$|^(?!0)([1-9]\d{0,}|500000)$/)))
  if (parseInt(newValue) > 500000) {
    setShowPopup(true);
    setIsError(true);
    setPopupMessage("The payout amount cannot exceed 500000.");
  }
}
    if (!isValidAmount) {
      // console.log('Invalid amount');
      return;
    }

    updatedPayoutData[index] = {
      ...updatedPayoutData[index],
      [field]: updatedValue,
      filled: !!newValue,
    };
    setPayoutData(updatedPayoutData);
    if (field === 'payoutAmount') {
      const newValue = e.target.value;
      const isNewAmountEmpty = newValue.trim() === '';

      updatedPayoutData[index] = {
        ...updatedPayoutData[index],
        [field]: newValue,
        payoutModel: isNewAmountEmpty ? '' : 'IMPS',
        filled: !!newValue,
      };

      // parseFloat(newValue) > 500000 ? 'RTGS' :
    }
    const allFieldsEmpty = Object.values(updatedPayoutData[index]).every(value => !value);
    if (allFieldsEmpty) {
      updatedPayoutData.splice(index, 1);
      setPayoutData(updatedPayoutData);
      return;
    }
    // Recalculate total amount
    const total = updatedPayoutData.reduce((acc, data) => {
      const payoutAmount = data.payoutAmount || 0;
      return acc + parseFloat(payoutAmount);
    }, 0);
    setTotalAmount(total);
  };

  const isSubmitDisabled = !payoutData.some(data =>
    data.beneficiaryName || data.beneficiaryaccountNumber || data.ifscCode || data.payoutAmount || data.payoutModel
  ) || !payoutData.every(data =>
    data.beneficiaryName && data.beneficiaryaccountNumber && data.ifscCode && data.payoutAmount && data.payoutModel
  );
  // console.log(payoutData.map(data => data))
  const renderRows = () => {
    const rows = [];
    for (let i = 0; i < rowCount; i++) {
      const isPreviousRowFilled = i === 0 || payoutData[i - 1]?.filled;

      rows.push(
        <tr key={i} className='bg-[#bg-[#25282E]]'>
          <td className="px-3 pt-3 pb-3">
            <input
              type="text"
              value={payoutData[i]?.beneficiaryName || ''}
              onChange={(e) => handleInputChange(e, i, 'beneficiaryName')}
              disabled={!isPreviousRowFilled}
              placeholder="Name"
              className="rounded-sm px-2 py-1 border-b border-gray-700 focus:outline-none bg-[#25282E]"
            />
          </td>
          <td className="px-3 pt-3 pb-2">
            <input
              type="text"
              value={payoutData[i]?.beneficiaryaccountNumber || ''}
              onChange={(e) => handleInputChange(e, i, 'beneficiaryaccountNumber')}
              disabled={!isPreviousRowFilled}
              placeholder="Beneficiary Account Number"
              className="rounded-sm px-2 py-1 border-b border-gray-700 bg-[#25282E] appearance-none focus:outline-none"
            />
          </td>
          <td className="px-3 pt-3 pb-2">
            <input
              type="text"
              value={payoutData[i]?.ifscCode || ''}
              onChange={(e) => handleInputChange(e, i, 'ifscCode')}
              disabled={!isPreviousRowFilled}
              placeholder="Ifsc Code"
              className=" appearance-none rounded-sm px-2 py-1  border-b border-gray-700  focus:outline-none bg-[#25282E]"
              style={{ textTransform: 'uppercase' }}
            />
          </td>
          <td className="px-3 pt-3 pb-2">
            <input
              type="text"
              value={payoutData[i]?.payoutAmount || ''}
              disabled={!isPreviousRowFilled}
              onChange={(e) => handleInputChange(e, i, 'payoutAmount')}
              placeholder="Payout Amount"
              className="rounded-sm px-2 py-1  border-b border-gray-700 focus:outline-none bg-[#25282E]"
            />
          </td>
          <td className="px-3 pt-3 pb-2">
            <select
              value={payoutData[i]?.payoutModel || payoutModels[i]}
              disabled={!isPreviousRowFilled || !payoutData[i]?.payoutAmount}
              onChange={(e) => handlePayoutModelChange(e, i)}
              className="rounded-sm px-2 py-1 border border-gray-700 focus:outline-none bg-[#25282E]"
            >
              {/* {parseFloat(payoutData[i]?.payoutAmount || 0) > 500000 ? (
                <option value="RTGS">RTGS</option>
              ) : ( */}
                <>
                  <option value="IMPS">IMPS</option>
                  <option value="NEFT">NEFT</option>
                </>
              {/* )} */}
            </select>
          </td>
        </tr>
      );
    }
    return rows;
  };
  // useEffect(()=>{
  //  const visible =  payoutData.beneficiaryName==='' ? true : false
  // setDisabledSubmit(visible)
  // console.log(disableSubmit)

  // },[payoutData])
    // closing the popup message box after 3 sec
  if (showPopup) {
    setTimeout(() => {
      setShowPopup(false);
    }, 3000);
  }
  const bulkpayout = () => {
    const invalidIFSC = payoutData.some((data) => data.ifscCode && !isValidIFSC(data.ifscCode));
    if (invalidIFSC) {
      // console.log("Invalid IFSC code found. Please correct the IFSC codes.");
      setShowPopup(true)
      setIsError(true);
      setPopupMessage("Invalid IFSC code found. Please correct the IFSC codes.");
      return;
    }

    if (payoutData.some(data => data.payoutAmount > 500000)) {
      setShowPopup(true)
      setIsError(true);
      setPopupMessage("Payout amount exceeds 500000! For RTGS Use Normal Payout for amounts above this limit");
      return;
    }

    const invalidbeneficiaryaccountNumber = payoutData.some((data) => data.beneficiaryaccountNumber && !isValidAccountNumber(data.beneficiaryaccountNumber));
    if (invalidbeneficiaryaccountNumber) {
      // console.log("Invalid account number found. Please correct the account number.");
      setShowPopup(true)
      setIsError(true);
      setPopupMessage("Invalid account number found. Please correct the account number.");
      return;
    }
    // if (isSubmitDisabled) {
    // console.log("Please fill in all payout data fields");
    //   return;
    // }
    if (isSubmitDisabled) {
      // console.log("Please fill in all payout data fields:");
      payoutData.forEach((data, index) => {
        if (!data.beneficiaryName || !data.beneficiaryaccountNumber || !data.ifscCode || !data.payoutAmount || !data.payoutModel) {
          // console.log("efwdgerger hjv"`Row ${index + 1}: Missing fields - ${missingFields[index].join(', ')}`);
        }
      });
      return;
    }
    navigate('/payouts/bulk/CreateBulkPayoutButton', {
      state: {
        payoutData,
        totalAmount,
      },
    });
  };
  // console.log("efcedcwece ewcew cew", totalAmount, payoutData)

  return (
    <div className='bg-[#1B1E21]'>
      <div className='py-4 bg-[#8080800a] border-b border-[gray]  border-opacity-25'>
        <div className='flex justify-between  w-[97%] '>
          <h1 className=''> </h1>
          <div className='flex'>
            <h1 className=' self-center mr-5 font-semibold text-[#fff]'>Generate payouts using Excel</h1>
            <button onClick={() => navigate('/payouts/bulk/uploadfile')} className='bg-blue-800 text-base font-bold rounded-sm py-[6px] px-4 text-white'>Excel Bulk Payouts</button>
          </div>
        </div>
      </div>
      {/* <PayoutHeader /> */}
      <div className=" flex justify-center w-[95%] m-auto flex-col pt-[35px!important] shadow-sm shadow-slate-900 text-stone-300 rounded-lg overflow-hidden">

        <table className='  rounded-sm bg-[#25282E]' >
          <thead className=' border-b border-gray-500'>
            <tr>
              <th className="px-3 py-4 text-left  text-stone-300">Beneficiary Name</th>
              <th className="px-3 py-4 text-left text-stone-300">Beneficiary Account Number</th>
              <th className="px-3 py-4 text-left text-stone-300">Ifsc Code</th>
              <th className="px-3 py-4 text-left text-stone-300">Payout Amount</th>
              <th className="px-3 py-4 text-left text-stone-300">Payout Model</th>
            </tr>
          </thead>
          <tbody>{renderRows()}</tbody>
        </table>
        <div className='w-[90%] m-auto'>
          <button className={`my-4 float-end  ${isSubmitDisabled ? "cursor-not-allowed" : "cursor-pointer"} bg-blue-800 text-base font-bold rounded-sm py-2 px-8 text-white `} onClick={bulkpayout} disabled={isSubmitDisabled}>
            Submit
          </button>
        </div>
      </div>
       {/* Success/Error Popup */}
       {showPopup && (
            <div className={` fixed top-20 z-50 left-1/2 transform -translate-x-1/2 p-4 rounded-lg shadow-lg ${isError ? 'bg-red-500' : 'bg-green-500'} text-white`}>
              <p>{popupMessage}</p>
            </div>
          )}

    </div>

  );
};
export default BulkPayment;
