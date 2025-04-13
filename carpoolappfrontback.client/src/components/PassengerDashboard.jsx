﻿import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function PassengerDashboard() {
    const [rides, setRides] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [rideLocationsMap, setRideLocationsMap] = useState({});
    const [pickupLocation, setPickupLocation] = useState("");
    const [dropoffLocation, setDropoffLocation] = useState("");
    const [customPickup, setCustomPickup] = useState(false);
    const [customDropoff, setCustomDropoff] = useState(false);

    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    useEffect(() => {
        if (!token || role !== "passenger") {
            navigate("/");
            return;
        }

        const fetchAvailableRides = async () => {
            try {
                const res = await axios.get("/api/passengerdashboard/available-rides", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const ridesData = Array.isArray(res.data) ? res.data : [];
                setRides(ridesData);
                setLoading(false);

                for (const ride of ridesData) {
                    try {
                        const locationRes = await axios.get(`/api/booking/ride-locations/${ride.rideId}`, {
                            headers: { Authorization: `Bearer ${token}` },
                        });

                        setRideLocationsMap(prev => ({
                            ...prev,
                            [ride.rideId]: Array.isArray(locationRes.data.locations) ? locationRes.data.locations : [],
                        }));
                    } catch (err) {
                        console.error("Error fetching ride locations:", err);
                    }
                }
            } catch (err) {
                console.error("Unauthorized or error fetching rides:", err);
                navigate("/");
            }
        };

        fetchAvailableRides();
    }, [navigate]);

    const sendRideRequest = async (rideId, origin, destination) => {
        try {
            setRides(prevRides =>
                prevRides.map(ride =>
                    ride.rideId === rideId ? { ...ride, rideRequestStatus: "Pending" } : ride
                )
            );

            const requestBody = {
                RideId: rideId,
                PickupLocation: pickupLocation,
                DropoffLocation: dropoffLocation,
                Source: origin,
                Destination: destination,
            };

            const res = await axios.post("/api/booking/request-ride", requestBody, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.data.success) {
                alert("Ride request sent successfully!");
            } else {
                throw new Error("Ride request failed.");
            }
        } catch (error) {
            console.error("Error sending ride request:", error.response?.data || error.message);
            setRides(prevRides =>
                prevRides.map(ride =>
                    ride.rideId === rideId ? { ...ride, rideRequestStatus: "Failed" } : ride
                )
            );
        }
    };

    if (loading) return <p>Loading available rides...</p>;

    const displayRides = Array.isArray(rides) ? rides.filter(ride =>
        ride.origin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ride.destination?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (Array.isArray(ride.routeStops) && ride.routeStops.some(stop =>
            stop.toLowerCase().includes(searchTerm.toLowerCase())
        ))
    ) : [];

    return (
        <div>
            <h2>Passenger Dashboard</h2>

            <div>
                <input
                    type="text"
                    placeholder="Search by source, destination, or route stops"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <h3>Available Rides</h3>
            {displayRides.length > 0 ? (
                displayRides.map((ride, index) => {
                    const rideLocations = rideLocationsMap[ride.rideId] || [];

                    return (
                        <div key={index}>
                            <p><strong>From:</strong> {ride.origin} → <strong>To:</strong> {ride.destination}</p>
                            <p><strong>Departure:</strong> {new Date(ride.departureTime).toLocaleString()}</p>
                            <p><strong>Seats:</strong> {ride.availableSeats}</p>
                            <p><strong>Price:</strong> {ride.pricePerSeat} PKR</p>
                            <p><strong>Driver:</strong> {ride.driverName}</p>
                            <p><strong>Vehicle:</strong> {ride.vehicleModel}</p>

                            <p><strong>Route Stops:</strong></p>
                            {Array.isArray(ride.routeStops) && ride.routeStops.length > 0 ? (
                                <ul>
                                    {ride.routeStops.map((stop, i) => (
                                        <li key={i}>{stop}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p>No route stops available</p>
                            )}

                            {/* Pickup/Dropoff Selection */}
                            <div>
                                <label>Pickup Location:</label>
                                {customPickup ? (
                                    <input
                                        type="text"
                                        placeholder="Custom pickup location"
                                        value={pickupLocation}
                                        onChange={(e) => setPickupLocation(e.target.value)}
                                    />
                                ) : (
                                    <select
                                        onChange={(e) => setPickupLocation(e.target.value)}
                                        defaultValue=""
                                    >
                                        <option value="" disabled>Select pickup</option>
                                        {rideLocations.map((loc, i) => (
                                            <option key={i} value={loc}>{loc}</option>
                                        ))}
                                    </select>
                                )}
                                <button onClick={() => setCustomPickup(prev => !prev)}>
                                    {customPickup ? "Use Dropdown" : "Custom Pickup"}
                                </button>
                            </div>

                            <div>
                                <label>Dropoff Location:</label>
                                {customDropoff ? (
                                    <input
                                        type="text"
                                        placeholder="Custom dropoff location"
                                        value={dropoffLocation}
                                        onChange={(e) => setDropoffLocation(e.target.value)}
                                    />
                                ) : (
                                    <select
                                        onChange={(e) => setDropoffLocation(e.target.value)}
                                        defaultValue=""
                                    >
                                        <option value="" disabled>Select dropoff</option>
                                        {rideLocations.map((loc, i) => (
                                            <option key={i} value={loc}>{loc}</option>
                                        ))}
                                    </select>
                                )}
                                <button onClick={() => setCustomDropoff(prev => !prev)}>
                                    {customDropoff ? "Use Dropdown" : "Custom Dropoff"}
                                </button>
                            </div>

                            <button
                                onClick={() => sendRideRequest(ride.rideId, ride.origin, ride.destination)}
                                disabled={ride.rideRequestStatus === "Pending" || ride.rideRequestStatus === "Accepted"}
                            >
                                {ride.rideRequestStatus === "Denied" ? "Send Request Again" : ride.rideRequestStatus || "Send Request"}
                            </button>

                            <hr />
                        </div>
                    );
                })
            ) : (
                <p>No available rides.</p>
            )}

            <div style={{ marginTop: "30px" }}>
                <button onClick={() => navigate("/passenger/profile")}>
                    View Accepted Rides
                </button>
            </div>
        </div>
    );
}
