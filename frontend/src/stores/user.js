import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('mni_token'),
  }),
  actions: {
    setToken(newToken) {

        this.token = newToken;

        localStorage.setItem('mni_token', newToken); // Save to local storage
    },
    clearToken() {
      this.token = null;
      localStorage.removeItem('mni_token'); // Remove from local storage
    },
    validateToken() {
      return true;
    },
    getValidToken() {
      return this.validateToken() ? this.token : null;
    }
  },
  getters: {
    isAuthenticated: (state) => !!state.token,
  },
});
