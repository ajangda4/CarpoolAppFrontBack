import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function CreateRidePage() {
    const [origin, setOrigin] = useState('');
    const [destination, setDestination] = useState('');
    const [routeStops, setRouteStops] = useState(['']);
    const [departureTime, setDepartureTime] = useState('');
    const [vehicleId, setVehicleId] = useState('');
    const [availableSeats, setAvailableSeats] = useState(1);
    const [pricePerSeat, setPricePerSeat] = useState('');
    const [vehicles, setVehicles] = useState([]);
    const [loadingVehicles, setLoadingVehicles] = useState(true);

    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    useEffect(() => {
        if (!token || role !== 'driver') {
            navigate('/');
            return;
        }

        fetchVehicles();
    }, [navigate]);

    const fetchVehicles = async () => {
        try {
            const res = await axios.get('https://localhost:7161/api/driver/profile/vehicles', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setVehicles(res.data || []);
        } catch (err) {
            console.error('Error fetching vehicles:', err);
            alert('Failed to load your vehicles.');
        } finally {
            setLoadingVehicles(false);
        }
    };

    const handleRouteStopChange = (index, value) => {
        const updated = [...routeStops];
        updated[index] = value;
        setRouteStops(updated);
    };

    const addRouteStop = () => setRouteStops([...routeStops, '']);
    const removeRouteStop = (index) => {
        const updated = routeStops.filter((_, i) => i !== index);
        setRouteStops(updated);
    };

    const handleSubmit = async () => {
        if (!origin || !destination || !vehicleId) {
            alert('Please fill in all required fields.');
            return;
        }

        try {
            const payload = {
                origin,
                destination,
                routeStops: routeStops.filter(stop => stop.trim() !== ''),
                departureTime: new Date(departureTime),
                vehicleId: parseInt(vehicleId),
                availableSeats: parseInt(availableSeats),
                pricePerSeat: parseInt(pricePerSeat)
            };

            await axios.post('https://localhost:7161/api/ridemanagement/create', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert('Ride created successfully!');
            navigate('/driver-dashboard');
        } catch (err) {
            console.error('Failed to create ride:', err);
            alert(err.response?.data?.message || 'Ride creation failed.');
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2>Create Ride</h2>

            <input
                placeholder="Origin"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
            />
            <input
                placeholder="Destination"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
            />

            <div>
                <label>Route Stops (Optional):</label>
                {routeStops.map((stop, index) => (
                    <div key={index}>
                        <input
                            value={stop}
                            onChange={(e) => handleRouteStopChange(index, e.target.value)}
                            placeholder={`Stop ${index + 1}`}
                        />
                        <button type="button" onClick={() => removeRouteStop(index)}>Remove</button>
                    </div>
                ))}
                <button type="button" onClick={addRouteStop}>Add Stop</button>
            </div>

            <div>
                <label>Departure Date & Time:</label>
                <input
                    type="datetime-local"
                    value={departureTime}
                    onChange={(e) => setDepartureTime(e.target.value)}
                />
            </div>

            <div>
                <label>Select Vehicle:</label>
                {loadingVehicles ? (
                    <p>Loading vehicles...</p>
                ) : (
                    <select value={vehicleId} onChange={(e) => setVehicleId(e.target.value)}>
                        <option value="">-- Select Vehicle --</option>
                        {Array.isArray(vehicles) && vehicles.length > 0 ? (
                            vehicles.map((v) => (
                                <option key={v.vehicleId} value={v.vehicleId}>
                                    {`${v.make} ${v.model} - ${v.numberPlate}`}
                                </option>
                            ))
                        ) : (
                            <option value="" disabled>No Vehicles Available</option>
                        )}
                    </select>
                )}
            </div>

            <input
                type="number"
                placeholder="Available Seats"
                value={availableSeats}
                onChange={(e) => setAvailableSeats(e.target.value)}
                min={1}
                max={10}
            />

            <input
                type="number"
                placeholder="Price Per Seat (PKR)"
                value={pricePerSeat}
                onChange={(e) => setPricePerSeat(e.target.value)}
            />

            <button onClick={handleSubmit}>Create Ride</button>
        </div>
    );
}
