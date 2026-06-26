#!/usr/bin/env node
/**
 * Dependency-free static file server that mimics Cloudflare Pages routing:
 * a trailing-slash path serves the directory's index.html, and anything that
 * does not resolve to a file falls back to 404.html with a 404 status. Used as
 * the Playwright webServer so end-to-end tests hit the site exactly as deployed.
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PORT as DEFAULT_PORT } from '../e2e/pages.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = Number(process.env.PORT || DEFAULT_PORT);

const TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.mjs': 'text/javascript; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.xml': 'application/xml; charset=utf-8',
    '.txt': 'text/plain; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.ico': 'image/x-icon',
};

function resolveFile(rawUrl) {
    let p;
    try {
        p = decodeURIComponent(rawUrl.split('?')[0].split('#')[0]);
    } catch {
        return null; // malformed percent-encoding -> treat as not found, never crash the server
    }
    if (p.endsWith('/')) p += 'index.html';
    const rel = path.normalize(p).replace(/^[/\\]+/, '');
    const abs = path.resolve(ROOT, rel);
    if (abs !== ROOT && !abs.startsWith(ROOT + path.sep)) return null; // path-traversal guard
    return abs;
}

const server = http.createServer((req, res) => {
    const file = resolveFile(req.url || '/');
    if (file && fs.existsSync(file) && fs.statSync(file).isFile()) {
        res.writeHead(200, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream' });
        fs.createReadStream(file).pipe(res);
        return;
    }
    const notFound = path.join(ROOT, '404.html');
    const body = fs.existsSync(notFound) ? fs.readFileSync(notFound) : 'Not Found';
    res.writeHead(404, { 'content-type': 'text/html; charset=utf-8' });
    res.end(body);
});

server.listen(PORT, () => console.log(`serving ${ROOT} at http://localhost:${PORT}`));
