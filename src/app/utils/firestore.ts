// SRP: This function only fetches a single borrower by ID, not responsible for UI or other logic
export async function fetchBorrowerById(borrowerId: string): Promise<Borrower | null> {
  try {
    const docRef = doc(db, 'borrowers', borrowerId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    const data = docSnap.data();
    // OCP: Borrower shape is defined by the Borrower type, easy to extend
    return {
      id: docSnap.id,
      name: data.name ?? '',
      loanAmount: data.loanAmount ?? 0,
      rateOfInterest: data.rateOfInterest ?? '',
      startDate: data.startDate ?? '',
      endDate: data.endDate ?? '',
      daysBetween: data.daysBetween ?? '',
      totalAmount: data.totalAmount ?? '',
      status: data.status ?? '',
      dueDate: data.dueDate ?? '',
      applicationId: data.applicationId ?? '',
      numericId: data.numericId ?? '',
    };
  } catch (e) {
    console.error('Error fetching borrower:', e);
    return null;
  }
}
// SRP: Only deletes a payment, not responsible for UI or other logic
export async function deletePayment(borrowerId: string, paymentId: string): Promise<void> {
  try {
    const paymentDoc = doc(db, 'borrowers', borrowerId, 'payments', paymentId);
    await deleteDoc(paymentDoc);
  } catch (e) {
    console.error('Error deleting payment:', e);
    throw e;
  }
}

export async function updateApplication(id: string, updatedData: any) {
  try {
    await updateDoc(doc(db, 'applications', id), updatedData);
  } catch (e) {
    console.error('Error updating application:', e);
    throw e;
  }
}
import { deleteDoc } from 'firebase/firestore';
export async function deleteApplication(id: string) {
  try {
    await deleteDoc(doc(db, 'applications', id));
  } catch (e) {
    console.error('Error deleting application:', e);
    throw e;
  }
}

export async function deleteBorrower(id: string) {
  try {
    await deleteDoc(doc(db, 'borrowers', id));
  } catch (e) {
    console.error('Error deleting borrower:', e);
    throw e;
  }
}
export async function updateApplicationStatus(id: string, status: string) {
  const applicationRef = doc(db, 'applications', id);
  await updateDoc(applicationRef, { status });
  if (status === 'Approved') {
    // Fetch the application data
    const appSnap = await getDoc(applicationRef);
    const appData = appSnap.data();
    if (appData) {
      // Add to borrowers collection, copy all fields from application
      await addDoc(collection(db, 'borrowers'), {
        ...appData,
        status: 'Approved',
        applicationId: id
      });
    }
  }
}

import { db } from '../../firebase';
import { doc, updateDoc, getDoc, collection, addDoc, getDocs, setDoc, query, where, orderBy } from 'firebase/firestore';

export async function saveApplication(application: any) {
  try {
    // Get the current max snNo
    const appsSnap = await getDocs(collection(db, 'applications'));
    let maxSnNo = 0;
    appsSnap.forEach(docSnap => {
      const data = docSnap.data();
      if (data && data.snNo && data.snNo > maxSnNo) {
        maxSnNo = data.snNo;
      }
    });
    const newApp = { ...application, snNo: maxSnNo + 1 };
    const docRef = await addDoc(collection(db, 'applications'), newApp);
    return docRef.id;
  } catch (e) {
    console.error('Error adding application:', e);
    throw e;
  }
}

export async function saveBorrower(borrower: any) {
  try {
    // Get the current max id
    const borrowersSnap = await getDocs(collection(db, 'borrowers'));
    let maxId = 0;
    borrowersSnap.forEach(docSnap => {
      const data = docSnap.data();
      if (data && data.numericId && data.numericId > maxId) {
        maxId = data.numericId;
      }
    });
    const newId = (maxId + 1).toString();
    await setDoc(doc(db, 'borrowers', newId), { ...borrower, numericId: Number(newId) });
    return newId;
  } catch (e) {
    console.error('Error adding borrower:', e);
    throw e;
  }
}

export async function fetchApplications() {
  const querySnapshot = await getDocs(collection(db, 'applications'));
  return querySnapshot.docs.map((doc, idx) => {
    const data = doc.data();
    return { id: doc.id, snNo: data.snNo ?? (idx + 1), ...data };
  });
}

export async function fetchBorrowers() {
  const querySnapshot = await getDocs(collection(db, 'borrowers'));
  return querySnapshot.docs.map((doc, idx) => {
    const data = doc.data();
    return {
      id: doc.id,
      snNo: data.snNo ?? (idx + 1),
      name: data.name ?? '',
      loanAmount: data.loanAmount ?? 0,
      rateOfInterest: data.rateOfInterest ?? '',
      startDate: data.startDate ?? '',
      endDate: data.endDate ?? '',
      daysBetween: data.daysBetween ?? '',
      totalAmount: data.totalAmount ?? '',
      status: data.status ?? '',
      dueDate: data.dueDate ?? '',
      applicationId: data.applicationId ?? '',
      numericId: data.numericId ?? '',
    };
  });
}

// SRP: Only saves a payment, not responsible for validation or UI
// OCP: Accepts a payment object, can be extended
export async function savePayment(borrowerId: string, payment: Payment): Promise<void> {
  try {
    const paymentsCol = collection(db, 'borrowers', borrowerId, 'payments');
    await addDoc(paymentsCol, payment);
  } catch (e) {
    console.error('Error saving payment:', e);
    throw e;
  }
}

// SRP: Only fetches payments, not responsible for UI or other logic
export async function fetchPayments(borrowerId: string): Promise<Payment[]> {
  try {
    const paymentsCol = collection(db, 'borrowers', borrowerId, 'payments');
    const q = query(paymentsCol, orderBy('date', 'asc'));
    const snapshot = await getDocs(q);
    // OCP: Payment shape is defined by Payment type
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Payment));
  } catch (e) {
    console.error('Error fetching payments:', e);
    return [];
  }
}
// ISP: Define focused types for each entity
export type Borrower = {
  id: string;
  name: string;
  loanAmount: number;
  rateOfInterest: string;
  startDate: string;
  endDate: string;
  daysBetween: string;
  totalAmount: string;
  status: string;
  dueDate: string;
  applicationId: string;
  numericId: string;
};

export type Payment = {
  id?: string; // Optional for new payments, required when reading from Firestore
  amount: number;
  date: string;
};