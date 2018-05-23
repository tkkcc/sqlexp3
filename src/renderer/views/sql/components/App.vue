<template>
  <div id='app'>
    <i class='el-icon-close close' @click="require('electron').remote.getCurrentWindow().close()"></i>
    <div class="container">
      <div class='header'>
        <el-row :gutter="0">
          <el-col :span=18 :offset=3>
            <el-steps :active=steps_active finish-status=success :span=18 align-center class='steps'>
              <el-step class='step' :title="sqlConnection?sqlSetting.user+'@'+sqlSetting.host+':'+sqlSetting.port.toString():'SQL'" @click.native='tabClick(1)'>
                <span class='description' slot='title'>{{sqlConnection?sqlSetting.user+'@'+sqlSetting.host+':'+sqlSetting.port.toString():'SQL'}}</span>
                <!-- <span class='description' slot='description'>{{sqlConnection?'':'Connect to Mysql / Mariadb:'}}</span> -->
                <font-awesome-icon :icon="['fas', 'cloud']" slot='icon' class='step-icon' />
              </el-step>
              <el-step class='step' :title="dbConnection?database:'Database'" @click.native='tabClick(2)'>
                <!-- <span class='description' slot='description'>{{dbConnection?'':'select database'}}</span> -->
                <span class='description' slot='title'>{{dbConnection?database:'Database'}}</span>
                <font-awesome-icon :icon="['fas', 'database']" slot='icon' class='step-icon' />
              </el-step>
              <el-step class='step' :title="tbConnection?titleFormater(table,20):'Table'" @click.native='tabClick(3)'>
                <span class='description' slot='title'>{{tbConnection?titleFormater(table,20):'Table'}}</span>
                <!-- <span class='description' slot='description'>{{tbConnection?'':'select table'}}</span> -->
                <font-awesome-icon :icon="['fas', 'table']" slot='icon' class='step-icon' />
              </el-step>
            </el-steps>
          </el-col>
        </el-row>
      </div>

      <div class='main'>
        <!-- sql connection -->
        <transition name='el-fade-in-linear'>
          <div v-show="page===1" class='slide slide-sql'>
            <el-form :model='sqlSetting' :rules='rules' ref='sqlSetting' label-width='10em' status-icon @keyup.enter.native='connectSql' @dblclick.native="connectSql">
              <el-form-item label='Host' prop='host'>
                <el-input v-model='sqlSetting.host' clearable></el-input>
              </el-form-item>
              <el-form-item label='Port' prop='port'>
                <el-input v-model.number='sqlSetting.port' clearable></el-input>
              </el-form-item>
              <el-form-item label='User' prop='user'>
                <el-input v-model='sqlSetting.user' clearable></el-input>
              </el-form-item>
              <el-form-item label='Password' prop='password'>
                <el-input type='password' v-model='sqlSetting.password' clearable></el-input>
              </el-form-item>
            </el-form>
          </div>
        </transition>

        <!-- database select -->
        <transition name='el-fade-in-linear'>
          <div v-show='page===2' class='slide slide-db'>
            <p class='hint' v-show='!sqlConnection'>please connect to sql first!</p>
            <ul class="list">
              <li class='item' v-for='db in dbList' :key='db' @click='selectDatabase(db)'>{{ db }}</li>
            </ul>
          </div>
        </transition>
        <transition name='el-fade-in-linear'>
          <div v-show='page===3' class='slide slide-tb'>
            <!-- todo change to $message -->
            <p class='hint' v-if='!sqlConnection' key='message1'>please connect to sql first!</p>
            <p class='hint' v-else-if='!dbConnection' key='message2'>please select database first!</p>
            <ul v-else class="list">
              <li class='item' v-for='tb in tbList' :key='tb' @click='selectTable(tb)'>{{ tb }}</li>
            </ul>
          </div>
        </transition>
        <!-- table -->
        <transition name='el-fade-in-linear'>
          <div v-show='page===4' class='slide slide-data'>
            <el-popover class='filter-popover' ref="filter-pover" placement="top-left" trigger="click" visible-arrow='false'>
              <span v-for='(filter,index) in tableFilters' :key='index' class="filter-tag-all">
                <!-- filter -->
                <el-tag class='filter-tag' disable-transitions>
                  <el-checkbox v-model="filter.active">
                  </el-checkbox>
                  <span class='tag-text' @click='editTag(filter,index)'>
                    {{ filter.key+' '+filter.operator+' '+filter.value }}
                  </span>
                  <i class='el-icon-close tag-close' @click='removeFilter(index)'></i>
                </el-tag>
                <!-- linker -->
                <span v-if='index!=tableFilters.length-1' class='tag-text linker-tag' @click='toggleLinker(index)'>{{ filter.linker}}</span>
              </span>
              <el-row type='flex' justify-content='center' id='new-filter-input'>

                <!-- select field/key -->
                <el-select v-model="newFilter.key" size="small" placeholder="field" auto-complete filterable default-first-option @keyup.enter.native="addFilter" @change='fillDefault'>
                  <el-option v-for="field in tableFields" :key="field" :label="field" :value="field"> </el-option>
                </el-select>

                <!-- select/input operator -->
                <el-select v-model="newFilter.operator" size="small" filterable allow-create placeholder="select operator" auto-complete default-first-option>
                  <el-option label='=' value='='> </el-option>
                  <el-option label='>' value='>'> </el-option>
                  <el-option label='>=' value='>='> </el-option>
                  <el-option label='<' value='<'> </el-option>
                  <el-option label='<=' value='<='> </el-option>
                  <el-option label='<>' value='<>'> </el-option>
                  <el-option label='like' value='like'> </el-option>
                  <el-option label='not like' value='not like'> </el-option>
                </el-select>

                <el-input v-model="newFilter.value" size="small" placeholder="value" @keyup.enter.native="addFilter" @dblclick.native='addFilter'>
                </el-input>
              </el-row>
              <p v-text='queryString' id='sql-text'></p>
            </el-popover>
            <el-row type='flex' justify="center" v-popover:filter-pover>
              <p v-text='this.table?queryString:""' id='filter-triger' v-popover:filter-pover></p>
            </el-row>
            <!-- <el-table :data='tableData' border empty-text='no data' class='data-table' :height="(windowHeight-200)">
              <el-table-column v-for='(field,index) in tableFields' :prop='field' :label='field' :key='index' align='center' sortable></el-table-column>
            </el-table> -->
            <div class="clusterize" v-loading='tableLoading'>
              <table>
                <thead class='table-head'>
                  <tr>
                    <th v-for="field in tableFields" :key='field'>{{ field}}</th>
                  </tr>
                </thead>
              </table>
              <div id="scrollArea" class="clusterize-scroll">
                <table>
                  <tbody id="contentArea" class="clusterize-content">
                    <tr class="clusterize-no-data">
                      <td>Loading data…</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <span class='table-info'>{{tableInfo}}</span>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script>
import Clusterize from 'clusterize.js'
import _ from 'lodash'
import mysql from 'mysql'
import { throws } from 'assert'
import {
  clearTimeout,
  clearInterval,
  clearImmediate,
  setInterval
} from 'timers'
import { link } from 'fs'
let connection = false
export default {
  data: () => ({
    skipCount: 0,
    limitCount: 100,
    tableLoading: true,
    windowHeight: window.innerHeight,
    ping: false,
    preventFill: false,
    fieldType: {},
    newFilter: {
      key: '',
      operator: '',
      value: '',
      linker: 'and'
    },
    page: 1,
    sqlSetting: {
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: ''
    },
    database: '',
    table: '',
    sqlConnection: false,
    dbConnection: false,
    tbConnection: false,
    dbList: [],
    tbList: [],
    tableFilters: [],
    tableFields: [],
    tableData: [],
    dataCount: 0,
    rules: {
      host: [
        {
          required: true,
          message: 'Please input host',
          trigger: 'blur'
        }
      ],
      port: [
        {
          required: true,
          message: 'Please input port',
          trigger: 'blur'
        },
        { type: 'number', message: 'age must be a number' }
      ],
      user: [
        {
          required: true,
          message: 'user is required',
          trigger: 'blur'
        }
      ],
      password: [
        {
          required: true,
          message: 'password is required',
          trigger: 'blur'
        }
      ]
    }
  }),
  mounted() {
    let that = this
    this.$nextTick(function() {
      window.addEventListener('resize', function(e) {
        that.windowHeight = window.innerHeight
        if (this.clusterize) this.clusterize.refresh()
      })
    })
    this.clusterize = new Clusterize({
      scrollId: 'scrollArea',
      contentId: 'contentArea',
      callbacks: {
        scrollingProgress: _.debounce(() => {
          if (!this.scrollLoadingMode) return
          const progress = this.clusterize.getScrollProgress() // for
          this.skipCount = Math.round(progress * this.dataCount / 100)
          console.log(progress + ' ' + this.dataCount + ' ' + this.skipCount)
          if (this.tableData[this.skipCount + this.limitCount / 2] != undefined)
            return
          this.tableLoading = true
          this.fetchData({ scrollTop: true })
        }, 150)
      }
    })
  },
  methods: {
    loading() {
      const loading = this.$loading({
        lock: true,
        text: 'Loading',
        spinner: 'el-icon-loading'
      })
      setTimeout(() => {
        loading.close()
      }, 2000)
    },
    toggleLinker(index) {
      const l = this.tableFilters[index]
      l.linker = l.linker === 'or' ? 'and' : 'or'
    },
    editTag(filter, index) {
      this.preventFill = true
      const t = this.newFilter
      t.key = filter.key
      t.value = filter.value
      t.operator = filter.operator
    },
    handleFetch(page) {
      if (page === 2) {
        this.fetchDatabase()
      } else if (page === 3) {
        this.fetchTable()
      }
    },
    tabClick(page) {
      if (this.page === page) {
        this.handleFetch(page)
      } else {
        this.page = page
      }
    },
    fillDefault() {
      if (this.preventFill || this.tableData.length === 0) {
        this.preventFill = false
        return
      }
      if (!this.scrollLoadingMode)
        this.newFilter.value = this.tableData[0][this.newFilter.key]
      this.newFilter.operator = '>'
    },
    addFilter() {
      const t = this.newFilter
      if (t.value === '' || t.key === '' || t.operator === '') return
      const filter = Object.assign({ active: true }, t)
      this.tableFilters.push(filter)
    },
    removeFilter(index) {
      this.tableFilters.splice(index, 1)
    },
    titleFormater: (str, len = 10) =>
      str.length > len ? str.slice(0, len - 3) + '...' : str.padEnd(len),
    selectDatabase(db) {
      if (!connection) return false
      connection.query(`use ${db}`, (err, results, fields) => {
        if (err) {
          if (err.code === 'ER_BAD_DB_ERROR') {
            this.fetchDatabase()
          } else {
            this.page = 1
            this.sqlConnection = false
          }
          return false
        }
        // success
        this.database = db
        this.page = 3
        this.dbConnection = true
      })
    },
    selectTable(tb) {
      if (!connection || !tb) return false
      this.table = tb
      this.tableFilters = []
      this.fetchField()
      this.fetchData({ first: true })
    },
    connectSql() {
      const new_connection = mysql.createConnection(this.sqlSetting)
      new_connection.connect(err => {
        if (err) {
          this.$message({
            showClose: true,
            message: `${err.code}`,
            type: 'error',
            duration: 3000
          })
          this.sqlConnection = false
          return false
        }
        if (connection) {
          connection.end()
        }
        connection = new_connection
        this.sqlConnection = true
        this.page = 2
      })
      this.dbConnection = false
      this.tbConnection = false
    },
    fetchDatabase() {
      connection.query('show databases', (error, results) => {
        if (error) return
        this.dbList = results.map(result => result['Database'])
      })
    },
    fetchField() {
      connection.query(
        `show fields from ${this.table}`,
        (error, results, fields) => {
          if (error) return
          this.tableFields = results.map(result => result.Field)
          this.fieldType = results.reduce(
            (a, c) => (a.set(c.Field, c.Type), a),
            new Map()
          )
          this.newFilter.key = this.tableFields[0]
        }
      )
    },
    fetchTable() {
      connection.query('show tables', (error, results) => {
        if (error) return
        this.tbList = results.map(result => Object.values(result)[0])
      })
    },
    async fetchData(first = false, scrollTop = false) {
      if (scrollTop) {
        document.querySelector('#scrollArea').scrollTop = 0
      }
      if (first) {
        this.page = 4
        this.tableLoading = true
        await this.fetchCount()
        // todo async
      }
      let query = this.queryString
      if (this.scrollLoadingMode) {
        query += ` limit ${this.skipCount}, ${this.limitCount}`
      }
      connection.query(query, (error, results, fields) => {
        if (error) return
        this.tbConnection = true
        if (this.scrollLoadingMode) {
          this.tableData = Array(this.dataCount)
          for (let i = 0; i < this.limitCount; ++i) {
            let tr = ``
            tr += '<tr>'
            Object.values(results[i]).forEach(i => {
              tr += `<td>${i}</td>`
            })
            tr + '</tr>'
            this.tableData[this.skipCount + i - 1] = tr
          }
        } else {
          this.tableData = results
        }
        if (first) this.fillDefault()
      })
    },

    fetchCount() {
      return new Promise((resolve, reject) => {
        connection.query(
          `SELECT COUNT(*) FROM ${this.table}`,
          (error, results) => {
            if (error) {
              reject(-1)
            }
            this.dataCount = Object.values(results[0])[0]
            resolve(this.dataCount)
          }
        )
      })
    }
  },
  computed: {
    scrollLoadingMode() {
      return this.dataCount > 20000
    },
    tableInfo() {
      let info = ''
      if (this.dataCount <= 0) return
      info += ('total:' + this.dataCount).padEnd(13, ' ')
      const date = new Date()
      info +=
        'last update:' +
        date.getHours() +
        ':' +
        date.getMinutes() +
        ':' +
        date.getSeconds()
      return info
    },
    queryString() {
      const t = this.tableFilters.filter(
        i => i.active && this.fieldType.has(i.key) && i.value && i.operator
      )
      const prefix = `select * from ${this.table}`
      let query = ''
      for (let i = 0; i < t.length; ++i) {
        let { key, operator, value, linker } = t[i]
        if (this.fieldType.get(key).includes('char'))
          value = JSON.stringify(value)
        query += '(' + key + ' ' + operator + ' ' + value + ')'
        if (i != t.length - 1) query += linker
      }
      return query.length === 0 ? prefix : prefix + ' where ' + query
    },
    steps_active() {
      return !this.sqlConnection
        ? 0
        : !this.dbConnection ? 1 : !this.tbConnection ? 2 : 3
    }
  },
  watch: {
    tableData() {
      let newData
      if (!this.scrollLoadingMode)
        newData = this.tableData.map(d => {
          let tr = ``
          tr += '<tr>'
          Object.values(d).forEach(i => {
            tr += `<td>${i}</td>`
          })
          return tr + '</tr>'
        })
      else {
        newData = this.tableData
      }
      this.clusterize.update(newData)
      this.tableLoading = false
    },
    page(page) {
      this.handleFetch(page)
    },
    queryString() {
      this.fetchData()
    }
  },

  beforeDestroy() {
    connection.end()
  }
}
</script>

<style scoped>
/* CSS */
/* :root {
  --header-height: 8em;
  --bottom-height: 3em;
} */
:not(input):not(textarea),
:not(input):not(textarea)::after,
:not(input):not(textarea)::before {
  -webkit-user-select: none;
  user-select: none;
  cursor: default;
}
input,
button,
textarea,
:focus {
  outline: none;
}
html,
body {
  margin: 0;
  padding: 0;
  height: 100%;
}
* {
  font-family: sans-serif;
  box-sizing: border-box;
}
.container {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
}
.header {
  margin-top: 1em;
  display: block;
  height: 3em;
}
.step {
  cursor: pointer;
  min-width: 0;
  margin: 0;
}
.description {
  display: inline-block;
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.main {
  position: fixed;
  top: 5em;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.slide {
  top: 3em;
  position: absolute;
}

.slide-sql {
  margin-left: -3em;
  width: 50%;
}
.slide-db {
  width: 70%;
  padding-right: 2em;
}
.slide-tb {
  bottom: 3em;
  width: 70%;
  overflow: auto;
}
.item {
  text-align: center;
  list-style: none;
  color: silver;
  border-bottom: 1px solid silver;
  padding: 0.5em 0;
  cursor: pointer;
}
.item:hover {
  color: slategrey;
}

.close {
  z-index: 1;
  position: absolute;
  top: 0;
  right: 0;
  font-size: 2em;
  color: slategray;
}
.close:hover {
  background-color: tomato;
  color: snow;
}
.filter-tag {
  margin: 0.2em 0.5em;
}

.tag-close {
  color: slategray;
}
.tag-close:hover {
  background-color: tomato;
  color: snow;
}

#filter-triger {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
  color: silver;
}
.truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
#filter-triger:hover {
  color: gray;
}
#new-filter-input > * {
  margin: 0.2em 0.5em;
}
.table-info {
  white-space: pre;
  position: absolute;
  bottom: 0;
  color: lightslategray;
}
.tag-text {
  cursor: pointer;
}
#sql-text {
  border: solid slategray;
  border-width: 1px 0;
  padding: 1em 1em;
}

.linker-tag {
  margin-left: -0.5em;
}
::-webkit-scrollbar {
  background-color: #fff;
  width: 0.3em;
  height: 0.3em;
}

::-webkit-scrollbar-thumb:window-inactive,
::-webkit-scrollbar-thumb {
  background: slateblue;
}
.clusterize-scroll {
  max-height: 100%;
}
.clusterize {
  height: 100%;
  padding-bottom: 7em;
}
.slide-data {
  top: 0;
  bottom: 3em;
  width: 80%;
  overflow: hidden;
}
table {
  border-collapse: collapse;
  width: 100%;
  table-layout: fixed;
}

td,
th {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: left;
  padding: 0.4em;
}
.step * {
  cursor: pointer;
}
/* .step-icon::after{
  cursor: pointer;
} */
.table-head {
  border-bottom: 2px solid slateblue;
}
.hint {
  display: flex;
  justify-content: center;
  /* margin: 0 auto; */
}
</style>