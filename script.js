class ParkingManager {
    constructor() {
        this.apiBase = '/api';
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadData();
        setInterval(() => this.loadData(), 5000); // Auto-refresh every 5 seconds
    }

    bindEvents() {
        document.getElementById('parkForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.parkVehicle();
        });

        document.getElementById('exitForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.exitVehicle();
        });
    }

    async parkVehicle() {
        const licensePlate = document.getElementById('parkLicense').value.trim();
        const vehicleType = document.getElementById('vehicleType').value;

        if (!licensePlate) {
            this.showNotification('Please enter a license plate', 'error');
            return;
        }

        try {
            const response = await fetch(`${this.apiBase}/park`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ license_plate: licensePlate, vehicle_type: vehicleType })
            });

            const result = await response.json();
            
            if (result.success) {
                this.showNotification(`Vehicle parked at spot ${result.data.spot_number}. Ticket: ${result.data.ticket_id}`, 'success');
                document.getElementById('parkForm').reset();
                this.loadData();
            } else {
                this.showNotification(result.message, 'error');
            }
        } catch (error) {
            this.showNotification('Error parking vehicle', 'error');
        }
    }

    async exitVehicle() {
        const licensePlate = document.getElementById('exitLicense').value.trim();

        if (!licensePlate) {
            this.showNotification('Please enter a license plate', 'error');
            return;
        }

        try {
            const response = await fetch(`${this.apiBase}/exit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ license_plate: licensePlate })
            });

            const result = await response.json();
            
            if (result.success) {
                this.showNotification(`Vehicle exited from spot ${result.data.spot_number}. Duration: ${result.data.duration_minutes} minutes`, 'success');
                document.getElementById('exitForm').reset();
                this.loadData();
            } else {
                this.showNotification(result.message, 'error');
            }
        } catch (error) {
            this.showNotification('Error exiting vehicle', 'error');
        }
    }

    async loadData() {
        try {
            const [statusResponse, vehiclesResponse, historyResponse] = await Promise.all([
                fetch(`${this.apiBase}/status`),
                fetch(`${this.apiBase}/vehicles`),
                fetch(`${this.apiBase}/history`)
            ]);

            const status = await statusResponse.json();
            const vehicles = await vehiclesResponse.json();
            const history = await historyResponse.json();

            this.updateStatus(status);
            this.updateVehiclesTable(vehicles);
            this.updateActivity(history);
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }

    updateStatus(status) {
        document.getElementById('totalSpots').textContent = status.total_spots;
        document.getElementById('availableSpots').textContent = status.available_spots;
        document.getElementById('occupiedSpots').textContent = status.occupied_spots;
        document.getElementById('occupancyRate').textContent = `${status.occupancy_rate}%`;
    }

    updateVehiclesTable(vehicles) {
        const tbody = document.getElementById('vehiclesBody');
        
        if (vehicles.length === 0) {
            tbody.innerHTML = '<tr class="no-data"><td colspan="5">No vehicles currently parked</td></tr>';
            return;
        }

        tbody.innerHTML = vehicles.map(vehicle => `
            <tr>
                <td><strong>#${vehicle.spot_number}</strong></td>
                <td>${vehicle.license_plate}</td>
                <td><span class="vehicle-type">${vehicle.vehicle_type}</span></td>
                <td>${this.formatDateTime(vehicle.entry_time)}</td>
                <td><code>${vehicle.ticket_id}</code></td>
            </tr>
        `).join('');
    }

    updateActivity(history) {
        const container = document.getElementById('activityContainer');
        
        if (history.length === 0) {
            container.innerHTML = '<div class="no-activity">No recent activity</div>';
            return;
        }

        container.innerHTML = history.reverse().map(activity => `
            <div class="activity-item ${activity.action.toLowerCase()}">
                <div class="activity-icon ${activity.action.toLowerCase()}">
                    <i class="fas fa-${activity.action === 'ENTRY' ? 'sign-in-alt' : 'sign-out-alt'}"></i>
                </div>
                <div class="activity-details">
                    <h4>${activity.license_plate} - Spot #${activity.spot_number}</h4>
                    <p>${activity.action} at ${this.formatDateTime(activity.timestamp)}
                    ${activity.duration_minutes ? ` (${activity.duration_minutes} min)` : ''}</p>
                </div>
            </div>
        `).join('');
    }

    formatDateTime(isoString) {
        return new Date(isoString).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    showNotification(message, type) {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.className = `notification ${type}`;
        notification.classList.add('show');

        setTimeout(() => {
            notification.classList.remove('show');
        }, 4000);
    }
}

// Initialize the parking manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ParkingManager();
});