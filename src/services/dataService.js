// Data Service for SaaS Platform
// This will handle saving/loading diagram data to/from the backend

class DataService {
  constructor() {
    this.baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';
  }

  // Save diagram data
  async saveDiagram(diagramId, data, userId) {
    try {
      const response = await fetch(`${this.baseUrl}/diagrams/${diagramId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({
          userId,
          data,
          updatedAt: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to save diagram: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error saving diagram:', error);
      throw error;
    }
  }

  // Load diagram data
  async loadDiagram(diagramId, userId) {
    try {
      const response = await fetch(`${this.baseUrl}/diagrams/${diagramId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to load diagram: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error loading diagram:', error);
      throw error;
    }
  }

  // Create new diagram
  async createDiagram(name, data, userId) {
    try {
      const response = await fetch(`${this.baseUrl}/diagrams`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({
          name,
          userId,
          data,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to create diagram: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating diagram:', error);
      throw error;
    }
  }

  // Get user's diagrams
  async getUserDiagrams(userId) {
    try {
      const response = await fetch(`${this.baseUrl}/diagrams?userId=${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to load user diagrams: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error loading user diagrams:', error);
      throw error;
    }
  }

  // Delete diagram
  async deleteDiagram(diagramId, userId) {
    try {
      const response = await fetch(`${this.baseUrl}/diagrams/${diagramId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to delete diagram: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting diagram:', error);
      throw error;
    }
  }

  // Export diagram as JSON
  exportDiagram(data, filename = 'diagram.json') {
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Import diagram from JSON file
  importDiagram(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          resolve(data);
        } catch (error) {
          reject(new Error('Invalid JSON file'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  // Get authentication token (placeholder for now)
  getAuthToken() {
    // This would be implemented with your authentication system
    return localStorage.getItem('authToken') || '';
  }

  // Save to localStorage as fallback
  saveToLocalStorage(diagramId, data) {
    try {
      localStorage.setItem(`diagram_${diagramId}`, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      return false;
    }
  }

  // Load from localStorage as fallback
  loadFromLocalStorage(diagramId) {
    try {
      const data = localStorage.getItem(`diagram_${diagramId}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      return null;
    }
  }
}

export default new DataService(); 