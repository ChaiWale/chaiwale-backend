import dotenv from 'dotenv';
dotenv.config();
import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(url, key);

async function consolidateHalfFullDishes() {
  console.log('[CONSOLIDATE] Fetching all menu items from Supabase...');
  const { data: allItems, error: fetchErr } = await supabase.from('menu_items').select('*');
  if (fetchErr) {
    console.error('Fetch error:', fetchErr);
    return;
  }

  const pairs: Record<string, { Half?: any; Full?: any }> = {};
  for (const item of allItems || []) {
    const match = item.name.match(/^(.*?)\s*\((Half|Full)\)$/i);
    if (match) {
      const baseName = match[1].trim();
      const portion = (match[2].charAt(0).toUpperCase() + match[2].slice(1).toLowerCase()) as 'Half' | 'Full';
      if (!pairs[baseName]) {
        pairs[baseName] = {};
      }
      pairs[baseName][portion] = item;
    }
  }

  console.log(`[CONSOLIDATE] Found ${Object.keys(pairs).length} base dishes with Half/Full portions.`);
  let consolidatedCount = 0;

  for (const [baseName, portions] of Object.entries(pairs)) {
    const fullItem = portions.Full;
    const halfItem = portions.Half;

    if (!fullItem && !halfItem) continue;

    const master = fullItem || halfItem;
    const duplicate = (master.id === fullItem?.id) ? halfItem : fullItem;

    const fullPrice = fullItem ? Number(fullItem.base_price) : Number(halfItem.base_price);
    const halfPrice = halfItem ? Number(halfItem.base_price) : Math.round(fullPrice * 0.6);

    // 1. Update master item name
    const cleanSlug = baseName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const { error: updateErr } = await supabase.from('menu_items').update({
      name: baseName,
      slug: `${cleanSlug}-${master.id.slice(0, 4)}`,
      base_price: fullPrice,
      updated_at: new Date().toISOString()
    }).eq('id', master.id);

    if (updateErr) {
      console.error(`Failed to update ${baseName}:`, updateErr.message);
      continue;
    }

    // 2. Clear existing variants
    await supabase.from('menu_item_variants').delete().eq('menu_item_id', master.id);

    // 3. Insert Half & Full variants
    const { error: variantErr } = await supabase.from('menu_item_variants').insert([
      {
        menu_item_id: master.id,
        name: 'Half',
        price: halfPrice,
        is_available: true
      },
      {
        menu_item_id: master.id,
        name: 'Full',
        price: fullPrice,
        is_available: true
      }
    ]);

    if (variantErr) {
      console.error(`Failed to insert variants for ${baseName}:`, variantErr.message);
      continue;
    }

    // 4. Delete duplicate row if exists
    if (duplicate && duplicate.id !== master.id) {
      await supabase.from('menu_item_variants').delete().eq('menu_item_id', duplicate.id);
      await supabase.from('menu_items').delete().eq('id', duplicate.id);
    }

    consolidatedCount++;
    console.log(`✓ Consolidated: "${baseName}" -> Half: ₹${halfPrice}, Full: ₹${fullPrice}`);
  }

  console.log(`\n[CONSOLIDATE] All done! Successfully converted ${consolidatedCount} dishes to portion variants.`);
}

consolidateHalfFullDishes().catch(console.error);
