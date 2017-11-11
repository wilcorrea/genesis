<template>
  <field :class="classNames" v-bind="{id, inline, problems, label, validate, title, tooltip, editable, visible}">
    <div slot="component">
      <div v-show="editable" :class="{'has-error': problems.length}">
        <!--<q-numeric v-model="model" v-bind="bind"></q-numeric>-->
        <div class="q-numeric input" :name="field" :id="id">
          <i class="material-icons" @click="remove(model, step)">remove</i>
          <input type="number" v-model="model" pattern="[0-9]*" :step="step" @input="updateValue"/>
          <i class="material-icons" @click="add(model, step)">add</i>
        </div>
      </div>
      <div v-show="!editable" class="html" v-html="html"></div>
    </div>
  </field>
</template>

<script type="text/javascript">
  import Field from 'genesis/components/fields/components/base.vue'
  import FieldAbstract from 'genesis/components/fields/abstract'

  export default {
    extends: FieldAbstract,
    components: {
      Field
    },
    name: 'field-numeric',
    props: {
      min: {
        type: Number
      },
      max: {
        type: Number
      },
      step: {
        type: Number,
        default: () => 1
      }
    },
    data: () => ({
      updated: false,
      model: undefined
    }),
    computed: {
      bind () {
        return {
          min: this.min,
          max: this.max
        }
      },
      html () {
        return this.model
      }
    },
    methods: {
      /**
       * @param {Number} value
       */
      applyValue (value) {
        if (!this.updated) {
          this.model = value
        }
        this.updated = false
      },
      /**
       */
      updateValue () {
        this.updated = true
        this.$emit('input', this.model)
      },
      /**
       * @param {Number} value
       * @param {Number} step
       */
      add (value, step) {
        this.applyValue(value + step)
      },
      /**
       * @param {Number} value
       * @param {Number} step
       */
      remove (value, step) {
        this.applyValue(value - step)
      }
    },
    watch: {
      value (value) {
        this.applyValue(value)
      },
      mask () {
        this.applyValue(this.value)
      }
    },
    mounted () {
      this.applyValue(this.value)
    }
  }
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
  .field-numeric
    .q-numeric
      display flex
      align-items center
      flex-direction row
      width 100%
      padding 6px
      margin 0
      i
        border 1px solid #ddd
        border-radius 2px
        cursor pointer
        font-size 140%
      input
        width calc(100% - 40px)
        margin 0 5px
        border none
        box-shadow none
        text-align center
        padding 3px 0 0 0
    .html
      height 38px
      color #515151
      padding 9px 8px
      font-size 14.4px
</style>