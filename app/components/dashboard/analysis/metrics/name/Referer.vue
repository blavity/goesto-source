<script setup lang="ts">
defineProps<{
  name?: string
}>()
</script>

<template>
  <a
    :href="`http://${name}`"
    target="_blank"
    rel="noopener noreferrer"
    class="flex w-full min-w-0 items-start gap-1"
  >
    <Avatar
      class="size-5 shrink-0 p-0.5"
    >
      <!--
        No remote favicon lookup. Upstream fetched one per referrer from a
        third-party avatar service, which disclosed every referring domain in
        the analytics to that service.
      -->
      <AvatarFallback>
        <img
          src="/icon.png"
          :alt="name"
          loading="lazy"
          width="20"
          height="20"
        >
      </AvatarFallback>
    </Avatar>
    <span class="min-w-0 break-all">{{ name }}</span>
  </a>
</template>
