<script setup>
import { ref } from 'vue'

// Features data
const features = [
  {
    title: 'Advanced Plate Detection',
    description:
      'State-of-the-art computer vision technology for accurate license plate recognition.',
    icon: 'camera',
  },
  {
    title: 'Fraud Prevention',
    description: 'Enhanced security measures to prevent registration fraud and ensure compliance.',
    icon: 'shield',
  },
  {
    title: 'Real-time Verification',
    description: 'Instant verification of plate authenticity and registration status.',
    icon: 'clock',
  },
  {
    title: 'Digital Records',
    description: 'Secure digital storage of vehicle registration and ownership information.',
    icon: 'database',
  },
]
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-light-blue/10 to-white">
    <!-- Header with Back Button -->
    <header class="fixed w-full bg-dark-blue/95 backdrop-blur-sm z-50 py-4 px-6 shadow-lg">
      <div class="container mx-auto">
        <button
          @click="$router.back()"
          class="flex items-center text-white hover:text-red transition-colors"
        >
          <font-awesome-icon icon="arrow-left" class="mr-2" />
          Back
        </button>
      </div>
    </header>
    <!-- Hero Section -->
    <div class="pt-16">
      <section
        class="relative overflow-hidden bg-gradient-to-br from-dark-blue to-black py-24 md:py-32 text-white"
      >
        <div class="container mx-auto px-4">
          <div class="max-w-4xl mx-auto text-center">
            <h1 class="text-4xl md:text-5xl font-bold mb-6">
              Revolutionizing Vehicle Plate Management
            </h1>
            <p class="text-lg md:text-xl text-gray-300 mb-8">
              SmartPlate combines cutting-edge technology with robust security measures to create a
              comprehensive vehicle plate detection and management system.
            </p>
            <button
              @click="$router.push('/register')"
              class="bg-red hover:bg-opacity-90 text-white font-semibold py-3 px-8 rounded-lg transform transition-all hover:-translate-y-0.5 hover:shadow-lg"
            >
              Get Started
            </button>
          </div>
        </div>
        <!-- Decorative Elements -->
        <div class="absolute -bottom-24 -left-24 w-96 h-96 bg-red/20 rounded-full blur-3xl"></div>
        <div
          class="absolute -top-24 -right-24 w-96 h-96 bg-dark-blue/20 rounded-full blur-3xl"
        ></div>
      </section>

      <!-- Mission Section -->
      <section class="py-16 px-4">
        <div class="container mx-auto max-w-4xl text-center">
          <h2 class="text-3xl font-bold text-dark-blue mb-6">Our Mission</h2>
          <p class="text-gray text-lg leading-relaxed">
            To enhance road safety and security through innovative technology, providing a reliable
            and efficient system for vehicle plate management. We aim to support law enforcement
            agencies and vehicle owners with accurate, real-time information while maintaining the
            highest standards of data security and user privacy.
          </p>
        </div>
      </section>

      <!-- Features Section -->
      <section class="py-16 bg-gradient-to-br from-dark-blue/5 to-transparent px-4">
        <div class="container mx-auto max-w-6xl">
          <h2 class="text-3xl font-bold text-dark-blue text-center mb-12">Key Features</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div
              v-for="feature in features"
              :key="feature.title"
              class="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
            >
              <div class="flex items-center justify-center w-12 h-12 bg-dark-blue rounded-lg mb-4">
                <font-awesome-icon :icon="['fas', feature.icon]" class="h-6 w-6 text-white" />
              </div>
              <h3 class="text-xl font-semibold text-dark-blue mb-3">{{ feature.title }}</h3>
              <p class="text-gray">{{ feature.description }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Call to Action Section -->
      <section class="py-16 bg-gradient-to-br from-dark-blue to-black text-white px-4">
        <div class="container mx-auto max-w-4xl text-center">
          <h2 class="text-3xl font-bold mb-6">Ready to Get Started?</h2>
          <p class="text-lg text-gray-300 mb-8">
            Join SmartPlate today and experience the future of vehicle plate management.
          </p>
          <div class="flex justify-center gap-4">
            <button
              @click="$router.push('/register')"
              class="bg-red hover:bg-opacity-90 text-white font-semibold py-3 px-8 rounded-lg transform transition-all hover:-translate-y-0.5 hover:shadow-lg"
            >
              Register Now
            </button>
            <button
              @click="$router.push('/login')"
              class="bg-transparent border-2 border-white hover:bg-white/10 text-white font-semibold py-3 px-8 rounded-lg transform transition-all hover:-translate-y-0.5 hover:shadow-lg"
            >
              Sign In
            </button>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
