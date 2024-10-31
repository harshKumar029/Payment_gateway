import React from 'react';

const AppProvider = ({ children }) => {
  const [contactId, setContactId] = useState(null);
  const [fundAccountNo, setFundAccountNo] = useState(null);
  const [payoutResult, setPayoutResult] = useState(null);
  const [progress, setProgress] = useState(32);

  return (
    <div value={{ contactId, setContactId, fundAccountNo, setFundAccountNo, payoutResult, setPayoutResult, progress, setProgress }}>
      {children}
    </div>
  );
};

export default AppProvider;