// import React from 'react';

// const Pagination = ({ totalItems, itemsPerPage, currentPage, onPageChange }) => {
//     const pageNumbers = [];

//     for (let i = 1; i <= Math.ceil(totalItems / itemsPerPage); i++) {
//         pageNumbers.push(i);
//     }

//     return (
//         <nav className="flex justify-center mt-4">
//             <ul className="pagination">
//                 {currentPage > 1 && (
//                     <li className="page-item">
//                         <button className="bg-black text-white px-3 py-1" onClick={() => onPageChange(currentPage - 1)}>Previous</button>
//                     </li>
//                 )}
//                 {pageNumbers.map((number) => (
//                     <li key={number} className={`page-item ${number === currentPage ? 'active' : ''}`}>
//                         <button className="bg-black text-white px-3 py-1" onClick={() => onPageChange(number)}>
//                             {number}
//                         </button>
//                     </li>
//                 ))}
//                 {currentPage < Math.ceil(totalItems / itemsPerPage) && (
//                     <li className="page-item">
//                         <button className="bg-black text-white px-3 py-1" onClick={() => onPageChange(currentPage + 1)}>Next</button>
//                     </li>
//                 )}
//             </ul>
//         </nav>
//     );
// };

// export default Pagination;


import React from 'react';

const Pagination = ({ totalItems, itemsPerPage, currentPage, onPageChange }) => {
  return (
    <div className=" mt-4">
      <div className="pagination flex justify-between ">
        <div>
          {currentPage > 1 && (
            <h1 className="page-item">
              <button className="bg-[#323756] font-semibold flex items-center justify-between text-sm text-white px-3 py-[.4rem]" onClick={() => onPageChange(currentPage - 1)}>
                <svg className="w-[.9rem] mr-[.5rem]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 15.75 3 12m0 0 3.75-3.75M3 12h18" />
                </svg>
                <p>PREVIOUS</p>

              </button>
            </h1>
          )}
        </div>
        <div>
          {currentPage < Math.ceil(totalItems / itemsPerPage) && (
            <h1 className="page-item">
              <button className="bg-[#323756] font-semibold flex items-center justify-between text-sm text-white px-3 py-[.4rem]" onClick={() => onPageChange(currentPage + 1)}>
                <p>NEXT</p>
                <svg className=" w-[.9rem] ml-[.5rem]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3" />
                </svg>
              </button>
            </h1>
          )}
        </div>
      </div>
    </div>
  );
};

export default Pagination;
