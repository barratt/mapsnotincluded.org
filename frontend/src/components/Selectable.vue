<template>
    <div v-for="(item, i) in items" :key="item.id" class="selectable" @click="select(item)" :class="{ 
        'selected': isSelected(item.id),
     }">
        <img :src="item.img" :alt="item.id" class="img-responsive"/>
        <div class="text-center" :class="{
            [selectedTextClass]: isSelected(item.id),
        }">{{ item.name }}</div>
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
        multiselect: {
            type: Boolean,
            default: false,
        },
        selectedTextClass: {
            type: String,
            default: 'text-info',
        }
    },
    emits: ['update:modelValue'],
    data() {
        let first = null;
        // debugger;
        if (this.$props.items && this.$props.items.length > 0) {
            first = this.$props.items[0];
        }

        if (this.$props.multiselect) {
            first = [];
        }
    
        return {
            selected: first,
        }
    },
    methods: {
        select(item) {
            // console.log('setSelected', item);
            
            if (this.multiselect) {
                if (this.selected.includes(item)) {
                    let index = this.selected.findIndex(i => i.id === item.id);
                    this.selected.splice(index, 1);
                } else {
                    this.selected.push(item);
                }
            } else {
                this.selected = item;
            }

            console.log('selected', this.selected);
            this.$emit('update:modelValue', this.selected);
        },

        isSelected(id) {
            if (this.multiselect) {
                return this.selected && this.selected.find(i => i.id === id);
            }

            return this.selected && this.selected.id && this.selected.id == id;
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
  max-height: 80px;
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