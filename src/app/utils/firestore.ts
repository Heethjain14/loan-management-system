
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

// Save a payment for a borrower
export async function savePayment(borrowerId: string, payment: { amount: number, date: string }) {
  try {
    // Payments are stored in a subcollection under each borrower
    const paymentsCol = collection(db, 'borrowers', borrowerId, 'payments');
    await addDoc(paymentsCol, payment);
  } catch (e) {
    console.error('Error saving payment:', e);
    throw e;
  }
}

// Fetch payment history for a borrower
export async function fetchPayments(borrowerId: string) {
  try {
    const paymentsCol = collection(db, 'borrowers', borrowerId, 'payments');
    const q = query(paymentsCol, orderBy('date', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc, idx) => ({ id: doc.id, ...doc.data() }));
  } catch (e) {
    console.error('Error fetching payments:', e);
    return [];
  }
}