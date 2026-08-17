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

async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

async function verifyPassword(password, storedHash) {
    const hash = await hashPassword(password);
    return hash === storedHash;
}

// ============================================
// MATJAR STORE - Logique Admin
// ============================================

const STORAGE_KEYS = {
    ADMIN_ACCOUNT: 'matjar_admin_account',
    ADMIN_SESSION: 'matjar_admin_session',
    PRODUCTS: 'matjar_products',
    ORDERS: 'matjar_orders',
    SETTINGS: 'matjar_settings',
    CUSTOM_STYLE: 'matjar_custom_style'
};

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
// GESTION DE L'AUTHENTIFICATION
// ============================================

function isAdminLoggedIn() {
    return getFromLocalStorage(STORAGE_KEYS.ADMIN_SESSION) !== null;
}

function checkAuth() {
    if (isAdminLoggedIn()) {
        showDashboard();
    } else {
        showLoginPage();
    }
}

function showLoginPage() {
    document.getElementById('login-page').style.display = 'flex';
    document.getElementById('admin-dashboard').style.display = 'none';
}

function showDashboard() {
    document.getElementById('login-page').style.display = 'none';
    document.getElementById('admin-dashboard').style.display = 'block';
    loadAdminProducts();
    loadAdminOrders();
    loadSettings();
    loadCustomStyle();
}

async function handleRegister(event) {
    event.preventDefault();
    
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirm = document.getElementById('register-confirm').value;
    
    if (password !== confirm) {
        alert('Les mots de passe ne correspondent pas !');
        return;
    }
    
    if (getFromLocalStorage(STORAGE_KEYS.ADMIN_ACCOUNT)) {
        alert('Un compte admin existe déjà !');
        return;
    }
    
    const passwordHash = await hashPassword(password);
    
    const account = {
        email: email,
        passwordHash: passwordHash,
        createdAt: new Date().toISOString()
    };
    
    saveToLocalStorage(STORAGE_KEYS.ADMIN_ACCOUNT, account);
    
    const session = {
        email: email,
        loginTime: new Date().toISOString()
    };
    saveToLocalStorage(STORAGE_KEYS.ADMIN_SESSION, session);
    
    alert('✅ Compte créé avec succès !');
    showDashboard();
}

async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    const account = getFromLocalStorage(STORAGE_KEYS.ADMIN_ACCOUNT);
    
    if (!account) {
        alert('Aucun compte admin trouvé. Veuillez créer un compte.');
        return;
    }
    
    if (account.email !== email) {
        alert('Email incorrect !');
        return;
    }
    
    const isValid = await verifyPassword(password, account.passwordHash);
    
    if (!isValid) {
        alert('Mot de passe incorrect !');
        return;
    }
    
    const session = {
        email: email,
        loginTime: new Date().toISOString()
    };
    saveToLocalStorage(STORAGE_KEYS.ADMIN_SESSION, session);
    
    showDashboard();
}

function handleLogout() {
    removeFromLocalStorage(STORAGE_KEYS.ADMIN_SESSION);
    showLoginPage();
}

// ============================================
// GESTION DES PRODUITS
// ============================================

function loadAdminProducts() {
    const products = getFromLocalStorage(STORAGE_KEYS.PRODUCTS) || [];
    const container = document.getElementById('admin-products-list');
    
    if (!container) return;
    
    if (products.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">Aucun produit. Cliquez sur "Ajouter un produit" pour commencer.</p>';
        return;
    }
    
    container.innerHTML = '';
    
    products.forEach(product => {
        const item = document.createElement('div');
        item.className = 'admin-product-item';
        
        item.innerHTML = `
            <div class="admin-product-info">
                <h3>${product.name}</h3>
                <p>Prix : <strong>${product.price} DZD</strong></p>
                ${product.oldPrice ? `<p>Ancien prix : <del>${product.oldPrice} DZD</del></p>` : ''}
                ${product.promotion ? '<p style="color: #e74c3c;">En promotion</p>' : ''}
                ${product.inStock ? '<p style="color: #4CAF50;">En stock</p>' : '<p style="color: #e74c3c;">Rupture de stock</p>'}
            </div>
            <div class="admin-product-actions">
                <button class="edit-btn" onclick="editProduct('${product.id}')">Modifier</button>
                <button class="delete-btn" onclick="deleteProduct('${product.id}')">Supprimer</button>
            </div>
        `;
        
        container.appendChild(item);
    });
}

function showAddProductForm() {
    document.getElementById('product-form-container').style.display = 'block';
    document.getElementById('product-form-title').textContent = 'Ajouter un produit';
    document.getElementById('product-form').reset();
    document.getElementById('product-id').value = '';
}

function editProduct(productId) {
    const products = getFromLocalStorage(STORAGE_KEYS.PRODUCTS) || [];
    const product = products.find(p => p.id === productId);
    
    if (!product) return;
    
    document.getElementById('product-form-container').style.display = 'block';
    document.getElementById('product-form-title').textContent = 'Modifier le produit';
    document.getElementById('product-id').value = product.id;
    document.getElementById('product-name').value = product.name;
    document.getElementById('product-price').value = product.price;
    document.getElementById('product-old-price').value = product.oldPrice || '';
    document.getElementById('product-image').value = product.image || '';
    document.getElementById('product-description').value = product.description;
    document.getElementById('product-html').value = product.html || '';
    document.getElementById('product-promotion').checked = product.promotion || false;
    document.getElementById('product-stock').checked = product.inStock !== false;
    
    document.getElementById('product-form-container').scrollIntoView({ behavior: 'smooth' });
}

function deleteProduct(productId) {
    if (!confirm('Voulez-vous vraiment supprimer ce produit ?')) return;
    
    let products = getFromLocalStorage(STORAGE_KEYS.PRODUCTS) || [];
    products = products.filter(p => p.id !== productId);
    saveToLocalStorage(STORAGE_KEYS.PRODUCTS, products);
    
    loadAdminProducts();
    alert('✅ Produit supprimé !');
}

function handleProductSubmit(event) {
    event.preventDefault();
    
    const productId = document.getElementById('product-id').value;
    const productData = {
        name: document.getElementById('product-name').value,
        price: parseFloat(document.getElementById('product-price').value),
        oldPrice: document.getElementById('product-old-price').value ? parseFloat(document.getElementById('product-old-price').value) : null,
        image: document.getElementById('product-image').value || 'https://via.placeholder.com/300x300?text=Produit',
        description: document.getElementById('product-description').value,
        html: document.getElementById('product-html').value || '',
        promotion: document.getElementById('product-promotion').checked,
        inStock: document.getElementById('product-stock').checked
    };
    
    let products = getFromLocalStorage(STORAGE_KEYS.PRODUCTS) || [];
    
    if (productId) {
        const index = products.findIndex(p => p.id === productId);
        if (index !== -1) {
            products[index] = { ...products[index], ...productData };
        }
    } else {
        productData.id = 'PROD-' + Date.now();
        productData.createdAt = new Date().toISOString();
        products.push(productData);
    }
    
    saveToLocalStorage(STORAGE_KEYS.PRODUCTS, products);
    
    document.getElementById('product-form-container').style.display = 'none';
    loadAdminProducts();
    
    alert('✅ Produit enregistré !');
}

// ============================================
// GESTION DES COMMANDES
// ============================================

function loadAdminOrders() {
    const orders = getFromLocalStorage(STORAGE_KEYS.ORDERS) || [];
    const container = document.getElementById('admin-orders-list');
    
    if (!container) return;
    
    if (orders.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">Aucune commande pour le moment.</p>';
        return;
    }
    
    container.innerHTML = '';
    
    orders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
    
    orders.forEach(order => {
        const item = document.createElement('div');
        item.className = 'order-item';
        
        const statusClass = getStatusClass(order.status);
        
        item.innerHTML = `
            <div class="order-header">
                <span class="order-id">${order.id}</span>
                <span class="order-status ${statusClass}">${order.status}</span>
            </div>
            <div class="order-details">
                <span><strong>Client :</strong> ${order.fullname}</span>
                <span><strong>Téléphone :</strong> ${order.phone}</span>
                <span><strong>Wilaya :</strong> ${order.wilaya}</span>
                <span><strong>Produit :</strong> ${order.productName}</span>
                <span><strong>Quantité :</strong> ${order.quantity}</span>
            </div>
            <div class="order-total">Total : ${order.total} DZD</div>
        `;
        
        container.appendChild(item);
    });
}

function getStatusClass(status) {
    switch(status) {
        case 'Nouvelle commande':
            return 'status-new';
        case 'Confirmée':
            return 'status-confirmed';
        case 'Livrée':
            return 'status-delivered';
        default:
            return 'status-new';
    }
}

// ============================================
// GESTION DES PARAMÈTRES
// ============================================

function generateWilayasList() {
    const container = document.getElementById('wilayas-list');
    if (!container) return;
    
    container.innerHTML = '';
    
    WILAYAS.forEach(wilaya => {
        const item = document.createElement('div');
        item.className = 'wilaya-item';
        
        item.innerHTML = `
            <input type="checkbox" id="wilaya-${wilaya}" value="${wilaya}" checked>
            <label for="wilaya-${wilaya}">${wilaya}</label>
        `;
        
        container.appendChild(item);
    });
}

function toggleAllWilayas(select) {
    const checkboxes = document.querySelectorAll('#wilayas-list input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = select;
    });
}

function getSelectedWilayas() {
    const checkboxes = document.querySelectorAll('#wilayas-list input[type="checkbox"]:checked');
    return Array.from(checkboxes).map(cb => cb.value);
}

function loadSettings() {
    generateWilayasList();
    
    const settings = getFromLocalStorage(STORAGE_KEYS.SETTINGS);
    
    if (settings) {
        document.getElementById('delivery-fee').value = settings.deliveryFee || 500;
        document.getElementById('delivery-time').value = settings.deliveryTime || '2-5 jours ouvrés';
        
        if (settings.wilayas && settings.wilayas.length > 0) {
            const checkboxes = document.querySelectorAll('#wilayas-list input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                checkbox.checked = settings.wilayas.includes(checkbox.value);
            });
        }
    }
}

function handleSettingsSubmit(event) {
    event.preventDefault();
    
    const selectedWilayas = getSelectedWilayas();
    
    if (selectedWilayas.length === 0) {
        alert('Veuillez sélectionner au moins une wilaya !');
        return;
    }
    
    const settings = {
        deliveryFee: parseFloat(document.getElementById('delivery-fee').value),
        deliveryTime: document.getElementById('delivery-time').value,
        wilayas: selectedWilayas,
        updatedAt: new Date().toISOString()
    };
    
    saveToLocalStorage(STORAGE_KEYS.SETTINGS, settings);
    
    alert('✅ Paramètres enregistrés !');
}

// ============================================
// GESTION DU STYLE PERSONNALISÉ
// ============================================

function loadCustomStyle() {
    const customStyle = getFromLocalStorage(STORAGE_KEYS.CUSTOM_STYLE);
    
    if (customStyle) {
        document.getElementById('custom-css').value = customStyle.css || '';
        document.getElementById('custom-font').value = customStyle.font || '';
        document.getElementById('primary-color').value = customStyle.primaryColor || '#c9a96e';
        document.getElementById('hero-title').value = customStyle.heroTitle || '';
        document.getElementById('hero-subtitle').value = customStyle.heroSubtitle || '';
    }
}

function handleCustomStyleSubmit(event) {
    event.preventDefault();
    
    const customStyle = {
        css: document.getElementById('custom-css').value,
        font: document.getElementById('custom-font').value,
        primaryColor: document.getElementById('primary-color').value,
        heroTitle: document.getElementById('hero-title').value,
        heroSubtitle: document.getElementById('hero-subtitle').value,
        updatedAt: new Date().toISOString()
    };
    
    saveToLocalStorage(STORAGE_KEYS.CUSTOM_STYLE, customStyle);
    
    alert('✅ Style personnalisé enregistré !');
}

// ============================================
// NAVIGATION PAR ONGLETS
// ============================================

function initTabs() {
    const navBtns = document.querySelectorAll('.nav-btn');
    
    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            navBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            document.querySelectorAll('.tab-content').forEach(tab => {
                tab.classList.remove('active');
            });
            
            const tabId = 'tab-' + btn.dataset.tab;
            document.getElementById(tabId).classList.add('active');
        });
    });
}

// ============================================
// INITIALISATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🔐 Matjar Store - Admin');
    
    checkAuth();
    initTabs();
    
    document.getElementById('register-form').addEventListener('submit', handleRegister);
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    document.getElementById('logout-btn').addEventListener('click', handleLogout);
    
    document.getElementById('show-register').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('register-form').style.display = 'block';
        document.getElementById('login-form').style.display = 'none';
    });
    
    document.getElementById('add-product-btn').addEventListener('click', showAddProductForm);
    document.getElementById('cancel-product-btn').addEventListener('click', () => {
        document.getElementById('product-form-container').style.display = 'none';
    });
    document.getElementById('product-form').addEventListener('submit', handleProductSubmit);
    
    document.getElementById('settings-form').addEventListener('submit', handleSettingsSubmit);
    document.getElementById('custom-style-form').addEventListener('submit', handleCustomStyleSubmit);
    
    console.log('✅ Admin initialisé');
});