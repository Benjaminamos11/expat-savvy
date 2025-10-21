# Insurer Page URL Mapping — Complete

**Migration Date:** October 21, 2025  
**Status:** All redirects configured ✅

---

## 📍 New Canonical URLs (Live)

| Insurer | New URL | Old URLs (301 Redirect) |
|---------|---------|------------------------|
| **Helsana** | `/healthcare/all-insurances/helsana/` | `/healthcare/insurers/helsana/`<br>`/insurers/helsana/` |
| **SWICA** | `/healthcare/all-insurances/swica/` | `/healthcare/insurers/swica/`<br>`/insurers/swica/` |
| **CSS** | `/healthcare/all-insurances/css/` | `/healthcare/insurers/css/`<br>`/insurers/css/` |
| **Sanitas** | `/healthcare/all-insurances/sanitas/` | `/healthcare/insurers/sanitas/`<br>`/insurers/sanitas/` |
| **Assura** | `/healthcare/all-insurances/assura/` | `/healthcare/insurers/assura/`<br>`/insurers/assura/` |
| **Concordia** | `/healthcare/all-insurances/concordia/` | `/healthcare/insurers/concordia/`<br>`/insurers/concordia/` |
| **Atupri** | `/healthcare/all-insurances/atupri/` | `/healthcare/insurers/atupri/`<br>`/insurers/atupri/` |

---

## 🔗 Internal Link Updates Required

### Pages That Need Link Updates

1. **Main Navigation / Header** (if insurer links exist)
   - Update any links to use new URLs

2. **Blog Posts** (search for old links)
   ```bash
   grep -r "/healthcare/insurers/" src/
   grep -r "/insurers/" src/
   ```

3. **Comparison Pages** (when created)
   - Link to `/healthcare/all-insurances/{slug}/`

4. **Hub Page** (to be created)
   - `/healthcare/all-insurances/` → links to all 7 insurers

---

## 🧪 Redirect Testing Commands

```bash
# Test Helsana redirect
curl -I https://expat-savvy.ch/insurers/helsana

# Test SWICA redirect
curl -I https://expat-savvy.ch/healthcare/insurers/swica

# Test CSS redirect
curl -I https://expat-savvy.ch/insurers/css

# Expected: HTTP/1.1 301 Moved Permanently
#           Location: https://expat-savvy.ch/healthcare/all-insurances/{slug}/
```

---

## 📊 Page Status

| Insurer | Content File | Template | Redirects | Live |
|---------|-------------|----------|-----------|------|
| Helsana | ✅ | ✅ | ✅ | ✅ |
| SWICA | ✅ | ✅ | ✅ | ✅ |
| CSS | ✅ | ✅ | ✅ | ✅ |
| Sanitas | ✅ | ✅ | ✅ | ✅ |
| Assura | ✅ | ✅ | ✅ | ✅ |
| Concordia | ✅ | ✅ | ✅ | ✅ |
| Atupri | ✅ | ✅ | ✅ | ✅ |

---

## 🎯 Preview URLs (Dev Server)

Access at: `http://localhost:4322/healthcare/all-insurances/{slug}/`

- Helsana: http://localhost:4322/healthcare/all-insurances/helsana/
- SWICA: http://localhost:4322/healthcare/all-insurances/swica/
- CSS: http://localhost:4322/healthcare/all-insurances/css/
- Sanitas: http://localhost:4322/healthcare/all-insurances/sanitas/
- Assura: http://localhost:4322/healthcare/all-insurances/assura/
- Concordia: http://localhost:4322/healthcare/all-insurances/concordia/
- Atupri: http://localhost:4322/healthcare/all-insurances/atupri/

---

## ✅ Migration Checklist

- [x] Content collection schema created
- [x] Master template built
- [x] 7 insurer MDX files created with complete data
- [x] 14 redirect rules added to netlify.toml
- [x] SEO schemas implemented (5 types per page)
- [x] Internal linking structure defined
- [x] Special features supported (gym rebates, highlights, etc.)
- [x] Color palette corrected (red gradient, no blue)
- [x] Mobile responsive design verified
- [x] Documentation complete

---

**All insurer pages are now using a unified template system!** 🎉


