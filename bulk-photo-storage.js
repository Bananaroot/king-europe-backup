/* KING BULK · modulo foto separato, NON attivo finché non collegato.
   Richiede il client Supabase autenticato e un prodotto selezionato.
   Ridimensiona e comprime in WebP, carica nel bucket dedicato e restituisce URL.
   Non cancella foto precedenti e non modifica il database. */
window.KingBulkPhotos = {
 async upload(file, productId, supabaseClient) {
  if (!supabaseClient) throw Error('Accedi prima a Supabase.');
  if (!file || !file.type.startsWith('image/')) throw Error('Seleziona una foto valida.');
  if (!productId || !/^[a-zA-Z0-9_-]+$/.test(String(productId))) throw Error('ID prodotto non valido.');
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 600 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close?.();
  const blob = await new Promise((resolve,reject) =>
   canvas.toBlob(b => b ? resolve(b) : reject(Error('WebP non supportato')), 'image/webp', 0.76));
  if (blob.size > 1048576) throw Error('Immagine oltre 1 MB anche dopo compressione.');
  const path = `${productId}/${crypto.randomUUID()}.webp`;
  const {error} = await supabaseClient.storage.from('king-bulk-photos')
   .upload(path, blob, {contentType:'image/webp',upsert:false});
  if (error) throw error;
  const {data} = supabaseClient.storage.from('king-bulk-photos').getPublicUrl(path);
  return {url:data.publicUrl, bytes:blob.size, path};
 }
};
