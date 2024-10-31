import React, { useState } from "react";

const ProgressBar = ({ progress }) => {

  return (
    <div>
      <div style={{ width: `${progress}%`, height: "4px", backgroundColor: "rgba(131, 255, 129, 0.7)", transition: "width 0.3s ease-in-out 0s" }}></div>
    </div>
  );
};

export default ProgressBar;

// older blue color #59A0F7