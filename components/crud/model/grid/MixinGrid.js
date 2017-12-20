import { Data } from 'genesis'
import { undo } from 'genesis/support/message/index'
import { wildcard } from 'genesis/support/utils/index'

export default {
  props: {
    scope: {
      type: String,
      default: () => 'index'
    },
    messages: {
      type: Object,
      default: () => ({
        read: '',
        delete: 'Registro apagado com sucesso'
      })
    },
    handlers: {
      type: Object,
      default () {
        return {
          read: (response) => {
            const populateGrid = Data.get('grid')
            populateGrid(this, response)
          },
          delete: (response) => {
            undo(wildcard(this.messages.delete, this.$http.$body(response)), () => {
              // window.alert('Undo')
            })
            this.browse(this.path)
          }
        }
      }
    },
    position: {
      type: String,
      default: () => 'left'
    },
    slots: {
      type: Array,
      default: () => ([])
    },
    filters: {
      type: Array,
      default: () => ([])
    },
    paginate: {
      type: Boolean,
      default: () => true
    },
    toolbar: {
      type: Object,
      default: () => ({
        pagination: {
          top: {
            show: false,
            className: 'top-navigation',
            elementsPaginate: {
              pagination: {
                show: true,
                className: 'has-25 xs-70'
              },
              select: {
                show: true,
                className: 'has-15 xs-30'
              },
              info: {
                show: true,
                className: 'has-15 xs-30'
              }
            }
          },
          bottom: {
            show: true,
            className: 'bottom-navigation',
            elementsPaginate: {
              pagination: {
                show: true,
                className: 'has-25 xs-70'
              },
              select: {
                show: true,
                className: 'has-15 xs-30'
              },
              info: {
                show: true,
                className: 'has-20 hidden-small'
              }
            }
          }
        }
      })
    },
    unity: {
      type: String,
      default: () => 'vw'
    },
    filtering: {
      type: Boolean,
      default: () => true
    },
    styles: {
      type: Object,
      default: () => ({
        height: 'calc(100vh - 290px)',
        minHeight: '200px'
      })
    },
    bodyStyle: {
      type: Object,
      default: () => ({
        height: 'calc(100vh - 330px)',
        minHeight: '170px'
      })
    },
    limiting: {
      type: Number,
      default: () => (25)
    },
    content: {
      type: String,
      default: () => ('app-data-table')
    }
  },
  data: () => ({
    fields: [],
    columns: [],
    data: [],
    page: 1,
    pages: 1,
    limit: 25,
    total: 1
  }),
  computed: {
    classNames () {
      const classNames = []
      if (this.className) {
        classNames.push(this.className)
      }
      if (this.$route.name) {
        classNames.push(String(this.$route.name).replace(/\./g, '_'))
      }
      if (this.filter.active) {
        classNames.push('--grid-filtering')
      }
      return classNames
    }
  },
  methods: {
    /**
     */
    renderElements () {
      this.fields = this.schemas.filter(this.filterColumns).map(this.mapColumns).sort(this.sortColumns)

      if (this.buttons.middle.length) {
        let method = 'unshift'
        if (this.position === 'right') {
          method = 'push'
        }
        this.fields[method]({field: 'options', label: 'Opções', width: '70px'})
      }

      this.columns = this.fields.filter(field => !field.hidden)
    },
    /**
     * @param {Object} item
     * @param {Number} index
     * @returns {Object}
     */
    mapColumns (item, index) {
      const assign = {
        field: item.grid.field,
        order: item.grid.order || index,
        width: typeof item.grid.width === 'number' ? item.grid.width + this.unity : item.grid.width
      }
      return Object.assign({}, item.grid, assign)
    },
    /**
     * @param {Object} item
     * @returns {Object}
     */
    filterColumns (item) {
      return item.scopes.includes(this.scope)
    },
    /**
     * @param {Object} a
     * @param {Object} b
     */
    sortColumns (a, b) {
      if (a.order < b.order) {
        return -1
      }
      if (a.order > b.order) {
        return 1
      }
      return 0
    },
    /**
     * @returns {boolean}
     */
    isPaginated () {
      return this.paginate
    },
    /**
     * @param {int} page
     */
    changePage (page) {
      this.page = page
      this.browse(this.path, {page: this.page, limit: this.limit})
    },
    /**
     * @param {int} limit
     */
    changeLimit (limit) {
      this.limit = limit
      this.changePage(1)
    },
    /**
     * @param {boolean} noCache
     */
    fetchData (noCache = false) {
      const filters = Object.keys(this.filter.record).reduce((accumulate, key) => {
        let value = this.filter.record[key]
        if (this.filter.rules[key]) {
          value = this.filter.rules[key] + this.separator + value
        }
        accumulate[key] = value
        return accumulate
      }, {})

      /**
       * @type {Function}
       */
      const configure = Data.get('search')

      const search = () => {
        this.search(configure(this.page, this.limit, filters), {noCache})
      }

      window.setTimeout(search, this.timeout)
    },
    /**
     * @param {AxiosResponse} response
     * @param {string} method
     * @param {Function} callback
     */
    then (response, method, callback = null) {
      if (this.handlers[method]) {
        this.handlers[method](response)
      }
      if (typeof callback === 'function') {
        callback(response)
      }
    }
  },
  created () {
    if (this.$route.query.page) {
      this.page = parseInt(this.$route.query.page)
      this.pages = parseInt(this.$route.query.page)
    }
    this.limit = this.limiting
    if (this.$route.query.limit) {
      this.limit = parseInt(this.$route.query.limit)
    }
    this.renderAll()
    this.renderFilters()
    this.loadFilters()
  },
  mounted () {
    this.fetchData()
  }
}
