
import React, { useEffect, useState } from 'react';
import { Routes, Route } from "react-router-dom";
import './App.css';
import Login from "./components/Login";
import Signup from "./components/Signup";
import PhoneSignUp from "./components/PhoneSignUp";
import ProtectedRoute from "./components/ProtectedRoute";
import AddBalance from "./components/AddBalance";
import CreateFundAccountForm from './components/Payout/pages/CreateFundAccountForm';
import { UserAuthContextProvider } from "./context/UserAuthContext";
import AuthenticatedLayout from './AuthenticatedLayout'; 
import Home from "./components/Home";
import AccountStatementPage from './components/AccountStatementPage';
import Payouts from './components/Payout/pages/Payouts';
import CreatePayoutButton from './components/Payout/pages/CreatePayoutButton';
import BulkPayment from './components/Payout/pages/BulkPayment';
import CreateBulkPayoutButton from './components/Payout/pages/CreateBulkPayoutButton';
import BatchPayouts from './components/Payout/pages/BatchPayouts';
import RequestCallback from './components/RequestCallback';
import AddBankaccount from './components/AddBankaccount';
import PayoutHeader from './components/Payout/pages/PayoutHeader';
import UploadbulkexelFile from './components/Payout/pages/UploadbulkexelFile';
import Analytics from './components/Analytics';
import Loading from './components/Payout/pages/Loading';


function App() {

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 1000); 
  }, []);

  return (
    <UserAuthContextProvider>
      {isLoading ? (
        <div className="  bg-light-dasboard-gray">
          <Loading />
        </div>
      ) : (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/phonesignup" element={<PhoneSignUp />} />
        
        {/* Wrap protected routes in AuthenticatedLayout */}
        <Route path="/payouts" element={<ProtectedRoute><AuthenticatedLayout><PayoutHeader><Payouts /></PayoutHeader></AuthenticatedLayout></ProtectedRoute>} />
        <Route path="/" element={<ProtectedRoute><AuthenticatedLayout><Home /></AuthenticatedLayout></ProtectedRoute>} />
        <Route path="/addAccount" element={<ProtectedRoute><AuthenticatedLayout><AddBalance /></AuthenticatedLayout></ProtectedRoute>} />
        <Route path="/payouts/bulk" element={<ProtectedRoute><AuthenticatedLayout><PayoutHeader><BulkPayment/></PayoutHeader></AuthenticatedLayout></ProtectedRoute>} />
        <Route path="/payouts/batch" element={<ProtectedRoute><AuthenticatedLayout><PayoutHeader><BatchPayouts/></PayoutHeader></AuthenticatedLayout></ProtectedRoute>} />
        <Route path="/requestcall" element={<ProtectedRoute><AuthenticatedLayout><RequestCallback /></AuthenticatedLayout></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><AuthenticatedLayout><Analytics /></AuthenticatedLayout></ProtectedRoute>} />
        

        {/* payouts all pages routes */}
        <Route path="/payouts/CreateFundAccountForm" element={<ProtectedRoute><CreateFundAccountForm /></ProtectedRoute>} />
        <Route path="/payouts/CreatePayoutButton" element={<ProtectedRoute><CreatePayoutButton /></ProtectedRoute>} />
        <Route path="/payouts/bulk/CreateBulkPayoutButton" element={<ProtectedRoute><CreateBulkPayoutButton /></ProtectedRoute>} />
        <Route path="/payouts/bulk/uploadfile" element={<ProtectedRoute><UploadbulkexelFile/></ProtectedRoute>} />
        
        {/* <Route element={<ProtectedRoute><AuthenticatedLayout /></ProtectedRoute>}>
          <Route path="/" element={<Home />} />
          <Route path="/addbalance" element={<AddBalance />} />
        </Route> */}
        <Route path='/add_bankaccount' element={<ProtectedRoute><AddBankaccount/></ProtectedRoute>}/>
        <Route path='/ledger' element={<ProtectedRoute><AuthenticatedLayout><AccountStatementPage /></AuthenticatedLayout></ProtectedRoute>}/>
        
      </Routes>
      )}
    </UserAuthContextProvider>
  );
}

export default App;


