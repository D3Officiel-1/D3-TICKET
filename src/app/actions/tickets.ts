
'use server';

/**
 * @fileOverview Action serveur pour la récupération des codes depuis Firestore.
 * Cette version est STRICTE : elle ne retourne que les codes correspondant au type demandé.
 */

import { initializeApp, getApps } from "firebase/app";
import { getFirestore, collection, query, where, limit, getDocs } from "firebase/firestore";
import { firebaseConfig } from "@/firebase/config";

export async function fetchTicketsAction(quantity: number, ticketStatus: string) {
  try {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    const db = getFirestore(app);

    // Récupération STRICTE depuis la collection 'tickets'
    // On filtre obligatoirement par type (standard ou vip)
    const q = query(
      collection(db, "tickets"),
      where("type", "==", ticketStatus),
      limit(Math.min(quantity, 500))
    );

    const querySnapshot = await getDocs(q);
    
    const codes = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return data.code || doc.id;
    });

    // Pas de fallback ici pour garantir que si on demande du VIP, on a du VIP.
    if (codes.length === 0) {
      throw new Error(`Aucun ticket de type "${ticketStatus}" trouvé dans la base de données.`);
    }

    return codes;
  } catch (error: any) {
    console.error("Erreur Firestore lors de la récupération des tickets:", error);
    throw new Error(error.message || "Impossible de récupérer les tickets officiels.");
  }
}
