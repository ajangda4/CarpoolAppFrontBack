import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function DriverDashboard() {
    const [timestamp, setTimestamp] = useState("");
    const [ridesWithRequests, setRidesWithRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");

        if (!token || role !== "driver") {
            navigate("/");
            return;
        }

        const fetchData = async () => {
            try {
                const res = await axios.get("https://localhost:7161/api/driver/dashboard/rides-with-requests", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const rides = Array.isArray(res.data.result) ? res.data.result : [];
                const fetchedTimestamp = res.data.timestamp || new Date().toISOString();

                setRidesWithRequests(rides);
                setTimestamp(fetchedTimestamp);
                setLoading(false);
            } catch (error) {
                console.error("Error loading dashboard:", error);
                setLoading(false);
            }
        };

        fetchData();
    }, [navigate]);

    const handleRideRequest = async (requestId, action) => {
        const token = localStorage.getItem("token");
        try {
            await axios.post(`https://localhost:7161/api/riderequest/${action}/${requestId}`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setRidesWithRequests(prevRides =>
                prevRides.map(ride => {
                    const match = ride.requests.find(req => req.requestId === requestId);
                    if (!match) return ride;

                    const updatedRequests = ride.requests.filter(req => req.requestId !== requestId);

                    if (action === "accept") {
                        return {
                            ...ride,
                            requests: updatedRequests,
                            acceptedPassengers: [...(ride.acceptedPassengers || []), match]
                        };
                    } else {
                        return {
                            ...ride,
                            requests: updatedRequests
                        };
                    }
                })
            );
        } catch (err) {
            console.error(`Error ${action}ing request:`, err.response?.data || err.message);
        }
    };

    const formatRoute = (origin, stops, destination) => {
        let parsedStops = Array.isArray(stops) ? stops : [];
        return [origin, ...parsedStops, destination].join(" → ");
    };

    if (loading) return <p>Loading dashboard...</p>;

    if (!Array.isArray(ridesWithRequests)) {
        console.error("ridesWithRequests is invalid:", ridesWithRequests);
        return <p>Error loading rides. Please refresh.</p>;
    }

    return (
        <div style={{ padding: "20px", maxWidth: "900px", margin: "0 auto" }}>
            <h2>Driver Dashboard</h2>
            <p><strong>Last Updated:</strong> {timestamp ? new Date(timestamp).toLocaleString() : "N/A"}</p>

            <h3>Your Rides & Requests</h3>

            {ridesWithRequests.length === 0 ? (
                <p><i>No rides offered yet.</i></p>
            ) : (
                ridesWithRequests.map((ride) => {
                    const goingToHabib = ride.destination.toLowerCase().includes("habib university");

                    return (
                        <div
                            key={ride.rideId}
                            style={{
                                border: "1px solid #ccc",
                                borderRadius: "8px",
                                padding: "16px",
                                marginBottom: "24px"
                            }}
                        >
                            <h4>Ride ID: {ride.rideId}</h4>
                            <p><strong>Route:</strong> {formatRoute(ride.origin, ride.routeStops, ride.destination)}</p>
                            <p><strong>Departure:</strong> {new Date(ride.departureTime + 'Z').toLocaleString()}</p>
                            <p><strong>Vehicle:</strong> {ride.vehicle}</p>
                            <p><strong>Seats Available:</strong> {ride.availableSeats}</p>
                            <p><strong>Price per Seat:</strong> Rs. {ride.pricePerSeat}</p>

                            <button
                                onClick={() => navigate(`/chat/${ride.rideId}`)}
                                style={{
                                    marginTop: "10px",
                                    padding: "8px 12px",
                                    backgroundColor: "#007bff",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: "pointer"
                                }}
                            >
                                Go to Messages
                            </button>

                            {/* Incoming Requests */}
                            <h5 style={{ marginTop: "20px" }}>Incoming Requests</h5>
                            {ride.requests?.length > 0 ? (
                                ride.requests.map((req) => (
                                    <div
                                        key={req.requestId}
                                        style={{
                                            marginTop: "10px",
                                            padding: "10px",
                                            backgroundColor: "#f5f5f5",
                                            borderRadius: "4px",
                                            color: "#222",
                                        }}
                                    >
                                        <p><strong>Passenger:</strong> {req.passengerName}</p>
                                        <p>
                                            <strong>{goingToHabib ? "Pickup" : "Dropoff"}:</strong>{" "}
                                            {goingToHabib ? req.pickupLocation : req.dropoffLocation}
                                        </p>
                                        <div style={{ marginTop: "8px" }}>
                                            <button
                                                onClick={() => handleRideRequest(req.requestId, "accept")}
                                                style={{
                                                    marginRight: "10px",
                                                    padding: "6px 12px",
                                                    backgroundColor: "#28a745",
                                                    color: "white",
                                                    border: "none",
                                                    borderRadius: "4px",
                                                    cursor: "pointer"
                                                }}
                                            >
                                                Accept
                                            </button>
                                            <button
                                                onClick={() => handleRideRequest(req.requestId, "reject")}
                                                style={{
                                                    padding: "6px 12px",
                                                    backgroundColor: "#dc3545",
                                                    color: "white",
                                                    border: "none",
                                                    borderRadius: "4px",
                                                    cursor: "pointer"
                                                }}
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p><i>No pending requests.</i></p>
                            )}

                            {/* Accepted Passengers */}
                            <h5 style={{ marginTop: "20px" }}>Upcoming Passengers</h5>
                            {ride.acceptedPassengers?.length > 0 ? (
                                ride.acceptedPassengers.map((passenger, idx) => (
                                    <div
                                        key={idx}
                                        style={{
                                            marginTop: "10px",
                                            padding: "10px",
                                            backgroundColor: "#d4edda",
                                            borderRadius: "4px",
                                            color: "#155724",
                                            border: "1px solid #c3e6cb",
                                        }}
                                    >
                                        <p><strong>Passenger:</strong> {passenger.passengerName}</p>
                                        <p>
                                            <strong>{goingToHabib ? "Pickup" : "Dropoff"}:</strong>{" "}
                                            {goingToHabib ? passenger.pickupLocation : passenger.dropoffLocation}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <p><i>No confirmed passengers yet.</i></p>
                            )}
                        </div>
                    );
                })
            )}

            <div style={{ marginTop: "30px", display: "flex", gap: "12px" }}>
                <button
                    onClick={() => navigate("/create-ride")}
                    style={{
                        padding: "10px 16px",
                        backgroundColor: "#007bff",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer"
                    }}
                >
                    Create Ride
                </button>
                <button
                    onClick={() => navigate("/driver-profile")}
                    style={{
                        padding: "10px 16px",
                        backgroundColor: "#6c757d",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer"
                    }}
                >
                    View Profile / Manage Vehicles
                </button>
            </div>
        </div>
    );
}
