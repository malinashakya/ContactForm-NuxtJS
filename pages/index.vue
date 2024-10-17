<template>
  <section class="contact p-d-flex">
    <div class="greet m-4">
      <Button class="view-contact-button" @click="navigateToViewContact">
        View Contact
      </Button>
      <h2>Contact Me</h2>
      <h3>Let's Greet and Meet.</h3>
    </div>

    <!-- Contact Form Section -->
    <Form class="contact-form" @submit="handleSubmit">
      <!-- Name Field -->
      <div class="form-group m-4">
        <label for="name">Name<span class="required">*</span></label>
        <Field v-slot="{ field }" name="name">
          <InputText v-model="formData.name" class="full" placeholder="Your Name" v-bind="field"/>
        </Field>
        <ErrorMessage class="error" name="name"/>
        <p v-if="serverErrors.name" class="error">{{ serverErrors.name }}</p>
      </div>

      <!-- Contact Via Field -->
      <div class="form-group m-4">
        <label for="contactVia">Contact Via<span class="required">*</span></label>
        <Field v-slot="{ field }" name="contactVia" rules="required">
          <template v-if="!isLoading">
            <Select
                id="contactVia"
                v-model="formData.contactVia"
                :options="contactViaOptions"
                placeholder="Select Contact Method"
                v-bind="field"
            />
          </template>
          <template v-else>
            <p>Loading options...</p> <!-- Display while loading -->
          </template>
        </Field>
        <ErrorMessage class="error" name="contactVia"/>
        <p v-if="serverErrors.contactVia" class="error">{{ serverErrors.contactVia }}</p>
      </div>

      <!-- Email Field -->
      <div v-if="formData.contactVia === 'Email'" class="form-group m-4">
        <label for="email">Email<span class="required">*</span></label>
        <Field v-slot="{ field }" :rules="emailRules" name="email">
          <InputText v-model="formData.email" placeholder="Your Email" type="email" v-bind="field"/>
        </Field>
        <ErrorMessage class="error" name="email"/>
        <p v-if="serverErrors.email" class="error">{{ serverErrors.email }}</p>
      </div>

      <!-- Contact Field -->
      <div v-if="formData.contactVia === 'Phone'" class="form-group m-4">
        <label for="contact">Contact<span class="required">*</span></label>
        <Field v-slot="{ field }" :rules="contactRules" name="contact">
          <InputText v-model="formData.contact" placeholder="Your Contact" v-bind="field"/>
        </Field>
        <ErrorMessage class="error" name="contact"/>
        <p v-if="serverErrors.contact" class="error">{{ serverErrors.contact }}</p>
      </div>

      <!-- Address Field -->
      <div class="form-group m-4">
        <label for="address">Address<span class="required">*</span></label>
        <Field v-slot="{ field }" name="address" rules="required|min:3">
          <InputText v-model="formData.address" placeholder="Your Address" v-bind="field"/>
        </Field>
        <ErrorMessage class="error" name="address"/>
        <p v-if="serverErrors.address" class="error">{{ serverErrors.address }}</p>
      </div>

      <!-- Message Field -->
      <div class="form-group m-4">
        <label for="message">Message<span class="required">*</span></label>
        <Field v-slot="{ field }" name="message" rules="required|min:10">
          <Textarea v-model="formData.message" placeholder="Your Message" rows="4" v-bind="field"/>
        </Field>
        <ErrorMessage class="error" name="message"/>
        <p v-if="serverErrors.message" class="error">{{ serverErrors.message }}</p>
      </div>

      <!-- Submit Button -->
      <Button class="m-4" type="submit">Send Message</Button>
    </Form>
  </section>
</template>

<script lang="ts" setup>
import {ref, computed} from 'vue';
import {useRouter} from 'vue-router';
import {Form, Field, ErrorMessage, defineRule, configure} from 'vee-validate';
import {required, email, min} from '@vee-validate/rules';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import Textarea from 'primevue/textarea';
import {useAsyncData} from '#app';

// Reactive form data
const formData = ref({
  name: '',
  email: '',
  contact: '',
  address: '',
  message: '',
  contactVia: ''
});

// Reactive state for contact via options and loading
const contactViaOptions = ref([]);
const fetchError = ref(null);
const serverErrors = ref({}); // Reactive object to store server-side errors

// Fetch contact via options using useAsyncData
const {data: options, error} = await useAsyncData('contact-via-options', async () => {
  const response = await $fetch('http://localhost:8080/ContactForm-1.0-SNAPSHOT/api/contacts/contactvia');
  return response; // return the fetched data
});

// Error handling
if (error.value) {
  fetchError.value = error.value;
  console.error('Error fetching contact methods:', error.value);
} else {
  contactViaOptions.value = options.value || []; // Ensure that fetched data is not null
}

// Computed rules based on the contact method
const emailRules = computed(() => {
  return formData.value.contactVia === 'Email' ? 'required|email' : '';
});

const contactRules = computed(() => {
  return formData.value.contactVia === 'Phone' ? 'required|exactLength:10' : '';
});

// Handle form submission
const handleSubmit = async () => {
  try {
    // Reset server errors before submission
    serverErrors.value = {};

    // Use useAsyncData for submitting data
    const {data} = await useAsyncData('submit-contact-form', async () => {
      return await $fetch('/api/contacts', {
        method: 'POST',
        body: formData.value, // Pass the form data
      });
    });

    // Handle server-side validation errors

    console.log(data.value.code)
    if (data.value.code == 400 && data.value.result) {
      handleServerValidationErrors(data.value.result);
      return; // Stop further execution to prevent success alert
    }
    alert(`Thank you, ${formData.value.name}! Your message has been sent.`);

    // Clear form data after submission
    Object.keys(formData.value).forEach(key => (formData.value[key] = ''));
  } catch (error) {
    alert('An error occurred while sending your message. Please try again.');
    console.error(error);
  }
};

// Function to handle server-side validation errors
const handleServerValidationErrors = (errors) => {
  // Clear previous server errors
  serverErrors.value = {};

  if (errors.error) {
    const violationMessages = extractViolationMessages(errors.error);
    violationMessages.forEach((message) => {
      if (message.includes('Address')) {
        serverErrors.value.address = message;
      }
      if (message.includes('Name')) {
        serverErrors.value.name = message;
      }
      if (message.includes('Email')) {
        serverErrors.value.email = message;
      }
      if (message.includes('Contact')) {
        serverErrors.value.contact = message;
      }
      if (message.includes('Message')) {
        serverErrors.value.message = message;
      }
    });
  }
};


// Helper function to extract messages from the error string
const extractViolationMessages = (errorString) => {
  const regex = /ConstraintViolationImpl\{interpolatedMessage='(.*?)'/g; // Regex to match messages
  let messages = [];
  let match;

  // Loop through matches and extract the messages
  while ((match = regex.exec(errorString)) !== null) {
    messages.push(match[1]); // Push the message into the array
  }

  return messages;
};

// Navigate to view contact page
const router = useRouter();
const navigateToViewContact = () => {
  router.push({name: 'viewdetails'});
};

// Define VeeValidate rules
defineRule('required', required);
defineRule('email', email);
defineRule('min', min);
defineRule('lettersOnly', value => /^[a-zA-Z\s]+$/.test(value) || 'Name should contain only letters.');
defineRule('exactLength', (value: string, [length]: [number]) => {
  const isNumeric = /^[0-9]+$/.test(value);
  return isNumeric && value.length == length || `Contact should be exactly ${length} digits.`;
});

// Configure VeeValidate
configure({
  validateOnInput: true,
  generateMessage: (context) => {
    const fieldName = context.field;
    const messages = {
      required: `${fieldName} is required.`,
      min: `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} should be at least ${context.rule?.params[0]} characters.`,
      email: 'Email must be valid and contain "@" and "."',
      lettersOnly: 'Name should contain only letters.',
      exactLength: `Contact should be exactly ${context.rule?.params[0]} digits long.`
    };
    return messages[context.rule?.name] || `Invalid ${fieldName}.`;
  }
});
</script>

<style scoped>
.error {
  color: red;
}
</style>
