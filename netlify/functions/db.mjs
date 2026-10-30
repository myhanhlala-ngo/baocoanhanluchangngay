// Kho dữ liệu chung cho báo cáo 일별 인원현황표 (Netlify Functions + Netlify Blobs)
// GET  /api/db?since=<ms>            → các bản ghi thay đổi sau mốc thời gian (bỏ qua lịch sử phiên bản)
// GET  /api/db?prefix=versions/      → toàn bộ bản ghi có tiền tố (dùng cho Lịch sử phiên bản)
// POST /api/db  {ops:[{op:'set'|'delete'|'add', path, data}]}
import { getStore } from "@netlify/blobs";

const PATH = /^(months|staff|org|orgimg|versions)\/[A-Za-z0-9_\-.:]{1,80}$/;
const INDEX = "__index";

async function readIndex(store) {
  const r = await store.getWithMetadata(INDEX, { type: "json" });
  return r ? { idx: r.data || {}, etag: r.etag } : { idx: {}, etag: null };
}

// cập nhật mục lục (path → phiên bản) an toàn khi nhiều người lưu cùng lúc
async function bumpIndex(store, changes) {
  for (let i = 0; i < 8; i++) {
    const { idx, etag } = await readIndex(store);
    Object.assign(idx, changes);
    const res = etag
      ? await store.setJSON(INDEX, idx, { onlyIfMatch: etag })
      : await store.setJSON(INDEX, idx, { onlyIfNew: true });
    if (!res || res.modified !== false) return;
    await new Promise((r) => setTimeout(r, 40 + Math.random() * 120));
  }
  throw new Error("index busy");
}

export async function handle(req, store) {
  const url = new URL(req.url);
  const cors = { "cache-control": "no-store" };
  try {
    if (req.method === "GET") {
      const { idx } = await readIndex(store);
      const prefix = url.searchParams.get("prefix");
      const since = +url.searchParams.get("since") || 0;
      const keys = Object.keys(idx).filter((k) =>
        prefix ? k.startsWith(prefix) && !idx[k].del : !k.startsWith("versions/") && idx[k].ver > since);
      const docs = await Promise.all(keys.map(async (k) =>
        idx[k].del ? { path: k, ver: idx[k].ver, del: 1 } : { path: k, ver: idx[k].ver, data: await store.get(k, { type: "json" }) }));
      return Response.json({ now: Date.now(), docs }, { headers: cors });
    }
    if (req.method === "POST") {
      const body = await req.json();
      const ops = Array.isArray(body && body.ops) ? body.ops.slice(0, 60) : [];
      const now = Date.now(), changes = {}, paths = [];
      for (const o of ops) {
        let p = String(o.path || "");
        if (o.op === "add") p = p.replace(/\/+$/, "") + "/" + now.toString(36) + Math.random().toString(36).slice(2, 8);
        if (!PATH.test(p)) return Response.json({ error: "bad path " + p }, { status: 400 });
        if (o.op === "delete") { await store.delete(p); changes[p] = { ver: now, del: 1 }; }
        else { await store.setJSON(p, o.data == null ? {} : o.data); changes[p] = { ver: now }; }
        paths.push(p);
      }
      if (paths.length) await bumpIndex(store, changes);
      return Response.json({ ok: true, now, paths }, { headers: cors });
    }
    return new Response("Method not allowed", { status: 405 });
  } catch (e) {
    return Response.json({ error: String(e && e.message || e) }, { status: 500 });
  }
}

export default (req) => handle(req, getStore({ name: "dailyhc", consistency: "strong" }));
export const config = { path: "/api/db" };
