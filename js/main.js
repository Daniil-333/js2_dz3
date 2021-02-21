
const API = `https://raw.githubusercontent.com/GeekBrainsTutorial/online-store-api/master/responses`;

let getRequest = (url, cb) => {
    let xhr = new XMLHttpRequest();
    // window.ActiveXObject -> new ActiveXObject();
    xhr.open('GET', url, true);
    xhr.onreadystatechange = () => {
        if (xhr.readyState !== 4) {
            return;
        }

        if (xhr.status !== 200) {
            console.log('some error');
            return;
        }

        cb(xhr.responseText);
    }
};


class Products {
    products = [];
    container = null;

    constructor(selector) {
        this.container = document.querySelector(selector);
        this._fetchData()
            .then(() => this._render());
    }

    calcSum() {
        return this.products.reduce((accum, item) => accum += item.price, 0);
    }

    _fetchData() {
        return fetch(`${API}/catalogData.json`)
            .then(result => result.json())
            .then(data => {
                for (let product of data) {
                    this.products.push(new ProductItem(product));
                }
            })
    }

    _render() {
        for (let product of this.products) {
            if (product.rendered) {
                continue;
            }

            this.container.insertAdjacentHTML('beforeend', product.render())
        }
    }
}

class ProductItem {
    title = '';
    price = 0;
    id = 0;
    img = '';
    rendered = false;

    constructor(product, img = 'https://placehold.it/200x150') {
        ({ product_name: this.title, price: this.price, id_product: this.id } = product);
        this.img = img;
    }

    render() {
        this.rendered = true;
        return `<div class="product-item">
                 <img src="${this.img}" alt="${this.title}">
                 <div class="desc">
                     <h3>${this.title}</h3>
                     <p>${this.price}</p>
                     <button class="buy-btn">Купить</button>
                 </div>
             </div>`
    }
}

class Cart {
    items = [];
    itemsContainer = '';
    amount = 0;
    countGoods = 0;

    constructor(selector, amount = 0, countGoods = 0) {
        this.itemsContainer = document.querySelector(selector);
        this.fetchItems()
            .then(() => this.renderCart());
        this.amount = amount;
        this.countGoods = countGoods;
        this.init();
    };

    init() {
        this._showHideCart('.btn-cart');
        this._addItem('.buy-btn');
    }

    fetchItems() {
        return fetch(`${API}/getBasket.json`)
            .then(result => result.json())
            .then(data => {
                for (let item of data.contents) {
                    this.items.push(new CartItem(item));
                }
                this.amount = data.amount;
                this.countGoods = data.countGoods;
            })
    }

    renderCart() {
        for (let item of this.items) {
            this.itemsContainer.insertAdjacentHTML('beforeend', item.render())
        }
         this.itemsContainer.insertAdjacentHTML('beforeend', 
                `<div class="general">
                <p>Количество товаров в корзине: ${this.countGoods}</p>
                <p>Общая сумма товаров в корзине: ${this.amount}</p>
                </div>`)
    }

    _showHideCart(selector) {
        document.querySelector(selector).addEventListener('click', () => {
            document.querySelector('.cart').classList.toggle('hidden');
        })
    }

    _addItem(selector) {
        let btnItems = document.querySelectorAll(selector);
        for (let btnItem of btnItems) {
            btnItem.addEventListener('click', () => this.items.push(new CartItem(item)))
          }
    }
    // removeItem() - удаление одного товара из корзины
    // clear() - очистка корзины
    // makePercentDiscount(arg) - применение скидки, в качестве аргумента раззмер скидки в процентах
    // subtotal() - промежуточная стоимость всех товаров корзины(до применения скидки, если таковая имеется)
    // grandTotal() - итоговая стоимость всех товаров корзины

}

class CartItem {
    name = '';
    img = '';
    unitPrice = 0;
    quantity = 0;

    constructor(item, img = 'https://placehold.it/100x75') {
        ({product_name: this.name, price: this.unitPrice, quantity: this.quantity} = item);
        this.img = img;
    }

    render() {
        return `<div class="cart-item">
                 <img src="${this.img}" alt="${this.name}">
                 <div class="descItem">
                     <h3>${this.name}</h3>
                     <p>${this.unitPrice} x ${this.quantity}</p>
                 </div>
                 <button class="del-btn">x</button>
             </div>`
    }

    // subtotal() - промежуточная стоимость товара

}

const list = new Products('.products');
console.log(list.calcSum());

let basket = new Cart('.cart');