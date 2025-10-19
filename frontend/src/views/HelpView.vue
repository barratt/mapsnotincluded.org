<script setup>

</script>

<template>
    <main class="container mt-5">
        <div>
            <h1>{{ $t('help.title') }}</h1>
            <!--Navigation menu-->
            <div>
                <ul class="nav flex-column">
                    <li class="nav-item">
                        <a class="nav-link" href="#faq">{{ $t('help.faq.header') }}</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="#troubleshooting">{{ $t('help.troubleshooting.header') }}</a>
                    </li>
                </ul>
            </div>
            <!--FAQ-->
            <div class="mt-5" id="faq">
                <h2 class="text-primary">{{ $t('help.faq.header') }}</h2>
                <!--FAQ content-->
                <section class="mt-4 ms-3">
                    <div v-for="(faq, index) in $tm('help.faq.items')" :key="index" class="mb-5">
                        <p> {{ faq.question }}</p>
                        <p class="text-muted">{{ faq.answer }}</p>
                    </div>
                </section>
            </div>
            <!--Troubleshooting guide-->
            <div class="mt-5" id="troubleshooting">
                <h2 class="text-danger">{{ $t('help.troubleshooting.header') }}</h2>
            </div>
        </div>
    </main>
</template>
