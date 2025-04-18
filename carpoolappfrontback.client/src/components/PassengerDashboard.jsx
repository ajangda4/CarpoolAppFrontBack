import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

export default function PassengerDashboard() {
    const [availableRides, setAvailableRides] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [selectedRideId, setSelectedRideId] = useState(null);
    const [selectedLocation, setSelectedLocation] = useState("");
    const [customLocation, setCustomLocation] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [isPickupMode, setIsPickupMode] = useState(false);
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

    const openModal = (ride) => {
        setSelectedRideId(ride.rideId);
        setSelectedLocation("");
        setCustomLocation("");
        const goingToHabib = ride.destination.toLowerCase().includes("habib university");
        setIsPickupMode(goingToHabib);
        setShowModal(true);
    };

    const handleRequestRide = async () => {
        const final = selectedLocation === "custom" ? customLocation.trim() : selectedLocation;

        if (!final) {
            toast.error("Please select or enter a location.");
            return;
        }

        try {
            const token = localStorage.getItem("token");
            const ride = availableRides.find(r => r.rideId === selectedRideId);

            await axios.post("https://localhost:7161/api/passengerdashboard/request-ride", {
                rideId: selectedRideId,
                pickupLocation: isPickupMode ? final : "To be decided",
                dropoffLocation: isPickupMode ? ride?.destination : final
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            toast.success(`Ride request sent with ${isPickupMode ? 'pickup' : 'dropoff'}: ${final}`);
            setTimeout(() => window.location.reload(), 2000);
        } catch (err) {
            console.error("Error requesting ride:", err.response?.data || err.message);
            toast.error(err.response?.data?.message || "Failed to request ride.");
        }
    };


    if (loading) return <p>Loading available rides...</p>;

    return (
        <div style={{ padding: "20px", maxWidth: "900px", margin: "0 auto" }}>
            <ToastContainer position="top-center" autoClose={2500} hideProgressBar />
            <h2>Passenger Dashboard</h2>

            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "10px", marginBottom: "20px" }}>
                <h3 style={{ margin: 0 }}>Available Rides</h3>
                <input
                    type="text"
                    placeholder="Search origin, destination, or route"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        flex: 1,
                        minWidth: "220px",
                        padding: "6px",
                        border: "1px solid #ccc",
                        borderRadius: "4px"
                    }}
                />
                <button
                    onClick={() => navigate("/passenger-profile")}
                    style={{
                        padding: "8px 12px",
                        backgroundColor: "#007bff",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer"
                    }}
                >
                    My Ride History
                </button>
            </div>


            {availableRides.length === 0 ? (
                <p><i>No rides available right now.</i></p>
            ) : (
                    availableRides.filter((ride) =>
                        ride.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        ride.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (Array.isArray(ride.routeStops) && ride.routeStops.some(stop =>
                            stop.toLowerCase().includes(searchTerm.toLowerCase())
                        ))
                    ).map((ride) => (
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
                        <p><strong>Departure:</strong> {new Date(ride.departureTime + 'Z').toLocaleString()}</p>
                        <p><strong>Available Seats:</strong> {ride.availableSeats}</p>
                        <p><strong>Price per Seat:</strong> Rs. {ride.pricePerSeat}</p>
                        <p><strong>Driver:</strong> {ride.driverName}</p>
                        <p><strong>Vehicle:</strong> {ride.vehicle}</p>

                        {ride.routeStops.length > 0 && (
                            <p><strong>Route Stops:</strong> {ride.routeStops.join(" → ")}</p>
                        )}

                        <p><strong>Your Request Status:</strong> {ride.rideRequestStatus}</p>

                        {ride.availableSeats === 0 ? (
                            <span style={{ color: "gray", fontStyle: "italic" }}>Ride is Full</span>
                        ) : ride.rideRequestStatus === "Not Requested" ? (
                            <button
                                onClick={() => openModal(ride)}
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

                        {showModal && selectedRideId === ride.rideId && (
                            <div style={{
                                marginTop: "16px",
                                padding: "12px",
                                border: "1px dashed gray",
                                borderRadius: "6px",
                                backgroundColor: "#f9f9f9"
                            }}>
                                <label style={{ color: "#000" }}>
                                    <strong>Select {isPickupMode ? "Pickup" : "Dropoff"} Location:</strong>
                                </label><br />
<br />
                                <select
                                    value={selectedLocation}
                                    onChange={(e) => {
                                        setSelectedLocation(e.target.value);
                                        if (e.target.value !== "custom") {
                                            setCustomLocation("");
                                        }
                                    }}
                                    style={{ padding: "6px", marginTop: "8px", width: "100%" }}
                                >
                                    <option value="">-- Select --</option>
                                    {(isPickupMode
                                        ? [ride.origin, ...ride.routeStops]
                                        : [...ride.routeStops, ride.destination]
                                    ).map((stop, idx) => (
                                        <option key={idx} value={stop}>{stop}</option>
                                    ))}
                                    <option value="custom">Other (type manually)</option>
                                </select>


                                {selectedLocation === "custom" && (
                                    <input
                                        type="text"
                                        placeholder={`Enter custom ${isPickupMode ? "pickup" : "dropoff"} location`}
                                        value={customLocation}
                                        onChange={(e) => setCustomLocation(e.target.value)}
                                        style={{
                                            marginTop: "10px",
                                            padding: "8px",
                                            width: "100%",
                                            border: "1px solid #ccc",
                                            borderRadius: "4px"
                                        }}
                                    />
                                )}

                                <button
                                    onClick={handleRequestRide}
                                    style={{
                                        marginTop: "12px",
                                        padding: "8px 12px",
                                        backgroundColor: "#007bff",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "4px",
                                        cursor: "pointer"
                                    }}
                                >
                                    Confirm Ride Request
                                </button>
                            </div>
                        )}
                    </div>
                ))
            )}
        </div>
    );
}
