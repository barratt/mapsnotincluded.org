<template>
    <!-- Bootstrap 5 navbar -->
    <nav class="navbar navbar-expand-lg">
        <div class="container">
            <router-link to="/" class="navbar-brand"><img src="@/assets/logo.png" style="max-height: 40px" class="me-2"/>MapsNotIncluded</router-link>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
                aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav">
                    <li class="nav-item">
                        <router-link to="/map-explorer" class="nav-link">Map Explorer</router-link>
                    </li>
                    <li class="nav-item">
                        <router-link to="/seed-explorer" class="nav-link">Seed Explorer</router-link>
                    </li>
                    <li class="nav-item">
                        <router-link to="/trait-finder" class="nav-link">World Trait Finder</router-link>
                    </li>
                    <li class="nav-item">
                        <router-link to="/starmap-generator" class="nav-link">StarMap Generator</router-link>
                    </li>
                </ul>
                <ul class="navbar-nav ms-auto">
                    <li class="nav-item">
                        <router-link to="/contribute" class="nav-link">Contribute</router-link>
                    </li>
                    <li class="nav-item">
                        <a href="https://discord.gg/3vhCpp6PNq" target="mni_gh" class="nav-link">Discord</a>
                    </li>
                    <li class="nav-item">
                        <a href="https://github.com/barratt/mapsnotincluded.org" target="mni_disc" class="nav-link">GitHub</a>
                    </li>
                </ul>
            </div>
        </div>
    </nav>

</template>

<style scoped>
.navbar {
    background-color: #4F5F80;
}
</style>