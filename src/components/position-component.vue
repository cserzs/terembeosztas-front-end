<template>
    <a href="javascript:void(0)"
        @click="$emit('positionClick', roomId, classId, position, groupId, isLast)"
        class="tag roomposition"
        :class="{'newPosition': isNewPosition, 'betuszin': !isNewPosition}" >{{ roomName }}</a>
    <span v-if="!isNewPosition"> / </span>
</template>

<script>
export default {
    name: "PositionComponent",
    props: {
        classId: Number,
        position: Number,
        groupId: Number,
        roomName: String,
        isLast: Boolean,
        roomId: Number,
        isNewPosition: {
            type: Boolean,
            default: false
        }
    },
    emits: ['positionClick']
}
</script>

<style scoped>
.newPosition {
    background-color: #17a2b8;
    color: #ffffff;
}
.betuszin {
    color: #000;
}
a.roomposition {
    text-decoration: none;
    font-weight: 500;
}
a.roomposition:hover {
    text-decoration: none;
    background: #c5c5c5;
}
</style>
