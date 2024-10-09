import Aura from '@primevue/themes/aura';

export default defineNuxtConfig({
    modules: [
        '@primevue/nuxt-module'
    ],
    css: [
        'primeflex/primeflex.css',
    ],
    primevue: {
        options: {
            theme: {
                preset: Aura
            }
        }
    },

    runtimeConfig: {
        public: {
            apiBase: '/api'
        }
    },

    nitro: {
        devProxy: {
            '/api': {
                target: 'http://localhost:8080/ContactForm-1.0-SNAPSHOT/api',
                changeOrigin: true,
                prependPath: true
            }
        }
    },
    compatibilityDate: '2024-10-09'
});
