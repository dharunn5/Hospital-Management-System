import React, { useEffect, useState, useContext } from "react";
import API from "../api";
import { AppContext } from "../context/AppContext";
import { assets } from "../assets/assets";

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const { doctors } = useContext(AppContext);

  useEffect(() => {
    const fetchAppointments = async () => {     
      try {
        const token = localStorage.getItem('token');
        const res = await API.get('/appointment', { headers: { Authorization: `Bearer ${token}` } });
        setAppointments(res.data);
      } catch {
        setMessage('Failed to load appointments');
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  const handleCancel = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await API.put(`/appointment/${id}/cancel`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setAppointments(appts => appts.map(a => a._id === id ? { ...a, status: 'cancelled' } : a));
      setMessage('Appointment cancelled');
    } catch {
      setMessage('Cancel failed');
    }
  };

  if (loading) return <div className="text-center py-10">Loading appointments...</div>;

  return (
    <div>
      {/* <p className="pb-3 mt-12 font-medium text-zinc-700 border-b">My Appointments</p>   */}
      {message && <div className="mb-4 text-green-600 font-semibold">{message}</div>}
      <div>
        {appointments.length === 0 && <p>No appointments found.</p>}
        {appointments.map((item, index) => {
          // Find doctor by id or name
          let doc = doctors.find(d => d._id === item.doctor || d.name === item.doctor);
          return (
            <div key={item._id}>
              <div className="grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-2 border-b items-center">
                <div>
                  <img className="w-32 bg-indigo-50" src={doc?.image && doc.image.startsWith('/uploads') ? `http://localhost:5000${doc.image}` : (doc?.image || assets.profile_pic)}   />
                </div>
                <div>
                  <p className="font-semibold text-lg">{doc?.name || item.doctor}</p>
                  <p className="text-gray-600">{doc?.speciality || ""}</p>
                  <p>Date: {item.date}</p>
                  <p>Time: {item.time}</p>
                  <p>Status: <span className={item.status === 'cancelled' ? 'text-red-500' : 'text-green-600'}>{item.status}</span></p>
                </div>
                <div className="flex flex-col gap-2">
                  <button className="bg-blue-200 px-3 py-1 rounded mb-1" disabled>Pay Online</button>
                  <button
                    className="bg-red-500 text-white px-3 py-1 rounded disabled:opacity-50"
                    disabled={item.status === 'cancelled'}
                    onClick={() => handleCancel(item._id)}
                  >
                    Cancel Appointment
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MyAppointments;

