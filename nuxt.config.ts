import Aura from '@primevue/themes/aura';

export default defineNuxtConfig({
    modules: [
        '@primevue/nuxt-module'
    ],
    css: [
        'primeflex/primeflex.css', // Import PrimeFlex CSS
        ],
    primevue: {
        options: {
            theme: {
                preset: Aura
            }
        }
    }
})