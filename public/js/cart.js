let cart = {}
const addToCartButton = document.querySelectorAll('.add-to-cart')

if (localStorage.getItem('cart')) {
  cart = JSON.parse(localStorage.getItem('cart'))
  ajaxGetGoodsInfo()
}


addToCartButton.forEach(item => {
  item.addEventListener('click', addToCart)
})

function addToCart() {
  const goodsId = this.dataset.id
  if (cart[goodsId]) {
    cart[goodsId]++
  } else {
    cart[goodsId] = 1
  }
  ajaxGetGoodsInfo()
}

function ajaxGetGoodsInfo() {
  updateLocalStorageCart()
  fetch('/get-goods-info', {
    method: 'POST',
    body: JSON.stringify({key: Object.keys(cart)}),
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  })
    .then(response => response.text())
    .then(body => showCart(JSON.parse(body)))
}

const showCart = data => {
  let out = '<table class="table table-striped table-cart"><tbody>'
  let total = 0
  for (let key in cart) {
    out += `<tr><td colspan="4"><a href="/goods?id=${key}">${data[key]['name']}</a></td></tr>
    <tr><td><span class="cart-minus" data-id="${key}">-</span></td>
    <td>${cart[key]}</td>
    <td><span class="cart-plus" data-id="${key}">+</span></td>
    <td>${formatPrice(data[key]['cost'] * cart[key])} uah</td>
    </tr>`
    total = cart[key] * data[key]['cost']
  }
  out += `<tr><td colspan="3">Total: </td><td>${formatPrice(total)} uah</td></tr>`
  out += '</tbody></table>'
  document.querySelector('#cart-nav').innerHTML = out

  document.querySelectorAll('.cart-minus').forEach(item => {
    item.addEventListener('click', cartMinus)
  })

  document.querySelectorAll('.cart-plus').forEach(item => {
    item.addEventListener('click', cartPlus)
  })

}

function cartMinus() {
  const goodsId = this.dataset.id
  if (cart[goodsId] - 1 > 0) {
    cart[goodsId]--
  } else {
    delete (cart[goodsId])
  }
  ajaxGetGoodsInfo()
}

function cartPlus() {
  const goodsId = this.dataset.id
  cart[goodsId]++
  ajaxGetGoodsInfo()
}

function updateLocalStorageCart() {
  localStorage.setItem('cart', JSON.stringify(cart))
}

function formatPrice(price) {
  return price.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$& ')
}













