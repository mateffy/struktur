// src/main/index.ts
console.log("Struktur Desktop - Production Mode");
var root = document.getElementById("root");
if (root) {
  root.innerHTML = `
    <div style="
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      gap: 20px;
      padding: 40px;
      text-align: center;
    ">
      <h1 style="color: #7a5c3a; font-size: 28px; font-weight: 600;">
        Struktur Desktop
      </h1>
      <p style="color: #a0926f; font-size: 16px; max-width: 400px;">
        Production build placeholder.
      </p>
      <p style="color: #5c4b3d; font-size: 14px; margin-top: 20px;">
        To use the full app, run in development mode:
      </p>
      <code style="
        background: #ede5d8;
        padding: 12px 16px;
        border-radius: 6px;
        font-family: monospace;
        font-size: 13px;
        color: #2d1b0e;
      ">bun run dev</code>
    </div>
  `;
}
