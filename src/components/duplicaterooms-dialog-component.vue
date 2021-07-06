<template>

<div class="modal is-active">
  <div class="modal-background"></div>
  <div class="modal-card">
    <header class="modal-card-head">
      <p class="modal-card-title">Többször is kiosztott órák</p>
      <button class="delete" aria-label="close" @click="$emit('closeEvent')"></button>
    </header>
    <section class="modal-card-body">
      <ul>
        <li v-for="(items, index) in roomlist" :key="index">{{index}}. óra:
          <span v-if="items.length < 1">-</span>
          <span v-for="(item, indx) in items" :key="indx"><span v-if="indx > 0">, </span>{{item.nev}} ({{item.num}} db)</span>
        </li>
      </ul>
    </section>
    <footer class="modal-card-foot">
      <button class="button is-dark" @click="$emit('closeEvent')">Bezár</button>
    </footer>
  </div>
</div>

</template>

<script>
import axios from 'axios';

export default {
    name: "DuplicateroomsDialogComponent",
    props: {
      day: Number,
      maxPos: Number,
      getRoom: Function
    },
    created() {
      axios.get('/api/roombindings/checkduplicate/' + this.day)
      .then((res) => {
          this.roomlist = [];
          for(let i = 0; i < this.maxPos; i++) this.roomlist[i] = [];
          for(let i = 0; i < res.data.length; i++) {
            this.roomlist[ res.data[i].idopont ].push({
              'nev': this.getRoom(res.data[i].terem_id).nev,
              'num': res.data[i].num
            });
          }
      })
      .catch((error) => {
        console.warn("Duplicate check hiba: " + error);
        alert("Nem sikerült a művelet!");
      });
    },
    data() { return {
      roomlist: []
    }},
    methods: {
    }
}
</script>

<style scoped>
.modal-card {
  width: 600px;
}
ul {
  margin-left: 20px;
  list-style-type: disc;
}
ul li {
  margin: 5px 0;
}
</style>