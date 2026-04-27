
'use server';

/**
 * @fileOverview Action serveur pour la récupération des codes depuis Firestore.
 * Filtre par imprimer == false pour éviter les doublons d'impression.
 */

import { initializeApp, getApps } from "firebase/app";
import { getFirestore, collection, query, where, limit, getDocs, writeBatch } from "firebase/firestore";
import { firebaseConfig } from "@/firebase/config";

export async function fetchTicketsAction(quantity: number, ticketStatus: string) {
  try {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    const db = getFirestore(app);

    // Récupération stricte des tickets non encore imprimés (imprimer == false)
    const q = query(
      collection(db, "tickets"),
      where("type", "==", ticketStatus),
      where("imprimer", "==", false),
      limit(Math.min(quantity, 500))
    );

    const querySnapshot = await getDocs(q);
    
    // Si vide, on tente de récupérer ceux qui n'ont pas encore le champ 'imprimer'
    if (querySnapshot.empty) {
        const qNoField = query(
            collection(db, "tickets"),
            where("type", "==", ticketStatus),
            limit(Math.min(quantity * 2, 500))
        );
        const fullSnapshot = await getDocs(qNoField);
        
        // Filtre manuel pour les documents n'ayant pas le champ 'imprimer'
        const filteredDocs = fullSnapshot.docs.filter(doc => doc.data().imprimer === undefined || doc.data().imprimer === false);
        
        const codes = filteredDocs.map(doc => {
          const data = doc.data();
          return data.code || doc.id;
        }).slice(0, quantity);

        if (codes.length === 0) {
            throw new Error(`Aucun ticket disponible de type "${ticketStatus.toUpperCase()}". Tous les tickets sont déjà imprimés ou validés.`);
        }
        return codes;
    }

    const codes = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return data.code || doc.id;
    });

    return codes;
  } catch (error: any) {
    console.error("Erreur Firestore lors de la récupération des tickets:", error);
    throw new Error(error.message || "Impossible de récupérer les tickets.");
  }
}

export async function markTicketsAsPrintedAction(codes: string[]) {
  try {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    const db = getFirestore(app);
    const batch = writeBatch(db);
    
    // On doit retrouver les IDs des documents correspondant aux codes
    for (const code of codes) {
        const q = query(collection(db, "tickets"), where("code", "==", code), limit(1));
        const snap = await getDocs(q);
        if (!snap.empty) {
            batch.update(snap.docs[0].ref, { 
                imprimer: true,
                printedAt: new Date().toISOString()
            });
        }
    }
    
    await batch.commit();
    return { success: true };
  } catch (error: any) {
    console.error("Erreur marquage impression:", error);
    throw new Error("Impossible de mettre à jour le statut d'impression.");
  }
}
