<template>
  <main class="container mt-5" style="max-width: 820px">
    <h1>{{ $t('privacy.title') }}</h1>
    <p class="text-muted small">{{ $t('privacy.updated') }}</p>
    <p>{{ $t('privacy.intro') }}</p>

    <h4 class="mt-4">{{ $t('privacy.collect_title') }}</h4>
    <ul>
      <li>{{ $t('privacy.collect_search') }}</li>
      <li>{{ $t('privacy.collect_ip') }}</li>
      <li>{{ $t('privacy.collect_fingerprint') }}</li>
      <li>{{ $t('privacy.collect_steam') }}</li>
    </ul>

    <h4 class="mt-4">{{ $t('privacy.why_title') }}</h4>
    <p>{{ $t('privacy.why') }}</p>

    <h4 class="mt-4">{{ $t('privacy.processors_title') }}</h4>
    <p>{{ $t('privacy.processors') }}</p>

    <h4 class="mt-4">{{ $t('privacy.retention_title') }}</h4>
    <p>{{ $t('privacy.retention') }}</p>

    <h4 class="mt-4">{{ $t('privacy.rights_title') }}</h4>
    <i18n-t keypath="privacy.rights" tag="p">
      <template v-slot:discordLink>
        <a href="https://discord.gg/3vhCpp6PNq" target="mni_disc">Discord</a>
      </template>
    </i18n-t>
  </main>
</template>
