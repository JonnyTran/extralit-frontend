<template>
  <section class="config-form">
    <div class="config-form__content">
      <div class="config-form__col-wrapper">
        <div
          class="config-form__col"
          v-if="dataset.selectedSubset.fields.length"
        >
          <div class="config-form__col__header">
            {{ $t("datasetCreation.fields") }}
            <div class="config-form__subset" v-if="dataset.subsets.length > 1">
              {{ $t("datasetCreation.subset") }}:
              <DatasetConfigurationSelector
                class="config-form__selector"
                :options="dataset.subsets"
                :value="dataset.selectedSubset.name"
                @onValueChange="$emit('change-subset', $event)"
              >
                <template slot="optionsIntro">
                  <span class="config-form__selector__intro">{{
                    $t("datasetCreation.selectSubset")
                  }}</span>
                </template>
              </DatasetConfigurationSelector>
            </div>
          </div>
          <div class="config-form__col__content">
            <draggable
              class="config-form__draggable-area"
              :list="dataset.selectedSubset.fields"
              :group="{ name: 'fields' }"
              ghost-class="config-form__ghost"
              :disabled="isFocused"
            >
              <transition-group
                class="config-form__draggable-area-wrapper"
                type="transition"
                :css="false"
              >
                <DatasetConfigurationField
                  v-for="field in dataset.selectedSubset.fields.filter(
                    (f) => f.name !== dataset.mappings.external_id
                  )"
                  :key="field.name"
                  :field="field"
                  :available-types="
                    availableFieldTypes.filter(
                      (a) =>
                        a.value === 'no mapping' ||
                        a.value === field.originalType.value
                    )
                  "
                  @is-focused="isFocused = $event"
                />
              </transition-group>
            </draggable>
          </div>
        </div>
      </div>
      <div class="config-form__col-wrapper">
        <div class="config-form__col">
          <div class="config-form__col__header">
            {{ $t("datasetCreation.questionsTitle") }}
            <DatasetConfigurationAddQuestion
              :options="[
                'text',
                'label_selection',
                'multi_label_selection',
                'rating',
                'ranking',
                'span',
              ]"
              @add-question="addQuestion($event)"
            />
          </div>
          <div class="config-form__col__content --questions">
            <draggable
              v-if="dataset.selectedSubset.questions.length"
              class="config-form__draggable-area"
              ghost-class="config-form__ghost"
              :list="dataset.selectedSubset.questions"
              :group="{ name: 'questions' }"
              :disabled="isFocused"
            >
              <transition-group
                class="config-form__draggable-area-wrapper"
                type="transition"
                :css="false"
              >
                <DatasetConfigurationQuestion
                  v-for="question in dataset.selectedSubset.questions"
                  :key="question.name"
                  :selectedSubset="dataset.selectedSubset"
                  :question="question"
                  :remove-is-allowed="true"
                  :available-types="availableQuestionTypes"
                  @change-type="onTypeIsChanged(question.name, $event)"
                  @is-focused="isFocused = $event"
                />
              </transition-group>
            </draggable>
          </div>
        </div>
        <div class="config-form__button-area">
          <BaseButton
            class="primary"
            @click.prevent="
              visibleDatasetCreationDialog = !visibleDatasetCreationDialog
            "
            >{{ $t("datasetCreation.button") }}</BaseButton
          >
          <DatasetConfigurationDialog
            v-if="visibleDatasetCreationDialog"
            :dataset="dataset"
            :is-loading="isLoading"
            @close-dialog="visibleDatasetCreationDialog = false"
            @create-dataset="createDataset"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { useDatasetConfigurationForm } from "./useDatasetConfigurationForm";

export default {
  props: {
    dataset: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      isFocused: false,
      visibleDatasetCreationDialog: false,
    };
  },
  computed: {
    getMaxNumberInNames() {
      return Math.max(
        ...this.dataset.selectedSubset.questions.map((question) => {
          const numberInName = question.name.split("_").pop();
          return parseInt(numberInName) || 0;
        })
      );
    },
  },
  methods: {
    createDataset() {
      this.create(this.dataset);
    },
    generateName(type, number) {
      const typeName = this.$t(`config.questionId.${type}`);
      return `${typeName}_${parseInt(number) || 0}`;
    },
    addQuestion(type) {
      const questionName = this.generateName(
        type,
        this.getMaxNumberInNames + 1
      );
      this.dataset.selectedSubset.addQuestion(questionName, {
        type,
      });
    },
    onTypeIsChanged(oldName, type) {
      const numberInName = oldName.split("_").pop();
      const index = this.dataset.selectedSubset.questions.findIndex(
        (q) => q.name === oldName
      );
      this.dataset.selectedSubset.removeQuestion(oldName);
      const newQuestionName = this.generateName(type.value, numberInName);
      this.dataset.selectedSubset.addQuestion(
        newQuestionName,
        {
          type: type.value,
        },
        index !== -1 ? index : undefined
      );
    },
  },
  setup() {
    return useDatasetConfigurationForm();
  },
};
</script>

<style lang="scss" scoped>
.config-form {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: $base-space;
  padding: $base-space * 2;
  &__content {
    display: flex;
    gap: $base-space * 2;
    min-height: 0;
    height: 100%;
    @include media("<tablet") {
      flex-direction: column;
    }
  }
  &__col-wrapper {
    display: flex;
    flex-direction: column;
    gap: $base-space * 2;
    position: relative;
    width: 100%;
    max-width: 440px;
  }
  &__col {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
    background: var(--bg-accent-grey-1);
    border: 1px solid var(--bg-opacity-6);
    border-radius: $border-radius-m;
    &__header {
      display: flex;
      justify-content: space-between;
      min-height: $base-space * 7;
      align-items: center;
      padding: $base-space * 2 $base-space * 2 $base-space $base-space * 2;
      font-weight: 500;
    }
    &__content {
      display: flex;
      flex-direction: column;
      padding: $base-space $base-space * 2 $base-space * 2;
      gap: $base-space;
      overflow: auto;
      height: 100%;
    }
  }
  &__draggable-area {
    display: flex;
    flex-direction: column;
    gap: $base-space;
  }
  &__draggable-area-wrapper {
    display: flex;
    flex-direction: column;
    gap: $base-space;
  }
  &__ghost {
    opacity: 0.5;
  }
  &__selector {
    &__intro {
      display: block;
      padding: 4px;
      background: var(--bg-config-alert);
      @include font-size(12px);
      @include line-height(16px);
    }
  }
  &__subset {
    display: flex;
    gap: $base-space;
    align-items: center;
    font-weight: 400;
  }
  &__button-area {
    display: flex;
    .button {
      width: 100%;
      justify-content: center;
    }
  }
}
</style>
