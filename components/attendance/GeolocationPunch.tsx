"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { attendanceApi, officeApi } from "@/lib/api";
import { toast } from "@/components/ui/toast";
import { MapPin, Navigation, Clock, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { format } from "date-fns";

interface GeolocationPunchProps {
  onPunchSuccess?: () => void;
}

export function GeolocationPunch({ onPunchSuccess }: GeolocationPunchProps) {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [isInsideRadius, setIsInsideRadius] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [todayStatus, setTodayStatus] = useState<any>(null);
  const [office, setOffice] = useState<any>(null);
  const [locationPermissionDenied, setLocationPermissionDenied] = useState(false);

  useEffect(() => {
    loadTodayStatus();
    // Always request location on mount
    getCurrentLocation();
  }, []);

  const loadTodayStatus = async () => {
    try {
      const status = await attendanceApi.getTodayStatus();
      setTodayStatus(status);
    } catch (err: any) {
      console.error("Failed to load today status:", err);
    }
  };

  const getCurrentLocation = () => {
    setIsGettingLocation(true);
    setError(null);
    setLocationPermissionDenied(false);

    if (!navigator.geolocation) {
      const errorMsg = "Geolocation is not supported by your browser. Please use a modern browser with GPS support.";
      setError(errorMsg);
      setIsGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // Validate coordinates
        if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
          setError("Invalid location coordinates received. Please try again.");
          setIsGettingLocation(false);
          return;
        }

        setLocation({ lat: latitude, lng: longitude });
        setIsGettingLocation(false);
        setLocationPermissionDenied(false);

        // Validate location with backend
        try {
          const validation = await officeApi.validateLocation(latitude, longitude);
          setDistance(validation.distance);
          setIsInsideRadius(validation.isValid);
          setOffice(validation.office);
          
          if (!validation.isValid) {
            setError(`You are ${validation.distance}m away from the office. Please move within ${validation.office?.radius || 100}m radius.`);
          } else {
            setError(null); // Clear any previous errors
          }
        } catch (err: any) {
          console.error("Failed to validate location:", err);
          setError(err.message || "Failed to validate location. Please try again.");
        }
      },
      (err) => {
        setIsGettingLocation(false);
        let errorMessage = "Failed to get your location";
        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMessage = "Location permission denied. Please enable location access in your browser settings and refresh the page.";
            setLocationPermissionDenied(true);
            break;
          case err.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable. Please check your GPS settings.";
            break;
          case err.TIMEOUT:
            errorMessage = "Location request timed out. Please try again.";
            break;
        }
        setError(errorMessage);
        setLocation(null); // Clear location if error
        setIsInsideRadius(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000, // Increased timeout
        maximumAge: 0, // Always get fresh location
      }
    );
  };

  const handlePunch = async () => {
    // Mandatory location check
    if (!location || !location.lat || !location.lng) {
      toast.error("Location Required", "Please enable location services and wait for GPS to be detected");
      getCurrentLocation(); // Automatically retry getting location
      return;
    }

    // Validate coordinates
    if (isNaN(location.lat) || isNaN(location.lng)) {
      toast.error("Invalid Location", "Invalid GPS coordinates. Please refresh location.");
      getCurrentLocation();
      return;
    }

    // Mandatory radius check - must be inside office radius
    if (isInsideRadius === false) {
      toast.error("Outside Office Radius", `You are ${distance}m away from the office. Please move within ${office?.radius || 100}m radius to punch in/out.`);
      return;
    }

    // If validation is still pending
    if (isInsideRadius === null) {
      toast.error("Location Validation Pending", "Please wait for location validation to complete");
      return;
    }

    setIsLoading(true);
    try {
      console.log("Frontend: Sending punch request", {
        lat: location.lat,
        lng: location.lng,
      });
      
      const result = await attendanceApi.punchWithLocation(
        location.lat,
        location.lng
      );

      console.log("Frontend: Punch response received", result);

      toast.success(
        `Punch ${result.action === "punch-in" ? "In" : "Out"} Successful`,
        `Distance: ${result.distance}m from ${result.office?.officeName || "office"}`
      );

      await loadTodayStatus();
      if (onPunchSuccess) {
        onPunchSuccess();
      }
    } catch (err: any) {
      console.error("Frontend: Punch failed:", err);
      console.error("Frontend: Error details:", {
        message: err.message,
        response: err.response,
        stack: err.stack,
      });
      
      // Show specific error messages
      if (err.message?.includes("outside the allowed radius")) {
        toast.error("Outside Office Radius", err.message);
      } else if (err.message?.includes("No office location assigned")) {
        toast.error("Office Not Configured", err.message);
      } else if (err.message?.includes("Location coordinates are required")) {
        toast.error("Location Required", err.message);
        getCurrentLocation(); // Retry getting location
      } else {
        toast.error("Punch Failed", err.message || "Please try again");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Can only punch if: location is valid, inside radius, not loading, and location permission granted
  const canPunch = location && 
                   location.lat && 
                   location.lng && 
                   !isNaN(location.lat) && 
                   !isNaN(location.lng) && 
                   isInsideRadius === true && 
                   !isLoading && 
                   !isGettingLocation &&
                   !locationPermissionDenied;
  
  const actionText = todayStatus?.isPunchedIn ? "Punch Out" : "Punch In";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Navigation className="h-5 w-5" />
          Geolocation Attendance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Location Status */}
        <div className="space-y-2">
          {isGettingLocation && (
            <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 p-3 rounded-lg">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Getting your location... Please allow location access when prompted.</span>
            </div>
          )}

          {locationPermissionDenied && (
            <div className="flex flex-col gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4" />
                <span className="font-medium">Location Permission Required</span>
              </div>
              <p className="text-xs pl-6">
                Location access is mandatory for attendance. Please enable location permissions in your browser settings and refresh the page.
              </p>
              <Button
                onClick={getCurrentLocation}
                variant="outline"
                size="sm"
                className="mt-2"
              >
                Retry Location Access
              </Button>
            </div>
          )}

          {error && !locationPermissionDenied && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
              <XCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}

          {location && !error && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-primary" />
                <span>
                  Lat: {location.lat.toFixed(6)}, Lng: {location.lng.toFixed(6)}
                </span>
              </div>

              {distance !== null && (
                <div className="flex items-center gap-2 text-sm">
                  {isInsideRadius ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <span>
                    Distance: <strong>{distance}m</strong> from {office?.officeName || "office"}
                    {office && ` (Radius: ${office.radius}m)`}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Today's Status */}
        {todayStatus && (
          <div className="border-t pt-4 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Today's Status:</span>
            </div>
            {todayStatus.punchInTime ? (
              <div className="text-sm space-y-1 pl-6">
                <div>
                  <strong>Punch In:</strong>{" "}
                  {format(new Date(todayStatus.punchInTime), "h:mm a")}
                </div>
                {todayStatus.punchOutTime ? (
                  <div>
                    <strong>Punch Out:</strong>{" "}
                    {format(new Date(todayStatus.punchOutTime), "h:mm a")}
                  </div>
                ) : (
                  <div className="text-green-600">Currently at work</div>
                )}
                {todayStatus.hoursWorked > 0 && (
                  <div>
                    <strong>Hours Worked:</strong> {todayStatus.hoursWorked.toFixed(2)}h
                  </div>
                )}
              </div>
            ) : (
              <div className="text-sm pl-6 text-muted-foreground">
                Not punched in yet
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            onClick={handlePunch}
            disabled={!canPunch}
            className="flex-1"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : !location ? (
              <>
                <MapPin className="h-4 w-4 mr-2" />
                Waiting for Location...
              </>
            ) : !isInsideRadius ? (
              <>
                <XCircle className="h-4 w-4 mr-2" />
                Outside Office Radius
              </>
            ) : (
              <>
                <Navigation className="h-4 w-4 mr-2" />
                {actionText}
              </>
            )}
          </Button>
          <Button
            onClick={getCurrentLocation}
            variant="outline"
            disabled={isGettingLocation}
          >
            <MapPin className="h-4 w-4 mr-2" />
            {isGettingLocation ? "Getting..." : "Refresh Location"}
          </Button>
        </div>

        {!location && !isGettingLocation && (
          <div className="text-xs text-amber-600 bg-amber-50 p-3 rounded-lg">
            <strong>⚠️ Location Required:</strong> GPS location is mandatory for attendance. Please enable location services and click "Refresh Location".
          </div>
        )}

        {!isInsideRadius && location && (
          <div className="text-xs text-red-600 bg-red-50 p-3 rounded-lg">
            <strong>❌ Outside Office Radius:</strong> You are {distance}m away. You must be within {office?.radius || 100}m of the office to punch in/out.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

