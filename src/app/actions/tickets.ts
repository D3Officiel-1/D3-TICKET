'use server';

/**
 * @fileOverview Action serveur pour la récupération sécurisée des codes de tickets.
 * - fetchTicketsAction - Appelle l'API GIGA KERMESSE pour générer des codes uniques.
 */

const API_KEY = 'De3691215';
const API_URL = 'https://giga-kermesse.vercel.app/api/tickets/bulk';

export async function fetchTicketsAction(quantity: number, ticketType: string) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY
      },
      body: JSON.stringify({ 
        quantity,
        type: ticketType,
        username: "D3_TOMBOLA_APP"
      }),
      cache: 'no-store'
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erreur API ${response.status}: ${errorText || 'Réponse invalide'}`);
    }

    const data = await response.json();
    return Array.isArray(data) ? data : (data.codes || []);
  } catch (error: any) {
    console.error("Erreur lors de l'appel à l'API de tickets:", error);
    throw new Error(error.message || "Impossible de contacter le serveur de tickets.");
  }
}
