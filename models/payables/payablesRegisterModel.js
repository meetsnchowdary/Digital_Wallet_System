import { db } from '../../config/firebase.js';

export const createPayablesRegisterEntry = async (tenantId, data) => {
  const payablesRegisterRef = db.collection('tenants').doc(tenantId).collection('payablesRegister');
  const newEntry = await payablesRegisterRef.add({
    vendorId: data.vendorId,
    agentId: data.agentId || null, // For Agent Commission Payments
    amount: data.amount,
    transactionType: data.transactionType, // 'Debit' or 'Credit'
    date: new Date(),
    reference: data.reference,
    description: data.description || '',
    status: 'Pending',
  });
  return newEntry.id;
};

export const getAllPayables = async (tenantId) => {
  const payablesSnapshot = await db.collection('tenants').doc(tenantId).collection('payablesRegister').get();
  return payablesSnapshot.docs.map(doc => doc.data());
};

export const getPayablesByVendor = async (tenantId, vendorId) => {
  const payablesSnapshot = await db.collection('tenants').doc(tenantId)
    .collection('payablesRegister')
    .where('vendorId', '==', vendorId)
    .get();
  
  return payablesSnapshot.docs.map(doc => doc.data());
};
