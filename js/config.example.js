// ============================================
// CONFIGURATION MATJAR STORE (EXEMPLE)
// ============================================
// Copiez ce fichier en config.js et remplissez vos informations

const CONFIG = {
    // Formspree - Pour recevoir les commandes
    FORMSPREE_URL: 'https://formspree.io/f/VOTRE_FORM_ID',
    
    // Meta Pixel ID
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

