import { defineStore } from 'pinia';

// Lets get the mni_token and check if it is valid

const token = localStorage.getItem('mni_token');
if (token) {
  // Check if the token is expired
  const decodedToken = JSON.parse(atob(token.split('.')[1]));
  const current_time = new Date().getTime() / 1000;
  if (decodedToken.exp < current_time) {
    console.log('Token expired');
    localStorage.removeItem('mni_token');
  }
}

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('mni_token') || null,
  }),
  actions: {
    setToken(newToken) {
      this.token = newToken;
      // TODO: Parse the data from the token and store in a user object, this contains a username and profile image!
      
      localStorage.setItem('mni_token', newToken); // Save to local storage
    },
    clearToken() {
      this.token = null;
      localStorage.removeItem('mni_token'); // Remove from local storage
    },
  },
  getters: {
    isAuthenticated: (state) => !!state.token,
  },
});
