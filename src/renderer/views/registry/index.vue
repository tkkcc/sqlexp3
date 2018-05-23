<template>
  <div class="app-container">
    <!-- {{room}} -->
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

    <el-table :data="data" v-loading='loading' ref='table' fit @row-click='toggleExpand' highlight-current-row>
      <el-table-column type="expand">
        <template slot-scope="props">
          <div v-for='(i,index) in props.row.consumption' class='consumption'>
            <!-- <span>{{props.row.storeId}} </span> -->
            <!-- <span>{{i.id}} </span> -->
            <span>{{i.info}} </span>
            <span>{{i.total}} </span>
            <!-- <span>{{i.paid}} </span> -->
            <!-- <span>{{i.paydate}} </span> -->
            <el-button class='paid-btn' :type="i.paid ===1?'danger':'success'" plain size='mini' @click.native='togglePaid(i.customerId,index)'>{{i.paid ===1?'not paid':(i.paydate)}}</el-button>

            <!-- <el-tag class='consumption-status' size="small" >Small</el-tag> -->
          </div>
          <!-- <p>State: {{ props.row.storeId }}</p>
        <p>City: {{ props.row.roomId }}</p>
        <p>Address: {{ props.row.start }}</p>
        <p>Zip: {{ props.row.zip }}</p> -->
        </template>
      </el-table-column>
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

    <el-dialog :visible.sync="dialogVisible">
      <!-- <el-tag size="mini">Mini</el-tag> -->

      <div v-if='dialogStatus==="create"'>
        <span>roomId: {{ form.roomId}}</span>
        <p>{{roomInfo}}</p>
        <el-radio-group v-model="form.roomId" class="room-select" size="small" fill='#00bcd4' text-color='#fff'>

          <el-radio-button v-for='r in room' :label='r.label' :disabled='r.disabled'></el-radio-button>
        </el-radio-group>
      </div>
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
import {
  raw,
  fetchRoom,
  findRegistry,
  delRegistry,
  createRegistry,
  updateRegistry,
  fetchFieldRegistry,
  countRegistry,
  fetchConsumption,
  togglePaid
} from '@/api/sql'
export default {
  name: 'registry',
  // props: ['name'],
  data() {
    return {
      tableMap: {
        checkin: 'checkin',
        customer: 'customer',
        consumption: 'consumption'
      },
      name: 'checkin',
      newFilter: {
        key: '',
        operator: '',
        value: '',
        linker: 'and'
      },
      room: [],
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
    fetchFieldRegistry().then(r => {
      this.field = r
    })
    this.fetchCount()
    this.fetchData()
  },
  methods: {
    toggleExpand(row, e) {
      if (!e.target.className.includes('cell')) return
      this.$refs.table.toggleRowExpansion(row)
    },
    togglePaid(customerId, index) {
      this.$refs.table.toggleRowExpansion()
      const x = this.data.find(i => i.customerId === customerId).consumption[
        index
      ]
      togglePaid(x)
        .then(r => {
          // Object.keys(r).forEach(k=>{
          //   this.$set(x,k,r[k])
          // })
          // console.log(r)
          // x=r
          Object.assign(x, r)
          if (r.paid === 0)
            this.$notify({
              title: 'pay success',
              // message: e.sqlMessage,
              type: 'success'
            })
          // console.log(x)
          // x.paid=
        })
        .catch(e => {
          this.$notify({
            title: 'toggle paid fail',
            message: e.sqlMessage,
            type: 'error'
          })
        })
    },
    fetchCount() {
      countRegistry(this.filter).then(r => {
        this.total = r
      })
    },
    fillDefault() {
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
      updateRegistry(this.form)
        .then(_ => {
          Object.assign(this.data[this.index], this.form)
          this.$notify({
            title: 'update success',
            // message: 'update success',
            type: 'success'
          })
        })
        .catch(e => {
          // this.data[this.index] = t
          this.$notify({
            title: 'update fail',
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
      createRegistry(this.form)
        .then(_ => {
          this.$notify({
            title: 'create success',
            // message: 'create success',
            type: 'success'
          })
        })
        .catch(e => {
          // this.data.shift()
          this.$notify({
            title: 'create fail',
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
      delete this.form.consumption
      // console.log(this.form)
      this.dialogStatus = 'update'
      this.dialogVisible = true
      this.index = index
      this.$nextTick(() => {
        this.$refs['form'].clearValidate()
      })
    },
    handleCreate() {
      fetchRoom()
        .then(r => {
          // console.log(r)
          this.room = r
        })
        .catch(e => {
          this.$notify({
            title: 'fetch room info fail',
            message: e.sqlMessage,
            type: 'error'
          })
        })
      this.field.forEach(k => (this.form[k] = ''))
      delete this.form.customerId
      delete this.form.consumption
      delete this.form.roomId
      delete this.form.storeId
      delete this.form.id
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
      delRegistry(this.data[index])
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
      findRegistry(this.pagination, this.filter).then(r => {
        this.data = r
        fetchConsumption(this.data.map(i => i.customerId)).then(r => {
          r.forEach(x => {
            const a = this.data.find(i => i.customerId === x.customerId)
            if (!a.hasOwnProperty('consumption')) a.consumption = []
            a.consumption.push(x)
          })
        })
      })
      this.loading = false
    }
  },
  computed: {
    roomInfo() {
      const r = this.room.find(i => i.id == this.form.roomId)
      if (!r) return
      this.form.storeId = r.storeId
      return r.level + ' 可容纳' + r.num + '人 价格:' + r.price
    }
  }
}
</script>
<style scoped>
/* .paid-btn{
  display: block;
  width: 20em;
} */
/* .paid-btn{
  display: block;
  width: 20em;
} */
/* .room-tag{
  width: 100px,
} */
/* .room-select > * {
  width: 100px;
} */
.consumption {
  display: flex;
}
.consumption > span {
  flex: 2;
  /* width: 40em; */
}
.consumption > .paid-btn {
  flex: 3;
  /* width: 40em; */
}

.consumption-status {
  /* cursor: pointer; */
}
.consumption-status:hover {
  /* box-shadow: 1px 1px 5px 1px black */
}
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
