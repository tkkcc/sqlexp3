<template>
  <div class="dashboard-editor-container">
    <!-- <github-corner></github-corner> -->

    <!-- <panel-group @handleSetLineChartData="handleSetLineChartData"></panel-group> -->
    <el-row :gutter="32">
      <el-col :xs="24" :sm="24" :lg="8" v-for='k in Object.keys(room)'>

        <div class=" room-info ">
          <span class="room-header">
            {{k}}
          </span>
          <div class="room-detail">
            空闲{{room[k]['已清理']||0}} / 已满{{room[k]['已满']||0}} / 待清理{{room[k]['待清理']||0}}
          </div>
          <!-- {{room[k]}} -->
          <!-- <raddar-chart></raddar-chart> -->
        </div>
      </el-col>
    </el-row>
    <el-row class="wrapper">
      <h2 class='checkin-header'>checkin statistics</h2>
      <line-chart :chart-data="chart"></line-chart>
    </el-row>
    <div class="wrapper">
      <h2 class='checkin-header'>recent 30 consumption</h2>
      <el-table :data="consumption">
        <el-table-column v-for='k in Object.keys(consumption[0])' :prop=k :label=k></el-table-column>
      </el-table>

      <!-- <ul>
        <li v-for='c in consumption'>
          <span v-for='k in Object.keys(c)'>
            {{c[k]}}
          </span>
        </li>
      </ul> -->

    </div>
    <!-- {{room}} {{checkin}} {{consumption}} -->

  </div>
</template>

<script>
import LineChart from './components/LineChart'
import { fetchDashboard } from '@/api/sql'
import checkinVue from '../sql/checkin.vue'
export default {
  name: 'dashboard',
  components: { LineChart },
  data() {
    return {
      chart: {},
      room: {},
      checkin: [],
      consumption: [{}]
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      fetchDashboard().then(({ room, checkin, consumption }) => {
        // console.log(room)
        // console.log(checkin)
        // console.log(consumption)
        // Object.assign(this.chart, checkin)
        Object.keys(checkin).forEach(k => {
          this.$set(this.chart, k, checkin[k])
        })
        this.room = room
        this.consumption = consumption
        // this.checkin=checkin
      })
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.dashboard-editor-container {
  padding: 32px;
  background-color: rgb(240, 242, 245);
  .wrapper {
    background: #fff;
    padding: 16px 16px 0;
    margin-bottom: 32px;
  }
}
.checkin-header {
  margin: 0 0;
  color: slateblue;
}
.room-info {
  padding: 1em;
  padding-top: 0;
  background-color: white;
  margin-bottom: 1em;
  // font-size: 2em;
}
.room-detail {
  color: silver;
}
.room-header {
  // padding: 0.5em;
  color: slategray;
  // margin: 0.25em;
  line-height: 2em;
  // color: white;
  // background: slategrey;
  font-size: 2em;
}
</style>
