import {navigateTo} from "#app";

export default defineNuxtRouteMiddleware((to, from) => {
    const token = useCookie('auth_token');
    const expiration = useCookie('auth_token_expiration');
    const username = useCookie('username');

    // If token is present and not expired
    if (token.value && expiration.value && new Date() < new Date(expiration.value)) {
        if (to.name === 'loginpage') {
            return navigateTo('/viewdetails');
        }
    }

    //If token expires
    if (token.value && expiration.value && new Date() > new Date(expiration.value)) {
        token.value = '';
        expiration.value = '';
        username.value = '';
        return navigateTo('/loginpage');
    }

    if (!token.value && to.name !== 'loginpage') {
        return navigateTo('/loginpage');
    }
})

