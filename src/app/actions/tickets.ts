'use server';

/**
 * @fileOverview Action serveur pour la récupération des codes depuis Firestore.
 */

import { initializeApp, getApps } from "firebase/app";
import { getFirestore, collection, query, where, limit, getDocs } from "firebase/firestore";
import { firebaseConfig } from "@/firebase/config";

export async function fetchTicketsAction(quantity: number, ticketType: string) {
  try {
    // Initialisation manuelle de Firebase
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    const db = getFirestore(app);

    // Récupération depuis la collection 'tickets'
    // On filtre par type si nécessaire, sinon on prend les X premiers
    const q = query(
      collection(db, "tickets"),
      where("type", "==", ticketType),
      limit(Math.min(quantity, 500))
    );

    const querySnapshot = await getDocs(q);
    
    // On extrait soit l'ID du document, soit le champ 'code' s'il existe
    const codes = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return data.code || doc.id;
    });

    if (codes.length === 0) {
      // Fallback si aucun ticket n'est trouvé pour ce type : on essaie sans filtre de type
      const fallbackQuery = query(collection(db, "tickets"), limit(quantity));
      const fallbackSnapshot = await getDocs(fallbackQuery);
      return fallbackSnapshot.docs.map(doc => doc.data().code || doc.id);
    }

    return codes;
  } catch (error: any) {
    console.error("Erreur Firestore lors de la récupération des tickets:", error);
    throw new Error(error.message || "Impossible de récupérer les tickets depuis Firestore.");
  }
}
