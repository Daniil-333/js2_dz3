
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

fetchGoods () {
    fetch('url')
    .then(rawData => rawData.json())
    .then(data => console.log(data))
    .catch(err => {
        console.warn('Проверьте соединение с интернетом', err)
    })
}

let getRequestNew = new Promise((resoleve, reject) => {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', 'url', true);
    xhr.onload = () => resoleve(xhr.response);
    xhr.onerror = () => reject(new Error('Запрос завершился неудачей'));
    xhr.send();
});
    getRequestNew.then((xhr) => {
        console.log(xhr.responseText);
    });
    getRequestNew.catch((error) => {
        console.log('some error');
    });



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
    }

    fetchItems() {
        return fetch(`${API}/getBasket.json`)
            .then(result => result.json())
            .then(data => {
                for (let item of data.contents) {
                    this.items.push(new CartItem(item));
                }
                //Подсчёт общей стоимости и количества товаров в корзине
                this.amount = this.items.reduce((accum, item) => accum += item.unitPrice, 0);
                this.countGoods = this.items.reduce((accum, item) => accum += item.quantity, 0);
            })
    }

    renderCart() {
        for (let item of this.items) {
            if (item.rendered) {
                continue;
            }
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
            this._removeItem('.del-btn');
        });
    }

    //Ничего не получилось. По началу удалял сами элементы товаров по нажатию на кнопку. Но в таком случае стоимость и количество не пересчитавались. Подумал, что нужно убирать элементы в массиве. Элементы убираются, а разметка остаётся такой же.
    _removeItem(selector) {
        if (!document.querySelector('.cart').classList.contains('hidden')) {
            let delBtn = document.querySelectorAll(selector);
            for (let btn of delBtn) {
                btn.addEventListener('click', (event) => {
                    console.log(event.target.parentNode.dataset.id);
                    this.items = this.items.filter(cartItem => cartItem.id !== Number(event.target.parentNode.dataset.id));
                })
            }
        }
    }

    // _addItem(selector) {}
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
    id = 0;
    rendered = false;

    constructor(item, img = 'https://placehold.it/100x75') {
        ({product_name: this.name, price: this.unitPrice, quantity: this.quantity, id_product: this.id} = item);
        this.img = img;
    }

    render() {
        this.rendered = true;
        return `<div class="cart-item" data-id="${this.id}">
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