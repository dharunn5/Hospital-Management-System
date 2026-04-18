import { createContext, useState, useEffect } from "react";
import API from '../api';
import { doctors as staticDoctors } from '../assets/assets';

export const AppContext = createContext()

const AppContextProvider = (props) => {

    const currencySymbol = "₹";
    const [doctors, setDoctors] = useState(staticDoctors);

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const { data } = await API.get('/doctor');
                if (Array.isArray(data) && data.length > 0) {
                    console.log('Fetched doctors:', data);
                    setDoctors(data);
                } else {
                    console.warn('Backend returned no doctors, using static fallback.');
                    setDoctors(staticDoctors);
                }
            } catch (err) {
                console.error('Error fetching doctors, using static fallback:', err);
                setDoctors(staticDoctors);
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