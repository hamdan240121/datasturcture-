# Smart Parking Lot Management System

A professional parking lot management system built with **Queue + Hashing** data structures, featuring an elegant frontend and Python Flask backend.

## 🚗 Features

### Data Structures Used
- **Queue (deque)**: Manages available parking spots efficiently (FIFO)
- **Hash Table (dict)**: Fast O(1) lookup for parked vehicles by license plate
- **Hashing**: Generates unique ticket IDs using MD5 hashing

### Core Functionality
- **Park Vehicle**: Assign available spots using queue dequeue
- **Exit Vehicle**: Return spots to queue and calculate duration
- **Real-time Status**: Live occupancy tracking
- **Activity History**: Track all parking activities
- **Responsive Design**: Professional UI with modern styling

## 🏗️ Architecture

```
Frontend (HTML/CSS/JS) ↔ Flask API ↔ Queue + Hash Data Structures
```

### Backend Components
- `ParkingLot` class with queue-based spot management
- Hash table for O(1) vehicle lookups
- RESTful API endpoints
- Automatic ticket ID generation

### Frontend Features
- Real-time dashboard with status cards
- Elegant form interfaces
- Live activity feed
- Responsive design with animations

## 🚀 Quick Start

### Option 1: Docker (Recommended)
```bash
cd "E:\parking lot management"
docker-compose up --build
```

### Option 2: Local Development
```bash
cd "E:\parking lot management\backend"
pip install -r requirements.txt
python app.py
```

Open `http://localhost:5000` in your browser.

## 📊 API Endpoints

- `POST /api/park` - Park a vehicle
- `POST /api/exit` - Exit a vehicle  
- `GET /api/status` - Get parking lot status
- `GET /api/vehicles` - List parked vehicles
- `GET /api/history` - Get recent activity

## 🎯 Data Structure Implementation

### Queue Operations
```python
# Available spots managed as queue
self.available_spots = deque(range(1, capacity + 1))
spot_number = self.available_spots.popleft()  # Dequeue
self.available_spots.append(spot_number)      # Enqueue back
```

### Hash Table Operations
```python
# O(1) vehicle lookup and storage
self.occupied_spots[license_plate] = spot_info  # Store
vehicle = self.occupied_spots[license_plate]    # Retrieve
del self.occupied_spots[license_plate]          # Remove
```

### Hashing for Ticket IDs
```python
def generate_ticket_id(self, license_plate):
    timestamp = str(time.time())
    return hashlib.md5((license_plate + timestamp).encode()).hexdigest()[:8].upper()
```

## 🎨 UI Features

- **Modern Design**: Gradient backgrounds and glass morphism
- **Status Cards**: Real-time occupancy visualization
- **Interactive Forms**: Smooth animations and feedback
- **Activity Feed**: Live parking activity updates
- **Responsive Layout**: Works on all device sizes

## 📁 Project Structure

```
parking lot management/
├── backend/
│   ├── app.py              # Flask application with Queue + Hash logic
│   ├── requirements.txt    # Python dependencies
│   └── Dockerfile         # Container configuration
├── frontend/
│   ├── index.html         # Main UI
│   ├── style.css          # Professional styling
│   └── script.js          # Frontend logic
├── docker-compose.yml     # Docker orchestration
└── README.md             # This file
```

## 🔧 Technical Details

- **Backend**: Python Flask with CORS support
- **Data Structures**: Collections.deque (Queue) + dict (Hash Table)
- **Frontend**: Vanilla JavaScript with modern CSS
- **Styling**: CSS Grid, Flexbox, animations, gradients
- **Icons**: Font Awesome for professional icons
- **Deployment**: Docker containerization ready