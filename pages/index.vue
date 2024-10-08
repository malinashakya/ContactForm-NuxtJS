<template>
  <section class="contact">
    <!-- Greeting Section -->
    <div class="greet">
      <Button class="view-contact-button" @click="navigateToViewContact">
        View Contact
      </Button>
      <h2>Contact Me</h2>
      <h3>Let's Greet and Meet.</h3>
    </div>

    <!-- Contact Form Section -->
    <Form class="contact-form" @submit="handleSubmit">
      <div class="form-group p-mb-4" v-for="field in fields" :key="field.name">
        <label :for="field.name">{{ field.label }}<span class="required">*</span></label>
        <!-- Select Dropdown for Contact Via -->
        <template v-if="field.name === 'contactVia'">
          <select v-model="formData.contactVia" :id="field.name">
            <option disabled value="">Select...</option>
            <option v-for="option in contactViaOptions" :key="option" :value="option">{{ option }}</option>
          </select>
        </template>
        <template v-else>
        <Field
            :id="field.name"
            v-model="formData[field.name]"
            :as="field.type"
            :name="field.name"
            :placeholder="field.placeholder"
            :rules="field.rules"
        />
        </template>
        <ErrorMessage class="error" :name="field.name" />
      </div>

      <Button type="submit">Send Message</Button>
    </Form>
  </section>
</template>

<script lang="ts" setup>
import { onMounted, reactive, computed } from 'vue'
import { Form, Field, ErrorMessage, defineRule, configure } from 'vee-validate'
import { required, email, min } from '@vee-validate/rules'
import axios from 'axios'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import Textarea from 'primevue/textarea'
import InputText from 'primevue/inputtext'
import Select from "primevue/select";
// Reactive form data
const formData = reactive({
  name: '',
  email: '',
  contact: '',
  address: '',
  message: '',
  contactVia: '',
})

const fields = [
  { name: 'name', label: 'Name', placeholder: 'Your Name', as: 'InputText', rules: 'required|min:2|lettersOnly' },
  { name: 'contactVia', label: 'Contact Via', placeholder: 'Select...', as: 'Select', rules: 'required' },
  { name: 'email', label: 'Email', placeholder: 'Your Email', as: 'InputText', rules: computed(() => formData.contactVia === 'Email' ? 'required|email' : '') },
  { name: 'contact', label: 'Contact', placeholder: 'Your Contact', as: 'InputText', rules: computed(() => formData.contactVia === 'Phone' ? 'required|exactLength:10' : '') },
  { name: 'address', label: 'Address', placeholder: 'Your Address', as: 'InputText', rules: 'required|min:3' },
  { name: 'message', label: 'Message', placeholder: 'Your Message', as: 'TextArea', rules: 'required|min:10' },
];

// Reactive options for dropdown
const contactViaOptions = reactive<string[]>([]);

// Fetching data for dropdown options
const fetchContactViaOptions = async () => {
  try {
    const response = await axios.get('http://localhost:8080/ContactForm-1.0-SNAPSHOT/api/contacts/contactvia')
    console.log(response)
    contactViaOptions.push(...response.data)
  } catch (error) {
    console.error('Error fetching data of contact via options:', error);
  }
}

// Handle form submission
const handleSubmit = async () => {
  try {
    const response = await axios.post('/api/contacts', formData)
    alert(`Thank you, ${formData.name}! Your message has been sent.`)
    // Clear form data
    Object.keys(formData).forEach(key => (formData[key] = ''))
  } catch (error) {
    alert('An error occurred while sending your message. Please try again.')
  }
}

const router = useRouter()

const navigateToViewContact = () => {
  router.push({ name: 'viewdetails' })
}

// Define validation rules
defineRule('required', required)
defineRule('email', email)
defineRule('min', min)
defineRule('lettersOnly', (value: string) => /^[a-zA-Z\s]+$/.test(value) || 'Name should contain only letters.')
defineRule('exactLength', (value: string, [length]: [number]) => {
  const isNumeric = /^[0-9]+$/.test(value);
  return isNumeric && value.length == length || `Contact should be exactly ${length} digits.`;
});

// Configure VeeValidate
configure({
  validateOnInput: true,
  generateMessage: (context) => {
    const fieldName = context.field
    const messages = {
      required: `${fieldName} is required.`,
      min: `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} should be at least ${context.rule?.params[0]} characters.`,
      email: 'Email must be valid and contain "@" and "."',
      lettersOnly: 'Name should contain only letters.',
      exactLength: 'Contact should be exactly 10 digits long.'
    }
    return messages[context.rule?.name] || `Invalid ${fieldName}.`
  }
})

onMounted(() => {
  fetchContactViaOptions()
})
</script>

<style scoped>
.contact {
  padding: 2rem;
  background: #4861a1;
  color: white;
  text-align: center;
}

.contact h2 {
  margin-top: 0;
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.greet {
  margin-bottom: 20px;
  line-height: 1.5;
}

.contact-form {
  max-width: 500px;
  margin: 2rem auto;
  padding: 1.5rem;
  background: #031b34;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.form-group {
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
  text-align: left;
}

.form-group label {
  margin-bottom: 0.5rem;
  font-weight: bold;
  color: #ecf0f1;
}

.form-group input,
.form-group textarea {
  padding: 0.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  color: #333;
  background: whitesmoke;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: 2px solid #1abc9c;
}

button {
  padding: 0.7rem 1.5rem;
  border: none;
  border-radius: 4px;
  background-color: #1abc9c;
  color: white;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

button:hover {
  background: dodgerblue;
}

.error {
  color: rgba(255, 0, 0, 0.85);
  font-size: 1rem;
  margin-top: 0.5rem;
}

.required {
  padding-left: 2px;
  color: rgba(255, 0, 0, 0.85);
}
</style>
