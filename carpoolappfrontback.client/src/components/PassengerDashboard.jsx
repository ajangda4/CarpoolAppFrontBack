import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function PassengerDashboard() {
    const [availableRides, setAvailableRides] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");

        if (!token || role !== "passenger") {
            navigate("/");
            return;
        }

        const fetchRides = async () => {
            try {
                const res = await axios.get("https://localhost:7161/api/passengerdashboard/available-rides", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setAvailableRides(res.data);
            } catch (err) {
                console.error("Error fetching rides:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchRides();
    }, [navigate]);

    const handleRequestRide = async (rideId) => {
        const pickupLocation = prompt("Enter your Pickup Location:");
        const dropoffLocation = prompt("Enter your Dropoff Location:");
        if (!pickupLocation || !dropoffLocation) {
            alert("Pickup and Dropoff are required!");
            return;
        }

        try {
            const token = localStorage.getItem("token");
            await axios.post("https://localhost:7161/api/passengerdashboard/request-ride", {
                rideId,
                pickupLocation,
                dropoffLocation
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert("Ride request sent successfully!");
            window.location.reload(); // Refresh the rides
        } catch (err) {
            console.error("Error requesting ride:", err.response?.data || err.message);
            alert(err.response?.data?.message || "Failed to request ride.");
        }
    };

    if (loading) return <p>Loading available rides...</p>;

    return (
        <div style={{ padding: "20px", maxWidth: "900px", margin: "0 auto" }}>
            <h2>Passenger Dashboard</h2>

            <h3>Available Rides</h3>
            {availableRides.length === 0 ? (
                <p><i>No rides available right now.</i></p>
            ) : (
                availableRides.map((ride) => (
                    <div
                        key={ride.rideId}
                        style={{
                            border: "1px solid #ccc",
                            borderRadius: "8px",
                            padding: "16px",
                            marginBottom: "24px"
                        }}
                    >
                        <p><strong>From:</strong> {ride.origin}</p>
                        <p><strong>To:</strong> {ride.destination}</p>
                        <p><strong>Departure:</strong> {new Date(ride.departureTime).toLocaleString()}</p>
                        <p><strong>Available Seats:</strong> {ride.availableSeats}</p>
                        <p><strong>Price per Seat:</strong> Rs. {ride.pricePerSeat}</p>
                        <p><strong>Driver:</strong> {ride.driverName}</p>
                        <p><strong>Vehicle:</strong> {ride.vehicleModel}</p>

                        {ride.routeStops.length > 0 && (
                            <p><strong>Route Stops:</strong> {ride.routeStops.join(" → ")}</p>
                        )}

                        <p><strong>Your Request Status:</strong> {ride.rideRequestStatus}</p>

                        {/* Handle full rides and request logic */}
                        {ride.availableSeats === 0 ? (
                            <span style={{ color: "gray", fontStyle: "italic" }}>Ride is Full</span>
                        ) : ride.rideRequestStatus === "Not Requested" ? (
                            <button
                                onClick={() => handleRequestRide(ride.rideId)}
                                style={{
                                    marginTop: "10px",
                                    padding: "8px 12px",
                                    backgroundColor: "#28a745",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: "pointer"
                                }}
                            >
                                Request Ride
                            </button>
                        ) : null}
                    </div>
                ))
            )}
        </div>
    );
}
