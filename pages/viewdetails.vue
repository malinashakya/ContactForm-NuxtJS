<template>
  <div>
    <h2>Contact Data</h2>
    <!-- Display loading message while data is being fetched -->
    <div v-if="loading"><i class="pi pi-spin pi-cog" style="font-size: 10rem; margin:12.5% 50%;"></i>
    </div>
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
          <!--            slotProps define current row-->
          <template #body="slotProps">
            <!-- Button to open the view dialog for a contact -->
            <Button class="mr-3" icon="pi pi-eye" severity="info"
            @click="openViewDialog(slotProps.data)"/>
            <!-- Button to open the edit dialog for a contact -->
            <Button class="mr-3" icon="pi pi-user-edit" severity="warn"
                    @click="openEditDialog(slotProps.data)"/>
            <!-- Button to delete a contact -->
            <Button icon="pi pi-trash" severity="danger"
                    @click="handleDeleteContact(slotProps.data.id)"/>
          </template>
        </Column>
      </DataTable>
    </div>

<!--    View Dialog-->
    <Dialog v-model:visible="showViewDialog" :style="{width:'30vw'}" header="Contact Details">
      <div v-if="selectedContact">
        <p><strong>ID:</strong> {{ selectedContact.id }}</p>
        <p><strong>Name:</strong> {{ selectedContact.name }}</p>
        <p><strong>Address:</strong> {{ selectedContact.address }}</p>
        <p><strong>Contact:</strong> {{ selectedContact.contact }}</p>
        <p><strong>Contact Via:</strong> {{ selectedContact.contactVia }}</p>
        <p><strong>Email:</strong> {{ selectedContact.email }}</p>
        <p><strong>Message:</strong> {{ selectedContact.message }}</p>
      <Button label="Download" icon="pi pi-download" severity="success" @click="downloadPDF"/>
      </div>
          </Dialog>
    <!-- Edit Dialog -->
    <Dialog v-model:visible="showEditDialog"
            :style="{ width: '30vw', background:'grey', padding:'10px',border: '1px solid grey' } "
            header="Edit Contact"
            modal>
      <Form class="form-grid" @submit="updateContact">
        <div class="form-row p-mb-4">
          <label for="name">Name<span class="required">*</span></label>
          <div>
            <Field v-slot="{ field, errorMessage }" v-model="editedContact.name" name="name" rules="required|min:3">
              <InputText
                  placeholder="Your Name"
                  v-bind="field"/>
            </Field>
            <ErrorMessage class="error" name="name"/>
          </div>
          </div>

          <!-- Contact Via Field -->
          <div class="form-row m-4">
            <label for="contactVia">Contact Via<span class="required">*</span></label>
            <div>
              <Field v-slot="{ field }" name="contactVia" rules="required">
              <Select
                  id="contactVia"
                  v-model="editedContact.contactVia"
                  :options="contactViaOptions"
                  placeholder="Select Contact Method"
                  v-bind="field"
              />
            </Field>
            </div>
            <ErrorMessage class="error" name="contactVia"/>
          </div>

          <!-- Email Field -->
          <div v-if="editedContact.contactVia === 'Email'" class="form-row m-4">
            <label for="email">Email<span class="required">*</span></label>
            <div>
            <Field v-slot="{ field }" :rules="emailRules" name="email">
              <InputText v-model="editedContact.email" placeholder="Your Email" type="email" v-bind="field"/>
            </Field>
            <ErrorMessage class="error" name="email"/>
          </div>
          </div>

          <!-- Contact Field -->
          <div v-if="editedContact.contactVia === 'Phone'" class="form-row m-4">
            <label for="contact">Contact<span class="required">*</span></label>
            <div><Field v-slot="{ field }" :rules="contactRules" name="contact">
              <InputText v-model="editedContact.contact" placeholder="Your Contact" v-bind="field"/>
            </Field>
            <ErrorMessage class="error" name="contact"/>
          </div>
          </div>

          <div class="form-row p-mb-4">
            <label for="address">Address<span class="required">*</span></label>
            <div>
            <Field v-slot="{ field, errorMessage }" v-model="editedContact.address" name="address"
                   rules="required|min:3">
              <InputText placeholder="Your Address" v-bind="field"/>
            </Field>
            <ErrorMessage class="error" name="address"/>
          </div>
          </div>

          <div class="form-row p-mb-4">
            <label for="message">Message<span class="required">*</span></label>
            <div>
            <Field v-slot="{ field, errorMessage }" v-model="editedContact.message" name="message"
                   rules="required|min:10">
              <Textarea placeholder="Your Message" rows="4" v-bind="field"/>
            </Field>
            <ErrorMessage class="error" name="message"/>
          </div>
          </div>

          <Button class="mr-3" icon="pi pi-pencil" label="Update" severity="warn" type="submit"/>
          <Button icon="pi pi-times" label="Cancel" severity="danger"
                  @click="closeEditDialog"/>
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
import {getData, putData, deleteData} from '@/utils/api';
import * as jspdf from "jspdf";
import jsPDF from "jspdf";

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
const showViewDialog=ref(false);
const selectedContact=ref<Contact|null>(null);

// Fetch contact data using the getData method
const {data: contactData, pending: contactPending, error: contactError} =
    await getData('contacts', 'http://localhost:8080/ContactForm-1.0-SNAPSHOT/api/contacts', null);

if (contactError.value) {
  console.error('Failed to fetch contact data:', contactError.value);
  alert('Failed to fetch contact data');
} else {
  console.log('Contact data fetched successfully:', contactData.value);
}

// Fetch contact via options using fetchData method
const {data: contactViaData, error: contactViaError} =
    await getData('contactVia', 'http://localhost:8080/ContactForm-1.0-SNAPSHOT/api/contacts/contactvia');

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

// Open the view dialog box
const openViewDialog = (contact: Contact) => {
  selectedContact.value = {...contact};
  showViewDialog.value = true;
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
    const {error: updateError} =
        await putData(`update-contact-${editedContact.value.id}`, `/api/contacts/${editedContact.value.id}`, editedContact.value
        );

    if (!updateError.value) {
      // Update the contact list with the new data
      contacts.value = contacts.value.map(contact =>
          contact.id === editedContact.value!.id ? editedContact.value! : contact  //! use for telling, it is not null, always has value
      );
      alert('Contact updated successfully!');
    } else {
      error.value = 'Failed to update contact.';
      console.error('Error updating contact:', updateError.value);
      alert('Error updating contact:', updateError.value);
    }

    // Close the dialog once the operation is complete
    closeEditDialog();
  }
};

// Handle delete contact
const handleDeleteContact = async (id: number) => {
  const {error: deleteError} = await deleteData('delete-contact-{id}', `/api/contacts/${id}`, null);

  if (!deleteError.value) {
    // Remove the deleted contact from the list
    contacts.value = contacts.value.filter(contact => contact.id !== id);
    alert('Contact deleted successfully');
  } else {
    error.value = 'Failed to delete contact.';
    console.error('Error deleting contact:', deleteError.value);
    alert('Error deleting contact:', deleteError.value);
  }
};

//Download as PDF
const downloadPDF=()=>{
  if(selectedContact.value)
  {
    const doc=new jsPDF();
    doc.setFontSize(20);
    doc.text("Contact Details", 10, 10); // x-axis=10, y-axis=10

    doc.setFontSize(14);
    doc.text(`ID: ${selectedContact.value.id}`, 10, 30);
    doc.text(`Name: ${selectedContact.value.name}`, 10, 40);
    doc.text(`Address: ${selectedContact.value.address}`, 10, 50);
    doc.text(`Contact: ${selectedContact.value.contact}`, 10, 60);
    doc.text(`Contact Via: ${selectedContact.value.contactVia}`, 10, 70);
    doc.text(`Email: ${selectedContact.value.email}`, 10, 80);
    doc.text(`Message: ${selectedContact.value.message}`, 10, 90);

    // Save the generated PDF
    doc.save(`contact_${selectedContact.value.id}.pdf`);
  }
}
</script>

<style scoped>
</style>