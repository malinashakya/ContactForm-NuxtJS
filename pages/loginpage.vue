<template>
  <div class="login-page flex justify-content-center align-items-center" style="height: 100vh;">
    <div class="login-container bg-blue-500 p-4 border-round shadow-2" style="max-width: 400px; width: 100%;">
      <div class="login-card text-center w-100" style="background-color: gray; border-radius: 5px; padding: 30px">
        <h2>Login Form</h2>
        <div class="p-field mb-3">
          <label for="username">Username</label>
          <InputText id="username" v-model="username" placeholder="Username"/>
        </div>
        <div class="p-field mb-3">
          <label for="password">Password</label>
          <Password id="password" v-model="password" feedback="false" placeholder="Password"/>
        </div>
        <Button class="p-button-primary" label="Login" @click="login"/>
        <p v-if="errorMessage" class="error errorMessage mt-3">{{ errorMessage }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref} from 'vue';
import {useRouter} from 'vue-router';
import {useFetch} from '#app';

// State
const username = ref('');
const password = ref('');
const errorMessage = ref('');

// Router instance
const router = useRouter();

// Login function
const login = async () => {
  try {
    const {data, error} = await useFetch('/admins/login', { // Updated to use the proxied endpoint
      method: 'POST',
      body: JSON.stringify({
        username: username.value,
        password: password.value,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (error.value || data.value.success === 'false') {
      errorMessage.value = 'Invalid credentials. Please try again.';
    } else {
      router.push({name: 'index'});
    }
  } catch (err) {
    errorMessage.value = 'An error occurred. Please try again.';
  }
};
</script>

<style scoped>

.error, .errorMessage {
  color: red;
  margin-top: 1rem;
}
</style>
