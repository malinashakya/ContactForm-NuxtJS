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
                    @click="handleDeleteContact(slotProps.data.id)">Delete
            </Button>
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- Edit Dialog -->
    <Dialog v-model:visible="showEditDialog"
            :style="{ width: '30vw', background:'grey', padding:'10px',border: '1px solid grey' } "
            header="Edit Contact"
            modal>
      <Form class="contact-form" @submit="updateContact">
        <div class="form-group p-mb-4">
          <label for="name">Name<span class="required">*</span></label>
          <Field v-slot="{ field, errorMessage }" v-model="editedContact.name" name="name" rules="required|min:3">
            <InputText
                placeholder="Your Name"
                v-bind="field"/>
          </Field>
          <ErrorMessage class="error" name="name"/>
        </div>

        <!-- Contact Via Field -->
        <div class="form-group m-4">
          <label for="contactVia">Contact Via<span class="required">*</span></label>
          <Field v-slot="{ field }" name="contactVia" rules="required">
            <Select
                id="contactVia"
                v-model="editedContact.contactVia"
                :options="contactViaOptions"
                placeholder="Select Contact Method"
                v-bind="field"
            />
          </Field>
          <ErrorMessage class="error" name="contactVia"/>
        </div>

        <!-- Email Field -->
        <div v-if="editedContact.contactVia === 'Email'" class="form-group m-4">
          <label for="email">Email<span class="required">*</span></label>
          <Field v-slot="{ field }" :rules="emailRules" name="email">
            <InputText v-model="editedContact.email" placeholder="Your Email" type="email" v-bind="field"/>
          </Field>
          <ErrorMessage class="error" name="email"/>
        </div>

        <!-- Contact Field -->
        <div v-if="editedContact.contactVia === 'Phone'" class="form-group m-4">
          <label for="contact">Contact<span class="required">*</span></label>
          <Field v-slot="{ field }" :rules="contactRules" name="contact">
            <InputText v-model="editedContact.contact" placeholder="Your Contact" v-bind="field"/>
          </Field>
          <ErrorMessage class="error" name="contact"/>
        </div>

        <div class="form-group p-mb-4">
          <label for="address">Address<span class="required">*</span></label>
          <Field v-slot="{ field, errorMessage }" v-model="editedContact.address" name="address" rules="required|min:3">
            <InputText placeholder="Your Address" v-bind="field"/>
          </Field>
          <ErrorMessage class="error" name="address"/>
        </div>

        <div class="form-group p-mb-4">
          <label for="message">Message<span class="required">*</span></label>
          <Field v-slot="{ field, errorMessage }" v-model="editedContact.message" name="message"
                 rules="required|min:10">
            <Textarea placeholder="Your Message" rows="4" v-bind="field"/>
          </Field>
          <ErrorMessage class="error" name="message"/>
        </div>

        <Button class="button p-2 m-2"
                style="background: #eded07; border: 1px solid rgba(244,244,73,0.89); border-radius: 3px " type="submit">
          Submit
        </Button>
        <Button class="button p-2 m-2 " style="background: red; border: 1px solid #e35555; border-radius: 3px"
                @click="closeEditDialog">
          Cancel
        </Button>
      </Form>

      <div v-if="updateSuccess" class="success-message mt-2">{{ updateSuccess }}</div>
    </Dialog>
  </div>
</template>

<script lang="ts" setup>
import {ref, onMounted, reactive, computed} from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Dialog from 'primevue/dialog';
import {ErrorMessage, Field, Form, defineRule, configure} from 'vee-validate';
import {required, email, min} from '@vee-validate/rules';
import Textarea from "primevue/textarea";
import Select from "primevue/select";
import InputText from "primevue/inputtext";
import {fetchData, postData, deleteData} from '@/utils/api';

// Validation rules
const emailRules = computed(() => {
  return editedContact.value?.contactVia === 'Email' ? 'required|email' : '';
});

const contactRules = computed(() => {
  return editedContact.value?.contactVia === 'Phone' ? 'required|exactLength:10' : '';
});

const lettersOnly = (value: string) => {
  const nameRegex = /^[a-zA-Z\s]+$/;
  return nameRegex.test(value) || 'Name should contain only letters.';
}

const exactLength = (value: string, [length]: [number]) => {
  const isNumeric = /^[0-9]+$/.test(value);
  if (!isNumeric) return 'Contact should contain only numbers.';
  return value.length == length || `Contact should be exactly ${length} digits.`;
};

defineRule('required', required);
defineRule('email', email);
defineRule('min', min);
defineRule('lettersOnly', lettersOnly);
defineRule('exactLength', exactLength);

// Configure vee-validate
configure({
  validateOnInput: true,
  generateMessage: (context) => {
    const fieldName = context.field;
    const messages = {
      required: `${fieldName} is required.`,
      min: `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} should be at least ${context.rule?.params[0]} characters.`,
      email: 'Email must be valid and contain "@" and "."',
      lettersOnly: 'Name should contain only letters.',
      exactLength: 'Contact should be exactly 10 digits long.'
    };
    return messages[context.rule?.name] || `Invalid ${fieldName}.`;
  }
});

// Refs to hold contact details, loading state, and dialog state
const contacts = ref<Contact[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const showEditDialog = ref(false);
const editedContact = ref<Contact | null>(null);
const updateSuccess = ref<string | null>(null);
const contactViaOptions = reactive<string[]>([]);


// Fetch contact data using the fetchData method
const {
  data: contactData,
  pending: contactPending,
  error: contactError
} = await fetchData('contacts', 'http://localhost:8080/ContactForm-1.0-SNAPSHOT/api/contacts');
if (contactError.value) {
  console.error('Failed to fetch contact data:', contactError.value);
} else {
  console.log('Contact data fetched successfully:', contactData.value);
}

// Fetch contact via options using fetchData method
const {
  data: contactViaData,
  error: contactViaError
} = await fetchData('contactVia', 'http://localhost:8080/ContactForm-1.0-SNAPSHOT/api/contacts/contactvia');
if (contactViaError.value) {
  console.error('Failed to fetch contact data:', contactError.value);
} else {
  console.log('Contact data fetched successfully:', contactData.value);
}

// Watch the data to set contacts
onMounted(() => {
  if (contactData.value) {
    contacts.value = contactData.value.result;
  }
  if (contactViaData.value) {
    contactViaOptions.push(...contactViaData.value);
  }
  loading.value = contactPending.value;
  error.value = contactError.value;
});

// Open the edit dialog and set the contact to be edited
const openEditDialog = (contact: Contact) => {
  editedContact.value = {...contact};
  showEditDialog.value = true;
};

// Close the edit dialog
const closeEditDialog = () => {
  showEditDialog.value = false;
  editedContact.value = null;
  updateSuccess.value = null;
};

// Update contact details
const updateContact = async () => {
  if (editedContact.value) {
    const {error: updateError} = await postData(
        `update-contact-${editedContact.value.id}`,
        `/api/contacts/${editedContact.value.id}`,
        'PUT',
        editedContact.value
    );

    if (!updateError.value) {
      // Update the contact list with the new data
      contacts.value = contacts.value.map(contact =>
          contact.id === editedContact.value!.id ? editedContact.value! : contact  //! use for telling, it is not null, always has value
      );
      updateSuccess.value = 'Contact updated successfully!';
    } else {
      error.value = 'Failed to update contact.';
      console.error('Error updating contact:', updateError.value);
    }

    // Close the dialog once the operation is complete
    closeEditDialog();
  }
};

// Handle delete contact
const handleDeleteContact = async (id: number) => {
  const {error: deleteError} = await deleteData(`delete-contact-${id}`, id);

  if (!deleteError.value) {
    // Remove the deleted contact from the list
    contacts.value = contacts.value.filter(contact => contact.id !== id);
  } else {
    error.value = 'Failed to delete contact.';
    console.error('Error deleting contact:', deleteError.value);
  }
};

</script>

<style scoped>

</style>