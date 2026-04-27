
'use server';

import { initializeApp, getApps } from "firebase/app";
import { getFirestore, collection, query, where, getDocs, updateDoc, limit } from "firebase/firestore";
import { firebaseConfig } from "@/firebase/config";

/**
 * Valide un ticket en le marquant comme 'imprimer: true' (validé) dans Firestore.
 * Cette action est irréversible pour garantir l'unicité du scan.
 */
export async function validateTicketScanAction(code: string) {
  try {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    const db = getFirestore(app);

    // On cherche le ticket par son code unique
    const q = query(collection(db, "tickets"), where("code", "==", code), limit(1));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return { success: false, message: "Ticket invalide : ce code n'existe pas." };
    }

    const ticketDoc = querySnapshot.docs[0];
    const data = ticketDoc.data();

    // Vérification de l'état actuel : si déjà marqué comme imprimé/validé
    if (data.imprimer === true) {
      return { 
        success: true, 
        alreadyValidated: true, 
        ticket: data,
        message: "Attention : Ce ticket a déjà été validé." 
      };
    }

    // MISE À JOUR CRITIQUE : Marquer le ticket comme imprimé (donc utilisé)
    await updateDoc(ticketDoc.ref, {
      imprimer: true,
      validatedAt: new Date().toISOString(),
      status: "used"
    });

    return { 
      success: true, 
      alreadyValidated: false, 
      ticket: { ...data, imprimer: true },
      message: "Ticket validé ! Accès autorisé." 
    };
  } catch (error: any) {
    console.error("Erreur Scan Logic:", error);
    throw new Error(error.message || "Erreur technique lors de la validation.");
  }
}
