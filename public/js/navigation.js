'use strict'

const closeNavButton = document.querySelector('.close-nav')
const showNavButton = document.querySelector('.show-nav')
const sineNav = document.querySelector('.site-nav')

const hideNav = () => {
  sineNav.style.left = '-300px'
}

const showNav = () => {
  sineNav.style.left = '0'
}

closeNavButton.addEventListener('click', hideNav)
showNavButton.addEventListener('click', showNav)

const showCategoryList = data => {
  let out = '<ul class="category-list"><li><a href="/">Main</a></li>'

  for (let i = 0; i < data.length; i++) {
    out += `<li><a href="/category?id=${data[i].id}">${data[i].category}</a></li>`
  }

  out += '</ul>'
  document.querySelector('#category-list').innerHTML = out
}

const getCategoryList = () => {
  fetch('/get-category-list',{method: 'POST'})
    .then(response => response.text())
    .then(body => {
      showCategoryList(JSON.parse(body))
    })
}

getCategoryList()