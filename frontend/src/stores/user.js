import { defineStore } from 'pinia';

// Function to validate a JWT token
function validateToken(token) {

    if (!token)
        return false;

    try {

        const parts = token.split('.');

        if (parts.length !== 3) {
            console.log('Invalid token structure');
            return false;
        }

        try {

            const header = JSON.parse(atob(parts[0]));

            if (header.alg !== 'ES256') {
                console.log('Invalid token algorithm');
                return false;
            }

        } catch (e) {
            console.log('Could not parse token header');
            return false;
        }

        return true;

    } catch (e) {
        console.log('Token validation error:', e);
        return false;
    }
}

const token = localStorage.getItem('mni_token');

if (token && !validateToken(token)) {

    console.log('Removing invalid token from localStorage');

    localStorage.removeItem('mni_token');
}

export const useUserStore = defineStore('user', {
    state: () => ({
        token: validateToken(localStorage.getItem('mni_token')) ? localStorage.getItem('mni_token') : null,
    }),
    actions: {
        setToken(newToken) {

            if (validateToken(newToken)) {

                this.token = newToken;

                localStorage.setItem('mni_token', newToken); // Save to local storage

            } else {
                console.log('Attempted to set invalid token');
                this.clearToken();
            }
        },
        clearToken() {
            this.token = null;
            localStorage.removeItem('mni_token'); // Remove from local storage
        },
        validateToken() {
            if (!validateToken(this.token)) {
                console.log('Token validation failed, clearing token');
                this.clearToken();
                return false;
            }
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
