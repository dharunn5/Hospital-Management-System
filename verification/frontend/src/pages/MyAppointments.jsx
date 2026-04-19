import React, { useContext } from "react";
import { AppContext } from "../context/AppContext";

const MyAppointments = () => {
  const { doctors } = useContext(AppContext);

  return (
    <>
      <div>
        <p className="pb-3 mt-12 font-medium text-zinc-700 border-b">My Appointments</p>
        <div>
          {doctors.slice(0,2).map((item,index)=>(
            <div className="grid grid-cols=[1fr_2fr] gap-4 sm:flex sm:gap-6 py-2 border-b" key={index}>
              <div>
                <img className="w-32 bg-indigo-50" src={item.image} alt="" />
              </div>
              <div>
                <p>{item.name}</p>
                <p>{item.speciality}</p>
                <p>Address:</p>
                <p>{item.address.line1}</p>
                <p>{item.address.line2}</p>
                <p><span>Date & Time:</span>25, July, 2024 |  8:30 PM</p>
              </div>
              <div></div>
              <div>
                <button>Pay Online</button>
                <button>Cancel Appointment</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default MyAppointments;
