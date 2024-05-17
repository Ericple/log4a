<template>
    <img :src="imgSrc" alt="Repository">
</template>

<script setup>
import { useData } from 'vitepress';
import { ref, watch } from 'vue';

const { isDark } = useData();
let imgSrc = ref(isDark.value ? 'https://gitee.com/ericple/log4a/widgets/widget_card.svg?colors=eae9d7,2e2f29,272822,484a45,eae9d7,747571' :
    'https://gitee.com/ericple/log4a/widgets/widget_card.svg?colors=4183c4,ffffff,ffffff,e3e9ed,666666,9b9b9b');

watch(isDark, (v) => {
    if (v) {
        imgSrc.value = 'https://gitee.com/ericple/log4a/widgets/widget_card.svg?colors=eae9d7,2e2f29,272822,484a45,eae9d7,747571';
        console.log(imgSrc)
    } else {
        imgSrc.value = 'https://gitee.com/ericple/log4a/widgets/widget_card.svg?colors=4183c4,ffffff,ffffff,e3e9ed,666666,9b9b9b';
        console.log(imgSrc)
    }
})
</script>