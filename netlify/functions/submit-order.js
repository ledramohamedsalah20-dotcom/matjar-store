// netlify/functions/submit-order.js
exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Méthode non autorisée' })
        };
    }

    try {
        const orderData = JSON.parse(event.body);
        
        // La clé est sécurisée ici (jamais visible côté client)
        const WEB3FORMS_KEY = process.env.WEB3FORMS_KEY;
        
        const response = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                access_key: WEB3FORMS_KEY,
                subject: 'Nouvelle commande - Matjar Store',
                from_name: 'Matjar Store',
                ...orderData
            })
        });

        const data = await response.json();

        if (data.success) {
            return {
                statusCode: 200,
                body: JSON.stringify({ success: true })
            };
        } else {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: data.message })
            };
        }
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Erreur serveur' })
        };
    }
};