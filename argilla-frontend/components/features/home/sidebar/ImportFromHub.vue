<template>
  <div class="import-from-hub" :class="isExpanded ? '--expanded' : null">
    <BaseButton
      class="import-from-hub__button"
      @click="$emit('on-expand')"
      v-if="!isExpanded"
      ><svgicon
        class="import-from-hub__button__icon"
        name="link"
        width="18"
        height="18"
        color="#F6C000"
        aria-hidden="true"
      ></svgicon
      >{{ $t("home.importFromHub") }}</BaseButton
    >
    <template v-else>
      <BaseButton
        class="import-from-hub__close-button"
        @click="$emit('on-close')"
      >
        <svgicon name="close" width="8" aria-hidden="true"></svgicon
        >Close</BaseButton
      >
      <form @submit.prevent="$emit('on-import-dataset', repositoryId)">
        <transition name="slide-right" appear>
          <BaseInputContainer
            class="import-from-hub__input"
            :class="{ '--error': error }"
          >
            <svgicon
              class="import-from-hub__button__icon"
              name="link"
              width="20"
              height="20"
              aria-hidden="true"
            ></svgicon>
            <BaseInput
              autofocus
              v-model="repositoryId"
              :placeholder="$t('home.pasteRepoIdPlaceholder')"
            />
            <BaseButton
              :disabled="!repositoryId"
              class="secondary import-from-hub__button-submit"
              type="submit"
            >
              <svgicon name="chevron-right" width="16"></svgicon
            ></BaseButton>
          </BaseInputContainer>
        </transition>
        <span v-if="error" class="import-from-hub__error">{{
          $t("datasetCreation.cantLoadRepository")
        }}</span>
      </form>
    </template>
  </div>
</template>

<script>
import "assets/icons/link";
import "assets/icons/chevron-right";
export default {
  props: {
    isExpanded: {
      type: Boolean,
    },
    error: {
      type: String,
    },
  },
  data() {
    return {
      repositoryId: "",
    };
  },
};
</script>

<style lang="scss" scoped>
$color-error: var(--color-brand);
.import-from-hub {
  &.--expanded {
    width: 100%;
  }
  &__button.button {
    min-height: 42px;
    color: var(--fg-primary);
    background: linear-gradient(
      177.33deg,
      var(--bg-accent-grey-5) 20%,
      var(--bg-opacity-4) 100%
    );
    box-shadow: 0 0 0 1px var(--bg-opacity-10);
    &:hover {
      background: linear-gradient(
        177.33deg,
        var(--bg-accent-grey-5) 20%,
        var(--bg-opacity-2) 100%
      );
    }
  }
  &__input {
    display: flex;
    align-items: center;
    min-height: 42px;
    gap: $base-space * 2;
    padding: 0 calc($base-space / 2) 0 $base-space * 2;
    width: 100%;
    background: var(--bg-accent-grey-2);
    border-radius: $border-radius;
    box-shadow: 0 0 0 1px var(--bg-opacity-10);
    &.--error {
      box-shadow: 0 0 0 1px $color-error !important;
    }
    &.re-has-value:focus-within {
      box-shadow: 0 0 0 1px var(--fg-cuaternary);
      .import-from-hub__button__icon {
        fill: var(--fg-secondary);
      }
      .button {
        background: var(--bg-action);
        * {
          fill: var(--color-white);
        }
      }
    }
    input {
      color: var(--fg-secondary);
      @include input-placeholder {
        color: var(--fg-tertiary);
      }
    }
  }
  &__button {
    &__icon {
      fill: hsl(47, 100%, 48%);
    }
  }
  &__close-button.button {
    margin-left: auto;
    margin-top: -$base-space * 2;
    padding: calc($base-space / 2);
    @include font-size(12px);
  }
  &__button-submit.button {
    padding: $base-space;
  }
  &__error {
    display: block;
    margin-top: $base-space;
    color: $color-error;
    @include font-size(12px);
  }
}
.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.3s;
}
.slide-right-enter,
.slide-right-leave-to {
  transform: translateX(50px);
}
</style>
