<script setup>

</script>

<template>
    <main class="container mt-5">
        <div>
            <h1>{{ $t('help.title') }}</h1>
            <!--Navigation menu-->
            <nav>
                <ul class="nav flex-column">

                    <li class="nav-item">
                        <a class="nav-link" href="#faq">{{ $t('help.faq.header') }}</a>
                    </li>

                    <li class="nav-item">
                        <a class="nav-link" href="#troubleshooting-guide">{{ $t('help.troubleshooting_guide.header')}}</a>
                    </li>
                </ul>
            </nav>
            <!--FAQ-->
            <div class="mt-5" id="faq">
                <h2 class="text-primary">{{ $t('help.faq.header') }}</h2>
                <!--FAQ content-->
                <section class="mt-4 ms-3">
                    <div v-for="(faq, index) in $tm('help.faq.content_items')" :key="index" class="mb-5">

                        <p>{{ faq.question }}</p>
                        <p class="text-muted">{{ faq.answer }}</p>
                    </div>
                </section>
            </div>
            <!--Troubleshooting guide-->
            <div class="mt-5" id="troubleshooting-guide">
                <h2 class="text-danger">{{ $t('help.troubleshooting_guide.header') }}</h2>

                <!--Troubleshooting guide content-->
                <section class="mt-4 ms-3">
                    <div v-for="(troubleshooting_guide, index) in $tm('help.troubleshooting_guide.content_items')" :key="index" class="mb-5">

                        <p>{{ troubleshooting_guide.problem }}</p>
                        <i18n-t :keypath="`help.troubleshooting_guide.content_items.${index}.solution`" tag="p" class="text-muted">
                            <template v-slot:discordLink>
                                <a href="https://discord.gg/3vhCpp6PNq" target="mni_disc">{{ $t('help.link.discord')}}</a>
                            </template>
                        </i18n-t>
                    </div>
                </section>
            </div>
        </div>
    </main>
</template>
