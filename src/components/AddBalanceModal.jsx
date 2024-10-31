import React from "react";
import { Dialog, Transition } from "@headlessui/react";
import { FaTimes, FaCaretDown } from 'react-icons/fa';

const AddBalanceModal = ({ isOpen, onClose }) => {
  return (
    <Transition show={isOpen} as={React.Fragment}>
      <Dialog as="div" className="fixed inset-0 z-10 overflow-y-auto" onClose={onClose}>
        <div className="min-h-screen px-4 text-center">
          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
          </Transition.Child>

          {/* This element is to trick the browser into centering the modal contents. */}
          <span className="inline-block h-screen align-middle" aria-hidden="true">
            &#8203;
          </span>

          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-dark-blue shadow-xl rounded-2xl">
              <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-white">
                Add Balance
              </Dialog.Title>
              <button
                onClick={onClose}
                className="absolute top-0 right-0 mt-4 mr-4 text-white"
              >
                <FaTimes />
              </button>

              <div className="mt-4">
                <div className="bg-blue-800 p-4 rounded-md">
                  <h4 className="text-white font-semibold mb-2">Update balance to any of the following:</h4>
                  <div className="flex justify-between">
                    <span className="text-white">Axis Bank</span>
                    <FaCaretDown className="text-white" />
                  </div>
                  <div className="mt-2 text-white">
                    <p>A/C Holder: STORESHOPPY ONLINE SERVICES PRIVATE LIMITED</p>
                    <p>A/C Number: 984536441004684</p>
                    <p>IFSC: UTIBOCCH274</p>
                  </div>
                </div>
                <div className="mt-4 text-white text-sm">
                  <p>Make sure to transfer the balance from 4 Validated Accounts only.</p>
                  <button className="text-blue-400 mt-1">Show Details</button>
                </div>
                <div className="mt-4 text-white text-xs">
                  <p>NOTE:</p>
                  <ul className="list-disc pl-4">
                    <li>Supported modes: NEFT, RTGS, IMPS & UPI.</li>
                    <li>NEFT and RTGS transfers can take 2hrs & 30min respectively.</li>
                    <li>Contact support for any other issues.</li>
                  </ul>
                </div>
              </div>

            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};

export default AddBalanceModal;
