const CONFIG = {
    // AUCUN secret ici
    META_PIXEL_ID: 'VOTRE_PIXEL_ID_ICI',
    SITE_NAME: 'Matjar Store',
    CURRENCY: 'DZD',
    ADMIN: {
        STORAGE_KEY: 'matjar_admin_session',
    },
    ORDERS: {
        STORAGE_KEY: 'matjar_orders',
    }
};

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
    }
}

function trackEvent(eventName, data = {}) {
    if (CONFIG.META_PIXEL_ID && CONFIG.META_PIXEL_ID !== 'VOTRE_PIXEL_ID_ICI') {
        fbq('track', eventName, data);
    }
}

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

document.addEventListener('DOMContentLoaded', initMetaPixel);