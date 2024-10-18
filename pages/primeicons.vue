<script lang="ts" setup>

</script>

<template>
  <h1>PrimeIcons</h1>

  <h2>Icons</h2>
  <span class="pi pi-search mr-4" style="font-size:2rem; color:blue">Search</span>
  <span class="pi pi-user mr-4" style="font-size:2.5rem; background-color: whitesmoke; color:black"></span>
  <i class="pi pi-check mr-4">Tick</i>

  <h2>Spinning Icons</h2>
  <i class="pi pi-spin pi-spinner mr-8" style="font-size: 2rem"></i>
  <i class="pi pi-spin pi-cog" style="font-size: 2rem"></i>

  <h2>Menu Card</h2>
  <div class="card flex justify-center ml-4 mt-4">
    <Menu :model="items"/>
  </div>

  <Button label="Info" severity="info" />
</template>


<script>
import {PrimeIcons} from '@primevue/core/api';

export default {
  data() {
    return {
      items: [
        {
          label: 'File',
          items: [
            {label: 'New', icon: PrimeIcons.PLUS},
            {label: 'Open', icon: PrimeIcons.DOWNLOAD},
            {label: 'Connect', icon: PrimeIcons.WIFI}
          ]
        },
        {
          label: 'Edit',
          items: [
            {label: 'Upload', icon: PrimeIcons.UPLOAD},
            {label: 'Delete', icon: PrimeIcons.TRASH}
          ]
        },
      ]
    };
  }
};
</script>
