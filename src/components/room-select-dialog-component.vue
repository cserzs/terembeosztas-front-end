<template>

<div class="modal is-active">
  <div class="modal-background"></div>
  <div class="modal-card">
    <header class="modal-card-head">
      <p class="modal-card-title">{{ title }}</p>
      <button class="delete" aria-label="close" @click="$emit('closeEvent')"></button>
    </header>
    <section class="modal-card-body">
      <div>
        <button v-for="room in rooms" :key="room.id"
            class="button roomButton"
            :class="{ 'is-link': !isRoomReserved(room.id) }"
            @click="$emit('roomClick', room.id)"
            @mouseover="showDesc(room)"
            @mouseout="hideDesc" >{{room.nev}}</button>
      </div>
      <div v-html="roomDesc" class="roomDesc"></div>
    </section>
    <footer class="modal-card-foot">
      <button class="button is-dark" @click="$emit('closeEvent')">Bezár</button>
      <span>Jelmagyarázat: kék - nincs használatban, fehér - használatban van</span>
    </footer>
  </div>
</div>

</template>

<script>
export default {
    name: "RoomSelectDialogComponent",
    props: {
        title: String,
        rooms: Array,
        isRoomReserved: Function
    },
    data() { return {
      roomDesc: "&nbsp;"
    }},
    methods: {
      showDesc(room) {
        if (room.megjegyzes) { this.roomDesc = room.megjegyzes; } 
      },
      hideDesc() { this.roomDesc = "&nbsp;"; }
    }
}
</script>

<style>
.roomButton {
  margin: 5px;
  width: 100px;
}
.roomDesc {
  margin-top: 15px;
  text-align: center;
}
.modal-card {
  width: 80%;
}
</style>