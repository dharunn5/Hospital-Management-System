// This file exports the doctors array from the verification assets.js for backend/frontend data consistency checks.
// It is NOT used by the app, only for debugging and validation.

export const doctors = [
    {
        _id: 'doc1',
        name: 'Dr. Richard James',
        image: 'doc1.png',
        speciality: 'General physician',
        degree: 'MBBS',
        experience: '4 Years',
        about: 'Dr. Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies. Dr. Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.',
        fees: 50,
        address: {
            line1: '17th Cross, Richmond',
            line2: 'Circle, Ring Road, London'
        }
    },
    // ... (repeat for all 15 doctors as in assets.js)
];
