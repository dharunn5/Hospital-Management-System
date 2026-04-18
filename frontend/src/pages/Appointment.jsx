import { useCallback, useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { assets } from '../assets/assets'
import RelatedDoctors from '../components/RelatedDoctors'

const Appointment = () => {

  const { docId } = useParams();
  const { doctors, currencySymbol } = useContext(AppContext);
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const [docInfo, setDocInfo] = useState(null);
  const [docSlots, setDocSlots] = useState([]);
  const [slotIndex, setSlotIndex] = useState(0);
  const [slotTime, setSlotTime] = useState('');
  const [, setBookedSlots] = useState([]);
  const [toast, setToast] = useState({ show: false, type: '', message: '' });
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    const doc = doctors.find(doc => doc._id === docId);
    setDocInfo(doc);
  }, [doctors, docId]);

  const getAvailableSlots = useCallback(async (booked = []) => {
    let today = new Date();
    let days = [];
    for (let i = 0; i < 7; i++) {
      let dateObj = new Date(today);
      dateObj.setDate(today.getDate() + i);
      let dateStr = `${dateObj.getDate()}/${dateObj.getMonth()+1}/${dateObj.getFullYear()}`;
      let start = new Date(dateObj);
      let now = new Date();
      if (i === 0) {
        start.setHours(now.getHours());
        start.setMinutes(now.getMinutes() > 30 ? 60 : 30, 0, 0);
        if (start.getHours() < 10) start.setHours(10, 0, 0, 0);
      } else {
        start.setHours(10, 0, 0, 0);
      }
      let end = new Date(dateObj);
      end.setHours(20, 30, 0, 0);
      let slots = [];
      while (start <= end) {
        let timeStr = start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        // check if slot is booked
        let bookedSlot = booked.find(b => b.date === dateStr && b.time === timeStr);
        slots.push({
          datetime: new Date(start),
          time: timeStr,
          date: dateStr,
          booked: !!bookedSlot
        });
        start.setMinutes(start.getMinutes() + 30);
      }
      days.push(slots);
    }
    setDocSlots(days);
  }, []);

  const fetchBookedSlots = useCallback(async (doctorId) => {
    if (!doctorId) return;
    try {
      const API = (await import('../api')).default;
      const res = await API.get(`/appointment/slots/${doctorId}`);
      setBookedSlots(res.data);
      getAvailableSlots(res.data);
    } catch {
      setBookedSlots([]);
      getAvailableSlots([]);
    }
  }, [getAvailableSlots]);


  useEffect(() => {
    if (!docInfo) return;
    fetchBookedSlots(docInfo._id || docInfo.name);
  }, [docInfo, fetchBookedSlots])

  useEffect(() => {
    console.log(docSlots);

  }, [docSlots]);



  console.log('Appointment.jsx debug:', { docId, doctors, docInfo, docSlots });
  // Robust loading and error states
  if (!doctors || !doctors.length) {
    return <div className='text-center text-lg py-10'>Loading doctors...</div>;
  }
  if (!docInfo) {
    // If doctors loaded but docInfo not found, show error
    if (doctors && doctors.length) {
      return <div className='text-center text-lg py-10 text-red-600'>No doctor found for this ID. Please check the URL or try again later.</div>;
    }
    // Else, still loading
    return <div className='text-center text-lg py-10'>Loading doctor details...</div>;
  }
  if (!Array.isArray(docSlots) || !docSlots.length) return <div className='text-center text-lg py-10'>Loading available slots...</div>;
  if (!docSlots[slotIndex]) return <div className='text-center text-lg py-10'>No slots found for this doctor.</div>;

  return (
    <>
      <div>
        {/*------------------Docctor Details------------------*/}
        <div className='flex flex-col sm:flex-row gap-4'>
          <div>
            <img className='bg-primary w-full sm:max-w-72 rounded-lg' src={docInfo.image} alt="" />
          </div>

          <div className='flex-1 border border-gray-400 rounded-lg p-8 py-7 bg-white mx-2 sm:mx-0 mt-[-80px] sm:mt-0'>
            {/*------------------DocInfo: name, degree, experience-----------------*/}
            <p className='flex items-center gap-2 text-2xl font-medium text-gray-900'>
              {docInfo.name} <img className='w-5' src={assets.verified_icon} alt="Verified" />
            </p>
            <div className='flex items-center gap-2 text-gray-600 text-sm mt-1'>
              <p>{docInfo.degree} - {docInfo.speciality}</p>
              <button className='py-0.5 px-2 border text-xs rounded-full'>{docInfo.experience}</button>
            </div>

            {/*------------------Doctor About------------------*/}
            <div>
              <p className='flex items-center gap-1 text-sm font-medium text-gray-900 mt-3'>
                About <img src={assets.info_icon} alt='' />
              </p>
              <p className='text-sm text-gray-500 max-w-[700px] mt-1'>{docInfo.about}</p>
            </div>
            <p className='text-gray-600 font-medium mt-4'>
              Appoinment Fee: <span className='text-gray-600'> {currencySymbol} {docInfo.fees}</span>
            </p>
          </div>
        </div>
        {/*------------------Booking Slots------------------*/}
        <div className='sm:ml-72 sm:pl-4 mt-4 font-medium text-gray-700'>
          <p>Booking Slots</p>
          <div className='flex gap-3 items-center w-full overflow-x-scroll mt-4'>
            {
            docSlots.length && docSlots.map((item,index) => (
              <div onClick={() => setSlotIndex(index)} className={`text-center py-6 min-w-16 rounded-full cursor-pointer 
                ${slotIndex === index ? 'bg-primary text-white': 'border border-gray-200'}`} key={index}> 
                <p>{item[0] && daysOfWeek[item[0].datetime.getDay()]}</p>
                <p>{item[0] && item[0].datetime.getDate()}</p> 
                </div>
              ))
            }
          </div>

          <div className='flex items-center gap-3 w-full overflow-x-scroll mt-4'>
            {docSlots.length && docSlots[slotIndex].map((item,index)=>(
              <p
                onClick={()=> !item.booked && setSlotTime(item.time)}
                className={`text-sm font-light flex-shrink-0 px-5 py-2 rounded-full ${item.booked ? 'bg-gray-200 text-gray-400 cursor-not-allowed line-through' : item.time === slotTime ? 'bg-primary text-white cursor-pointer' : 'text-gray-400 border border-gray-300 cursor-pointer'}`}
                key={index}
                title={item.booked ? 'This slot is already booked' : ''}
                style={{ pointerEvents: item.booked ? 'none' : 'auto', opacity: item.booked ? 0.5 : 1 }}
              >
                {item.time.toLowerCase()}
              </p>
            ))}
          </div>
            <button
              className={`bg-primary text-white text-sm font-light px-14 py-3 rounded-full my-6 ${(() => {
                const slot = docSlots[slotIndex]?.find(s => s.time === slotTime);
                return slot && slot.booked ? 'opacity-50 cursor-not-allowed' : '';
              })()}`}
              disabled={isBooking || !slotTime || (docSlots[slotIndex]?.find(s => s.time === slotTime)?.booked)}
              onClick={async () => {
                // Prevent multiple clicks
                if (isBooking) return;
                
                const slot = docSlots[slotIndex]?.find(s => s.time === slotTime);
                if (!slotTime || !docInfo) {
                  setToast({ show: true, type: 'error', message: 'Please select a slot' });
                  setTimeout(() => setToast({ show: false, type: '', message: '' }), 3000);
                  return;
                }
                if (slot && slot.booked) {
                  setToast({ show: true, type: 'error', message: 'This slot is already booked.' });
                  setTimeout(() => setToast({ show: false, type: '', message: '' }), 3000);
                  return;
                }
                
                setIsBooking(true);
                try {
                  const token = localStorage.getItem('token');
                  if (!token || token === 'undefined' || token === 'null') {
                    localStorage.removeItem('token');
                    setToast({ show: true, type: 'error', message: 'Please login before booking.' });
                    setTimeout(() => {
                      setToast({ show: false, type: '', message: '' });
                      window.location.href = '/login';
                    }, 1500);
                    return;
                  }

                  await (await import('../api')).default.post(
                    '/appointment',
                    { 
                      doctor: docInfo._id, 
                      date: docSlots[slotIndex][0].date, 
                      time: slotTime 
                    },
                    { 
                      headers: { 
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                      } 
                    }
                  );
                  
                  setToast({ show: true, type: 'success', message: 'Appointment booked!' });
                  setTimeout(() => {
                    setToast({ show: false, type: '', message: '' });
                    window.location.href = '/my-appointments';
                  }, 2000);
                  
                } catch (err) {
                  console.error('Booking error:', err);
                  const errorMessage = err?.response?.data?.msg || 'Booking failed. Please try again.';
                  if (err?.response?.status === 401 || errorMessage === 'Invalid token') {
                    localStorage.removeItem('token');
                    setToast({ show: true, type: 'error', message: 'Session expired. Please login again.' });
                    setTimeout(() => {
                      setToast({ show: false, type: '', message: '' });
                      window.location.href = '/login';
                    }, 1500);
                  } else {
                    setToast({ show: true, type: 'error', message: errorMessage });
                    setTimeout(() => setToast({ show: false, type: '', message: '' }), 3000);
                  }
                } finally {
                  setIsBooking(false);
                }
              }}
            >
              {isBooking ? 'Booking...' : 'Book an Appointment'}
            </button>
            {/* Toast message */}
            {toast.show && (
              <div className={`fixed left-1/2 top-20 transform -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-lg text-white text-lg font-semibold transition-all duration-300 ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-500'}`}
                style={{ minWidth: 200, textAlign: 'center' }}>
                {toast.message}
              </div>
            )}

        </div>

        {/*------------------ Listing Related Doctors------------------*/}
        <RelatedDoctors docId={docId} speciality={docInfo.speciality} />

      </div>
              
    </>
  )
}

export default Appointment