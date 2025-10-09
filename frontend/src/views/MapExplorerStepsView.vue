<script setup>
import {onMounted, ref} from 'vue';
import {useRoute} from 'vue-router';
import {useUserStore} from '@/stores';

const route = useRoute();

const MAPEXPLORER_URL = 'https://stefanoltmann.de/oni-seed-browser';
const iframeUrl = ref(null);
const iframeRef = ref(null);

onMounted(() => {
  const userStore = useUserStore();
  const token = userStore.getValidToken();

  const queryParams = {...route.query, embedded: 'mni'};
  if (token) queryParams.token = token;

  // Encode all query params except 'filter'
  const encodedQuery = Object.entries(queryParams)
      .map(([key, value]) => {
        if (key === 'filter') return `${key}=${value}`; // leave as-is
        return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
      })
      .join('&');

  let url = `${MAPEXPLORER_URL}?${encodedQuery}`;

  if (route.params.seed) {
    url += `#${encodeURIComponent(route.params.seed)}`;
  }

  iframeUrl.value = url;
});
</script>
