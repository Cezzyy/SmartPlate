<script setup lang="ts">
import type { VehicleRegistrationForm } from '@/types/vehicleRegistration'
import { computed, ref, onMounted, watch } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

const props = defineProps<{
  registrations: VehicleRegistrationForm[]
}>()

const emit = defineEmits<{
  (e: 'process', data: { registrationId: string; action: 'approve' | 'reject' }): void
}>()

const sortBy = ref('submissionDate')
const sortOrder = ref('desc')

const isLoading = ref(true)

// Simulate loading delay
onMounted(() => {
  isLoading.value = true
  setTimeout(() => {
    isLoading.value = false
  }, 1500)
})

// Search and filter
const searchQuery = ref('')
const filterOptions = ref({
  vehicleType: '',
  year: '',
})

// Pagination
const currentPage = ref(1)
const itemsPerPage = 10
const totalPages = computed(() => Math.ceil(filteredRegistrations.value.length / itemsPerPage))

// Filtered registrations based on search query and filters
const filteredRegistrations = computed(() => {
  return props.registrations.filter((reg) => {
    // Search query filter
    const searchLower = searchQuery.value.toLowerCase()
    const matchesSearch =
      searchLower === '' ||
      reg.id.toLowerCase().includes(searchLower) ||
      `${reg.make} ${reg.model}`.toLowerCase().includes(searchLower) ||
      (reg.applicantName && reg.applicantName.toLowerCase().includes(searchLower))

    // Dropdown filters
    const matchesVehicleType =
      filterOptions.value.vehicleType === '' || reg.vehicleType === filterOptions.value.vehicleType

    const matchesYear =
      filterOptions.value.year === '' || reg.year.toString() === filterOptions.value.year

    return matchesSearch && matchesVehicleType && matchesYear
  })
})

// Get unique values for filter dropdowns
const vehicleTypes = computed(() => {
  const types = new Set(
    props.registrations.map((reg) => reg.vehicleType).filter((type) => type && type.trim() !== ''),
  )
  return Array.from(types)
})

const years = computed(() => {
  const yearsSet = new Set(
    props.registrations
      .map((reg) => reg.year.toString())
      .filter((year) => year && year.trim() !== ''),
  )
  return Array.from(yearsSet).sort((a, b) => b.localeCompare(a)) // Sort descending
})

// Sorted and paginated registrations
const displayedRegistrations = computed(() => {
  const sorted = [...filteredRegistrations.value].sort((a, b) => {
    const aValue = (a as any)[sortBy.value] || ''
    const bValue = (b as any)[sortBy.value] || ''
    const order = sortOrder.value === 'asc' ? 1 : -1
    return aValue > bValue ? order : -order
  })

  const startIndex = (currentPage.value - 1) * itemsPerPage
  return sorted.slice(startIndex, startIndex + itemsPerPage)
})

// Reset pagination when filters change
watch([searchQuery, filterOptions], () => {
  currentPage.value = 1
})

// Methods for pagination
const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

// Reset filters
const resetFilters = () => {
  searchQuery.value = ''
  filterOptions.value = {
    vehicleType: '',
    year: '',
  }
}

const toggleSort = (field: string) => {
  if (sortBy.value === field) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = field
    sortOrder.value = 'desc'
  }
}

const processRegistration = (registrationId: string, action: 'approve' | 'reject') => {
  emit('process', { registrationId, action })
}
</script>

<template>
  <!-- Search and Filters -->
  <div class="bg-white rounded-xl shadow-md border border-light-gray border-opacity-20 p-6 mb-8">
    <div class="space-y-5">
      <!-- Search Bar -->
      <div class="relative">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search by ID, vehicle details, or owner..."
          class="w-full pl-10 pr-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-light-blue focus:border-transparent transition-all"
        />
        <font-awesome-icon
          :icon="['fas', 'search']"
          class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray"
        />
      </div>

      <div class="flex flex-col md:flex-row md:justify-between gap-4">
        <!-- Filters -->
        <div>
          <h3 class="text-sm font-medium text-gray mb-2">Filter by Vehicle Type</h3>
          <div class="flex flex-wrap gap-2">
            <button
              @click="filterOptions.vehicleType = ''"
              :class="[
                'px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200',
                !filterOptions.vehicleType
                  ? 'bg-dark-blue text-white shadow-sm'
                  : 'bg-gray-50 text-gray hover:bg-light-blue hover:bg-opacity-10',
              ]"
            >
              All Types
            </button>
            <button
              v-for="type in vehicleTypes"
              :key="type"
              @click="filterOptions.vehicleType = type"
              :class="[
                'px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200',
                filterOptions.vehicleType === type
                  ? 'bg-dark-blue text-white shadow-sm'
                  : 'bg-gray-50 text-gray hover:bg-light-blue hover:bg-opacity-10',
              ]"
            >
              {{ type }}
            </button>
          </div>
        </div>

        <!-- Year Filters -->
        <div>
          <h3 class="text-sm font-medium text-gray mb-2">Filter by Year</h3>
          <div class="flex flex-wrap gap-2">
            <button
              @click="filterOptions.year = ''"
              :class="[
                'px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200',
                !filterOptions.year
                  ? 'bg-dark-blue text-white shadow-sm'
                  : 'bg-gray-50 text-gray hover:bg-light-blue hover:bg-opacity-10',
              ]"
            >
              All Years
            </button>
            <button
              v-for="year in years.slice(0, 5)"
              :key="year"
              @click="filterOptions.year = year"
              :class="[
                'px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200',
                filterOptions.year === year
                  ? 'bg-dark-blue text-white shadow-sm'
                  : 'bg-gray-50 text-gray hover:bg-light-blue hover:bg-opacity-10',
              ]"
            >
              {{ year }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Table -->
  <div
    class="bg-white rounded-xl shadow-md border border-light-gray border-opacity-20 overflow-hidden mb-6"
  >
    <!-- Loading State -->
    <div v-if="isLoading" class="p-12 flex flex-col items-center justify-center">
      <div class="flex justify-center items-center mb-4">
        <div class="relative w-20 h-20">
          <div class="absolute top-0 left-0 right-0 bottom-0 w-20 h-20">
            <div
              class="border-4 border-light-blue border-opacity-50 opacity-75 rounded-full w-20 h-20 animate-spin border-t-dark-blue"
            ></div>
          </div>
        </div>
      </div>
      <div class="text-center">
        <p class="text-lg font-medium text-gray-700 mb-1">Loading Registrations</p>
        <p class="text-sm text-gray-500">Please wait while we fetch the latest data...</p>
      </div>
    </div>

    <!-- Content -->
    <div v-else>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th
                v-for="header in [
                  { text: 'Registration ID', value: 'id', sortable: true },
                  { text: 'Vehicle Details', value: 'vehicledetails', sortable: true },
                  { text: 'Owner', value: 'owner', sortable: true },
                  { text: 'Submission Date', value: 'submissionDate', sortable: true },
                  { text: 'Actions', value: 'actions', sortable: false },
                ]"
                :key="header.value"
                @click="header.sortable && toggleSort(header.value)"
                class="px-6 py-4 text-left text-xs font-medium text-gray uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                :class="{ 'cursor-default': !header.sortable }"
              >
                <div class="flex items-center gap-2">
                  {{ header.text }}
                  <span v-if="header.sortable" class="text-gray-400">
                    <font-awesome-icon
                      v-if="sortBy === header.value"
                      :icon="['fas', sortOrder === 'asc' ? 'sort-up' : 'sort-down']"
                    />
                    <font-awesome-icon v-else :icon="['fas', 'sort']" />
                  </span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <!-- Empty state -->
            <tr v-if="filteredRegistrations.length === 0" class="hover:bg-gray-50">
              <td colspan="5" class="px-6 py-10 text-center text-gray">
                <div class="flex flex-col items-center justify-center space-y-3">
                  <div class="bg-light-blue bg-opacity-10 p-4 rounded-full">
                    <font-awesome-icon
                      :icon="['fas', 'clipboard-list']"
                      class="text-3xl text-light-blue"
                    />
                  </div>
                  <p class="text-lg font-medium text-dark-blue">No pending registrations found</p>
                  <p class="text-sm text-gray">Try adjusting your search or filter criteria</p>

                  <button
                    v-if="searchQuery || filterOptions.vehicleType || filterOptions.year"
                    @click="resetFilters"
                    class="mt-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-light-blue hover:bg-dark-blue focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-light-blue transition-all"
                  >
                    <font-awesome-icon :icon="['fas', 'times']" class="mr-2" />
                    Clear Filters
                  </button>
                </div>
              </td>
            </tr>

            <!-- Table rows -->
            <tr
              v-for="registration in displayedRegistrations"
              :key="registration.id"
              class="hover:bg-gray-50 transition-colors"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm font-medium text-dark-blue">{{ registration.id }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div
                    class="flex-shrink-0 h-10 w-10 bg-light-blue bg-opacity-10 rounded-full flex items-center justify-center"
                  >
                    <font-awesome-icon :icon="['fas', 'car']" class="text-light-blue" />
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-dark-blue">
                      {{ `${registration.make} ${registration.model}` }}
                    </div>
                    <div class="text-sm text-gray">
                      {{ registration.year }} ·
                      <span
                        class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {{ registration.vehicleType }}
                      </span>
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-700">{{ registration.applicantName }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="px-3 py-1 inline-flex text-xs leading-5 font-medium rounded-full bg-yellow-100 text-yellow-800"
                >
                  <span class="h-1.5 w-1.5 rounded-full bg-yellow-600 mr-1.5 self-center"></span>
                  {{
                    new Date(registration.submissionDate as string).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })
                  }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right space-x-2">
                <button
                  @click="processRegistration(registration.id, 'approve')"
                  class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all"
                >
                  <font-awesome-icon :icon="['fas', 'check']" class="mr-2" />
                  Accept
                </button>
                <button
                  @click="processRegistration(registration.id, 'reject')"
                  class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all"
                >
                  <font-awesome-icon :icon="['fas', 'times']" class="mr-2" />
                  Reject
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div
        v-if="filteredRegistrations.length > 0"
        class="px-6 py-4 bg-gray-50 border-t border-gray-200"
      >
        <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div class="text-sm text-gray">
            Showing
            {{ filteredRegistrations.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0 }}
            to
            {{ Math.min(currentPage * itemsPerPage, filteredRegistrations.length) }}
            of
            {{ filteredRegistrations.length }} registrations
          </div>
          <div class="flex items-center gap-2">
            <button
              @click="prevPage"
              :disabled="currentPage === 1 || filteredRegistrations.length === 0"
              class="p-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
            >
              <font-awesome-icon :icon="['fas', 'chevron-left']" />
            </button>
            <span class="text-sm text-gray font-medium px-4">
              Page {{ filteredRegistrations.length > 0 ? currentPage : 0 }} of {{ totalPages }}
            </span>
            <button
              @click="nextPage"
              :disabled="currentPage === totalPages || filteredRegistrations.length === 0"
              class="p-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
            >
              <font-awesome-icon :icon="['fas', 'chevron-right']" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
