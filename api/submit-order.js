// api/submit-order.js
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Méthode non autorisée' });
    }

    try {
        const orderData = req.body;
        
        const WEB3FORMS_KEY = process.env.WEB3FORMS_KEY;
        
        if (!WEB3FORMS_KEY) {
            return res.status(500).json({ error: 'Clé Web3Forms non configurée' });
        }
        
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
            return res.status(200).json({ success: true });
        } else {
            return res.status(400).json({ error: data.message || 'Erreur' });
        }
    } catch (error) {
        return res.status(500).json({ error: 'Erreur serveur' });
    }
}