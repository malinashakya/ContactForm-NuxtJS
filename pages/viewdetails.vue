<template>
  <div>
    <h2>Contact Data</h2>
    <!-- Display loading message while data is being fetched -->
    <div v-if="loading">Loading...</div>
    <!-- Display error message if there is an issue fetching data -->
    <div v-if="error">{{ error }}</div>
    <!-- Display table only if data is loaded and no errors occurred -->
    <div class="p-d-flex p-flex-column p-ai-center p-4">
      <DataTable v-if="!loading && !error" :value="contacts" show-gridlines tableStyle="min-width: 50rem">
        <Column class="p-2" field="id" header="ID"></Column>
        <Column class="p-2" field="name" header="Name"></Column>
        <Column class="p-2" field="address" header="Address"></Column>
        <Column class="p-2" field="contact" header="Contact"></Column>
        <Column class="p-2" field="contactVia" header="Contact Via"></Column>
        <Column class="p-2" field="email" header="Email"></Column>
        <Column class="p-2 " field="message" header="Message"></Column>
        <Column class="p-2" header="Action">
          <template #body="slotProps">
            <!-- Button to open the edit dialog for a contact -->
            <Button class="m-2 p-2"
                    style="background: #eded07; border: 1px solid rgba(244,244,73,0.89); border-radius: 3px"
                    @click="openEditDialog(slotProps.data)"> Edit
            </Button>

            <!-- Button to delete a contact -->
            <Button class="m-2 p-2" style="background: red; border: 1px solid #e35555; border-radius: 3px"
                    @click="deleteContact(slotProps.data.id)">Delete
            </Button>
          </template>
        </Column>
      </DataTable>
    </div>


    <!-- Edit Dialog -->
    <!-- This dialog appears when showEditDialog is true -->
    <Dialog v-model:visible="showEditDialog"
            :style="{ width: '30vw', background:'grey', padding:'10px',border: '1px solid grey' } "
            header="Edit Contact"
            modal>
      <!-- Form to update contact details -->
      <Form class="contact-form" @submit="updateContact">
        <div class="form-group p-mb-4">
          <label for="name">Name<span class="required">*</span></label>
          <Field
              id="name"
              v-model="editedContact.name"
              as="InputText"
              name="name"
              placeholder="Your Name"
              rules="required|min:3"
          />
          <ErrorMessage class="error" name="name"/>
        </div>

        <!-- Dropdown for selecting contact via -->
        <div class="form-group p-mb-4">
          <label for="contactVia">Contact Via<span class="required">*</span></label>
          <Field
              id="contactVia"
              v-model="editedContact.contactVia"
              as="select"
              name="contactVia"
              rules="required"
          >
            <option value="">Select...</option>
            <option v-for="option in contactViaOptions" :key="option" :value="option">
              {{ option }}
            </option>
          </Field>
          <ErrorMessage class="error" name="contactVia"/>
        </div>

        <div class="form-group p-mb-4">
          <label for="email">Email<span class="required">*</span></label>
          <Field
              id="email"
              v-model="editedContact.email"
              :rules="emailRules"
              as="InputText"
              name="email"
              placeholder="Your Email"
              type="email"
          />
          <ErrorMessage class="error" name="email"/>
        </div>

        <div class="form-group p-mb-4">
          <label for="contact">Contact<span class="required">*</span></label>
          <Field
              id="contact"
              v-model="editedContact.contact"
              :rules="contactRules"
              as="InputText"
              name="contact"
              placeholder="Your Contact"
          />
          <ErrorMessage class="error" name="contact"/>
        </div>

        <div class="form-group p-mb-4">
          <label for="address">Address<span class="required">*</span></label>
          <Field
              id="address"
              v-model="editedContact.address"
              as="InputText"
              name="address"
              placeholder="Your Address"
              rules="required"
          />
          <ErrorMessage class="error" name="address"/>
        </div>

        <div class="form-group p-mb-4">
          <label for="message">Message<span class="required">*</span></label>
          <Field
              id="message"
              v-model="editedContact.message"
              as="TextArea"
              name="message"
              placeholder="Your Message"
              rows="4"
              rules="required|min:10"
          />
          <ErrorMessage class="error" name="message"/>
        </div>

        <Button class="button p-2 m-2"
                style="background: #eded07; border: 1px solid rgba(244,244,73,0.89); border-radius: 3px " type="submit">
          Submit
        </Button>
        <!-- Button to close the dialog without making changes -->
        <Button class="button p-2 m-2 " style="background: red; border: 1px solid #e35555; border-radius: 3px"
                @click="closeEditDialog">
          Cancel
        </Button>

      </Form>

      <!-- Show success message if the contact was updated successfully -->
      <div v-if="updateSuccess" class="success-message mt-2">{{ updateSuccess }}</div>
    </Dialog>
  </div>
</template>

<script lang="ts" setup>
import {ref, onMounted, reactive, computed} from 'vue';
import axios from 'axios';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Dialog from 'primevue/dialog';
import {ErrorMessage, Field, Form, defineRule, configure} from 'vee-validate';
import {required, email, min} from '@vee-validate/rules';
import Textarea from "primevue/textarea";

//THis becomes active only if contactVia is Email, i.e. Email's validation is active
const emailRules = computed(() => {
  return editedContact.value?.contactVia === 'Email' ? 'required|email' : '';
});

//THis becomes active only if contactVia is Phone, i.e. Contact's validation is active
const contactRules = computed(() => {
  return editedContact.value?.contactVia === 'Phone' ? 'required|exactLength:10' : '';
});

// Custom name rule to check for letters only (no numbers or special characters)
const lettersOnly = (value: string) => {
  const nameRegex = /^[a-zA-Z\s]+$/
  return nameRegex.test(value) || 'Name should contain only letters.'
}

// Custom contact rule to check for exactly 10 digits
const exactLength = (value: string, [length]: [number]) => {
  const isNumeric = /^[0-9]+$/.test(value); // Ensure only digits
  if (!isNumeric) return 'Contact should contain only numbers.';
  return value.length == length || `Contact should be exactly ${length} digits.`;
};


// Define validation rules
defineRule('required', required);
defineRule('email', email);
defineRule('min', min);
defineRule('lettersOnly', lettersOnly)
defineRule('exactLength', (value: string, [length]: [number]) => {
  const isNumeric = /^[0-9]+$/.test(value); // Ensure only digits
  return isNumeric && value.length == length || `Contact should be exactly ${length} digits.`;
});

// Define types for the contact data
interface Contact {
  id: number;
  name: string;
  address: string;
  contact: string;
  email: string;
  message: string;
  contactvia: 'Email' | 'Phone';
}

// Configure VeeValidate for customized messages
configure({
  validateOnInput: true, // Enables real-time validation
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

// Refs to hold contact details, loading state, and dialog state
const contacts = ref<Contact[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const showEditDialog = ref(false);
const editedContact = ref<Contact | null>(null);
const updateSuccess = ref<string | null>(null);

const contactViaOptions = reactive<string[]>([]);

//To fetch data from the backend
const fetchContactViaOptions = async () => {
  try {
    const response = await axios.get('http://localhost:8080/ContactForm-1.0-SNAPSHOT/api/contacts/contactvia')
    contactViaOptions.push(...response.data)
  } catch (error) {
    console.error('Error fetching data of contact via options:', error);
  }
}
// Fetch contact data when the component is mounted
onMounted(async () => {
  try {
    // Make a GET request to fetch contacts
    const response = await axios.get('http://localhost:8080/ContactForm-1.0-SNAPSHOT/api/contacts');
    contacts.value = response.data.result; // Store the result in contacts
  } catch (err) {
    error.value = 'Failed to load contacts.'; // Set error message if request fails
    console.error('Error fetching contacts:', err); // Log error for debugging
  } finally {
    loading.value = false; // Set loading to false after request completes
  }
});

// Open the edit dialog and set the contact to be edited
const openEditDialog = (contact: Contact) => {
  editedContact.value = {...contact}; // Create a copy of the contact for editing
  showEditDialog.value = true; // Show the edit dialog
};

// Close the edit dialog
const closeEditDialog = () => {
  showEditDialog.value = false; // Hide the edit dialog
  editedContact.value = null; // Clear the edited contact
  updateSuccess.value = null; // Clear any success message
};

// Update contact details
const updateContact = async () => {
  if (editedContact.value) {
    try {
      // Make a PUT request to update the contact
      await axios.put(`http://localhost:8080/ContactForm-1.0-SNAPSHOT/api/contacts/${editedContact.value.id}`, editedContact.value);

      // Update the contact list with the new data
      contacts.value = contacts.value.map(contact =>
          contact.id === editedContact.value!.id ? editedContact.value! : contact
      );
      console.log('Updating contact with contactVia:', editedContact.value.contactVia);
      console.log('Edited Contact:', editedContact.value);
      updateSuccess.value = 'Contact updated successfully!'; // Set success message
    } catch (err) {
      error.value = 'Failed to update contact.'; // Set error message if update fails
      console.error('Error updating contact:', err); // Log error for debugging
    } finally {
      closeEditDialog(); // Close the edit dialog after update
    }
  }
};

// Handle delete contact
const deleteContact = async (id: number) => {
  try {
    // Make a DELETE request to remove the contact
    await axios.delete(`http://localhost:8080/ContactForm-1.0-SNAPSHOT/api/contacts/${id}`);
    // Remove the deleted contact from the list
    contacts.value = contacts.value.filter(contact => contact.id !== id);
  } catch (err) {
    error.value = 'Failed to delete contact.'; // Set error message if delete fails
    console.error('Error deleting contact:', err); // Log error for debugging
  }
};


onMounted(() => {
  fetchContactViaOptions()
})
</script>

<style scoped>
.form-group {
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 0.5rem;
  font-weight: bold;
  color: #ecf0f1;
}

.form-group input,
.form-group textarea {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: whitesmoke;
  font-size: 1rem;
  color: #333;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: 2px solid #1abc9c;
}

button{
  padding: 0.7rem 1.5rem;
  border: none;
  border-radius: 4px;
  background-color: #1abc9c;
  color: white;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

button:hover{
  background: dodgerblue;
}

.error {
  color: rgba(255, 0, 0, 0.85);
  font-size: 1rem;
  margin-top: 0.5rem;
}

.required {
  color: rgba(255, 0, 0, 0.85);
}
</style>