import React, { createContext, useState, useEffect } from "react";
import API from '../api';

export const AppContext = createContext()

const AppContextProvider = (props) => {

    const currencySymbol = "₹";
    const [doctors, setDoctors] = useState([]);

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const { data } = await API.get('/doctor');
                console.log('Fetched doctors:', data);
                setDoctors(data);
            } catch (err) {
                console.error('Error fetching doctors:', err);
            }
        };
        fetchDoctors();
    }, []);

    const value = {
        doctors, currencySymbol
    };
    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
} 

export default AppContextProvider