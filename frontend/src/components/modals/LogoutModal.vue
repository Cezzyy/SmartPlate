<script setup>
import { defineProps, defineEmits } from 'vue'

defineProps({
  show: {
    type: Boolean,
    required: true,
  },
})

const emit = defineEmits(['confirm', 'cancel'])

const handleConfirm = () => {
  emit('confirm')
}

const handleCancel = () => {
  emit('cancel')
}
</script>

<template>
  <teleport to="body">
    <transition
      enter-active-class="ease-out duration-300"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="ease-in duration-200"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="show"
        class="fixed inset-0 z-50 overflow-y-auto backdrop-blur-sm"
        aria-labelledby="modal-title"
        role="dialog"
        aria-modal="true"
        @click.self="handleCancel"
      >
        <div class="flex items-center justify-center min-h-screen p-4 text-center sm:p-0">
          <div
            class="fixed inset-0 bg-gray-900 bg-opacity-50 transition-opacity"
            aria-hidden="true"
          ></div>

          <!-- Modal panel -->
          <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true"
            >&#8203;</span
          >
          <div
            class="relative inline-block align-bottom bg-white dark:bg-gray-800 rounded-xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-gray-200 dark:border-gray-700"
            @click.stop
          >
            <div class="bg-white dark:bg-gray-800 px-6 pt-6 pb-6 sm:p-8">
              <div class="sm:flex sm:items-start">
                <div
                  class="mx-auto flex-shrink-0 flex items-center justify-center h-14 w-14 rounded-full bg-red-100 dark:bg-red-900 sm:mx-0"
                >
                  <font-awesome-icon
                    :icon="['fas', 'sign-out-alt']"
                    class="h-7 w-7 text-red dark:text-red-300"
                  />
                </div>
                <div class="mt-4 text-center sm:mt-0 sm:ml-6 sm:text-left">
                  <h3
                    class="text-xl leading-6 font-semibold text-gray-900 dark:text-gray-100"
                    id="modal-title"
                  >
                    Confirm Logout
                  </h3>
                  <div class="mt-3">
                    <p class="text-base text-gray-500 dark:text-gray-300">
                      Are you sure you want to log out? You will need to log in again to access your
                      account.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div
              class="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 sm:px-8 sm:flex sm:flex-row-reverse gap-3"
            >
              <button
                type="button"
                class="w-full inline-flex justify-center items-center rounded-lg border border-transparent px-5 py-2.5 bg-red text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200 sm:w-auto"
                @click="handleConfirm"
              >
                <font-awesome-icon :icon="['fas', 'sign-out-alt']" class="mr-2 -ml-1 h-5 w-5" />
                Log Out
              </button>
              <button
                type="button"
                class="mt-3 w-full inline-flex justify-center items-center rounded-lg border border-gray-300 dark:border-gray-600 px-5 py-2.5 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 sm:mt-0 sm:w-auto"
                @click="handleCancel"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>
