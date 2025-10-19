<script setup>

</script>

<template>
    <main class="container mt-5">
        <div>
            <h1>{{ $t('help.title') }}</h1>
            <!--beginner's guide-->
            <div class="mt-5">
                <h2 class="text-info">{{ $t('help.guide.header') }}</h2>
                <p class="ps-3">{{ $t('help.guide.description') }}</p>
            </div>
            <!--FAQ-->
            <div class="mt-5">
                <h2 class="text-primary">{{ $t('help.faq.header') }}</h2>
                <!--FAQ content-->
                <div v-for="(faq, index) in $tm('help.faq.items')" :key="index" class="ps-3">
                    <h3 class="mt-5"> {{ faq.question }}</h3>
                    <p class="text-muted">{{ faq.answer }}</p>
                </div>
            </div>
        </div>
    </main>
</template>
