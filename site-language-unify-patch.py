from pathlib import Path

# -----------------------------------------------------------------------------
# Shared language helper integration
# -----------------------------------------------------------------------------

# ruin-language.js (used by mechanics)
p = Path('ruin-language.js')
s = p.read_text(encoding='utf-8')
old = """  function readLanguage() {\n    try {\n      const saved = localStorage.getItem(LANG_KEY);\n      if (VALID.includes(saved)) return saved;\n    } catch (_) {}\n    const raw = (document.documentElement.lang || '').toLowerCase();\n    if (raw.startsWith('en')) return 'en';\n    if (raw.startsWith('ja')) return 'ja';\n    return 'zh';\n  }\n\n  function saveLanguage(lang) {\n    try { localStorage.setItem(LANG_KEY, lang); } catch (_) {}\n  }\n"""
new = """  function readLanguage() {\n    if (window.RuinSiteLanguage?.read) return window.RuinSiteLanguage.read();\n\n    try {\n      const saved = localStorage.getItem(LANG_KEY);\n      if (VALID.includes(saved)) return saved;\n    } catch (_) {}\n\n    const candidates = Array.isArray(navigator.languages) && navigator.languages.length\n      ? navigator.languages\n      : [navigator.language || ''];\n    for (const raw of candidates) {\n      const value = String(raw || '').toLowerCase();\n      if (value.startsWith('zh')) return 'zh';\n      if (value.startsWith('ja')) return 'ja';\n      if (value.startsWith('en')) return 'en';\n    }\n    return 'en';\n  }\n\n  function saveLanguage(lang) {\n    if (window.RuinSiteLanguage?.save) {\n      window.RuinSiteLanguage.save(lang);\n      return;\n    }\n    try { localStorage.setItem(LANG_KEY, lang); } catch (_) {}\n  }\n"""
if old not in s:
    raise SystemExit('ruin-language read/save block not found')
s = s.replace(old, new, 1)
s = s.replace("""  function setLanguage(lang, options = {}) {\n    if (!VALID.includes(lang)) lang = 'zh';\n    saveLanguage(lang);\n""", """  function setLanguage(lang, options = {}) {\n    if (!VALID.includes(lang)) lang = 'en';\n    if (options.persist !== false) saveLanguage(lang);\n""", 1)
s = s.replace("setLanguage(readLanguage(), { animated: false });", "setLanguage(readLanguage(), { animated: false, persist: false });", 1)
p.write_text(s, encoding='utf-8')

# index.html: load helper before boot logic and bump main script cache.
p = Path('index.html')
s = p.read_text(encoding='utf-8')
if 'site-language.js?v=1' not in s:
    needle = '    <meta name="theme-color" content="#fffffb">\n'
    repl = needle + '    <script src="site-language.js?v=1"></script>\n'
    if needle not in s:
        raise SystemExit('index theme-color insertion point not found')
    s = s.replace(needle, repl, 1)
s = s.replace('script.js?v=393-mobile-fracture-randomness', 'script.js?v=394-auto-language', 1)
p.write_text(s, encoding='utf-8')

# script.js: persist manual changes and resolve initial language from shared helper.
p = Path('script.js')
s = p.read_text(encoding='utf-8')
old_sig = "function switchLanguage(targetLang) {\n    const vault = languageVault[targetLang];\n    if (!vault) return;\n"
new_sig = "function switchLanguage(targetLang, options = {}) {\n    const vault = languageVault[targetLang];\n    if (!vault) return;\n    if (options.persist !== false) window.RuinSiteLanguage?.save?.(targetLang);\n"
if old_sig not in s:
    raise SystemExit('main switchLanguage signature not found')
s = s.replace(old_sig, new_sig, 1)
old_start = """        if (typeof switchLanguage === 'function') {\n            switchLanguage('zh');\n        } else {\n            instantLanguage('zh');\n        }\n"""
new_start = """        const initialLang = window.RuinSiteLanguage?.read?.() || 'en';\n        if (typeof switchLanguage === 'function') {\n            switchLanguage(initialLang, { persist: false });\n        } else {\n            instantLanguage(initialLang);\n        }\n"""
if old_start not in s:
    raise SystemExit('main hard-coded startup language block not found')
s = s.replace(old_start, new_start, 1)
p.write_text(s, encoding='utf-8')

# archive-system.html: load helper before archive-system.js and bump cache.
p = Path('archive-system.html')
s = p.read_text(encoding='utf-8')
if 'site-language.js?v=1' not in s:
    needle = '    <meta name="theme-color" content="#fffffb">\n'
    repl = needle + '    <script src="site-language.js?v=1"></script>\n'
    if needle not in s:
        raise SystemExit('archive-system theme-color insertion point not found')
    s = s.replace(needle, repl, 1)
s = s.replace('archive-system.js?v=60', 'archive-system.js?v=61-auto-language', 1)
p.write_text(s, encoding='utf-8')

# archive-system.js: explicit ?lang= stays authoritative, otherwise saved/browser.
p = Path('archive-system.js')
s = p.read_text(encoding='utf-8')
old_current = "let currentLang = 'en';"
new_current = """const archiveRequestedLang = window.RuinSiteLanguage?.normalize?.(new URL(location.href).searchParams.get('lang'));\nlet currentLang = archiveRequestedLang || window.RuinSiteLanguage?.read?.() || 'en';"""
if old_current not in s:
    raise SystemExit('archive currentLang initializer not found')
s = s.replace(old_current, new_current, 1)
old_switch = "function switchLanguage(lang, { animate = true, updateUrl = true } = {}) {\n  if (!i18n[lang]) return;\n  currentLang = lang;"
new_switch = "function switchLanguage(lang, { animate = true, updateUrl = true, persist = true } = {}) {\n  if (!i18n[lang]) return;\n  currentLang = lang;\n  if (persist) window.RuinSiteLanguage?.save?.(lang);"
if old_switch not in s:
    raise SystemExit('archive switchLanguage signature not found')
s = s.replace(old_switch, new_switch, 1)
old_init = """applyI18n({ animate: false });\ninitialLanguageTimer = setTimeout(() => {\n  initialLanguageTimer = null;\n  switchLanguage('zh', { animate: true, updateUrl: true });\n}, 800);\n"""
new_init = """applyI18n({ animate: false });\ninitialLanguageTimer = null;\n"""
if old_init not in s:
    raise SystemExit('archive hard-coded initial timer block not found')
s = s.replace(old_init, new_init, 1)
p.write_text(s, encoding='utf-8')

# mechanics.html: shared resolver before RuinLanguage and cache bump.
p = Path('mechanics.html')
s = p.read_text(encoding='utf-8')
needle = '  <script src="ruin-language.js?v=74"></script>'
if 'site-language.js?v=1' not in s:
    if needle not in s:
        raise SystemExit('mechanics ruin-language include not found')
    s = s.replace(needle, '  <script src="site-language.js?v=1"></script>\n  <script src="ruin-language.js?v=75"></script>', 1)
else:
    s = s.replace('ruin-language.js?v=74', 'ruin-language.js?v=75', 1)
p.write_text(s, encoding='utf-8')
