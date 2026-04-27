
'use server';

import { initializeApp, getApps } from "firebase/app";
import { getFirestore, collection, query, where, getDocs, updateDoc, limit } from "firebase/firestore";
import { firebaseConfig } from "@/firebase/config";

/**
 * Valide un ticket en le marquant comme imprimé (et donc déjà utilisé)
 * Retourne les détails du ticket si trouvé.
 */
export async function validateTicketScanAction(code: string) {
  try {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    const db = getFirestore(app);

    // On cherche le ticket par son code unique
    const q = query(collection(db, "tickets"), where("code", "==", code), limit(1));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return { success: false, message: "Ticket introuvable dans la base." };
    }

    const ticketDoc = querySnapshot.docs[0];
    const data = ticketDoc.data();

    // Si déjà marqué comme imprimé/validé
    if (data.imprimer === true) {
      return { 
        success: true, 
        alreadyValidated: true, 
        ticket: data,
        message: "Ce ticket est déjà marqué comme validé/utilisé." 
      };
    }

    // Mise à jour du statut dans Firestore
    await updateDoc(ticketDoc.ref, {
      imprimer: true,
      validatedAt: new Date().toISOString()
    });

    return { 
      success: true, 
      alreadyValidated: false, 
      ticket: data,
      message: "Ticket validé avec succès !" 
    };
  } catch (error: any) {
    console.error("Erreur Scan:", error);
    throw new Error(error.message || "Erreur lors de la validation du scan.");
  }
}
