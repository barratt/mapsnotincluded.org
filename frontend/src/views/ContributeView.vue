<script setup>

</script>

<template>

  <main class="container mt-5">

    <div class="mb-5">
      <h1>{{ $t('contribute.title') }}</h1>
    </div>

    <div class="mb-5">
      <h2 class="text-danger">{{ $t('contribute.header.donation') }}</h2>
      <i18n-t keypath="contribute.description.donation" tag="p">
        <template v-slot:donateHosting>
          <a href="https://github.com/sponsors/barratt" target="mni_sponsor_hosting">{{ $t('contribute.link.donate_hosting') }}</a>
        </template>
        <template v-slot:donateSeedBrowser>
          <a href="https://github.com/sponsors/StefanOltmann" target="mni_sponsor_seed_browser">{{ $t('contribute.link.donate_seed_browser') }}</a>
        </template>
        <template v-slot:donateMod>
          <a href="https://ko-fi.com/sgtimalas" target="mni_sponsor_mod">{{ $t('contribute.link.donate_mod') }}</a>
        </template>
      </i18n-t>
    </div>

    <div class="mb-5">
      <h2 class="text-success">{{ $t('contribute.header.developer') }}</h2>
      <i18n-t keypath="contribute.description.developer" tag="p">
        <template v-slot:githubLink>
          <a href="https://github.com/barratt/mapsnotincluded.org" target="mni_disc">{{ $t('contribute.link.github') }}</a>
        </template>
      </i18n-t>
    </div>
    
    <div class="mb-5">
      <h2 class="text-info">{{ $t('contribute.header.gamer') }}</h2>
      <i18n-t keypath="contribute.description.gamer" tag="p" style="white-space: pre-wrap;">
        <template v-slot:githubReleaseLink>
          <a href=https://github.com/barratt/mapsnotincluded.org/releases target="_blank">{{ $t('contribute.link.github_release') }}</a>
        </template>
        <template v-slot:discordLink>
          <a href="https://discord.gg/3vhCpp6PNq" target="mni_gh">{{ $t('contribute.link.discord') }}</a>
        </template>
      </i18n-t>
    </div>

    <div class="mb-5">
      <h2 class="text-warning">{{ $t('contribute.header.artist') }}</h2>
      <p>{{ $t('contribute.description.artist') }}</p>
    </div>

    <div class="mb-5">
      <h2>{{ $t('contribute.header.contributor') }}</h2>
      <p>
        {{ $t('contribute.description.contributor.introduction') }}
      </p>
      <ul>
        <i18n-t keypath="contribute.description.contributor.item_1" tag="li">
          <template v-slot:RoboPhred>
            <a href="https://github.com/RoboPhred/oni-save-parser#readme">RoboPhred</a>
          </template>
        </i18n-t>
        <i18n-t keypath="contribute.description.contributor.item_2" tag="li">
          <template v-slot:StefanOltmann>
            <a href="https://stefan-oltmann.de/">Stefan Oltmann</a>
          </template>
        </i18n-t>
        <i18n-t keypath="contribute.description.contributor.item_3" tag="li">
          <template v-slot:Sgt_lmalas>
            <a href="https://github.com/Sgt-Imalas/">Sgt_lmalas</a>
          </template>
        </i18n-t>
        <i18n-t keypath="contribute.description.contributor.item_4" tag="li">
          <template v-slot:Cairath>
            <a href="https://github.com/Cairath">Cairath</a>
          </template>
        </i18n-t>
        <i18n-t keypath="contribute.description.contributor.item_5" tag="li">
          <template v-slot:paradeike>
            <a href="https://github.com/pardeike">@paradeike</a>
          </template>
          <template v-slot:harmony>
            <a href="https://github.com/pardeike/Harmony">Harmony</a>
          </template>
        </i18n-t>
        <i18n-t keypath="contribute.description.contributor.item_6" tag="li">
          <template v-slot:Magnet_MD>
            <a href="https://www.youtube.com/@Magnet_MD">@Magnet_MD</a>
          </template>
        </i18n-t>
        <i18n-t keypath="contribute.description.contributor.item_7" tag="li">
          <template v-slot:Klei>
            <a href="https://kleientertainment.com/">Klei Entertainment</a>
          </template>
        </i18n-t>
      </ul>
    </div>
    <div class="mb-5">
      <h2>{{ $t('contribute.header.contact') }}</h2>
      <i18n-t keypath="contribute.description.contact" tag="p">
        <template v-slot:email>
          <a href="mailto:hello@mapsnotincluded.org">hello@mapsnotincluded.org</a>
        </template>
      </i18n-t>
    </div>
  </main>
</template>
