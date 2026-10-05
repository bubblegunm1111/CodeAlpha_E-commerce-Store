import os
import glob
import re

public_dir = "public"

html_replacement = """        <div class="nav-icons">
            <a href="#" class="nav-icon" aria-label="Search">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            </a>
            <a href="#" class="nav-icon" aria-label="Wishlist">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78v0z"/></svg>
                <span class="badge" id="nav-wishlist">0</span>
            </a>
            <a href="#" class="nav-icon" aria-label="Cart">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 01-8 0"/></svg>
                <span class="badge" id="nav-bag">0</span>
            </a>
        </div>"""

html_regex = re.compile(r'<div class="nav-icons">.*?</div>', re.DOTALL)

for html_file in glob.glob(os.path.join(public_dir, "*.html")):
    with open(html_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_content = html_regex.sub(html_replacement, content)
    with open(html_file, 'w', encoding='utf-8') as f:
        f.write(new_content)

js_files = glob.glob(os.path.join(public_dir, "js", "*.js"))
for js_file in js_files:
    with open(js_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Update updateHeaderCounts
    content = content.replace("document.getElementById('nav-bag').textContent = `BAG (${cart.length})`;", "document.getElementById('nav-bag').textContent = cart.length;")
    content = content.replace("document.getElementById('nav-wishlist').textContent = `WISHLIST (${wishlist.length})`;", "document.getElementById('nav-wishlist').textContent = wishlist.length;")
    
    # ADD TO CART
    content = content.replace("ADD TO BAG", "ADD TO CART")
    content = content.replace("ADDED TO BAG", "ADDED TO CART")
    
    with open(js_file, 'w', encoding='utf-8') as f:
        f.write(content)

css_append = """
.nav-icon {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--text-cream);
    text-decoration: none;
    transition: color 0.3s ease;
}

.nav-icon:hover {
    color: var(--accent);
}

.badge {
    position: absolute;
    top: -8px;
    right: -10px;
    background-color: var(--accent);
    color: var(--bg-dark);
    font-size: 0.65rem;
    font-weight: 700;
    padding: 0.15rem 0.35rem;
    border-radius: 12px;
    line-height: 1;
    min-width: 18px;
    text-align: center;
}
"""
with open(os.path.join(public_dir, "style.css"), 'a', encoding='utf-8') as f:
    f.write(css_append)
