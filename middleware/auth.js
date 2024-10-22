import {navigateTo} from "#app";

export default defineNuxtRouteMiddleware((to, from) => {
    const token = useCookie('auth_token');
    const expiration = useCookie('auth_token_expiration');
    const username = useCookie('username');

    console.log("Token", token.value);
    console.log("Expiration", expiration.value);
    console.log("Username", username.value);
    console.log("Current Date Time", new Date());
    console.log("Expire", new Date(expiration.value));
    // If token is present and not expired
    if (token.value && expiration.value && new Date() < new Date(expiration.value)) {
        console.log("qqqqq", to)
        if (to.name === 'loginpage') {
            console.log("Nav");
            return navigateTo('/viewdetails');
        }
        return;
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

