<template>

<div v-if="isLoadingScreenVisible" class="loadingScreen">
  <div>Loading...</div>
</div>

<div v-cloak>


<div class="columns">
  <div class="column is-1"></div>
  <div class="column">
    <DayDropdownComponent :currentDay="currentDay" @handleDayClick="handleDayClick" />
  </div>
  <div class="column currentDay" >{{getCurrentDay}} </div>
  <div class="column" ><button class="button is-info" @click="openDuplicateCheckDialog">Dupla órák ellenőrzése</button></div>
  <div class="column" ><button class="button is-info" @click="confirmFullDelete">Minden óra törlése</button></div>
  <!--<div class="column" ><button class="button is-info" @click="proba">proba</button></div>-->
</div>



<div class="grid-container">
  <div class="date-column">
    <div class="cell">&nbsp;</div>
    <div v-for="n in idopontok" :key="n" class="cell idopontok">{{n}}. óra</div>
  </div>

  <div class="flex-container">
    <div class="schoolclass-column" v-for="entry in roomcatalogs" :key="entry.class_id">
      <div class="schoolclass-name cell">{{ getClass(entry.class_id).nev }}</div>
      <div class="cell" v-for="(rooms, pos) in entry.roomcatalog" :key="pos">
        <PositionComponent v-for="(roomid, groupid) in rooms" :key="groupid"
          :roomId="roomid"
          :classId="entry.class_id"
          :groupId="groupid"
          :position="pos"
          :roomName="getRoom(roomid).nev"
          :isLast="groupid == rooms.length-1"          
          @positionClick="handlePositionClick" />
        <PositionComponent
          :roomId=-1
          :classId="entry.class_id"
          :position="pos"
          :groupId="rooms.length"
          roomName="+"
          :isNewPosition="true"
          @positionClick="handleSelectRoom" />
      </div>
    </div>
  </div>

</div>

<RoomSelectDialogComponent v-if="isRoomSelectVisible"
  :rooms="rooms"
  :title="roomselectTitle"
  :isRoomReserved="isRoomReserved"
  @closeEvent="closeRoomselectDialog"
  @roomClick="handleRoomClick" />

<DuplicateroomsDialogComponent v-if="isDuplicateCheckVisible"
  :day="currentDay"
  :maxPos="idopontok.length"
  :getRoom="getRoom"
  @closeEvent="closeDuplicateCheckDialog" />

</div>
</template>

<script>
import DayDropdownComponent from './components/day-dropdown-component.vue';
import PositionComponent from './components/position-component.vue';
import RoomSelectDialogComponent from './components/room-select-dialog-component.vue';
import DuplicateroomsDialogComponent from './components/duplicaterooms-dialog-component.vue';

let selectedClass;
let selectedPosition;
let selectedGroupId;
let selectedAction = "";

export default {
  name: 'App',
  components: { DayDropdownComponent, RoomSelectDialogComponent, PositionComponent, DuplicateroomsDialogComponent },
  created() {
    this.loadAll(0);
  },
  data() {
    return {
      days: ["Hétfő", "Kedd", "Szerda", "Csütörtök", "Péntek"],
      currentDay: 0,
      isLoadingScreenVisible: true,
      roomselectTitle: "",
      isRoomSelectVisible: false,
      isDuplicateCheckVisible: false,
    }
  },
  computed: {
    idopontok() { return this.$store.getters.idopontok; },
    rooms() { return this.$store.getters.getRooms; },
    roomcatalogs() { return this.$store.getters.getRoomCatalogs; },
    schoolclasses() { return this.$store.getters.getSchoolclasses; },
    reservedRooms() { return this.$store.getters.getReservedRooms; },
    getCurrentDay() { return this.days[this.currentDay]; }
  },
  methods: {
    proba() {
      this.$store.dispatch('proba')
      .catch((error) => { this._showError("Proba hiba", error); });
    },
    async loadAll(dayId) {
      this.isLoadingScreenVisible = true;
      this.currentDay = dayId;
      this.$store.dispatch('loadAll', {currentDay: dayId}).then(() => { this.isLoadingScreenVisible = false; });
    },

    getClass(id) {
      return this.schoolclasses.find(schoolclass => schoolclass.id === id);
    },
    getRoom(id) {
      return this.rooms.find(room => room.id === id);
    },
    getRoomAt(classId, pos, groupId) {
      const roomId = this.$store.getters.getRoomAt(classId, pos, groupId);
      return this.getRoom(roomId);
    },
    isRoomReserved(roomid) {
      const entry = this.reservedRooms.find(entry => entry.pos === selectedPosition);
      return (entry.roomlist.indexOf(roomid) > -1);
    },

    handleDayClick(dayId) {
      this.loadAll(dayId);
    },
    handlePositionClick(roomId, classId, pos, groupId, isLast) {
      if (isLast) {
        this.$store.dispatch('deleteRoom', {roomId: roomId, day: this.currentDay, classId: classId, pos: pos, groupId: groupId})
        .catch((error) => { this._showError("Delete room hiba", error); });
      }
      else {
        this.prepareChangeRoom(classId, pos, groupId);
      }
    },
    handleSelectRoom(roomId, classId, pos, groupId) {
      this.saveSelection(classId, pos, groupId, "add");
      const schoolclass = this.getClass(classId);
      this.showRoomSelectDialog(`Új terem: ${schoolclass.nev}, ${pos}. óra`);
    },
    handleRoomClick(roomId) {
      if (selectedAction == "add") {
        this.$store.dispatch('addRoom', {day: this.currentDay, classId: selectedClass, pos: selectedPosition, groupId: selectedGroupId, roomId: roomId})
        .catch((error) => { this._showError("Add room hiba", error); });
      }
      else if (selectedAction == "change") {
        const room = this.getRoomAt(selectedClass, selectedPosition, selectedGroupId);
        if (room.id !== roomId) {
          this.$store.dispatch('changeRoom', {day: this.currentDay, classId: selectedClass, pos: selectedPosition, groupId: selectedGroupId, roomId: roomId})
          .catch((error) => { this._showError("Change room hiba", error); });
        }
      }
      this.closeRoomselectDialog();
    },

    prepareChangeRoom(classId, pos, groupId) {
      this.saveSelection(classId, pos, groupId, "change");
      const schoolclass = this.getClass(classId);
      const room = this.getRoomAt(classId, pos, groupId);
      this.showRoomSelectDialog(`Teremcsere: ${schoolclass.nev}, ${pos}. óra (jelenlegi: ${room.nev})`);
    },
    showRoomSelectDialog(title) {
      this.roomselectTitle = title;
      this.isRoomSelectVisible = true;
    },
    closeRoomselectDialog() {
      this.isRoomSelectVisible = false;
    },
    openDuplicateCheckDialog() {
      this.isDuplicateCheckVisible = true;
    },
    closeDuplicateCheckDialog() {
      this.isDuplicateCheckVisible = false;
    },
    saveSelection(classId, pos, groupId, action) {
      selectedClass = classId;
      selectedPosition = pos;
      selectedGroupId = groupId;
      selectedAction = action;
    },
    confirmFullDelete() {
        if (confirm("Biztos törlöd az egész napi terembeosztást?\nNem lehet visszavonni!!")) {
          this.$store.dispatch('deleteAllCatalog', {day: this.currentDay}).then(() => {
            this.loadAll(this.currentDay);
          })
          .catch((error) => { this._showError("Delete all hiba!", error); });
        }      
    },
    _showError(msg, error) {
        console.warn(msg + " " + error);          
        alert("Nem sikerült a művelet!");
    }
  }
}
</script>

<style>

.loadingScreen {
   position: absolute;
   left: 0;
   right: 0;
   top: 0;
   bottom: 0;
   background-color: white;
   text-align: center;
   z-index: 9999;
}
.loadingScreen > div{
  position: absolute;
  top: 47%;
  left: 47%;
}

.grid-container {
  display: grid;
  grid-template-columns: 100px auto;
}


.flex-container {
  display: flex;
  flex-direction: row;
  width: 100%;
  overflow-x: auto;
}
.schoolclass-column {
  min-width: 300px;
}
.cell {
  height: 50px;
  
  padding-top: 15px;
  /*
  padding-bottom: 15px;
  */
  border-bottom: 1px solid #000000;
  text-align: center;

}

.idopontok {
  font-weight: 700;
  text-align: left;
  padding-left: 20px;

}
.schoolclass-name {
  font-weight: 700;
}
.currentDay {
  padding-top: 25px;
  font-weight: 600;
  font-size: 1.15em;
  letter-spacing: 3px;
  text-decoration-line: underline;
  text-decoration-style: solid;
  text-decoration-thickness: 5px;
}
</style>
