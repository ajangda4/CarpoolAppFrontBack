import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function PassengerProfile() {
    const [upcomingRides, setUpcomingRides] = useState([]);
    const [pastRides, setPastRides] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');

        if (!token || role !== 'passenger') {
            navigate('/');
            return;
        }

        const fetchAcceptedRides = async () => {
            try {
                const res = await axios.get('/api/passengerprofile/accepted-rides', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const now = new Date();

                const upcoming = res.data
                    .filter(ride => new Date(ride.departureTime) >= now)
                    .sort((a, b) => new Date(a.departureTime) - new Date(b.departureTime));

                const past = res.data
                    .filter(ride => new Date(ride.departureTime) < now)
                    .sort((a, b) => new Date(b.departureTime) - new Date(a.departureTime));


                setUpcomingRides(upcoming);
                setPastRides(past);
            } catch (err) {
                console.error('Error fetching accepted rides:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchAcceptedRides();
    }, [navigate]);

    if (loading) return <p>Loading your profile...</p>;

    const renderRideCard = (ride, index) => (
        <div
            key={index}
            style={{
                border: '1px solid #ccc',
                borderRadius: '8px',
                padding: '15px',
                marginBottom: '20px'
            }}
        >
            <h4>Ride ID: {ride.rideId}</h4>
            <p><strong>From:</strong> {ride.origin}</p>
            <p><strong>To:</strong> {ride.destination}</p>
            <p><strong>Departure:</strong> {new Date(ride.departureTime + 'Z').toLocaleString()}</p>
            <p><strong>Vehicle:</strong> {ride.vehicle}</p>
            <p><strong>Driver:</strong> {ride.driverName}</p>
            <p><strong>Pickup:</strong> {ride.pickupLocation}</p>
            <p><strong>Dropoff:</strong> {ride.dropoffLocation}</p>
            <button
                onClick={() => navigate(`/chat/${ride.rideId}`)}
                style={{ marginTop: "10px" }}
            >
                Go to Messages
            </button>
        </div>
    );

    return (
        <div style={{ padding: '20px' }}>
            <h2>Passenger Profile</h2>

            <h3>Upcoming Rides</h3>
            {upcomingRides.length === 0 ? (
                <p><i>No upcoming accepted rides.</i></p>
            ) : (
                upcomingRides.map(renderRideCard)
            )}

            <h3 style={{ marginTop: '40px' }}>Past Rides</h3>
            {pastRides.length === 0 ? (
                <p><i>No past rides yet.</i></p>
            ) : (
                pastRides.map(renderRideCard)
            )}
        </div>
    );
}
