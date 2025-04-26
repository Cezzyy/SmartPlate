<template>
  <div class="min-h-screen">
    <!-- Header Section -->
    <header class="fixed w-full bg-dark-blue/95 backdrop-blur-sm z-50 py-4 px-6 shadow-lg">
      <div class="container mx-auto flex justify-between items-center">
        <router-link to="/" class="text-2xl font-bold text-white hover:text-red transition-colors">
          LTO SmartPlate
        </router-link>
        <div class="flex items-center gap-4">
          <router-link
            :to="userStore.isAuthenticated ? '/home' : '/login'"
            class="bg-red hover:bg-opacity-90 text-white font-semibold py-2 px-4 rounded-lg transition-all transform hover:-translate-y-0.5 hover:shadow-lg"
          >
            {{ userStore.isAuthenticated ? 'Go to Home' : 'Log In' }}
          </router-link>
        </div>
      </div>
    </header>

    <!-- Hero Section -->
    <div
      class="relative bg-gradient-to-br from-dark-blue to-black text-white overflow-hidden pt-20"
    >
      <div class="absolute inset-0 bg-grid-pattern opacity-10"></div>
      <div class="container mx-auto px-4 py-20 lg:py-32">
        <div class="max-w-4xl mx-auto text-center">
          <h1 class="text-4xl md:text-6xl font-bold mb-6 leading-tight text-white">
            Official Vehicle Registration Management System
          </h1>
          <p class="text-xl md:text-2xl text-gray-300 mb-10">
            The Land Transportation Office's advanced platform for vehicle owners and LTO officers
            to manage registrations, prevent fraud, and ensure compliance
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <router-link
              to="/login"
              class="bg-red hover:bg-opacity-90 text-white font-semibold py-3 px-8 rounded-lg transition-all transform hover:-translate-y-0.5 hover:shadow-lg"
            >
              Check Your Vehicle Registration
            </router-link>
            <router-link
              to="/about"
              class="bg-transparent border-2 border-white/30 hover:border-white/50 text-white font-semibold py-3 px-8 rounded-lg transition-all transform hover:-translate-y-0.5 hover:shadow-lg"
            >
              Learn More
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Features Section -->
    <div id="features" class="py-20 bg-gradient-to-br from-light-blue/5 to-white">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl md:text-4xl font-bold text-center text-dark-blue mb-16">
          Comprehensive Vehicle Management for Owners & LTO Officers
        </h2>
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <!-- Feature 1 -->
          <div
            class="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 hover:bg-gradient-to-br from-white to-light-blue/5"
          >
            <div
              class="w-12 h-12 bg-dark-blue/10 rounded-lg flex items-center justify-center mb-4 transform transition-transform group-hover:scale-110"
            >
              <font-awesome-icon icon="camera" class="text-dark-blue text-2xl" />
            </div>
            <h3 class="text-xl font-semibold text-dark-blue mb-3">Vehicle Registration Tracking</h3>
            <p class="text-gray-600">
              Monitor your vehicle's registration status, expiration dates, and renewal requirements
              in real-time
            </p>
          </div>

          <!-- Feature 2 -->
          <div
            class="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 hover:bg-gradient-to-br from-white to-light-blue/5"
          >
            <div
              class="w-12 h-12 bg-dark-blue/10 rounded-lg flex items-center justify-center mb-4 transform transition-transform group-hover:scale-110"
            >
              <font-awesome-icon icon="database" class="text-dark-blue text-2xl" />
            </div>
            <h3 class="text-xl font-semibold text-dark-blue mb-3">Centralized Records</h3>
            <p class="text-gray-600">
              Access complete vehicle information, plate numbers, and registration history in one
              secure platform
            </p>
          </div>

          <!-- Feature 3 -->
          <div
            class="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 hover:bg-gradient-to-br from-white to-light-blue/5"
          >
            <div
              class="w-12 h-12 bg-dark-blue/10 rounded-lg flex items-center justify-center mb-4 transform transition-transform group-hover:scale-110"
            >
              <font-awesome-icon icon="shield" class="text-dark-blue text-2xl" />
            </div>
            <h3 class="text-xl font-semibold text-dark-blue mb-3">Fraud Prevention</h3>
            <p class="text-gray-600">
              Advanced verification system for LTO officers to detect and prevent registration fraud
            </p>
          </div>

          <!-- Feature 4 -->
          <div
            class="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 hover:bg-gradient-to-br from-white to-light-blue/5"
          >
            <div
              class="w-12 h-12 bg-dark-blue/10 rounded-lg flex items-center justify-center mb-4 transform transition-transform group-hover:scale-110"
            >
              <font-awesome-icon icon="chart-line" class="text-dark-blue text-2xl" />
            </div>
            <h3 class="text-xl font-semibold text-dark-blue mb-3">Compliance Monitoring</h3>
            <p class="text-gray-600">
              Automated tracking of registration compliance and instant notifications for renewals
            </p>
          </div>

          <!-- Feature 5 -->
          <div
            class="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 hover:bg-gradient-to-br from-white to-light-blue/5"
          >
            <div
              class="w-12 h-12 bg-dark-blue/10 rounded-lg flex items-center justify-center mb-4 transform transition-transform group-hover:scale-110"
            >
              <font-awesome-icon icon="mobile" class="text-dark-blue text-2xl" />
            </div>
            <h3 class="text-xl font-semibold text-dark-blue mb-3">Mobile Access</h3>
            <p class="text-gray-600">
              Check your vehicle's registration status and receive updates anywhere, anytime
            </p>
          </div>

          <!-- Feature 6 -->
          <div
            class="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 hover:bg-gradient-to-br from-white to-light-blue/5"
          >
            <div
              class="w-12 h-12 bg-dark-blue/10 rounded-lg flex items-center justify-center mb-4 transform transition-transform group-hover:scale-110"
            >
              <font-awesome-icon icon="file-alt" class="text-dark-blue text-2xl" />
            </div>
            <h3 class="text-xl font-semibold text-dark-blue mb-3">Digital Documentation</h3>
            <p class="text-gray-600">
              Secure storage of vehicle documents and registration certificates for easy access
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer Section -->
    <footer class="bg-dark-blue text-white py-16">
      <div class="container mx-auto px-4">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <!-- Company Info -->
          <div class="space-y-4">
            <h3 class="text-xl font-bold mb-4">LTO SmartPlate</h3>
            <p class="text-gray-300 text-sm">
              The Vehicle Registration Management System of the Land Transportation Office of the
              Philippines.
            </p>
            <div class="flex space-x-4 mt-4">
              <a href="#" class="text-white hover:text-red transition-colors">
                <font-awesome-icon :icon="['fab', 'facebook']" size="lg" />
              </a>
              <a href="#" class="text-white hover:text-red transition-colors">
                <font-awesome-icon :icon="['fab', 'twitter']" size="lg" />
              </a>
              <a href="#" class="text-white hover:text-red transition-colors">
                <font-awesome-icon :icon="['fab', 'instagram']" size="lg" />
              </a>
            </div>
          </div>

          <!-- Quick Links -->
          <div class="space-y-4">
            <h3 class="text-xl font-bold mb-4">Quick Links</h3>
            <ul class="space-y-2">
              <li>
                <router-link to="/about" class="text-gray-300 hover:text-red transition-colors"
                  >About Us</router-link
                >
              </li>
              <li>
                <router-link to="/services" class="text-gray-300 hover:text-red transition-colors"
                  >Services</router-link
                >
              </li>
              <li>
                <router-link to="/contact" class="text-gray-300 hover:text-red transition-colors"
                  >Contact</router-link
                >
              </li>
              <li>
                <router-link to="/faq" class="text-gray-300 hover:text-red transition-colors"
                  >FAQ</router-link
                >
              </li>
            </ul>
          </div>

          <!-- Contact Info -->
          <div class="space-y-4">
            <h3 class="text-xl font-bold mb-4">Contact Us</h3>
            <ul class="space-y-2">
              <li class="flex items-center space-x-2">
                <font-awesome-icon :icon="['fas', 'location-dot']" class="text-red" />
                <span class="text-gray-300">East Avenue, Diliman, Quezon City</span>
              </li>
              <li class="flex items-center space-x-2">
                <font-awesome-icon :icon="['fas', 'phone']" class="text-red" />
                <span class="text-gray-300">(02) 8922-9061</span>
              </li>
              <li class="flex items-center space-x-2">
                <font-awesome-icon :icon="['fas', 'envelope']" class="text-red" />
                <span class="text-gray-300">ltomailbox@lto.gov.ph</span>
              </li>
            </ul>
          </div>

          <!-- Office Hours -->
          <div class="space-y-4">
            <h3 class="text-xl font-bold mb-4">Office Hours</h3>
            <ul class="space-y-2">
              <li class="text-gray-300">Monday - Friday</li>
              <li class="text-gray-300">8:00 AM - 5:00 PM</li>
              <li class="text-gray-300">Except Holidays</li>
            </ul>
          </div>
        </div>

        <!-- Copyright -->
        <div class="border-t border-white/20 mt-12 pt-8 text-center">
          <p class="text-gray-300 text-sm">
            © 2025 Land Transportation Office. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { useUserStore } from '@/stores/user'
import {
  faCamera,
  faDatabase,
  faShield,
  faChartLine,
  faMobile,
  faFileAlt,
  faLocationDot,
  faPhone,
  faEnvelope,
} from '@fortawesome/free-solid-svg-icons'
import { faFacebook, faTwitter, faInstagram } from '@fortawesome/free-brands-svg-icons'

const userStore = useUserStore()

library.add(
  faCamera,
  faDatabase,
  faShield,
  faChartLine,
  faMobile,
  faFileAlt,
  faLocationDot,
  faPhone,
  faEnvelope,
  faFacebook,
  faTwitter,
  faInstagram,
)
</script>

<style scoped>
.bg-grid-pattern {
  background-image:
    linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
  background-size: 20px 20px;
}
</style>
