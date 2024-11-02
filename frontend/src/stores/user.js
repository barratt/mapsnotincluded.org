import { defineStore } from 'pinia';

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
