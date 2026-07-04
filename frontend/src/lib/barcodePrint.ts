/**
 * Barcode label printing utility.
 * Generates scannable barcode labels and opens them in a print-friendly window.
 */

interface BarcodeLabel {
  name: string;
  barcode: string;
  price?: number;
  sku?: string;
}

/**
 * Generate and print barcode labels for one or more products.
 * Each label is 50mm × 30mm with the barcode, product name, and price.
 */
export function printBarcodeLabels(products: BarcodeLabel[]): void {
  if (products.length === 0) return;

  const html = buildLabelHtml(products);

  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, 'barcode-labels', 'width=600,height=800');

  if (win) {
    win.onload = () => {
      win.focus();
      win.print();
      URL.revokeObjectURL(url);
    };
  } else {
    // Fallback for popup blockers
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '-9999px';
    iframe.style.bottom = '-9999px';
    iframe.style.width = '80mm';
    iframe.style.height = '1px';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);
    const iframeDoc = iframe.contentWindow?.document;
    if (iframeDoc) {
      iframeDoc.open();
      iframeDoc.write(html);
      iframeDoc.close();
      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        setTimeout(() => {
          if (document.body.contains(iframe)) document.body.removeChild(iframe);
        }, 500);
      }, 400);
    }
  }
}

function buildLabelHtml(products: BarcodeLabel[]): string {
  const labels = products.map(p => buildSingleLabel(p)).join('\n');

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Barcode Labels</title>
<script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js"><\/script>
<style>
  @page { margin: 5mm; size: auto; }
  body { margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; }
  .label-sheet {
    display: flex; flex-wrap: wrap; gap: 4mm;
    justify-content: flex-start; align-items: flex-start; padding: 5mm;
  }
  .label-card {
    width: 50mm; height: 30mm; border: 1px solid #ccc; border-radius: 2mm;
    padding: 2mm; box-sizing: border-box; display: flex; flex-direction: column;
    align-items: center; justify-content: space-between;
    page-break-inside: avoid; break-inside: avoid;
    overflow: hidden;
  }
  .label-name { font-size: 8px; font-weight: bold; text-align: center; width: 100%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .label-price { font-size: 10px; font-weight: bold; color: #333; }
  .label-sku { font-size: 7px; color: #888; }
  .label-barcode { width: 100%; height: 14mm; display: flex; align-items: center; justify-content: center; }
  .label-barcode svg { max-width: 100%; max-height: 14mm; }
  @media print {
    body { margin: 0; padding: 0; }
    .label-sheet { padding: 0; gap: 0; }
    .label-card { border: none; border-bottom: 1px dashed #ddd; width: 100%; height: auto; min-height: 25mm; padding: 3mm; page-break-inside: avoid; }
  }
</style></head><body>
  <div class="label-sheet">
    ${labels}
  </div>
  <script>
    // Render all barcodes after DOM ready
    setTimeout(() => {
      document.querySelectorAll('.barcode-raw').forEach(el => {
        try {
          const code = el.getAttribute('data-code');
          const format = code && (code.length === 13 || code.length === 12) ? 'EAN13' :
                         code && (code.length === 8) ? 'EAN8' : 'CODE128';
          JsBarcode(el, code, {
            format: format,
            width: 1.5,
            height: 40,
            displayValue: true,
            fontSize: 10,
            margin: 0
          });
        } catch(e) { /* skip invalid barcodes */ }
      });
    }, 100);
  <\/script>
</body></html>`;
}

function buildSingleLabel(p: BarcodeLabel): string {
  return `
    <div class="label-card">
      <div class="label-name">${escapeHtml(p.name)}</div>
      <div class="label-barcode">
        <svg class="barcode-raw" data-code="${escapeHtml(p.barcode)}"></svg>
      </div>
      ${p.price !== undefined ? `<div class="label-price">TSh ${p.price.toLocaleString()}</div>` : ''}
      ${p.sku ? `<div class="label-sku">${escapeHtml(p.sku)}</div>` : ''}
    </div>`;
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
