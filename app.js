const express = require('express')
const config = require('config')
const mysql = require('mysql')
const app = express()

// Порт
const PORT = config.get('port')

// Подключение статических файлов
app.use(express.static('public'))

// Подключаем PUG
app.set('view engine', 'pug')

// Настройка подключения к базе данных
const dbOptions = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'shop'
})

// Настройка модуля
app.use(express.json())

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Server started. Port: ${PORT}`)
})

app.get('/', (req, res) => {
  const categoryGoods = new Promise((resolve, reject) => {
    dbOptions.query(config.get('homeGoodsUrl'), (error, result, fields) => {
      if (error) return reject(error)
      resolve(result)
    })
  })

  const categoryDescription = new Promise((resolve, reject) => {
    dbOptions.query('SELECT * FROM category', (error, result, fields) => {
      if (error) return reject(error)
      resolve(result)
    })
  })

  Promise.all([categoryGoods, categoryDescription])
    .then(value => {
      res.render('index', {
        goods: JSON.parse(JSON.stringify(value[0])),
        category: JSON.parse(JSON.stringify(value[1]))
      })
    })
})

app.get('/category', (req, res) => {
  const categoryId = req.query.id

  const category = new Promise((resolve, reject) => {
    dbOptions.query(
      `SELECT *
       FROM category
       WHERE id = ${categoryId}`,
      (error, result) => {
        if (error) reject(error)
        resolve(result)
      })
  })

  const goods = new Promise((resolve, reject) => {
    dbOptions.query(
      `SELECT *
       FROM goods
       WHERE category = ${categoryId}`,
      (error, result) => {
        if (error) reject(error)
        resolve(result)
      })
  })

  Promise.all([category, goods])
    .then(value => {
      res.render('category', {
        category: JSON.parse(JSON.stringify(value[0])),
        goods: JSON.parse(JSON.stringify(value[1]))
      })
    })

})

app.get('/goods', (req, res) => {
  const goodId = req.query.id
  dbOptions.query(`SELECT *
                   FROM goods
                   WHERE id = ${goodId}`,
    (error, result, fields) => {
      if (error) throw error
      res.render('goods', {goods: JSON.parse(JSON.stringify(result))})
    })
})

app.post('/get-category-list', (req, res) => {
  const goodId = req.query.id
  dbOptions.query(`SELECT id, category
                   FROM category`,
    (error, result, fields) => {
      if (error) throw error
      res.json(result)
    })
})

app.post('/get-goods-info', (req, res) => {
  const reqBodyKey = req.body.key
  if (req.body.key.length != 0){
  dbOptions.query(`SELECT id, name, cost
                   FROM goods
                   WHERE id IN (${reqBodyKey.join(',')})`,
    (error, result, fields) => {
      if (error) throw error
      const goods = {}
      for (let i = 0; i < result.length; i++) {
        goods[result[i]['id']] = result[i]
      }
      res.json(goods)
    })
  } else {
    res.send('0')
  }
})