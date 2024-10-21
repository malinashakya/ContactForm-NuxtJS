<template>
  <div class="card">
<!--    No. of items which willbe displayed= scrollHeight/itemSize-->
    <DataTable
        :value="virtualContacts"
        :virtualScrollerOptions="{
        lazy: true,
        onLazyLoad: loadContactsLazy,
        itemSize: 40,
        delay: 100,
        showLoader: true,
        loading: lazyLoading,
        numToleratedItems: 10
      }"
        scrollHeight="400px"
        scrollable
    >
      <Column field="id" header="Id" style="width: 10%">
        <template #loading>
          <div :style="{ height: '17px', 'flex-grow': '1', overflow: 'hidden' }" class="flex items-center">
            <Skeleton height="1rem" width="60%"/>
          </div>
        </template>
      </Column>
      <Column field="name" header="Name" style="width: 10%">
        <template #loading>
          <div :style="{ height: '17px', 'flex-grow': '1', overflow: 'hidden' }" class="flex items-center">
            <Skeleton height="1rem" width="40%"/>
          </div>
        </template>
      </Column>
      <Column field="address" header="Address" style="width: 10%">
        <template #loading>
          <div :style="{ height: '17px', 'flex-grow': '1', overflow: 'hidden' }" class="flex items-center">
            <Skeleton height="1rem" width="30%"/>
          </div>
        </template>
      </Column>
      <Column field="email" header="Email" style="width: 10%">
        <template #loading>
          <div :style="{ height: '17px', 'flex-grow': '1', overflow: 'hidden' }" class="flex items-center">
            <Skeleton height="1rem" width="60%"/>
          </div>
        </template>
      </Column>
      <Column field="contact" header="Contact" style="width: 10%">
        <template #loading>
          <div :style="{ height: '17px', 'flex-grow': '1', overflow: 'hidden' }" class="flex items-center">
            <Skeleton height="1rem" width="60%"/>
          </div>
        </template>
      </Column>
      <Column class="p-2" field="contactVia" header="Contact Via" style="width: 10%">
        <template #loading>
          <div :style="{ height: '17px', 'flex-grow': '1', overflow: 'hidden' }" class="flex items-center">
            <Skeleton height="1rem" width="60%"/>
          </div>
        </template>
      </Column>
      <Column class="p-2" field="message" header="Message" style="width: 10%">
        <template #loading>
          <div :style="{ height: '17px', 'flex-grow': '1', overflow: 'hidden' }" class="flex items-center">
            <Skeleton height="1rem" width="60%"/>
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup>
import {ref} from 'vue';
import Column from "primevue/column";
import {getData} from '@/utils/api';

const virtualContacts = ref(Array.from({length: 100000})); //Placeholder until real data come
const lazyLoading = ref(false);
const loadLazyTimeout = ref(null);

const loadContactsLazy = async (event) => {
  lazyLoading.value = true;

  if (loadLazyTimeout.value) {
    clearTimeout(loadLazyTimeout.value);
  }

  loadLazyTimeout.value = setTimeout(async () => {
    const {first, rows} = event;

    try {
      const {data: response} =
          await getData('contacts', `http://localhost:8080/ContactForm-1.0-SNAPSHOT/api/contacts?start=${first}&limit=${rows}`);

      if (!Array.isArray(response.value.result)) {
        throw new Error('Expected data.result to be an array');
      }

      virtualContacts.value.splice(first, rows, ...response.value.result); //purano thau ma new data replaced

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      lazyLoading.value = false;
    }
  }, Math.random() * 1000 + 250);
};
</script>

<style scoped>
/* Add your styles here */
</style>
