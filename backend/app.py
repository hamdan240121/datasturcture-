from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from collections import deque
import hashlib
import time
from datetime import datetime

app = Flask(__name__)
CORS(app)

class ParkingLot:
    def __init__(self, capacity=50):
        self.capacity = capacity
        self.available_spots = deque(range(1, capacity + 1))  # Queue for available spots
        self.occupied_spots = {}  # Hash table: license_plate -> spot_info
        self.parking_history = []  # Track all parking activities
    
    def generate_ticket_id(self, license_plate):
        """Generate unique ticket ID using hashing"""
        timestamp = str(time.time())
        return hashlib.md5((license_plate + timestamp).encode()).hexdigest()[:8].upper()
    
    def park_vehicle(self, license_plate, vehicle_type="car"):
        if not self.available_spots:
            return {"success": False, "message": "Parking lot is full"}
        
        if license_plate in self.occupied_spots:
            return {"success": False, "message": "Vehicle already parked"}
        
        spot_number = self.available_spots.popleft()  # Dequeue from available spots
        ticket_id = self.generate_ticket_id(license_plate)
        entry_time = datetime.now()
        
        spot_info = {
            "spot_number": spot_number,
            "ticket_id": ticket_id,
            "vehicle_type": vehicle_type,
            "entry_time": entry_time.isoformat(),
            "license_plate": license_plate
        }
        
        self.occupied_spots[license_plate] = spot_info
        self.parking_history.append({
            "action": "ENTRY",
            "license_plate": license_plate,
            "spot_number": spot_number,
            "ticket_id": ticket_id,
            "timestamp": entry_time.isoformat()
        })
        
        return {"success": True, "data": spot_info}
    
    def exit_vehicle(self, license_plate):
        if license_plate not in self.occupied_spots:
            return {"success": False, "message": "Vehicle not found"}
        
        spot_info = self.occupied_spots.pop(license_plate)
        self.available_spots.append(spot_info["spot_number"])  # Enqueue back to available spots
        
        exit_time = datetime.now()
        entry_time = datetime.fromisoformat(spot_info["entry_time"])
        duration = exit_time - entry_time
        
        self.parking_history.append({
            "action": "EXIT",
            "license_plate": license_plate,
            "spot_number": spot_info["spot_number"],
            "ticket_id": spot_info["ticket_id"],
            "timestamp": exit_time.isoformat(),
            "duration_minutes": int(duration.total_seconds() / 60)
        })
        
        return {
            "success": True,
            "data": {
                "spot_number": spot_info["spot_number"],
                "duration_minutes": int(duration.total_seconds() / 60),
                "exit_time": exit_time.isoformat()
            }
        }
    
    def get_status(self):
        return {
            "total_spots": self.capacity,
            "available_spots": len(self.available_spots),
            "occupied_spots": len(self.occupied_spots),
            "occupancy_rate": round((len(self.occupied_spots) / self.capacity) * 100, 1)
        }

# Initialize parking lot
parking_lot = ParkingLot()

@app.route('/')
def serve_frontend():
    return send_from_directory('../frontend', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('../frontend', path)

@app.route('/api/park', methods=['POST'])
def park_vehicle():
    data = request.get_json()
    license_plate = data.get('license_plate', '').upper().strip()
    vehicle_type = data.get('vehicle_type', 'car')
    
    if not license_plate:
        return jsonify({"success": False, "message": "License plate required"}), 400
    
    result = parking_lot.park_vehicle(license_plate, vehicle_type)
    return jsonify(result)

@app.route('/api/exit', methods=['POST'])
def exit_vehicle():
    data = request.get_json()
    license_plate = data.get('license_plate', '').upper().strip()
    
    if not license_plate:
        return jsonify({"success": False, "message": "License plate required"}), 400
    
    result = parking_lot.exit_vehicle(license_plate)
    return jsonify(result)

@app.route('/api/status', methods=['GET'])
def get_status():
    return jsonify(parking_lot.get_status())

@app.route('/api/vehicles', methods=['GET'])
def get_parked_vehicles():
    vehicles = list(parking_lot.occupied_spots.values())
    return jsonify(vehicles)

@app.route('/api/history', methods=['GET'])
def get_history():
    return jsonify(parking_lot.parking_history[-20:])  # Last 20 activities

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)