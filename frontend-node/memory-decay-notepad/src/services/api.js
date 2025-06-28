const API_BASE_URL = 'https://nodeforspeed10-backend-production-305f.up.railway.app/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Helper method to make HTTP requests
  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      console.log('Making API request to:', url);
      const response = await fetch(url, config);
      
      // Log response details for debugging
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        // If not JSON, get the text and log it
        const text = await response.text();
        console.error('Non-JSON response received:', text.substring(0, 200));
        throw new Error(`Expected JSON response but got ${contentType}. Server may be down or URL incorrect.`);
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      console.error('Request URL:', url);
      console.error('Request config:', config);
      throw error;
    }
  }

  // Authentication methods
  async signup(userData) {
    return this.makeRequest('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials) {
    return this.makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async logout() {
    return this.makeRequest('/auth/logout', {
      method: 'POST',
    });
  }

  async getProfile() {
    return this.makeRequest('/auth/profile', {
      method: 'GET',
    });
  }

  async updateProfile(profileData) {
    return this.makeRequest('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async forgotPassword(email) {
    return this.makeRequest('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(resetData) {
    return this.makeRequest('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(resetData),
    });
  }

  async changePassword(passwordData) {
    return this.makeRequest('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(passwordData),
    });
  }

  async refreshToken() {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    return this.makeRequest('/auth/refresh', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${refreshToken}`,
      },
    });
  }

  // Resend verification email
  async resendVerification(email) {
    return this.makeRequest('/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  // Notes methods
  async getNotes() {
    return this.makeRequest('/notes/', { method: 'GET' });
  }

  async getArchivedNotes() {
    return this.makeRequest('/notes/archived', { method: 'GET' });
  }

  async createNote(noteData) {
    return this.makeRequest('/notes/', {
      method: 'POST',
      body: JSON.stringify(noteData),
    });
  }

  async updateNote(noteId, noteData) {
    return this.makeRequest(`/notes/${noteId}`, {
      method: 'PUT',
      body: JSON.stringify(noteData),
    });
  }

  async deleteNote(noteId) {
    return this.makeRequest(`/notes/${noteId}`, {
      method: 'DELETE' });
  }

  // AI methods
  async aiRevision(noteId) {
    return this.makeRequest(`/notes/${noteId}/ai-revision`, {
      method: 'POST',
    });
  }

  async answerRevisionQuestion(noteId, questionIndex, answer) {
    return this.makeRequest(`/notes/${noteId}/answer-question`, {
      method: 'POST',
      body: JSON.stringify({ question_index: questionIndex, answer }),
    });
  }

  async completeRevision(noteId, correctAnswers, totalQuestions) {
    return this.makeRequest(`/notes/${noteId}/complete-revision`, {
      method: 'POST',
      body: JSON.stringify({ correct_answers: correctAnswers, total_questions: totalQuestions }),
    });
  }

  async reviveNote(noteId, questionIndex, answer) {
    return this.makeRequest(`/notes/${noteId}/revive`, {
      method: 'POST',
      body: JSON.stringify({ question_index: questionIndex, answer }),
    });
  }

  // Token management
  setTokens(accessToken, refreshToken) {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
  }

  clearTokens() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  isAuthenticated() {
    return !!localStorage.getItem('access_token');
  }
}

export const apiService = new ApiService();
export default apiService; 