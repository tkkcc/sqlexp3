// import request from '@/utils/request'
import mysql from 'mysql'

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '0',
  database: 'hotel'
})

connection.connect()
console.log('connection established')

// key = value and key = value 
const objJoin = (o, delimiter = 'and') => Object.entries(o).reduce((a, c, i, arr) => {
  return `${a} \`${c[0]}\` = ${JSON.stringify(c[1])} ${i !== arr.length - 1 ? delimiter : ''}`
}, '')
// key operator value linker
// const filterJoin = (filter) => filter.reduce((a, c, i, arr) => {
//   return `${a} \`${c[0]}\` = ${JSON.stringify(c[1])} ${i !== arr.length - 1 ? delimiter : ''}`
// }, '')
const filterJoin = (filter) => {
  const t = filter.filter(i => i.active && i.value && i.operator)

  let query = ''
  for (let i = 0; i < t.length; ++i) {
    let { key, operator, value, linker } = t[i]
    // if (this.fieldType.get(key).includes('char'))
    value = JSON.stringify(value)
    query += '(' + key + ' ' + operator + ' ' + value + ')'
    if (i != t.length - 1) query += linker
  }
  return query
}
// split primary keys
const splitQuery = o => {
  const x = Object.assign({}, o)
  if (o.hasOwnProperty('id')) {
    delete x['id']
    return ['id = ' + o.id, objJoin(x, ',')]
  } else {
    const y = {}
    Object.keys(x).forEach((k => {
      if (k.toLowerCase().includes('id') && k !== 'identification') {
        y[k] = x[k]
        delete x[k]
      }
    }))
    return [objJoin(y), objJoin(x, ',')]
  }
}

export const find = (table, pagination, filter, pre) => new Promise((resolve, reject) => {
  const page = ' limit ' + pagination.limit + ' offset ' + (pagination.page - 1) * pagination.limit
  const prefix = pre || `select * from ${table}`
  let query = filterJoin(filter)
  query = (query.length === 0 ? prefix : prefix + ' where ' + query) + ' ' + page
  console.log(query)
  connection.query(query, (error, results, fields) => {
    if (error) reject(error)
    // console.log(results);
    resolve(results)
  })
})

export const del = (table, opt) => new Promise((resolve, reject) => {
  connection.query(`delete from ${table} where ${splitQuery(opt)[0]}`, (error, results, fields) => {
    if (error) reject(error)
    resolve(results)
  })
})

export const create = (table, opt) => new Promise((resolve, reject) => {
  delete opt['id']
  connection.query(`insert into ${table} set ${objJoin(opt, ',')}`, (error, results, fields) => {
    if (error) reject(error)
    resolve(results)
  })
})

export const update = (table, opt) => new Promise((resolve, reject) => {
  const b = splitQuery(opt)
  let query = `update ${table} set ${b[1]} where ${b[0]}`
  console.log(query);
  connection.query(query, (error, results, fields) => {
    if (error) reject(error)
    resolve(results)
  })
})

export const fetchField = (table) => new Promise((resolve, reject) => {
  connection.query(`show fields from ${table}`, (error, results, fields) => {
    if (error) reject(error)
    const tableFields = results.map(result => result.Field)
    resolve(tableFields)
  })
})

export const count = (table, filter) => new Promise((resolve, reject) => {
  const prefix = `select count(*) from ${table}`
  let query = filterJoin(filter)
  query = (query.length === 0 ? prefix : prefix + ' where ' + query)
  console.log(query);
  connection.query(query, (error, results, fields) => {
    if (error) reject(error)
    let count = results[0]['count(*)']
    resolve(count || 0)
  })
})

// Registry
export const findRegistry = (pagination, filter) => new Promise((resolve, reject) => {
  const page = ' limit ' + pagination.limit + ' offset ' + (pagination.page - 1) * pagination.limit
  const order = ' order by customerId '
  const prefix = 'select roomId,storeId,customerId,start,duration,num,name,contact from checkin,customer where customer.id=checkin.customerId '
  // const prefix = 'select * from checkin,customer where customer.id=checkin.customerId '
  let query = filterJoin(filter)
  query = (query.length === 0 ? prefix : prefix + ' and ' + query) + order + page
  // console.log(query)
  connection.query(query, (error, results, fields) => {
    if (error) reject(error)
    // console.log(results)
    resolve(results)
  })
})
export const fetchConsumption = (customerId = []) => new Promise((resolve, reject) => {
  // const page = ' limit ' + pagination.limit + ' offset ' + (pagination.page - 1) * pagination.limit
  if (customerId.length === 0) resolve([])
  const order = ' order by customerId '
  const query = 'select id ,info,total,customerId,paid,paydate from consumption where customerId in (' + customerId.join(',') + ')' + order
  // let query=prefix+
  // const prefix = 'select * from checkin,customer where customer.id=checkin.customerId '
  // let query = filterJoin(filter)
  // query = (query.length === 0 ? prefix : prefix + ' and ' + query) + order + page
  console.log(query)
  connection.query(query, (error, results, fields) => {
    if (error) reject(error)
    // console.log(results)
    resolve(results)
  })
})
export const raw = (query) => new Promise((resolve, reject) => {
  connection.query(query, (error, results, fields) => {
    if (error) reject(error)
    resolve(results, fields)
  })
})

export const fetchRoom = () => new Promise((resolve, reject) => {
  raw('select * from room order by id').then(r => {
    const len = Math.max(...r.map(i => i.id)).toString().length
    r.forEach(i => {
      i.label = i.id.toString().padStart(len, '0')
      i.disabled = i.status !== '已清理'
    })
    resolve(r)
  }).catch(reject)
})



export const delRegistry = (opt) => new Promise((resolve, reject) => {
  // const prefix = 'select * from checkin as a,customer as b where b.id=a.customerId '
  // const o=Object.assign(target, source)
  // delete opt['id']
  // const o=Object.assign({}, opt)
  delete opt.id
  let query = `delete from checkin where ${splitQuery(opt)[0]}`
  // console.log(query)
  connection.query(query, (error, results, fields) => {
    if (error) reject(error)
    query = `update room set status='待清理' where id=` + opt.roomId
    connection.query(query, (error, results, fields) => {
      if (error) reject(error)
      resolve(results)
    })
    // resolve(results)
  })
})

const splitRegistry = opt => {
  console.log(opt);
  const customer = {
    name: opt.name || '',
    contact: opt.contact || '',
    identification: opt.identification || '',
  }
  const checkin = {
    roomId: opt.roomId,
    storeId: opt.storeId,
    start: opt.start || '',
    duration: opt.duration || '',
    num: opt.num || 0
  }
  if (opt.hasOwnProperty('id')) customer.id = opt.id
  // if (opt.hasOwnProperty('customerId')) checkin.id = opt.id
  return [customer, checkin]
}
export const createRegistry = (opt) => new Promise((resolve, reject) => {
  delete opt.id
  const [customer, checkin] = splitRegistry(opt)
  let query = `insert into customer set ${objJoin(customer, ',')}`
  connection.query(query, (error, results, fields) => {
    if (error) reject(error)
    checkin.customerId = results.insertId
    query = `insert into checkin set ${objJoin(checkin, ',')}`
    connection.query(query, (error, results, fields) => {
      if (error) reject(error)
      // resolve(results)
      query = `update room set status='已满' where id=` + opt.roomId
      connection.query(query, (error, results, fields) => {
        if (error) reject(error)
        resolve(results)
      })
    })
  })
})

export const updateRegistry = (opt) => new Promise((resolve, reject) => {
  opt.id = opt.customerId
  const [customer, checkin] = splitRegistry(opt).map(splitQuery)
  const query1 = `update customer set ${customer[1]} where ${customer[0]}`
  delete opt.id
  const query2 = `update checkin set ${checkin[1]} where ${checkin[0]}`
  // console.log(query1, query2)
  Promise.all([raw(query1), raw(query2)]).then(resolve).catch(reject)
})
export const togglePaid = (opt) => new Promise((resolve, reject) => {
  // opt.id = opt.customerId
  // const [customer, checkin] = splitRegistry(opt).map(splitQuery)
  // console.log(opt);
  // delete opt.customerId
  // delete opt.storeId
  // delete opt.roomId
  if (opt.paid === 1) {
    opt.paid = 0
    const a = new Date
    opt.paydate = a.getUTCFullYear() + '年' + (a.getUTCMonth() + 1) + '月' + a.getUTCDate() + '日'
  } else {
    opt.paid = 1
    opt.paydate = ''
  }
  const b = splitQuery(opt)

  let query = `update consumption set ${b[1]} where ${b[0]}`
  // console.log(query)
  connection.query(query, (error, results, fields) => {
    if (error) reject(error)
    resolve(opt)
  })
})

export const fetchFieldRegistry = () => new Promise((resolve, reject) => {
  findRegistry({ limit: 1, page: 1 }, []).then(result => {
    // console.log(Object.keys(result[0]))
    resolve(Object.keys(result[0]))
  }).catch(reject)
})

export const countRegistry = (filter) => new Promise((resolve, reject) => {
  const prefix = 'select count(*) from checkin,customer where customer.id=checkin.customerId '
  let query = filterJoin(filter)
  query = (query.length === 0 ? prefix : prefix + ' and ' + query)
  connection.query(query, (error, results, fields) => {
    if (error) reject(error)
    let count = results[0]['count(*)']
    resolve(count || 0)
  })
})

//   `select storeId,status,count(*) from room group by storeId,status
// select storeId,start,sum(num) from checkin group by storeId,start
// select storeId, sum(num) from checkin group by storeId
// select storeId, count(*) from employee group by storeId
//  `

export const fetchDashboard = () => new Promise((resolve, reject) => {
  const room = `select storeId,status,count(*) from room group by storeId,status`
  const checkin = `select storeId,start,sum(num) from checkin group by storeId,start`
  const consumption = `select name,info,total,paydate from consumption,customer where customer.id=consumption.customerId order by paydate desc limit 30`
  Promise.all([raw(room).then(r => {
    // console.log(r)
    const info = {}
    r.forEach(i => {
      const k = 'store' + i.storeId
      info[k] = info[k] || {}
      info[k][i.status] = i['count(*)']
    })
    // console.log(info);
    return info
  }), raw(checkin).then(r => {
    const info = {
      x: [...Array(30)].map((x, i) => '201702' + (i + 1).toString().padStart(2, '0')),
    }
    r.forEach((i) => {
      // console.log(i);
      const k = 'store' + i.storeId
      if (!info.hasOwnProperty(k)) info[k] = [...Array(30)].map(i => 0)
      const index = parseInt(i.start.toString().slice(-2), 10) - 1
      info[k][index] = i['sum(num)']
    })
    Object.keys(info).forEach(k => {
      if (!k.startsWith('store')) return
      for (let i = 1; i < 30; ++i) {
        info[k][i] += info[k][i - 1]
      }
    })
    // console.log(info)
    return info
  }), raw(consumption)]).then(r => {
    resolve({
      room: r[0],
      checkin: r[1],
      consumption: r[2]
    })
  }).catch(reject)
})
