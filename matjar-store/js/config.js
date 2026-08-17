// ============================================
// CONFIGURATION MATJAR STORE
// ============================================

const CONFIG = {
    // Formspree - Pour recevoir les commandes
    FORMSPREE_URL: 'https://formspree.io/f/mnjdadel',
    
    // Meta Pixel ID - À remplacer quand vous l'aurez
    META_PIXEL_ID: 'VOTRE_PIXEL_ID_ICI',
    
    // Informations du site
    SITE_NAME: 'Matjar Store',
    CURRENCY: 'DZD',
    
    // Configuration admin
    ADMIN: {
        STORAGE_KEY: 'matjar_admin_session',
    },
    
    // Configuration commandes
    ORDERS: {
        STORAGE_KEY: 'matjar_orders',
    }
};

// ============================================
// FONCTIONS UTILITAIRES
// ============================================

// Hashage de mot de passe (SHA-256)
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

// Vérification de mot de passe
async function verifyPassword(password, storedHash) {
    const hash = await hashPassword(password);
    return hash === storedHash;
}

// Sauvegarde dans localStorage
function saveToLocalStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

// Lecture depuis localStorage
function getFromLocalStorage(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
}

// Suppression depuis localStorage
function removeFromLocalStorage(key) {
    localStorage.removeItem(key);
}

// ============================================
// META PIXEL - Initialisation
// ============================================

function initMetaPixel() {
    if (CONFIG.META_PIXEL_ID && CONFIG.META_PIXEL_ID !== 'VOTRE_PIXEL_ID_ICI') {
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        
        fbq('init', CONFIG.META_PIXEL_ID);
        fbq('track', 'PageView');
        
        console.log('✅ Meta Pixel initialisé');
    } else {
        console.log('⚠️ Meta Pixel ID non configuré');
    }
}

// ============================================
// META PIXEL - Événements
// ============================================

function trackEvent(eventName, data = {}) {
    if (CONFIG.META_PIXEL_ID && CONFIG.META_PIXEL_ID !== 'VOTRE_PIXEL_ID_ICI') {
        fbq('track', eventName, data);
        console.log(`📊 Événement ${eventName} envoyé`, data);
    }
}

// Événements spécifiques
function trackViewContent(product) {
    trackEvent('ViewContent', {
        content_name: product.name,
        content_ids: [product.id],
        content_type: 'product',
        value: product.price,
        currency: CONFIG.CURRENCY
    });
}

function trackAddToCart(product) {
    trackEvent('AddToCart', {
        content_name: product.name,
        content_ids: [product.id],
        content_type: 'product',
        value: product.price,
        currency: CONFIG.CURRENCY
    });
}

function trackInitiateCheckout(orderData) {
    trackEvent('InitiateCheckout', {
        content_name: 'Commande',
        value: orderData.total,
        currency: CONFIG.CURRENCY,
        num_items: orderData.quantity
    });
}

function trackPurchase(orderData) {
    trackEvent('Purchase', {
        content_name: 'Commande Confirmée',
        content_ids: [orderData.productId],
        content_type: 'product',
        value: orderData.total,
        currency: CONFIG.CURRENCY,
        num_items: orderData.quantity
    });
}

// Initialisation au chargement
document.addEventListener('DOMContentLoaded', initMetaPixel);