<template>
    <a href="javascript:void(0)" @click="$emit('dayClick', id)" class="dropdown-item" :class="{'is-active': currentDay == id}">{{dayName}}</a>
</template>

<script>
export default {
    name: "DayComponent",
    props: {
        id: Number,
        currentDay: Number,
        dayName: String
    }
}
</script>
