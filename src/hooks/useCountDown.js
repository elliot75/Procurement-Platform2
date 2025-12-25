// src/hooks/useCountDown.js
import { useState, useEffect } from 'react';

/**
 * Hook to calculate time remaining until a target date.
 * @param {string|Date} targetDate - The deadline.
 * @returns {object} { days, hours, minutes, seconds, isExpired }
 */
const useCountDown = (targetDate) => {
    const countDownDate = new Date(targetDate).getTime();

    const [countDown, setCountDown] = useState(
        countDownDate - new Date().getTime()
    );

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date().getTime();
            const distance = countDownDate - now;

            setCountDown(distance);

            if (distance < 0) {
                clearInterval(interval);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [countDownDate]);

    return getReturnValues(countDown);
};

const getReturnValues = (countDown) => {
    if (countDown < 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
    }

    // Calculate time units
    const days = Math.floor(countDown / (1000 * 60 * 60 * 24));
    const hours = Math.floor((countDown % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((countDown % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((countDown % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds, isExpired: false };
};

export default useCountDown;
