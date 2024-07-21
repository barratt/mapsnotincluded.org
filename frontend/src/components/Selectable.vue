<template>
    <div v-for="(item, i) in items" :key="item.name" class="selectable" @click="select(item)" :class="{ 
        'selected': selected && selected.name && selected.name == item.name ? true : false,
     }">
        <img :src="item.img" :alt="item.name" />
        <div class="text-center">{{ item.name }}</div>
    </div>
</template>

<script>
export default {
    props: {
        items: {
            type: Array,
            required: true,
        },
        modelValue: {
            type: Object,
            default: null,
        },
    },
    emits: ['update:modelValue'],
    data() {
        let first = null;
        // debugger;
        if (this.$props.items && this.$props.items.length > 0) {
            first = this.$props.items[0];
        }

        return {
            selected: first,
        }
    },
    methods: {
        select(item) {
            console.log('setSelected', item);
            this.selected = item;
            this.$emit('update:modelValue', item.name);
            this.$forceUpdate();
        }
    },
}
</script>

<style scoped>
.selectable {
  cursor: pointer;
  transition: transform 0.2s;
  filter: grayscale(100%);
}

.selectable img {
  height: 100px;
}

.selectable:hover {
  transform: scale(1.1);
  filter: none !important;
}

.selectable:active {
  transform: scale(0.9);
  filter: none !important;
}

.selectable.selected {
  filter: none !important;
}

</style>