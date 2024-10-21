<template>
  <div class="card">
    <DataTable :value="virtualCars" scrollable scrollHeight="400px" tableStyle="min-width: 50rem"
               :virtualScrollerOptions="{ lazy: true, onLazyLoad: loadCarsLazy, itemSize: 46, delay: 200, showLoader: true, loading: lazyLoading, numToleratedItems: 10 }">
      <Column field="id" header="Id" style="width: 20%">
        <template #loading>
          <div class="flex items-center" :style="{ height: '17px', 'flex-grow': '1', overflow: 'hidden' }">
            <Skeleton width="60%" height="1rem" />
          </div>
        </template>
      </Column>
      <Column field="vin" header="Vin" style="width: 20%">
        <template #loading>
          <div class="flex items-center" :style="{ height: '17px', 'flex-grow': '1', overflow: 'hidden' }">
            <Skeleton width="40%" height="1rem" />
          </div>
        </template>
      </Column>
      <Column field="year" header="Year" style="width: 20%">
        <template #loading>
          <div class="flex items-center" :style="{ height: '17px', 'flex-grow': '1', overflow: 'hidden' }">
            <Skeleton width="30%" height="1rem" />
          </div>
        </template>
      </Column>
      <Column field="brand" header="Brand" style="width: 20%">
        <template #loading>
          <div class="flex items-center" :style="{ height: '17px', 'flex-grow': '1', overflow: 'hidden' }">
            <Skeleton width="40%" height="1rem" />
          </div>
        </template>
      </Column>
      <Column field="color" header="Color" style="width: 20%">
        <template #loading>
          <div class="flex items-center" :style="{ height: '17px', 'flex-grow': '1', overflow: 'hidden' }">
            <Skeleton width="60%" height="1rem" />
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const cars = ref([]);
const virtualCars = ref(Array.from({ length: 100000 })); // Placeholder for virtual cars
const lazyLoading = ref(false);
const loadLazyTimeout = ref();

// Generate dummy car data
const generateDummyCars = (count) => {
  const brands = ['Toyota', 'Ford', 'Chevrolet', 'Honda', 'Nissan', 'BMW', 'Mercedes'];
  const colors = ['Red', 'Blue', 'Green', 'Black', 'White', 'Yellow', 'Silver'];

  return Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    vin: `VIN${index + 1}`,
    brand: brands[Math.floor(Math.random() * brands.length)],
    color: colors[Math.floor(Math.random() * colors.length)],
    year: Math.floor(Math.random() * (2024 - 1990) + 1990) // Random year between 1990 and 2024
  }));
};

onMounted(() => {
  // Generate 100,000 dummy car data
  cars.value = generateDummyCars(100000);
});

const loadCarsLazy = (event) => {
  !lazyLoading.value && (lazyLoading.value = true);

  if (loadLazyTimeout.value) {
    clearTimeout(loadLazyTimeout.value);
  }

  // Simulate remote connection with a timeout
  loadLazyTimeout.value = setTimeout(() => {
    let _virtualCars = [...virtualCars.value];
    let { first, last } = event;

    // Load data of the required page
    const loadedCars = cars.value.slice(first, last);

    // Populate the page of virtual cars
    Array.prototype.splice.apply(_virtualCars, [...[first, last - first], ...loadedCars]);

    virtualCars.value = _virtualCars;
    lazyLoading.value = false;
  }, Math.random() * 1000 + 250);
};
</script>

<style scoped>
/* Add your styles here */
</style>
