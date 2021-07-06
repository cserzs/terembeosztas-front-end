<template>

<div class="dropdown is-hoverable">
  <div class="dropdown-trigger">
    <button class="button is-info" aria-haspopup="true" aria-controls="dropdown-menu">
      <span>Válassz napot!</span>
      <span class="icon is-small">
        <i class="fas fa-angle-down" aria-hidden="true"></i>
      </span>
    </button>
  </div>
  <div class="dropdown-menu" id="dropdown-menu" role="menu">
    <div class="dropdown-content">
      <DayComponent v-for="n in 5" :key="n" :id="n-1" :currentDay="currentDay" :dayName="days[n-1]" @dayClick="$emit('handleDayClick', $event)" />
    </div>
  </div>
</div>

</template>

<script>
import DayComponent from './day-component.vue';

export default {
    name: "DayDropdownComponent",
    components: {DayComponent},
    data() {
        return {
            days: ["Hétfő", "Kedd", "Szerda", "Csütörtök", "Péntek"],
        };
    },
    props: {
        currentDay: Number,
    },
    emits: ['handleDayClick'],
}
</script>