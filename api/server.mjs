import http from 'http';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import Busboy from 'busboy';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const env = Object.fromEntries(
  fs.readFileSync(path.join(root, '.env'), 'utf8')
    .split(/\r?\n/)
    .filter(line => line && !line.startsWith('#') && line.includes('='))
    .map(line => { const i = line.indexOf('='); return [line.slice(0, i).trim(), line.slice(i + 1).trim()]; })
);
const pool = mysql.createPool({
  host: env.DB_HOST || '127.0.0.1',
  port: Number(env.DB_PORT || 3306),
  user: env.DB_USER || 'root',
  password: env.DB_PASSWORD || '',
  database: env.DB_NAME || 'YUNSEUL-HOME',
  charset: 'utf8mb4',
  waitForConnections: true,
  connectionLimit: 8
});
const sessions = new Map();
const COLORS = ['#ffe3ec', '#fff3b8', '#d6f1ff', '#e4ddff'];
const FACES = ['🐥', '🌸', '🍀', '🐳', '🌈'];
const MAX_IMAGE = 8 * 1024 * 1024;
const TYPES = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.gif': 'image/gif', '.webp': 'image/webp' };

function send(res, code, body) {
  const raw = JSON.stringify(body);
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(raw);
}
function readJson(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', c => { size += c.length; if (size > 2_000_000) { reject(new Error('too big')); req.destroy(); } else chunks.push(c); });
    req.on('end', () => { try { resolve(chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {}); } catch { reject(new Error('bad json')); } });
    req.on('error', reject);
  });
}
function same(a, b) {
  const x = Buffer.from(String(a));
  const y = Buffer.from(String(b));
  if (x.length !== y.length) return false;
  return crypto.timingSafeEqual(x, y);
}
function authed(req) {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : '';
  const row = sessions.get(token);
  if (!row || row.exp < Date.now()) { sessions.delete(token); return false; }
  return true;
}
function dateOf(v) {
  const d = v instanceof Date ? v : new Date(v);
  const p = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())}`;
}
function listJson(v) {
  try { const a = JSON.parse(v || '[]'); return Array.isArray(a) ? a : []; } catch { return []; }
}
function blank(html) {
  const text = String(html || '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').trim();
  return !text && !/<img\b|<iframe\b/i.test(html || '');
}
function sanitize(html) {
  let s = String(html || '')
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '')
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/javascript:/gi, '');
  s = s.replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi, m => {
    const src = /src\s*=\s*["']([^"']+)["']/i.exec(m);
    const id = src && src[1].match(/youtube(?:-nocookie)?\.com\/embed\/([A-Za-z0-9_-]{11})/);
    if (!id) return '';
    return `<div class="yt-wrap"><iframe src="https://www.youtube-nocookie.com/embed/${id[1]}?rel=0" allowfullscreen loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe></div>`;
  });
  s = s.replace(/<img\b[^>]*>/gi, m => {
    const src = /src\s*=\s*["']([^"']+)["']/i.exec(m);
    const alt = /alt\s*=\s*["']([^"']*)["']/i.exec(m);
    if (!src || !src[1].startsWith('/uploads/') || src[1].includes('..')) return '';
    const name = (alt ? alt[1] : '').replace(/[<>"']/g, '');
    return `<img src="${src[1]}" alt="${name}" style="max-width:100%;height:auto;border-radius:12px">`;
  });
  return s;
}
function imagesOf(html) {
  const out = [];
  const re = /src\s*=\s*["'](\/uploads\/[^"']+)["']/gi;
  let m;
  while ((m = re.exec(html))) if (!out.includes(m[1])) out.push(m[1]);
  return out;
}
function clip(v, n) { return String(v || '').trim().slice(0, n); }
const GOODS = {
  shell: { ms: 3600000, kind: 'wear' },
  hat: { ms: 3600000, kind: 'wear' },
  juice: { ms: 20000, kind: 'eat' },
  pop: { ms: 20000, kind: 'eat' },
  fluff: { ms: 20000, kind: 'eat' },
  towel: { ms: 3600000, kind: 'place' },
  candle: { ms: 3600000, kind: 'place' }
};
const WHO = new Set(['boy', 'girl', 'dog', 'cat']);
async function ensureShop() {
  await pool.query(`CREATE TABLE IF NOT EXISTS shop_stock (
    item_key VARCHAR(32) NOT NULL PRIMARY KEY,
    stock TINYINT NOT NULL DEFAULT 1
  )`);
  await pool.query(`CREATE TABLE IF NOT EXISTS world_fx (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    item_key VARCHAR(32) NOT NULL,
    target VARCHAR(16) NULL,
    nx DOUBLE NULL, ny DOUBLE NULL, nz DOUBLE NULL,
    started_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ends_at DATETIME NOT NULL,
    KEY idx_end (ends_at)
  )`);
  for (const key of Object.keys(GOODS)) await pool.query('INSERT IGNORE INTO shop_stock (item_key, stock) VALUES (?, 1)', [key]);
}
async function shopState(req, res) {
  await pool.query('DELETE FROM world_fx WHERE ends_at <= NOW()');
  const [stock] = await pool.query('SELECT item_key, stock FROM shop_stock');
  const [fx] = await pool.query('SELECT id, item_key, target, nx, ny, nz, started_at, ends_at FROM world_fx ORDER BY id');
  return send(res, 200, {
    items: stock.map(r => ({ key: r.item_key, stock: r.stock })),
    fx: fx.map(r => ({
      id: r.id, key: r.item_key, target: r.target, nx: r.nx, ny: r.ny, nz: r.nz,
      start: new Date(r.started_at).getTime(), end: new Date(r.ends_at).getTime()
    }))
  });
}
async function buyGood(req, res) {
  const body = await readJson(req);
  const key = String(body.key || '');
  if (!GOODS[key]) return send(res, 400, { error: '없는 상품이에요' });
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [r] = await conn.query('UPDATE shop_stock SET stock = 0 WHERE item_key = ? AND stock = 1', [key]);
    if (!r.affectedRows) { await conn.rollback(); return send(res, 409, { error: '재고가 없어 구매할 수 없어요' }); }
    await conn.commit();
    return send(res, 200, { ok: true });
  } catch (e) { await conn.rollback(); throw e; }
  finally { conn.release(); }
}
async function useGood(req, res) {
  const body = await readJson(req);
  const key = String(body.key || '');
  const spec = GOODS[key];
  if (!spec) return send(res, 400, { error: '없는 상품이에요' });
  let target = null, nx = null, ny = null, nz = null;
  if (spec.kind === 'place') {
    nx = Number(body.nx); ny = Number(body.ny); nz = Number(body.nz);
    const len = Math.hypot(nx, ny, nz);
    if (!len) return send(res, 400, { error: '놓을 곳을 찾지 못했어요' });
    nx /= len; ny /= len; nz /= len;
  } else {
    target = String(body.target || '');
    if (!WHO.has(target)) return send(res, 400, { error: '적용할 친구를 골라 주세요' });
  }
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [r] = await conn.query('UPDATE shop_stock SET stock = 1 WHERE item_key = ? AND stock = 0', [key]);
    if (!r.affectedRows) { await conn.rollback(); return send(res, 409, { error: '지갑에 없는 물건이에요' }); }
    const sec = Math.round(spec.ms / 1000);
    const [n] = await conn.query(`INSERT INTO world_fx (item_key, target, nx, ny, nz, ends_at) VALUES (?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL ${sec} SECOND))`, [key, target, nx, ny, nz]);
    await conn.commit();
    return send(res, 200, { ok: true, id: n.insertId });
  } catch (e) { await conn.rollback(); throw e; }
  finally { conn.release(); }
}
async function endFx(req, res) {
  const body = await readJson(req);
  const id = Number(body.id);
  const [r] = await pool.query("UPDATE world_fx SET ends_at = NOW() WHERE id = ? AND item_key IN ('juice','pop','fluff') AND ends_at > NOW()", [id]);
  if (!r.affectedRows) return send(res, 404, { error: '먹고 있는 모습이 없어요' });
  return send(res, 200, { ok: true });
}
function wonNum(v, required) {
  if (v === '' || v == null) return required ? NaN : null;
  const s = String(v).replace(/,/g, '').trim();
  if (!s) return required ? NaN : null;
  if (!/^\d+$/.test(s)) return NaN;
  const n = Number(s);
  if (n > 2_000_000_000) return NaN;
  return n;
}
function dayOf(v) {
  const s = String(v || '').trim();
  if (!s) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return NaN;
  const [y, m, d] = s.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== m - 1 || dt.getDate() !== d) return NaN;
  return s;
}
function httpLink(v) {
  const s = clip(v, 500);
  if (!s) return '';
  let u;
  try { u = new URL(s); } catch { return null; }
  if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
  return s;
}
function imageList(v) {
  if (!Array.isArray(v)) return [];
  const out = [];
  for (const raw of v) {
    const s = String(raw || '');
    if (!s.startsWith('/uploads/') || s.includes('..') || s.length > 300) continue;
    if (!out.includes(s)) out.push(s);
    if (out.length >= 8) break;
  }
  return out;
}
function contactOf(v) {
  const t = clip(v, 200);
  if (!t) return '';
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t)) return t;
  const digits = t.replace(/\D/g, '');
  if (digits.length >= 8 && digits.length <= 15 && /^[0-9+\-\s().]+$/.test(t)) return t;
  return '';
}
const GOODS_SQL = `SELECT id, name, price, sale_price,
  IFNULL(DATE_FORMAT(sale_from,'%Y-%m-%d'),'') AS sale_from,
  IFNULL(DATE_FORMAT(sale_to,'%Y-%m-%d'),'') AS sale_to,
  IF(sale_from IS NULL OR sale_to IS NULL, '', CONCAT(DATE_FORMAT(sale_from,'%Y.%m.%d'),' ~ ',DATE_FORMAT(sale_to,'%Y.%m.%d'))) AS sale_label,
  CASE
    WHEN sale_price IS NULL OR sale_from IS NULL OR sale_to IS NULL THEN ''
    WHEN CURDATE() < sale_from THEN 'wait'
    WHEN CURDATE() > sale_to THEN 'end'
    ELSE 'on'
  END AS sale_state,
  images, IFNULL(link,'') AS link
  FROM shop_goods`;
function mapGoods(r) {
  return {
    id: r.id, name: r.name, price: r.price,
    salePrice: r.sale_price == null ? null : r.sale_price,
    saleFrom: r.sale_from || '', saleTo: r.sale_to || '', saleLabel: r.sale_label || '',
    saleState: r.sale_state || '', onSale: r.sale_state === 'on',
    images: listJson(r.images), link: r.link || ''
  };
}
async function readGoodsBody(req) {
  const body = await readJson(req);
  const name = clip(body.name, 200);
  const price = wonNum(body.price, true);
  const salePrice = wonNum(body.salePrice, false);
  const saleFrom = dayOf(body.saleFrom);
  const saleTo = dayOf(body.saleTo);
  const link = httpLink(body.link);
  const images = imageList(body.images);
  if (!name) return { error: '상품명을 입력해 주세요' };
  if (Number.isNaN(price)) return { error: '정상 가격을 숫자로 입력해 주세요' };
  if (Number.isNaN(salePrice)) return { error: '할인가는 숫자로 입력해 주세요' };
  if (Number.isNaN(saleFrom) || Number.isNaN(saleTo)) return { error: '할인 기간을 다시 선택해 주세요' };
  if (link === null) return { error: '외부 링크는 http 또는 https 주소로 입력해 주세요' };
  if (salePrice == null && (saleFrom || saleTo)) return { error: '할인 기간을 쓰려면 할인가도 입력해 주세요' };
  if (salePrice != null && (!saleFrom || !saleTo)) return { error: '할인가를 쓰면 할인 시작일과 종료일을 모두 입력해 주세요' };
  if (saleFrom && saleTo && saleFrom > saleTo) return { error: '할인 종료일은 시작일보다 빠를 수 없어요' };
  if (salePrice != null && salePrice >= price) return { error: '할인가는 정상 가격보다 낮게 입력해 주세요' };
  return { name, price, salePrice, saleFrom, saleTo, link: link || null, images };
}
async function ensureMarket() {
  await pool.query(`CREATE TABLE IF NOT EXISTS shop_goods (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    price INT NOT NULL,
    sale_price INT NULL,
    sale_from DATE NULL,
    sale_to DATE NULL,
    images TEXT NULL,
    link VARCHAR(500) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    display CHAR(1) NOT NULL DEFAULT 'Y'
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);
  await pool.query(`CREATE TABLE IF NOT EXISTS shop_consult (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    goods_id INT NOT NULL,
    goods_name VARCHAR(200) NOT NULL,
    contact VARCHAR(200) NOT NULL,
    name VARCHAR(80) NOT NULL,
    job_title VARCHAR(80) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    seen CHAR(1) NOT NULL DEFAULT 'N',
    KEY idx_seen (seen)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);
}
const TABLES = { qna: 'qna', guestbook: 'guestbook', board: 'board', portfolio: 'portfolio', goods: 'shop_goods' };
async function hideItem(req, res, table, id) {
  if (!TABLES[table]) return send(res, 404, { error: '글을 찾을 수 없어요' });
  if (!authed(req)) return send(res, 401, { error: '관리자만 지울 수 있어요' });
  const [r] = await pool.query(`UPDATE \`${TABLES[table]}\` SET display = 'N' WHERE id = ? AND display = 'Y'`, [id]);
  if (!r.affectedRows) return send(res, 404, { error: '글을 찾을 수 없어요' });
  return send(res, 200, { ok: true });
}
async function clearAnswer(req, res, table, id) {
  if (table !== 'qna' && table !== 'guestbook') return send(res, 404, { error: '글을 찾을 수 없어요' });
  if (!authed(req)) return send(res, 401, { error: '관리자만 지울 수 있어요' });
  const [r] = await pool.query(`UPDATE \`${table}\` SET answer = NULL, answer_images = NULL, answered_at = NULL WHERE id = ? AND display = 'Y' AND answer IS NOT NULL`, [id]);
  if (!r.affectedRows) return send(res, 404, { error: '답변을 찾을 수 없어요' });
  return send(res, 200, { ok: true });
}
async function savePost(req, res, table, id) {
  if (table !== 'board' && table !== 'portfolio') return send(res, 404, { error: '글을 찾을 수 없어요' });
  if (!authed(req)) return send(res, 401, { error: '관리자만 수정할 수 있어요' });
  const body = await readJson(req);
  const title = clip(body.title, 200), subtitle = clip(body.subtitle, 300), html = sanitize(body.body);
  if (!title || !subtitle || blank(html)) return send(res, 400, { error: '제목, 부제, 내용을 입력해 주세요' });
  const [r] = await pool.query(`UPDATE \`${table}\` SET title = ?, subtitle = ?, body = ?, images = ? WHERE id = ? AND display = 'Y'`, [title, subtitle, html, JSON.stringify(imagesOf(html)), id]);
  if (!r.affectedRows) return send(res, 404, { error: '글을 찾을 수 없어요' });
  return send(res, 200, { ok: true });
}

function reserveName(dir, base, ext) {
  let n = 1;
  for (;;) {
    const filename = n === 1 ? base + ext : `${base}_${n}${ext}`;
    try {
      const fd = fs.openSync(path.join(dir, filename), 'wx');
      return { fd, filename };
    } catch (e) {
      if (e.code !== 'EEXIST') throw e;
      n = n === 1 ? 2 : n + 1;
    }
  }
}
function safeImageName(original) {
  const ext = path.extname(original || '').toLowerCase();
  if (!TYPES[ext]) return null;
  let base = path.basename(original, path.extname(original));
  base = base.replace(/[\\/:*?"<>|]/g, '_').replace(/\s+/g, ' ').trim().slice(0, 80);
  if (!base) base = 'image';
  return { base, ext: ext === '.jpeg' ? '.jpg' : ext };
}
function upload(req, res) {
  const bb = Busboy({ headers: req.headers, defParamCharset: 'utf8', limits: { files: 1, fileSize: MAX_IMAGE } });
  let saved = null;
  let failed = null;
  let tooBig = false;
  bb.on('file', (name, stream, info) => {
    const parsed = safeImageName(info.filename || '');
    const mime = info.mimeType || '';
    if (!parsed || !Object.values(TYPES).includes(mime)) {
      failed = '이미지 파일만 올릴 수 있어요';
      stream.resume();
      return;
    }
    const now = new Date();
    const p = n => String(n).padStart(2, '0');
    const folder = `${now.getFullYear()}${p(now.getMonth() + 1)}${p(now.getDate())}`;
    const dir = path.join(root, 'uploads', folder);
    fs.mkdirSync(dir, { recursive: true });
    const slot = reserveName(dir, parsed.base, parsed.ext);
    const dest = path.join(dir, slot.filename);
    const out = fs.createWriteStream(null, { fd: slot.fd });
    saved = { url: `/uploads/${folder}/${slot.filename}`, dest, out };
    stream.pipe(out);
    stream.on('limit', () => { tooBig = true; stream.unpipe(out); out.destroy(); });
    out.on('error', () => { failed = '파일을 저장하지 못했어요'; });
  });
  bb.on('error', () => send(res, 400, { error: '업로드 형식이 올바르지 않아요' }));
  bb.on('finish', () => {
    if (failed || !saved) return send(res, 400, { error: failed || '이미지 파일을 선택해 주세요' });
    const done = () => {
      if (tooBig) { fs.rmSync(saved.dest, { force: true }); return send(res, 400, { error: '이미지는 8MB 이하만 올릴 수 있어요' }); }
      send(res, 200, { url: saved.url, name: path.basename(saved.url) });
    };
    if (saved.out.writableFinished) done();
    else saved.out.on('finish', done);
  });
  req.pipe(bb);
}

const HOME_DB = 'YUNSEUL-HOME';
async function homeGuard(res) {
  try {
    if ((env.DB_NAME || '') !== HOME_DB) return send(res, 200, { ok: false });
    const [schemas] = await pool.query('SELECT SCHEMA_NAME AS n FROM information_schema.SCHEMATA WHERE SCHEMA_NAME = ?', [HOME_DB]);
    if (!schemas.length) return send(res, 200, { ok: false });
    const [cols] = await pool.query("SELECT COLUMN_NAME AS n FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'CONFIG' AND COLUMN_NAME = 'admin'", [HOME_DB]);
    if (!cols.length) return send(res, 200, { ok: false });
    const [using] = await pool.query('SELECT DATABASE() AS n');
    if (!using.length || using[0].n !== HOME_DB) return send(res, 200, { ok: false });
    return send(res, 200, { ok: true });
  } catch {
    return send(res, 200, { ok: false });
  }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://127.0.0.1');
  const route = url.pathname.replace(/\/$/, '') || '/';
  try {
    if (req.method === 'GET' && route === '/api/health') return send(res, 200, { ok: true });
    if (req.method === 'GET' && route === '/api/home-guard') return await homeGuard(res);
    if (req.method === 'GET' && route === '/api/shop') return await shopState(req, res);
    if (req.method === 'POST' && route === '/api/shop/buy') return await buyGood(req, res);
    if (req.method === 'POST' && route === '/api/shop/use') return await useGood(req, res);
    if (req.method === 'POST' && route === '/api/shop/fx/end') return await endFx(req, res);
    if (req.method === 'POST' && route === '/api/upload') return upload(req, res);
    if (req.method === 'POST' && route === '/api/admin/login') {
      const body = await readJson(req);
      const [rows] = await pool.query('SELECT admin FROM CONFIG WHERE id = 1');
      if (!rows.length || !same(body.password || '', rows[0].admin)) return send(res, 401, { error: '비밀번호가 맞지 않아요' });
      const token = crypto.randomBytes(24).toString('hex');
      sessions.set(token, { exp: Date.now() + 12 * 3600 * 1000 });
      return send(res, 200, { ok: true, token });
    }
    if (req.method === 'GET' && route === '/api/admin/session') return send(res, authed(req) ? 200 : 401, authed(req) ? { ok: true } : { error: '로그인이 필요해요' });
    if (req.method === 'GET' && route === '/api/board') {
      const [rows] = await pool.query("SELECT id, title, subtitle, body, images, color, emoji, created_at FROM board WHERE display = 'Y' ORDER BY id DESC");
      return send(res, 200, { items: rows.map(r => ({ ...r, images: listJson(r.images), date: dateOf(r.created_at) })) });
    }
    if (req.method === 'GET' && route === '/api/portfolio') {
      const [rows] = await pool.query("SELECT id, title, subtitle, body, images, emoji, tone, created_at FROM portfolio WHERE display = 'Y' ORDER BY id DESC");
      return send(res, 200, { items: rows.map(r => ({ ...r, images: listJson(r.images), date: dateOf(r.created_at) })) });
    }
    if (req.method === 'GET' && route === '/api/qna') {
      const [rows] = await pool.query("SELECT id, name, title, body, images, answer, answer_images, created_at FROM qna WHERE display = 'Y' ORDER BY id DESC");
      return send(res, 200, { items: rows.map(r => ({ ...r, images: listJson(r.images), answer_images: listJson(r.answer_images), date: dateOf(r.created_at) })) });
    }
    if (req.method === 'GET' && route === '/api/guestbook') {
      const [rows] = await pool.query("SELECT id, name, body, images, emoji, answer, answer_images, created_at FROM guestbook WHERE display = 'Y' ORDER BY id DESC");
      return send(res, 200, { items: rows.map(r => ({ ...r, images: listJson(r.images), answer_images: listJson(r.answer_images), date: dateOf(r.created_at) })) });
    }
    if (req.method === 'POST' && route === '/api/board') {
      if (!authed(req)) return send(res, 401, { error: '관리자만 글을 등록할 수 있어요' });
      const body = await readJson(req);
      const title = clip(body.title, 200), subtitle = clip(body.subtitle, 300), html = sanitize(body.body);
      if (!title || !subtitle || blank(html)) return send(res, 400, { error: '제목, 부제, 내용을 입력해 주세요' });
      const imgs = imagesOf(html);
      const [n] = await pool.query('SELECT COUNT(*) AS c FROM board');
      await pool.query('INSERT INTO board (title, subtitle, body, images, color, emoji) VALUES (?, ?, ?, ?, ?, ?)', [title, subtitle, html, JSON.stringify(imgs), COLORS[n[0].c % COLORS.length], '📝']);
      return send(res, 200, { ok: true });
    }
    if (req.method === 'POST' && route === '/api/portfolio') {
      if (!authed(req)) return send(res, 401, { error: '관리자만 등록할 수 있어요' });
      const body = await readJson(req);
      const title = clip(body.title, 200), subtitle = clip(body.subtitle, 300), html = sanitize(body.body);
      if (!title || !subtitle || blank(html)) return send(res, 400, { error: '제목, 부제, 내용을 입력해 주세요' });
      const tones = ['#ffd1d1,#ffe9b8', '#d6e8ff,#e5d9ff', '#ffd6ea,#ffe3c2', '#c9f1e4,#d6ecff'];
      const [n] = await pool.query('SELECT COUNT(*) AS c FROM portfolio');
      await pool.query('INSERT INTO portfolio (title, subtitle, body, images, emoji, tone) VALUES (?, ?, ?, ?, ?, ?)', [title, subtitle, html, JSON.stringify(imagesOf(html)), '💼', tones[n[0].c % tones.length]]);
      return send(res, 200, { ok: true });
    }
    if (req.method === 'POST' && route === '/api/qna') {
      const body = await readJson(req);
      const title = clip(body.title, 200), name = clip(body.name, 80) || '익명', html = sanitize(body.body);
      if (!title || blank(html)) return send(res, 400, { error: '제목과 질문을 입력해 주세요' });
      await pool.query('INSERT INTO qna (name, title, body, images) VALUES (?, ?, ?, ?)', [name, title, html, JSON.stringify(imagesOf(html))]);
      return send(res, 200, { ok: true });
    }
    const boardHide = route.match(/^\/api\/board\/(\d+)\/hide$/);
    if (req.method === 'POST' && boardHide) return await hideItem(req, res, 'board', Number(boardHide[1]));
    const boardEdit = route.match(/^\/api\/board\/(\d+)$/);
    if (req.method === 'POST' && boardEdit) return await savePost(req, res, 'board', Number(boardEdit[1]));
    const pfHide = route.match(/^\/api\/portfolio\/(\d+)\/hide$/);
    if (req.method === 'POST' && pfHide) return await hideItem(req, res, 'portfolio', Number(pfHide[1]));
    const pfEdit = route.match(/^\/api\/portfolio\/(\d+)$/);
    if (req.method === 'POST' && pfEdit) return await savePost(req, res, 'portfolio', Number(pfEdit[1]));
    const ansClear = route.match(/^\/api\/qna\/(\d+)\/answer\/clear$/);
    if (req.method === 'POST' && ansClear) return await clearAnswer(req, res, 'qna', Number(ansClear[1]));
    const ans = route.match(/^\/api\/qna\/(\d+)\/answer$/);
    if (req.method === 'POST' && ans) {
      if (!authed(req)) return send(res, 401, { error: '관리자만 답변할 수 있어요' });
      const body = await readJson(req);
      const html = sanitize(body.answer);
      if (blank(html)) return send(res, 400, { error: '답변을 입력해 주세요' });
      const [r] = await pool.query("UPDATE qna SET answer = ?, answer_images = ?, answered_at = NOW() WHERE id = ? AND display = 'Y'", [html, JSON.stringify(imagesOf(html)), Number(ans[1])]);
      if (!r.affectedRows) return send(res, 404, { error: '질문을 찾을 수 없어요' });
      return send(res, 200, { ok: true });
    }
    const qnaHide = route.match(/^\/api\/qna\/(\d+)\/hide$/);
    if (req.method === 'POST' && qnaHide) return await hideItem(req, res, 'qna', Number(qnaHide[1]));
    const gbAnsClear = route.match(/^\/api\/guestbook\/(\d+)\/answer\/clear$/);
    if (req.method === 'POST' && gbAnsClear) return await clearAnswer(req, res, 'guestbook', Number(gbAnsClear[1]));
    const gbAns = route.match(/^\/api\/guestbook\/(\d+)\/answer$/);
    if (req.method === 'POST' && gbAns) {
      if (!authed(req)) return send(res, 401, { error: '관리자만 답변할 수 있어요' });
      const body = await readJson(req);
      const html = sanitize(body.answer);
      if (blank(html)) return send(res, 400, { error: '답변을 입력해 주세요' });
      const [r] = await pool.query("UPDATE guestbook SET answer = ?, answer_images = ?, answered_at = NOW() WHERE id = ? AND display = 'Y'", [html, JSON.stringify(imagesOf(html)), Number(gbAns[1])]);
      if (!r.affectedRows) return send(res, 404, { error: '방명록을 찾을 수 없어요' });
      return send(res, 200, { ok: true });
    }
    const gbHide = route.match(/^\/api\/guestbook\/(\d+)\/hide$/);
    if (req.method === 'POST' && gbHide) return await hideItem(req, res, 'guestbook', Number(gbHide[1]));
    if (req.method === 'GET' && route === '/api/goods') {
      const [rows] = await pool.query(GOODS_SQL + " WHERE display = 'Y' ORDER BY id DESC");
      return send(res, 200, { items: rows.map(mapGoods) });
    }
    if (req.method === 'POST' && route === '/api/goods') {
      if (!authed(req)) return send(res, 401, { error: '관리자만 상품을 등록할 수 있어요' });
      const g = await readGoodsBody(req);
      if (g.error) return send(res, 400, { error: g.error });
      await pool.query('INSERT INTO shop_goods (name, price, sale_price, sale_from, sale_to, images, link) VALUES (?, ?, ?, ?, ?, ?, ?)', [g.name, g.price, g.salePrice, g.saleFrom, g.saleTo, JSON.stringify(g.images), g.link]);
      return send(res, 200, { ok: true });
    }
    const goodsHide = route.match(/^\/api\/goods\/(\d+)\/hide$/);
    if (req.method === 'POST' && goodsHide) return await hideItem(req, res, 'goods', Number(goodsHide[1]));
    const goodsEdit = route.match(/^\/api\/goods\/(\d+)$/);
    if (req.method === 'POST' && goodsEdit) {
      if (!authed(req)) return send(res, 401, { error: '관리자만 수정할 수 있어요' });
      const g = await readGoodsBody(req);
      if (g.error) return send(res, 400, { error: g.error });
      const [r] = await pool.query("UPDATE shop_goods SET name = ?, price = ?, sale_price = ?, sale_from = ?, sale_to = ?, images = ?, link = ? WHERE id = ? AND display = 'Y'", [g.name, g.price, g.salePrice, g.saleFrom, g.saleTo, JSON.stringify(g.images), g.link, Number(goodsEdit[1])]);
      if (!r.affectedRows) return send(res, 404, { error: '상품을 찾을 수 없어요' });
      return send(res, 200, { ok: true });
    }
    if (req.method === 'POST' && route === '/api/consult') {
      const body = await readJson(req);
      const id = Number(body.goodsId);
      const contact = contactOf(body.contact);
      const name = clip(body.name, 80);
      const job = clip(body.job, 80);
      if (!contact) return send(res, 400, { error: clip(body.contact, 1) ? '연락처 또는 이메일을 올바르게 입력해 주세요' : '연락처 또는 이메일을 입력해 주세요' });
      if (!name) return send(res, 400, { error: '이름을 입력해 주세요' });
      if (!job) return send(res, 400, { error: '직책 또는 직위를 입력해 주세요' });
      const [rows] = await pool.query("SELECT id, name FROM shop_goods WHERE id = ? AND display = 'Y'", [id]);
      if (!rows.length) return send(res, 404, { error: '상품을 찾을 수 없어요' });
      await pool.query('INSERT INTO shop_consult (goods_id, goods_name, contact, name, job_title) VALUES (?, ?, ?, ?, ?)', [rows[0].id, rows[0].name, contact, name, job]);
      return send(res, 200, { ok: true });
    }
    if (req.method === 'GET' && route === '/api/consult') {
      if (!authed(req)) return send(res, 401, { error: '관리자만 볼 수 있어요' });
      const [rows] = await pool.query("SELECT id, goods_name, contact, name, job_title, seen, DATE_FORMAT(created_at, '%Y.%m.%d %H:%i') AS created_label FROM shop_consult ORDER BY id DESC");
      const [n] = await pool.query("SELECT COUNT(*) AS c FROM shop_consult WHERE seen = 'N'");
      return send(res, 200, { unread: Number(n[0].c), items: rows.map(r => ({ id: r.id, goodsName: r.goods_name, contact: r.contact, name: r.name, job: r.job_title, seen: r.seen, date: r.created_label })) });
    }
    if (req.method === 'POST' && route === '/api/consult/seen') {
      if (!authed(req)) return send(res, 401, { error: '관리자만 확인할 수 있어요' });
      await pool.query("UPDATE shop_consult SET seen = 'Y' WHERE seen = 'N'");
      return send(res, 200, { ok: true });
    }
    if (req.method === 'POST' && route === '/api/guestbook') {
      const body = await readJson(req);
      const name = clip(body.name, 80) || '익명', html = sanitize(body.body);
      if (blank(html)) return send(res, 400, { error: '내용을 입력해 주세요' });
      const [n] = await pool.query('SELECT COUNT(*) AS c FROM guestbook');
      await pool.query('INSERT INTO guestbook (name, body, images, emoji) VALUES (?, ?, ?, ?)', [name, html, JSON.stringify(imagesOf(html)), FACES[n[0].c % FACES.length]]);
      return send(res, 200, { ok: true });
    }
    send(res, 404, { error: '없는 주소예요' });
  } catch (e) {
    send(res, 500, { error: '서버에서 처리하지 못했어요' });
  }
});

ensureShop().then(() => ensureMarket()).then(() => server.listen(7780, '127.0.0.1')).catch(e => { console.error(e.message); process.exit(1); });
