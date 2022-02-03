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


// Запуск сервера
app.listen(PORT, () => {
  console.log(`Server started. Port: ${PORT}`)
})

app.get('/', async (req, res) => {
  await dbOptions.query(
    'SELECT * FROM goods',
    (error, result) => {
      if (error) throw error
      const goods = {}
      for (let i = 0; i < result.length; i++) {
        goods[result[i]['id']] = result[i]
      }
      res.render('main', {goods: JSON.parse(JSON.stringify(goods))})
    }
  )
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
