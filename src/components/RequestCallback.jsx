// Import necessary modules and components
import React, { useEffect, useState } from 'react';
import { Form, Button, Container, Col, Row } from 'react-bootstrap';
import { db, storage } from "../firebase";
import { doc, setDoc, collection, getDoc, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytes } from "firebase/storage";
import { v4 as uuidv4 } from 'uuid';
import { useUserAuth } from '../context/UserAuthContext';
// import './RequestCallback.css';
import PayoutHeader from './Payout/pages/PayoutHeader';

const RequestCallback = () => {
  // Use user authentication context
  const { user } = useUserAuth();

  // State variables
  const [formData, setFormData] = useState({
    requestText: '', // Add a new field for the request text
  });
  const generateShortUuid = () => {
    const fullUuid = uuidv4();
    return fullUuid.slice(0, 15);
  };

  const [imageFiles, setImageFiles] = useState([null, null, null]);
  const [formErrors, setFormErrors] = useState({});
  const [requests, setRequests] = useState([]);
  const [usersdata, setusersdata] = useState([]);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);

  const UID = user.uid;
  useEffect(() => {
    if (UID) {

      const fetchRequests = async () => {
        try {
          const callbacksCollection = collection(db, 'callbacks');
          const userDocRef = doc(callbacksCollection, UID);
          const userDocData = await getDoc(userDocRef);

          if (userDocData.exists()) {
            const userEntries = userDocData.data().entries || [];
            setRequests(userEntries.reverse());
          }
        } catch (error) {
          // console.error('Error fetching requests:', error);
        }
      };
      const unsubscribe = onSnapshot(doc(db, 'callbacks', UID), (snapshot) => {
        fetchRequests();
      });

      return () => {
        unsubscribe();
      }
    }
  }, [UID]);


  useEffect(() => {
    const getUserDetails = async () => {
      try {
        const docRef = doc(db, "Users", UID);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setusersdata(docSnap.data());
        } else {
        }
      } catch (error) {
      }
    };

    getUserDetails();
  }, []);


  // Validation function
  const validate = (values) => {
    const errors = {};
    if (!values.requestText.trim()) {
      errors.requestText = 'Request text is required';
    }

    // Validate at least one image selected
    // const hasSelectedImage = imageFiles.some(file => file !== null);
    // if (!hasSelectedImage) {
    //   errors.formFiles = 'Please upload at least one image';
    // }

    return errors;
  };

  // Handle form field changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle file changes for image uploads
  const handleFileChange = (e, index) => {
    const updatedImageFiles = [...imageFiles];
    updatedImageFiles[index] = e.target.files[0];
    setImageFiles(updatedImageFiles);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form fields
    const errors = validate(formData);
    setFormErrors(errors);

    // Check file sizes
    const exceedsLimit = imageFiles.some(file => file && file.size > 20 * 1024 * 1024);
    if (exceedsLimit) {
      setFormErrors({ formFiles: 'File size should be less than 20MB for each image' });
      return;
    }

    // Proceed with submission
    if (Object.keys(errors).length === 0) {
      try {
        // Create a unique ID for the request
        const requestId = generateShortUuid()

        // Upload image files to storage
        const imageUrls = await Promise.all(imageFiles.map(async (file, index) => {
          if (file) {
            const imageRef = ref(storage, `requestcallback/${requestId}_image${index + 1}`);
            await uploadBytes(imageRef, file);
            return `requestcallback/${requestId}_image${index + 1}`;
          }
          return null;
        }));

        // Prepare data for Firestore
        const requestData = {
          reason: formData.requestText,
          photoURLs: imageUrls,
          timestamp: new Date(),
          ispending: true,
        };

        // Add the request to the user's callbacks document
        const callbacksCollection = collection(db, 'callbacks');
        const userDocRef = doc(callbacksCollection, UID);
        const userDocData = await getDoc(userDocRef);

        const userEntries = userDocData.exists() ? userDocData.data().entries || [] : [];

        // Add the new entry to the existing entries
        userEntries.push({
          id: requestId,
          data: requestData,
        });

        // Update the user's document with the new entries
        await setDoc(userDocRef, { entries: userEntries }, { merge: true });
        // console.log('Request submitted successfully');
        setFormData({
          requestText: '',
        });
        setImageFiles([null, null, null])
      } catch (error) {
        // console.error('Error submitting request:', error);
      }

    } else {
      // console.log("Fix errors in the form");
      // console.log(errors);
    }
  };

  // time in Mar 13, 2024 formate
  const timestampToDate = (timestamp) => {
    // Convert the timestamp to milliseconds
    const milliseconds = timestamp.seconds * 1000 + Math.round(timestamp.nanoseconds / 1000000);
    const date = new Date(milliseconds);
    const formattedDate = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    });

    return formattedDate;
  };
  // time in 12:20 PM formate
  const timestampToTime = (timestamp) => {
    const milliseconds = timestamp.seconds * 1000 + Math.round(timestamp.nanoseconds / 1000000);
    const date = new Date(milliseconds);
    const formattedTime = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
    return formattedTime;
  };


  // Render the form
  return (
    <div className='bg-[#1B1E21] h-screen'>
      <PayoutHeader showLeftData={false} support={true} />
      <div>

      </div>
      <div className=' '>
        <div className=" py-2 border-b border-stone-300 border-opacity-20  overflow-hidden">
          <div className="overflow-y-auto h-96 scroll-container">

            {requests.map((request) => (
              <div className='' key={request.id} >
                <div className='flex justify-center items-center'>
                  <hr className='border-t-2 border-[#ffffff] w-[43%]' />
                  <button className='text-[#6C6C6C] bg-[#25282E] w-[7rem] rounded-xl'>{timestampToDate(request.data.timestamp)}</button>
                  <hr className='border-t-2 border-[#ffffff] w-[43%]' />
                </div>
                <div className='pl-11'>
                  <div className=' flex my-2'>
                    <p className='text-[#c2c0c0a1] font-thin text-[16px] '>Id: {request.id}</p>
                    {/* <p className='text-[#ffffff] '>{usersdata.Name && usersdata.Name.toUpperCase()}</p> */}
                    <p className='text-[#D6D3D1] ml-1'>{timestampToTime(request.data.timestamp)}</p>
                    {!request.data.ispending ? (
                      <p className="ml-3 rounded-full px-2 py-1 text-black bg-[#83FF81] font-bold text-xs self-center">
                        RESOLVED
                      </p>
                    ) : (
                      <p className="ml-3 rounded-full px-2 py-1 text-black bg-[#FFC659] font-bold text-xs self-center">
                        PENDING
                      </p>
                    )}
                  </div>
                  <p className='text-[#D6D3D1] mb-8 w-[95%]'>{request.data.reason}.</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Container className=" text-slate-300">
        <Form onSubmit={handleSubmit}>
          {/* Add form fields for request text and file uploads */}
          <Row>
            <Col md={12} className='w- mt-4 '>
              <Form.Group controlId="formRequestText" className=''>
                <Form.Control as="textarea" placeholder="Submit your request; we'll connect with you shortly." rows={3} name="requestText" value={formData.requestText} onChange={handleChange} className=' bg-[#1B1E21] placeholder-gray-500 focus:bg-blue-950 focus:text-slate-300 text-slate-300 border-b border-[#ffffff] border-opacity-30 rounded-sm' />
              </Form.Group>
            </Col>
          </Row>

          <div className=' flex justify-between'>
            <Row className=' w-[40rem] '>
              {/* Loop through the file inputs */}
              {Array.from({ length: 3 }).map((_, index) => (
                <Col md={4} key={index}>
                  <Form.Group controlId={`formImage${index + 1}`} className=' mt-4'>
                    <Form.Label >Upload Image {index + 1}</Form.Label>
                    <Form.Control type="file" onChange={(e) => handleFileChange(e, index)} className=' h-7 text-xs cursor-pointer bg-[#1B1E21] text-slate-300 opacity-70 focus:bg-indigo-950 focus:text-slate-300' />
                  </Form.Group>
                </Col>
              ))}
            </Row>
            {/* Add a submit button */}
            <button variant="primary" type="submit" className='bg-[#2e20d1] text-white px-8 py-1 mt-5 rounded-sm'>
              Submit
            </button>
          </div>

          {/* Display errors if any */}
          {formErrors.formFiles && <p className="text-red-500 text-xs mt-1">{formErrors.formFiles}</p>}
        </Form>
      </Container>
    </div>
  );
};

export default RequestCallback;
