<template>
  <div class="app-container">
    <!-- filter container -->
    <div class='filter-container'>
      <span v-for='(f,index) in filter' :key='index' class="filter-tag-all">
        <!-- filter -->
        <el-tag class='filter-tag' disable-transitions>
          <el-checkbox v-model="f.active" @change='fetchData()'> </el-checkbox>
          <span class='tag-text'> {{ f.key+' '+f.operator+' '+f.value }} </span>
          <i class='el-icon-close tag-close' @click='removeFilter(index)'></i>
        </el-tag>
        <!-- linker -->
        <span v-if='index!=filter.length-1' class='tag-text linker-tag' @click='toggleLinker(index)'>{{ f.linker}}</span>
      </span>
      <el-row type='flex' class='filter-input' justify-content='center' id='new-filter-input'>
        <!-- select field/key -->
        <el-select v-model="newFilter.key" size="small" placeholder="field" @keyup.enter.native="addFilter" @change='fillDefault'>
          <el-option v-for="f in field" :key="f" :label="f" :value="f"> </el-option>
        </el-select>

        <!-- select/input operator -->
        <!-- {{newFilter.operator}} -->
        <el-select v-model="newFilter.operator" size="small" placeholder="select operator">
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
    </div>

    <el-button class="add-btn" type="primary" @click="handleCreate" icon="el-icon-plus" circle></el-button>
    <!-- </div> -->

    <el-table :data="data" v-loading='loading' border fit highlight-current-row :header-cell-style='headerCellStyle()'>
      <el-table-column v-for="i in field" :prop=i :label=i></el-table-column>
      <el-table-column label="action">
        <template slot-scope="scope">
          <el-button-group>
            <el-button type="info" size="mini" icon="el-icon-edit" @click="handleUpdate(scope.$index)"></el-button>
            <el-button type="danger" size="mini" icon="el-icon-delete" @click="handleDelete(scope.$index)"></el-button>
          </el-button-group>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container">
      <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="pagination.page" :page-sizes="[10,20,50,100]" :page-size="pagination.limit" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </div>

    <el-dialog :visible.sync="dialogVisible" width="80%">
      <el-form ref="form" :model="form" label-position="left">
        <el-form-item v-for='k in Object.keys(form)' :label=k :prop=k>
          <el-input v-model="form[k]"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button v-if="dialogStatus=='create'" type="primary" @click="dataCreate">create</el-button>
        <el-button v-else type="primary" @click="dataUpdate">update</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { find, del, create, update, fetchField, count } from '@/api/sql'
export default {
  props: ['name'],
  data() {
    return {
      newFilter: {
        key: '',
        operator: '',
        value: '',
        linker: 'and'
      },
      filter: [],
      index: 0,
      form: {},
      dialogVisible: false,
      dialogStatus: 'create',
      loading: true,
      field: [],
      data: [],
      total: 0,
      pagination: {
        page: 1,
        limit: 10
      }
    }
  },

  created() {
    fetchField(this.name).then(r => {
      this.field = r
    })
    this.fetchCount()
    this.fetchData()
  },
  methods: {
    fetchCount() {
      count(this.name, this.filter).then(r => {
        this.total = r
      })
    },
    headerCellStyle() {
      return {
        // color:'white',
        // 'font-size':'0.1em',
        // 'line-height':'1em',
        // 'white-space': 'nowrap',
        // 'overflow': 'hidden',
        // 'text-overflow': 'ellipsis',
        // 'text-align': 'left'
      }
    },
    fillDefault() {
      console.log('fill default')
      if (this.data.length === 0) return
      this.newFilter.value = this.data[0][this.newFilter.key]
      this.newFilter.operator = '>'
    },
    toggleLinker(index) {
      const l = this.filter[index]
      l.linker = l.linker === 'or' ? 'and' : 'or'
      this.fetchData()
    },
    addFilter() {
      const t = this.newFilter
      if (t.value === '' || t.key === '' || t.operator === '') return
      const filter = Object.assign({ active: true }, t)
      this.filter.push(filter)
      this.fetchData()
    },
    removeFilter(index) {
      this.filter.splice(index, 1)
      this.fetchData()
    },
    dataUpdate() {
      this.dialogVisible = false
      update(this.name, this.form)
        .then(_ => {
          Object.assign(this.data[this.index], this.form)
          this.$notify({
            title: 'success',
            message: 'update success',
            type: 'success'
          })
        })
        .catch(e => {
          // this.data[this.index] = t
          this.$notify({
            title: 'fail',
            message: e.sqlMessage,
            type: 'error'
          })
        })
        .finally(_ => {
          this.fetchData()
        })
    },
    dataCreate() {
      this.dialogVisible = false
      // this.data.shift(this.form)
      create(this.name, this.form)
        .then(_ => {
          this.$notify({
            title: 'success',
            message: 'create success',
            type: 'success'
          })
        })
        .catch(e => {
          // this.data.shift()
          this.$notify({
            title: 'fail',
            message: e.sqlMessage,
            type: 'error'
          })
        })
        .finally(_ => {
          this.fetchData()
        })
    },
    handleUpdate(index) {
      this.form = Object.assign({}, this.data[index])
      this.dialogStatus = 'update'
      this.dialogVisible = true
      this.index = index
      this.$nextTick(() => {
        this.$refs['form'].clearValidate()
      })
    },
    handleCreate() {
      this.field.forEach(k => (this.form[k] = ''))
      delete this.form['id']
      this.dialogStatus = 'create'
      this.dialogVisible = true
      this.$nextTick(() => {
        this.$refs['form'].clearValidate()
      })
    },

    handleSizeChange(val) {
      this.pagination.limit = val
      this.fetchData()
    },
    handleCurrentChange(val) {
      this.pagination.page = val
      this.fetchData()
    },
    handleDelete(index) {
      // const t = this.data.splice(index, 1)[0]
      del(this.name, this.data[index])
        .then(_ => {
          this.data.splice(index, 1)
          // this.total--
          this.$notify({
            title: 'success',
            message: 'delete success',
            type: 'success'
          })
        })
        .catch(e => {
          // this.data.splice(index, 0, t)
          this.$notify({
            title: 'fail',
            message: e.sqlMessage,
            type: 'error'
          })
        })
        .finally(_ => {
          this.fetchData()
        })
    },
    fetchData() {
      this.fetchCount()
      this.loading = true
      find(this.name, this.pagination, this.filter).then(r => {
        this.data = r
      })
      this.loading = false
    }
  }
}
</script>
<style scoped>
.filter-input {
  padding-top: 0.5em;
}
.filter-container {
  padding-bottom: 0.5em;
  /* margin-bottom: 0.5em; */
  border-bottom: 1.5px solid slateblue;
  /* border-top: 1px solid slateblue; */
}
.add-btn {
  /* box-sizing: border-box; */

  z-index: 2;
  bottom: 2em;
  position: fixed;
  right: 2em;
  /* left: 20%; */
  box-shadow: 1px 1px 10px 0px grey;
}
.add-btn:hover {
  box-shadow: 2px 2px 5px 0px grey;
}
.linker-tag {
  /* margin-left: -0.5em; */
  margin-right: 0.5em;
  color: slategray;
  font-size: 0.8em;
  /* border: 1px solid */
}
</style>
