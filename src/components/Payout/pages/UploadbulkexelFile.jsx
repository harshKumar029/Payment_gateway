import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as ExcelJS from 'exceljs';
import CreateContactHeader from './CreateContactHeader';
import ProgressBar from './Progress';


const UploadbulkexelFile = () => {
  const [uploadFile, setUploadFile] = useState(null);
  const [payoutData, setPayoutData] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    processUploadedFile();
  }, [uploadFile]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    setUploadFile(file); 
  };

  const processUploadedFile = () => {
    if (!uploadFile) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      
      const workbook = new ExcelJS.Workbook();
      workbook.xlsx.load(data).then(() => {
        const worksheet = workbook.getWorksheet(1); // Assuming you want the first sheet
        const jsonData = [];

        worksheet.eachRow((row) => {
          jsonData.push(row.values);
        });

        // Now jsonData contains the data from the worksheet
        // Process the data further as needed

        // For example, mapping the data to payoutData
        const mappedData = jsonData.slice(1).map(row => ({
          beneficiaryName: row[1] || '',
          beneficiaryaccountNumber: row[2] || '',
          ifscCode: row[3] || '',
          payoutAmount: row[4] || '',
          payoutModel: row[5] || '',
        }));

        setPayoutData(mappedData);
        const total = mappedData.reduce((acc, data) => acc + parseFloat(data.payoutAmount || 0), 0);
        setTotalAmount(total);
      });
    };

    reader.readAsArrayBuffer(uploadFile);
  };


  const downloadExcel = () => {
    const headers = [
      'Beneficiary Name (Mandatory)',
      'Beneficiary Account Number (Mandatory)\nTypically 9-18 digits',
      'Ifsc Code (Mandatory)\n11 digit code of the beneficiary’s bank account. Eg. HDFC0004277',
      'Payout Amount (Mandatory)\nAmount should be in rupees',
      'Payout Model (Mandatory)\nSelect IMPS/NEFT (RTGS NOT ALLOWED)',
    ];
    
    const data = Array.from({}, () => ({
      beneficiaryName: '',
      beneficiaryaccountNumber: '',
      ifscCode: '',
      payoutAmount: '',
      payoutModel: '',
    }));

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet1');


    const headerStyle = {
      // font: { bold: true},
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E5F6DE' } },
      alignment: { horizontal: 'left', vertical: 'middle', wrapText: true, height: 40 },
      border: {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } },
      },
    };

    // Write headers to the worksheet and set column width
    headers.forEach((header, index) => {
      worksheet.getCell(1, index + 1).value = header;
      worksheet.getCell(1, index + 1).style = headerStyle;
      worksheet.getColumn(index + 1).width = 38; // Set column width to 35px
    });

    // Add data rows
    data.forEach((rowData, rowIndex) => {
      headers.forEach((header, columnIndex) => {
        worksheet.getCell(rowIndex + 2, columnIndex + 1).value = rowData[header];
      });
    });

    // Generate Excel file
    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
      const fileName = 'bulk_payment_template.xlsx';
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  if (uploadFile && payoutData.length > 0) {
    navigate('/payouts/bulk/CreateBulkPayoutButton', {
      state: {
        payoutData,
        totalAmount,
        Excelpayout: true,
      },
    });
  }




  return (
    <div className=' bg-[#1B1E21] h-[100vh]'>
      <CreateContactHeader bulkpayout={true} />
      <ProgressBar progress={50} />
      <div className=' w-[50%] m-auto mb-4 '>
        <h1 className="flex mt-5 mb-4">
          <div className=" mr-1 font-bold  text-[#fff] text-xl">Upload</div>
          <div className=" text-gray-400 text-xl">File</div>
        </h1>
        <div className="flex items-center justify-center ">
          <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-[#272829] hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
              </svg>
              <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Drop your .xlsx or .csv file here (MAX. 5MB)</p>
            </div>
            <input id="dropzone-file" type="file" accept=".xlsx, .xls" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
        <div className=' mt-4 self-center'>
          <div className=' w-[17rem] m-auto '>
          <p className=' text-white'>This file must follow the template</p>
          <button className="mr-2 px-4 mt-1  text-[#80B3F9] flex rounded" onClick={downloadExcel}>
            Download Template
            <p className="ml-1 rounded-sm px-2 py-[1px] text-black bg-[#83FF81]  text-[10px] font-semibold self-center">NEW</p>
          </button>
          </div>
        </div>

      </div>
    </div>
  )
}

export default UploadbulkexelFile