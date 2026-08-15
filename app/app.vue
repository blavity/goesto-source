<script setup lang="ts">
import 'vue-sonner/style.css'

const { title, description, image } = useAppConfig()
const route = useRoute()
const requestURL = useRequestURL()
const localeHead = useLocaleHead()
const colorMode = useColorMode()

// og:image and twitter:image must be absolute — crawlers do not resolve a
// relative path against the page. The config value is a local asset so that a
// deployment serves its own card rather than borrowing another host's.
const imageURL = computed(() => new URL(image, requestURL.origin).href)

useSeoMeta({
  title: `${title} - Link Shortener with Analytics`,
  description,
  ogType: 'website',
  ogTitle: title,
  ogSiteName: title,
  ogDescription: description,
  ogImage: imageURL,
  twitterTitle: title,
  twitterDescription: description,
  twitterImage: imageURL,
  twitterCard: 'summary_large_image',
})

useHead(() => ({
  htmlAttrs: localeHead.value.htmlAttrs,
  meta: [
    {
      name: 'viewport',
      content: 'width=device-width, initial-scale=1, viewport-fit=cover',
    },
    {
      name: 'theme-color',
      content: colorMode.value === 'dark' ? '#09090b' : '#ffffff',
    },
  ],
  link: [
    {
      rel: 'canonical',
      // This deployment's own origin. Upstream hardcodes its own domain, which
      // for any fork declares every page a duplicate of upstream's site.
      href: computed(() => `${requestURL.origin}${route.path}`),
    },
    {
      rel: 'icon',
      type: 'image/png',
      href: '/icon-192.png',
    },
    {
      rel: 'apple-touch-icon',
      href: '/apple-touch-icon.png',
    },
  ],
}))
</script>

<template>
  <NuxtLayout>
    <NuxtLoadingIndicator color="var(--primary)" />
    <NuxtPage />
    <Toaster position="top-center" rich-colors />
  </NuxtLayout>
</template>
