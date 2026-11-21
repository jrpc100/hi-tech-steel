
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Item = {
  code: string;
  spec: string;
  dimensions: string;
  qty: string;
  rate: string;
};

type OCRResult = {
  generated_text?: string;
};

const blankItem = (): Item => ({
  code: "",
  spec: "",
  dimensions: "",
  qty: "1",
  rate: "",
});

const money = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);

export default function EstimatePage() {
  const router = useRouter();

  const [checking, setChecking] = useState(true);
  const [customer, setCustomer] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [advance, setAdvance] = useState("0");
  const [items, setItems] = useState<Item[]>([blankItem()]);
  const [photo, setPhoto] = useState("");
  const [photoName, setPhotoName] = useState("");

  const [ocrText, setOcrText] = useState("");
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrProgress, setOcrProgress] = useState("");
  const [ocrError, setOcrError] = useState("");

  useEffect(() => {
    fetch("/api/admin/session", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (!data.authenticated) router.replace("/admin");
        else setChecking(false);
      })
      .catch(() => router.replace("/admin"));
  }, [router]);

  useEffect(() => {
    return () => {
      if (photo) URL.revokeObjectURL(photo);
    };
  }, [photo]);

  const rows = useMemo(
    () =>
      items.map((item) => {
        const qty = Math.max(0, Number(item.qty) || 0);
        const rate = Math.max(0, Number(item.rate) || 0);

        return {
          ...item,
          qtyValue: qty,
          amount: qty * rate,
        };
      }),
    [items]
  );

  const totalQty = rows.reduce((s, r) => s + r.qtyValue, 0);
  const total = rows.reduce((s, r) => s + r.amount, 0);
  const paid = Math.max(0, Number(advance) || 0);
  const balance = total - paid;

  function updateItem(index: number, key: keyof Item, value: string) {
    setItems((old) =>
      old.map((item, i) =>
        i === index ? { ...item, [key]: value } : item
      )
    );
  }

  function uploadPhoto(file?: File) {
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      alert("JPG, PNG or WEBP photo only.");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      alert("Photo must be below 8 MB.");
      return;
    }

    if (photo) URL.revokeObjectURL(photo);

    setPhoto(URL.createObjectURL(file));
    setPhotoName(file.name);
    setOcrText("");
    setOcrError("");
    setOcrProgress("");
  }

  async function readHandwriting() {
    if (!photo) {
      alert("Please upload a handwritten bill photo first.");
      return;
    }

    setOcrLoading(true);
    setOcrError("");
    setOcrText("");
    setOcrProgress("Loading handwriting recognition model...");

    try {
      const { pipeline } = await import("@huggingface/transformers");

      const recognizer = await pipeline(
        "image-to-text",
        "Xenova/trocr-small-handwritten",
        {
          dtype: "q8",
        }
      );

      setOcrProgress("Preparing image...");

      const image = new Image();

      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () => reject(new Error("Could not load image."));
        image.src = photo;
      });

      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      if (!context) {
        throw new Error("Image processing is not supported.");
      }

      const width = image.naturalWidth;
      const height = image.naturalHeight;

      if (!width || !height) {
        throw new Error("Invalid image.");
      }

      // Split the bill into horizontal sections.
      // TrOCR is a line-recognition model, so results may be imperfect.
      const sectionCount = Math.min(12, Math.max(4, Math.ceil(height / 180)));
      const sectionHeight = Math.ceil(height / sectionCount);
      const results: string[] = [];

      canvas.width = width;
      canvas.height = sectionHeight;

      for (let i = 0; i < sectionCount; i++) {
        const y = i * sectionHeight;
        const currentHeight = Math.min(sectionHeight, height - y);

        if (currentHeight <= 0) continue;

        canvas.height = currentHeight;
        context.clearRect(0, 0, width, currentHeight);
        context.drawImage(
          image,
          0,
          y,
          width,
          currentHeight,
          0,
          0,
          width,
          currentHeight
        );

        setOcrProgress(
          `Reading section ${i + 1} of ${sectionCount}...`
        );

        const result = (await recognizer(
          canvas.toDataURL("image/png")
        )) as OCRResult[];

        const line = result
          ?.map((entry) => entry.generated_text || "")
          .join(" ")
          .trim();

        if (line) results.push(line);
      }

      const extracted = results.join("\n").trim();

      if (!extracted) {
        setOcrError(
          "No readable text found. Try a clearer, brighter photo."
        );
      } else {
        setOcrText(extracted);
        setOcrProgress("Reading complete. Please verify the text.");
      }
    } catch (error) {
      console.error(error);
      setOcrError(
        "OCR failed. Check your internet connection and try again. The first model download may take time."
      );
    } finally {
      setOcrLoading(false);
    }
  }

  function addOCRLineAsItem() {
    const lines = ocrText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    if (!lines.length) {
      alert("No OCR text available.");
      return;
    }

    setItems((old) => [
      ...old,
      ...lines.map((line) => ({
        ...blankItem(),
        code: line,
      })),
    ]);

    alert(
      "OCR lines added to Item / Code. Please edit each row and enter the correct details, quantity and rate."
    );
  }

  if (checking) {
    return <main className="estimate-shell">Checking admin access...</main>;
  }

  return (
    <main className="estimate-shell">
      <div className="toolbar no-print">
        <a href="/admin">← Back to Admin</a>
        <button onClick={() => window.print()}>
          Download / Print PDF
        </button>
      </div>

      <section className="upload-panel no-print">
        <h1>Smart Estimate Generator</h1>
        <p>
          Upload a handwritten bill photo. The free handwriting
          recognition model will try to read the writing.
        </p>

        <label className="upload-button">
          Upload handwritten bill
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => {
              uploadPhoto(e.target.files?.[0]);
              e.currentTarget.value = "";
            }}
          />
        </label>

        {photoName && <p>Selected: {photoName}</p>}

        {photo && (
          <img
            src={photo}
            alt="Original handwritten bill"
            className="source-photo"
          />
        )}

        {photo && (
          <button
            className="ocr-button"
            onClick={readHandwriting}
            disabled={ocrLoading}
          >
            {ocrLoading ? "Reading handwriting..." : "Read Handwriting (Free AI)"}
          </button>
        )}

        {ocrProgress && <p className="ocr-status">{ocrProgress}</p>}

        {ocrError && <p className="ocr-error">{ocrError}</p>}

        {ocrText !== "" && (
          <div className="ocr-result">
            <h3>Recognized Text — Edit and Verify</h3>
            <p>
              Check spelling, measurements and numbers carefully.
              Recognition may not be accurate.
            </p>

            <textarea
              value={ocrText}
              onChange={(e) => setOcrText(e.target.value)}
              rows={9}
              placeholder="Recognized handwriting appears here..."
            />

            <button onClick={addOCRLineAsItem}>
              Add OCR Lines to Estimate Items
            </button>
          </div>
        )}
      </section>

      <article className="paper">
        <header className="brand">
          <h1>HI TECH DOOR &amp; WINDOWS</h1>
          <p>Perinthalmanna Road, KOPPAM</p>
          <strong>Mob: +91 97450 46924</strong>
          <div className="estimate-tag">ESTIMATE</div>
        </header>

        <div className="customer-line">
          <label>
            Customer Name:
            <input
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              placeholder="Customer name"
            />
          </label>

          <label>
            Date:
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>
        </div>

        <section className="spec-box">
          <h3>MATERIAL &amp; FABRICATION SPECIFICATIONS</h3>
          <div className="spec-grid">
            <p>• Frame Sheet: 16 kg Tata Galvano 120gsm GI Sheet</p>
            <p>• Coating: Epoxy Primer</p>
            <p>• Frame Profile: Mixed (9×4, 6×4, 4×3 Frame)</p>
            <p>• Technology: Laser Cutting &amp; Locking System</p>
            <p>• Grill Pipe: Apollo Pipe</p>
            <p>• Hardware: Stainless Steel Hinges</p>
          </div>
        </section>

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Sl No.</th>
                <th>Item / Code</th>
                <th>Spec / Type</th>
                <th>Dimensions (cm)</th>
                <th>Qty</th>
                <th>Rate (₹)</th>
                <th>Total (₹)</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((row, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>
                    <input
                      value={row.code}
                      onChange={(e) =>
                        updateItem(i, "code", e.target.value)
                      }
                      placeholder="Item"
                    />
                  </td>
                  <td>
                    <input
                      value={row.spec}
                      onChange={(e) =>
                        updateItem(i, "spec", e.target.value)
                      }
                      placeholder="4×3"
                    />
                  </td>
                  <td>
                    <input
                      value={row.dimensions}
                      onChange={(e) =>
                        updateItem(i, "dimensions", e.target.value)
                      }
                      placeholder="210 × 120"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      value={row.qty}
                      onChange={(e) =>
                        updateItem(i, "qty", e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      value={row.rate}
                      onChange={(e) =>
                        updateItem(i, "rate", e.target.value)
                      }
                      placeholder="0"
                    />
                  </td>
                  <td className="amount">₹ {money(row.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="row-actions no-print">
          <button
            onClick={() =>
              setItems((old) => [...old, blankItem()])
            }
          >
            + Add Item
          </button>

          {items.length > 1 && (
            <button
              onClick={() =>
                setItems((old) => old.slice(0, -1))
              }
            >
              Remove Last Item
            </button>
          )}
        </div>

        <section className="totals">
          <div>
            <b>TOTAL QUANTITY &amp; AMOUNT</b>
            <strong>{totalQty}</strong>
            <strong>₹ {money(total)}</strong>
          </div>

          <div>
            <b>ADVANCE PAID</b>
            <input
              type="number"
              min="0"
              value={advance}
              onChange={(e) => setAdvance(e.target.value)}
            />
            <strong>₹ {money(paid)}</strong>
          </div>

          <div className="balance">
            <b>BALANCE DUE</b>
            <strong>₹ {money(balance)}</strong>
          </div>
        </section>

        <footer className="signatures">
          <div>Customer Signature</div>
          <div>Authorized Signatory</div>
        </footer>

        <div className="paper-footer">
          <span>HI TECH DOOR &amp; WINDOWS — ESTIMATE</span>
          <span>Page 1 of 1</span>
        </div>
      </article>

      <style jsx>{`
        .estimate-shell {
          min-height: 100vh;
          background: #f3f6fb;
          color: #14243b;
          padding: 18px;
        }

        .toolbar {
          max-width: 1000px;
          margin: 0 auto 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
        }

        .toolbar a {
          color: #1769e8;
          font-weight: bold;
        }

        button,
        .upload-button {
          background: #1769e8;
          color: white;
          border: 0;
          padding: 11px 15px;
          border-radius: 7px;
          cursor: pointer;
          font-weight: bold;
        }

        button:disabled {
          opacity: 0.6;
          cursor: wait;
        }

        .upload-panel {
          max-width: 1000px;
          margin: 0 auto 18px;
          padding: 18px;
          background: white;
          border: 1px solid #dce4ee;
          border-radius: 12px;
        }

        .upload-panel p {
          color: #64748b;
          line-height: 1.5;
        }

        .upload-button {
          display: inline-block;
        }

        .upload-button input {
          display: none;
        }

        .source-photo {
          display: block;
          max-width: 100%;
          max-height: 300px;
          object-fit: contain;
          margin-top: 12px;
        }

        .ocr-button {
          display: block;
          margin-top: 14px;
        }

        .ocr-status {
          color: #1769e8 !important;
          font-weight: bold;
        }

        .ocr-error {
          color: #c62828 !important;
          font-weight: bold;
        }

        .ocr-result {
          margin-top: 18px;
          padding: 14px;
          border: 1px solid #dce4ee;
          border-radius: 9px;
          background: #f8faff;
        }

        .ocr-result h3 {
          margin: 0 0 8px;
          color: #263f7d;
        }

        .ocr-result textarea {
          width: 100%;
          box-sizing: border-box;
          padding: 12px;
          border: 1px solid #cbd5e1;
          border-radius: 7px;
          font: inherit;
          resize: vertical;
          margin: 8px 0 12px;
          color: #14243b;
          background: white;
        }

        .paper {
          max-width: 1000px;
          margin: auto;
          background: white;
          padding: 40px;
          min-height: 950px;
        }

        .brand {
          text-align: center;
          color: #263f7d;
          border-bottom: 2px solid #263f7d;
          padding-bottom: 12px;
        }

        .brand h1 {
          font-size: 25px;
          margin: 0 0 7px;
        }

        .brand p {
          font-size: 13px;
          margin: 0 0 5px;
        }

        .estimate-tag {
          display: table;
          margin: 10px auto 0;
          background: #263f7d;
          color: white;
          padding: 5px 18px;
          font-weight: bold;
        }

        .customer-line {
          display: flex;
          justify-content: space-between;
          gap: 15px;
          margin: 20px 0;
          font-size: 13px;
          font-weight: bold;
        }

        .customer-line input {
          border: 0;
          border-bottom: 1px dotted #64748b;
          padding: 5px;
          max-width: 220px;
        }

        .spec-box {
          background: #f7f9fc;
          border: 1px solid #cbd5e1;
          border-left: 5px solid #263f7d;
          padding: 12px;
          margin-bottom: 18px;
        }

        .spec-box h3 {
          color: #263f7d;
          font-size: 13px;
        }

        .spec-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 7px;
        }

        .spec-grid p {
          font-size: 11px;
          margin: 0;
        }

        .table-scroll {
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 11px;
        }

        th {
          background: #263f7d;
          color: white;
          padding: 9px 4px;
        }

        td {
          border: 1px solid #cbd5e1;
          padding: 5px;
          text-align: center;
        }

        td input {
          width: 100%;
          min-width: 45px;
          border: 0;
          background: transparent;
          text-align: center;
          padding: 4px 1px;
        }

        .amount {
          font-weight: bold;
          white-space: nowrap;
        }

        .row-actions {
          display: flex;
          gap: 8px;
          margin-top: 10px;
        }

        .row-actions button {
          background: #e8efff;
          color: #174ea6;
        }

        .totals {
          width: min(100%, 480px);
          margin: 16px 0 0 auto;
          border-top: 2px solid #263f7d;
        }

        .totals div {
          display: grid;
          grid-template-columns: 1fr auto auto;
          gap: 12px;
          padding: 10px;
          border-bottom: 1px solid #cbd5e1;
          font-size: 12px;
          align-items: center;
        }

        .totals b {
          text-align: right;
        }

        .totals strong:last-child {
          min-width: 100px;
          text-align: right;
        }

        .totals input {
          width: 95px;
          text-align: right;
        }

        .balance {
          background: #eef4ff;
          color: #263f7d;
        }

        .signatures {
          display: flex;
          justify-content: space-between;
          margin: 55px 0 75px;
          font-size: 11px;
        }

        .signatures div {
          width: 180px;
          text-align: center;
          border-top: 1px solid #64748b;
          padding-top: 7px;
        }

        .paper-footer {
          display: flex;
          justify-content: space-between;
          font-size: 10px;
          color: #64748b;
        }

        @media(max-width: 650px) {
          .estimate-shell {
            padding: 9px;
          }

          .paper {
            padding: 20px 12px;
          }

          .brand h1 {
            font-size: 19px;
          }

          .customer-line {
            flex-direction: column;
          }

          .spec-grid {
            grid-template-columns: 1fr;
          }

          table {
            min-width: 720px;
          }

          .toolbar {
            flex-wrap: wrap;
          }
        }

        @media print {
          @page {
            size: A4 portrait;
            margin: 12mm;
          }

          body {
            background: white !important;
          }

          .estimate-shell {
            padding: 0;
            background: white;
          }

          .no-print {
            display: none !important;
          }

          .paper {
            max-width: none;
            min-height: 0;
            padding: 0;
            box-shadow: none;
          }

          th,
          .estimate-tag,
          .spec-box,
          .balance {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>
    </main>
  );
}
