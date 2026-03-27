<script setup lang="ts">
import { RouterView } from 'vue-router'
import AppSidebar from './components/TheSidebar.vue'
</script>

<template>
  <div class="app-layout">
    <!-- Material Navigation Drawer -->
    <AppSidebar />

    <!-- Main Content Area -->
    <div class="main-container">
      <main class="content">
        <RouterView />
      </main>

      <!-- Footer -->
      <footer class="footer">TODO: add footer</footer>
    </div>
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background-color: var(--color-background);
}

.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.content {
  flex: 1;
  padding: 24px;
}

.footer {
  padding: 16px 24px;
  border-top: 1px solid var(--color-border);
  color: var(--color-text);
  text-align: center;
}
</style>
