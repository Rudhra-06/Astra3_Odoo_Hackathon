function extractInvoiceFields(text = '') {
  const value = pattern => text.match(pattern)?.[1]?.trim() || null;
  const amount = value(/(?:total|amount|grand total)\s*[:₹$]?\s*([\d,]+(?:\.\d{1,2})?)/i);
  return { vendor: value(/(?:vendor|supplier|sold by)\s*[:#-]?\s*([^\n]+)/i), purchaseDate: value(/(?:invoice date|purchase date|date)\s*[:#-]?\s*(\d{1,4}[\/-]\d{1,2}[\/-]\d{1,4})/i), serialNumber: value(/(?:serial(?: number| no\.?)?)\s*[:#-]?\s*([\w-]+)/i), warranty: value(/warranty\s*[:#-]?\s*([^\n]+)/i), amount: amount ? Number(amount.replace(/,/g, '')) : null };
}
module.exports = { extractInvoiceFields };
