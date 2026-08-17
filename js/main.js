// ============================================
// FONCTIONS UTILITAIRES
// ============================================

function saveToLocalStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function getFromLocalStorage(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
}

function removeFromLocalStorage(key) {
    localStorage.removeItem(key);
}

function trackEvent(eventName, data = {}) {
    console.log('📊', eventName, data);
}

function trackViewContent(product) {
    trackEvent('ViewContent', product);
}

function trackAddToCart(product) {
    trackEvent('AddToCart', product);
}

function trackInitiateCheckout(orderData) {
    trackEvent('InitiateCheckout', orderData);
}

function trackPurchase(orderData) {
    trackEvent('Purchase', orderData);
}

// ============================================
// MATJAR STORE - Logique principale
// ============================================

// Clés de stockage
const STORAGE_KEYS = {
    PRODUCTS: 'matjar_products',
    ORDERS: 'matjar_orders',
    SETTINGS: 'matjar_settings',
    CUSTOM_STYLE: 'matjar_custom_style'
};

// Liste des 58 wilayas d'Algérie
const WILAYAS = [
    "01 - Adrar", "02 - Chlef", "03 - Laghouat", "04 - Oum El Bouaghi",
    "05 - Batna", "06 - Béjaïa", "07 - Biskra", "08 - Béchar",
    "09 - Blida", "10 - Bouira", "11 - Tamanrasset", "12 - Tébessa",
    "13 - Tlemcen", "14 - Tiaret", "15 - Tizi Ouzou", "16 - Alger",
    "17 - Djelfa", "18 - Jijel", "19 - Sétif", "20 - Saïda",
    "21 - Skikda", "22 - Sidi Bel Abbès", "23 - Annaba", "24 - Guelma",
    "25 - Constantine", "26 - Médéa", "27 - Mostaganem", "28 - M'Sila",
    "29 - Mascara", "30 - Ouargla", "31 - Oran", "32 - El Bayadh",
    "33 - Illizi", "34 - Bordj Bou Arréridj", "35 - Boumerdès", "36 - El Tarf",
    "37 - Tindouf", "38 - Tissemsilt", "39 - El Oued", "40 - Khenchela",
    "41 - Souk Ahras", "42 - Tipaza", "43 - Mila", "44 - Aïn Defla",
    "45 - Naâma", "46 - Aïn Témouchent", "47 - Ghardaïa", "48 - Relizane",
    "49 - Timimoun", "50 - Bordj Badji Mokhtar", "51 - Ouled Djellal", "52 - Béni Abbès",
    "53 - In Salah", "54 - In Guezzam", "55 - Touggourt", "56 - Djanet",
    "57 - El M'Ghair", "58 - El Meniaa"
];

// ============================================
// CHARGEMENT DES DONNÉES
// ============================================

function getProducts() {
    return getFromLocalStorage(STORAGE_KEYS.PRODUCTS) || [];
}

function getSettings() {
    return getFromLocalStorage(STORAGE_KEYS.SETTINGS) || {
        deliveryFee: 500,
        deliveryTime: '2-5 jours ouvrés',
        wilayas: WILAYAS
    };
}

// ============================================
// AFFICHAGE DES PRODUITS
// ============================================

function displayProducts() {
    const container = document.getElementById('products-container');
    const select = document.getElementById('product-select');
    const products = getProducts();
    
    if (!container) return;
    
    container.innerHTML = '';
    
    if (products.length === 0) {
        container.innerHTML = '<div class="loading">Aucun produit disponible pour le moment.</div>';
        return;
    }
    
    if (select) {
        select.innerHTML = '<option value="">Choisissez un produit...</option>';
    }
    
    products.forEach(product => {
        if (product.inStock === false) return;
        
        const card = document.createElement('div');
        card.className = 'product-card';
        
        const promoBadge = product.promotion && product.oldPrice 
            ? `<div class="promotion-badge">-${calculateDiscount(product)}%</div>` 
            : '';
        
        const priceDisplay = product.oldPrice 
            ? `<span class="old-price">${product.oldPrice} DZD</span>` 
            : '';
        
        const descriptionDisplay = product.html 
            ? product.html 
            : `<p class="product-description">${product.description}</p>`;
        
        card.innerHTML = `
            ${promoBadge}
            <img src="${product.image}" alt="${product.name}" class="product-image" onerror="this.src='https://via.placeholder.com/300x300?text=${encodeURIComponent(product.name)}'">
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                ${descriptionDisplay}
                <div class="product-price">
                    ${product.price} DZD
                    ${priceDisplay}
                </div>
                <button class="add-to-cart" onclick="selectProduct('${product.id}')">
                    Commander ce produit
                </button>
            </div>
        `;
        
        container.appendChild(card);
        
        if (select) {
            const option = document.createElement('option');
            option.value = product.id;
            option.textContent = `${product.name} - ${product.price} DZD`;
            select.appendChild(option);
        }
        
        trackViewContent(product);
    });
}

function calculateDiscount(product) {
    if (product.oldPrice && product.oldPrice > product.price) {
        return Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100);
    }
    return 0;
}

function selectProduct(productId) {
    const select = document.getElementById('product-select');
    if (select) {
        select.value = productId;
        document.getElementById('order').scrollIntoView({ behavior: 'smooth' });
        
        const products = getProducts();
        const product = products.find(p => p.id === productId);
        if (product) {
            trackAddToCart(product);
        }
    }
}

// ============================================
// CHARGEMENT DES WILAYAS
// ============================================

function loadWilayas() {
    const select = document.getElementById('wilaya-select');
    if (!select) return;
    
    select.innerHTML = '<option value="">Choisissez votre wilaya...</option>';
    
    const settings = getSettings();
    const allowedWilayas = settings.wilayas || WILAYAS;
    
    WILAYAS.forEach(wilaya => {
        if (allowedWilayas.includes(wilaya)) {
            const option = document.createElement('option');
            option.value = wilaya;
            option.textContent = wilaya;
            select.appendChild(option);
        }
    });
}

// ============================================
// GESTION DU FORMULAIRE DE COMMANDE
// ============================================

function handleOrderSubmit(event) {
    event.preventDefault();
    
    const products = getProducts();
    const settings = getSettings();
    
    const productId = document.getElementById('product-select').value;
    const quantity = parseInt(document.getElementById('quantity').value);
    const wilaya = document.getElementById('wilaya-select').value;
    
    const product = products.find(p => p.id === productId);
    if (!product) {
        alert('Veuillez sélectionner un produit valide.');
        return;
    }
    
    if (!wilaya) {
        alert('Veuillez sélectionner votre wilaya.');
        return;
    }
    
    const subtotal = product.price * quantity;
    const deliveryFee = settings.deliveryFee || 0;
    const total = subtotal + deliveryFee;
    
    const orderData = {
        id: generateOrderId(),
        fullname: document.getElementById('fullname').value,
        phone: document.getElementById('phone').value,
        wilaya: wilaya,
        address: document.getElementById('address').value,
        productId: productId,
        productName: product.name,
        productPrice: product.price,
        quantity: quantity,
        subtotal: subtotal,
        deliveryFee: deliveryFee,
        total: total,
        notes: document.getElementById('notes').value,
        orderDate: new Date().toISOString(),
        status: 'Nouvelle commande'
    };
    
    saveOrder(orderData);
    trackInitiateCheckout(orderData);
    sendOrderToFormspree(orderData);
    showOrderConfirmation(orderData);
    
    document.getElementById('order-form').reset();
    document.getElementById('quantity').value = 1;
    
    trackPurchase(orderData);
}

function generateOrderId() {
    return 'CMD-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
}

function saveOrder(orderData) {
    let orders = getFromLocalStorage(STORAGE_KEYS.ORDERS) || [];
    orders.push(orderData);
    saveToLocalStorage(STORAGE_KEYS.ORDERS, orders);
    console.log('✅ Commande sauvegardée:', orderData);
}

function sendOrderToFormspree(orderData) {
    console.log('📤 Envoi de la commande...');
    
    fetch('/.netlify/functions/submit-order', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            commande_id: orderData.id,
            nom_complet: orderData.fullname,
            telephone: orderData.phone,
            wilaya: orderData.wilaya,
            adresse: orderData.address,
            produit: orderData.productName,
            quantite: orderData.quantity,
            sous_total: orderData.subtotal + ' DZD',
            livraison: orderData.deliveryFee + ' DZD',
            total: orderData.total + ' DZD',
            notes: orderData.notes,
            date: orderData.orderDate,
            statut: orderData.status
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log('✅ Commande envoyée avec succès !');
        } else {
            console.error('❌ Erreur:', data.error);
        }
    })
    .catch(error => {
        console.error('❌ Erreur réseau:', error);
        console.log('ℹ️ La commande reste sauvegardée en local');
    });
}

function showOrderConfirmation(orderData) {
    const settings = getSettings();
    
    const confirmationHTML = `
        <div style="
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 2rem;
            border-radius: 10px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.2);
            z-index: 2000;
            max-width: 400px;
            width: 90%;
            text-align: center;
        ">
            <h3 style="color: #4CAF50; margin-bottom: 1rem;">✅ Commande confirmée !</h3>
            <p style="margin-bottom: 0.5rem;">Merci <strong>${orderData.fullname}</strong> !</p>
            <p style="margin-bottom: 0.5rem;">Produit : <strong>${orderData.productName}</strong></p>
            <p style="margin-bottom: 0.5rem;">Quantité : <strong>${orderData.quantity}</strong></p>
            <p style="margin-bottom: 0.5rem;">Wilaya : <strong>${orderData.wilaya}</strong></p>
            <p style="margin-bottom: 0.5rem;">Sous-total : <strong>${orderData.subtotal} DZD</strong></p>
            <p style="margin-bottom: 0.5rem;">Livraison : <strong>${orderData.deliveryFee} DZD</strong></p>
            <p style="margin-bottom: 1rem; font-size: 1.2rem;">Total : <strong>${orderData.total} DZD</strong></p>
            <p style="color: #666; font-size: 0.9rem;">Livraison estimée : ${settings.deliveryTime}</p>
            <button onclick="this.parentElement.remove()" style="
                margin-top: 1rem;
                padding: 0.5rem 1.5rem;
                background: #c9a96e;
                color: white;
                border: none;
                cursor: pointer;
                font-size: 1rem;
            ">Fermer</button>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', confirmationHTML);
}

// ============================================
// MENU MOBILE
// ============================================

function initMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');
    
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
        
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
            });
        });
    }
}

// ============================================
// APPLICATION DU STYLE PERSONNALISÉ
// ============================================

function applyCustomStyle() {
    const customStyle = getFromLocalStorage(STORAGE_KEYS.CUSTOM_STYLE);
    
    if (!customStyle) return;
    
    if (customStyle.primaryColor) {
        document.documentElement.style.setProperty('--secondary', customStyle.primaryColor);
        document.documentElement.style.setProperty('--accent', customStyle.primaryColor);
    }
    
    if (customStyle.css) {
        const styleElement = document.createElement('style');
        styleElement.id = 'custom-style';
        styleElement.textContent = customStyle.css;
        document.head.appendChild(styleElement);
    }
    
    if (customStyle.font) {
        const fontLink = document.createElement('link');
        fontLink.rel = 'stylesheet';
        fontLink.href = `https://fonts.googleapis.com/css2?family=${customStyle.font.replace(' ', '+')}:wght@400;500;600;700&display=swap`;
        document.head.appendChild(fontLink);
        
        document.body.style.fontFamily = customStyle.font + ', sans-serif';
    }
    
    if (customStyle.heroTitle) {
        const heroTitle = document.querySelector('.hero h1');
        if (heroTitle) heroTitle.innerHTML = customStyle.heroTitle;
    }
    
    if (customStyle.heroSubtitle) {
        const heroSubtitle = document.querySelector('.hero-subtitle');
        if (heroSubtitle) heroSubtitle.textContent = customStyle.heroSubtitle;
    }
}

// ============================================
// INITIALISATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Matjar Store - Initialisation');
    
    displayProducts();
    loadWilayas();
    applyCustomStyle();
    initMobileMenu();
    
    const orderForm = document.getElementById('order-form');
    if (orderForm) {
        orderForm.addEventListener('submit', handleOrderSubmit);
    }
    
    console.log('✅ Site initialisé avec succès');
});