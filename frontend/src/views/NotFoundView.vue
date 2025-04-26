<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
    <div class="text-center">
      <h1 class="text-9xl font-bold text-dark-blue">404</h1>
      <h2 class="text-3xl font-semibold text-gray-700 mt-4">Page Not Found</h2>
      <p class="text-gray-600 mt-2 max-w-md mx-auto">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <div class="mt-8">
        <router-link
          to="/"
          class="bg-dark-blue hover:bg-blue-800 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200"
        >
          Go to Home
        </router-link>
      </div>
    </div>
  </div>
</template>
