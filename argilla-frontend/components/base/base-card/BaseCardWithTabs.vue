<template>
  <div :class="['card-with-tabs', tabClass]">
    <ul class="card-with-tabs__tabs">
      <li
        class="card-with-tabs__tab"
        :class="[{ '--active': tab.id === currentTab.id }, tab?.class]"
        v-for="tab in tabs"
      >
        <BaseTooltip :title="tab.tooltipTitle" :text="tab.tooltipText">
          <BaseButton :class="tabSize" @on-click="changeTab(tab)">
            {{ tab.name }}
            <svgicon v-if="tab.icon" :name="tab.icon" width="10" height="10" />
            <span
              class="card-with-tabs__info"
              v-if="tab.info"
              v-text="tab.info"
            />
          </BaseButton>
        </BaseTooltip>
      </li>
    </ul>
    <div class="card-with-tabs__content" >
      <transition name="fade">
        <slot :current-component="currentComponent" :currentTabId="currentTab.id" />
      </transition>
    </div>
  </div>
</template>

<script>
export default {
  name: "BaseCardWithTabs",
  props: {
    tabs: {
      type: Array,
      required: true,
    },
    tabSize: {
      type: String,
      default: "medium",
    },
  },
  data() {
    return {
      currentTab: this.tabs[0],
    };
  },
  computed: {
    currentComponent() {
      return this.currentTab.component;
    },
    tabClass() {
      return this.tabs.find((tab) => tab.id === this.currentTab.id)?.class;
    },
  },
  methods: {
    changeTab(tab) {
      this.currentTab = tab;
    },
  },
};
</script>

<style lang="scss" scoped>
.card-with-tabs {
  &__tabs {
    display: flex;
    align-items: center;
    margin: 0;
    padding: 0;
    flex-wrap: wrap-reverse;
    flex-direction: row-reverse;
    direction: rtl;
  }
  &__tab {
    min-height: 30px;
    list-style: none;
    border-top-right-radius: $border-radius;
    border-top-left-radius: $border-radius;
    background: var(--bg-accent-grey-2);
    border-top: 1px solid var(--bg-opacity-10);
    border-left: 1px solid var(--bg-opacity-10);
    border-right: 1px solid var(--bg-opacity-10);
    &:not(.--active) {
      background: var(--bg-solid-grey-2);
      .button {
        color: var(--fg-tertiary);
      }
    }
    &.--active {
      margin-bottom: -2px;
      border-bottom: 1px solid transparent;
    }
    &:last-child:not(:first-child) {
      margin-left: -1px;
    }
    // @media (max-width: 600px) {
    //   padding: 5px; 
    //   min-width: 100px;
    //   overflow: hidden;
    //   text-overflow: ellipsis;
    //   white-space: nowrap;
    // }
  }
  &__info {
    @include font-size(11px);
    margin-left: -4px;
  }
  &__info {
    @include font-size(11px);
    margin-left: -4px;
  }
  &__content {
    padding: $base-space;
    border-top-right-radius: $border-radius;
    border-bottom-left-radius: $border-radius;
    border-bottom-right-radius: $border-radius;
    background: var(--bg-accent-grey-2);
    border: 1px solid var(--bg-opacity-10);
  }
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.1s ease;
}

.fade-enter, .fade-leave-to {
  opacity: 0;
}
</style>
