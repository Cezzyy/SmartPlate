<script setup>
import { defineProps, ref } from 'vue'

defineProps({
  user: {
    type: Object,
    required: true,
  },
  isEditMode: {
    type: Boolean,
    default: false,
  },
  formData: {
    type: Object,
    required: true,
  },
  showEmptyState: {
    type: Boolean,
    default: false,
  },
})

// Tabs for personal information sections
const activeTab = ref('general')
</script>

<template>
  <div class="space-y-4 bg-white">
    <!-- Tabs for Personal Information -->
    <div class="border-b border-gray-200">
      <nav class="flex space-x-4" aria-label="Personal Information Tabs">
        <button
          @click="activeTab = 'general'"
          :class="[
            'py-2 px-3 text-sm font-medium rounded-t-lg',
            activeTab === 'general'
              ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-500'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50',
          ]"
        >
          General
        </button>
        <button
          @click="activeTab = 'medical'"
          :class="[
            'py-2 px-3 text-sm font-medium rounded-t-lg',
            activeTab === 'medical'
              ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-500'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50',
          ]"
        >
          Medical
        </button>
      </nav>
    </div>

    <!-- General Information Tab -->
    <div v-if="activeTab === 'general'" class="space-y-4">
      <!-- Nationality and Civil Status -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Nationality -->
        <div class="flex flex-col space-y-1">
          <label class="text-sm text-gray-500">Nationality</label>
          <div v-if="!isEditMode" class="text-gray-800 font-medium">
            <template v-if="user.nationality">{{ user.nationality }}</template>
            <span v-else-if="showEmptyState" class="text-gray-400 italic">No nationality provided</span>
          </div>
          <input
            v-else
            :value="formData.nationality"
            @input="$emit('update:formData', { ...formData, nationality: $event.target.value })"
            type="text"
            class="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>

        <!-- Civil Status -->
        <div class="flex flex-col space-y-1">
          <label class="text-sm text-gray-500">Civil Status</label>
          <div v-if="!isEditMode" class="text-gray-800 font-medium">
            <template v-if="user.civilStatus">{{ user.civilStatus }}</template>
            <span v-else-if="showEmptyState" class="text-gray-400 italic">No civil status provided</span>
          </div>
          <select
            v-else
            :value="formData.civilStatus"
            @input="$emit('update:formData', { ...formData, civilStatus: $event.target.value })"
            class="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value="Single">Single</option>
            <option value="Married">Married</option>
            <option value="Divorced">Divorced</option>
            <option value="Widowed">Widowed</option>
          </select>
        </div>
      </div>

      <!-- Date of Birth and Place of Birth -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Date of Birth -->
        <div class="flex flex-col space-y-1">
          <label class="text-sm text-gray-500">Date of Birth</label>
          <div v-if="!isEditMode" class="text-gray-800 font-medium">
            <template v-if="user.dateOfBirth">{{ new Date(user.dateOfBirth).toLocaleDateString() }}</template>
            <span v-else-if="showEmptyState" class="text-gray-400 italic">No date of birth provided</span>
          </div>
          <input
            v-else
            :value="formData.dateOfBirth"
            @input="$emit('update:formData', { ...formData, dateOfBirth: $event.target.value })"
            type="date"
            class="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>

        <!-- Place of Birth -->
        <div class="flex flex-col space-y-1">
          <label class="text-sm text-gray-500">Place of Birth</label>
          <div v-if="!isEditMode" class="text-gray-800 font-medium">
            <template v-if="user.placeOfBirth">{{ user.placeOfBirth }}</template>
            <span v-else-if="showEmptyState" class="text-gray-400 italic">No place of birth provided</span>
          </div>
          <input
            v-else
            :value="formData.placeOfBirth"
            @input="$emit('update:formData', { ...formData, placeOfBirth: $event.target.value })"
            type="text"
            class="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>
      </div>

      <!-- Educational Attainment and TIN -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Educational Attainment -->
        <div class="flex flex-col space-y-1">
          <label class="text-sm text-gray-500">Educational Attainment</label>
          <div v-if="!isEditMode" class="text-gray-800 font-medium">
            <template v-if="user.educationalAttainment">{{ user.educationalAttainment }}</template>
            <span v-else-if="showEmptyState" class="text-gray-400 italic">No educational attainment provided</span>
          </div>
          <select
            v-else
            :value="formData.educationalAttainment"
            @input="
              $emit('update:formData', { ...formData, educationalAttainment: $event.target.value })
            "
            class="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value="Elementary">Elementary</option>
            <option value="High School">High School</option>
            <option value="College Graduate">College Graduate</option>
            <option value="Post Graduate">Post Graduate</option>
          </select>
        </div>

        <!-- TIN -->
        <div class="flex flex-col space-y-1">
          <label class="text-sm text-gray-500">TIN</label>
          <div v-if="!isEditMode" class="text-gray-800 font-medium">
            <template v-if="user.tin">{{ user.tin }}</template>
            <span v-else-if="showEmptyState" class="text-gray-400 italic">No TIN provided</span>
          </div>
          <input
            v-else
            :value="formData.tin"
            @input="$emit('update:formData', { ...formData, tin: $event.target.value })"
            type="text"
            class="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>
      </div>
    </div>

    <!-- Medical Information Tab -->
    <div v-if="activeTab === 'medical'" class="space-y-4">
      <!-- Gender and Blood Type -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Gender -->
        <div class="flex flex-col space-y-1">
          <label class="text-sm text-gray-500">Gender</label>
          <div v-if="!isEditMode" class="text-gray-800 font-medium">
            <template v-if="user.gender">{{ user.gender }}</template>
            <span v-else-if="showEmptyState" class="text-gray-400 italic">No gender provided</span>
          </div>
          <select
            v-else
            :value="formData.gender"
            @input="$emit('update:formData', { ...formData, gender: $event.target.value })"
            class="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <!-- Blood Type -->
        <div class="flex flex-col space-y-1">
          <label class="text-sm text-gray-500">Blood Type</label>
          <div v-if="!isEditMode" class="text-gray-800 font-medium">
            <template v-if="user.bloodType">{{ user.bloodType }}</template>
            <span v-else-if="showEmptyState" class="text-gray-400 italic">No blood type provided</span>
          </div>
          <select
            v-else
            :value="formData.bloodType"
            @input="$emit('update:formData', { ...formData, bloodType: $event.target.value })"
            class="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
          </select>
        </div>
      </div>

      <!-- Complexion and Body Type -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Complexion -->
        <div class="flex flex-col space-y-1">
          <label class="text-sm text-gray-500">Complexion</label>
          <div v-if="!isEditMode" class="text-gray-800 font-medium">
            <template v-if="user.complexion">{{ user.complexion }}</template>
            <span v-else-if="showEmptyState" class="text-gray-400 italic">No complexion provided</span>
          </div>
          <select
            v-else
            :value="formData.complexion"
            @input="$emit('update:formData', { ...formData, complexion: $event.target.value })"
            class="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value="Fair">Fair</option>
            <option value="Medium">Medium</option>
            <option value="Dark">Dark</option>
          </select>
        </div>

        <!-- Body Type -->
        <div class="flex flex-col space-y-1">
          <label class="text-sm text-gray-500">Body Type</label>
          <div v-if="!isEditMode" class="text-gray-800 font-medium">
            <template v-if="user.bodyType">{{ user.bodyType }}</template>
            <span v-else-if="showEmptyState" class="text-gray-400 italic">No body type provided</span>
          </div>
          <select
            v-else
            :value="formData.bodyType"
            @input="$emit('update:formData', { ...formData, bodyType: $event.target.value })"
            class="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value="Slim">Slim</option>
            <option value="Medium">Medium</option>
            <option value="Athletic">Athletic</option>
            <option value="Heavy">Heavy</option>
          </select>
        </div>
      </div>

      <!-- Eye Color and Hair Color -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Eye Color -->
        <div class="flex flex-col space-y-1">
          <label class="text-sm text-gray-500">Eye Color</label>
          <div v-if="!isEditMode" class="text-gray-800 font-medium">
            {{ user.eyeColor }}
          </div>
          <input
            v-else
            :value="formData.eyeColor"
            @input="$emit('update:formData', { ...formData, eyeColor: $event.target.value })"
            type="text"
            class="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>

        <!-- Hair Color -->
        <div class="flex flex-col space-y-1">
          <label class="text-sm text-gray-500">Hair Color</label>
          <div v-if="!isEditMode" class="text-gray-800 font-medium">
            {{ user.hairColor }}
          </div>
          <input
            v-else
            :value="formData.hairColor"
            @input="$emit('update:formData', { ...formData, hairColor: $event.target.value })"
            type="text"
            class="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>
      </div>

      <!-- Weight and Height -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Weight -->
        <div class="flex flex-col space-y-1">
          <label class="text-sm text-gray-500">Weight (kg)</label>
          <div v-if="!isEditMode" class="text-gray-800 font-medium">{{ user.weight }} kg</div>
          <input
            v-else
            :value="formData.weight"
            @input="$emit('update:formData', { ...formData, weight: $event.target.value })"
            type="number"
            class="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>

        <!-- Height -->
        <div class="flex flex-col space-y-1">
          <label class="text-sm text-gray-500">Height (cm)</label>
          <div v-if="!isEditMode" class="text-gray-800 font-medium">{{ user.height }} cm</div>
          <input
            v-else
            :value="formData.height"
            @input="$emit('update:formData', { ...formData, height: $event.target.value })"
            type="number"
            class="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>
      </div>

      <!-- Organ Donor -->
      <div class="flex flex-col space-y-1">
        <label class="text-sm text-gray-500">Organ Donor</label>
        <div v-if="!isEditMode" class="text-gray-800 font-medium">
          {{ user.organDonor ? 'Yes' : 'No' }}
        </div>
        <div v-else class="flex items-center space-x-2">
          <input
            :checked="formData.organDonor"
            @change="$emit('update:formData', { ...formData, organDonor: $event.target.checked })"
            type="checkbox"
            class="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
          />
          <span class="text-gray-700">I want to be an organ donor</span>
        </div>
      </div>
    </div>
  </div>
</template>
