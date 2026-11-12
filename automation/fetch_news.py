"""Refresh _data/news.json with recent tiffin headlines from Google News RSS.

Keeps only the headline, publisher, link and date. Run from the repository root:
    python automation/fetch_news.py
"""
import json
import os
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime

QUERIES = [
    '"tiffin service"',
    'tiffin lunch box',
    'dabbawala',
    '"home kitchen" food business permit',
    'FSSAI registration home food',
]
OUT = os.path.join(os.path.dirname(__file__), "..", "_data", "news.json")
KEEP = 8


def fetch(q):
    url = "https://news.google.com/rss/search?" + urllib.parse.urlencode({"q": q + " when:30d", "hl": "en", "gl": "CA", "ceid": "CA:en"})
    req = urllib.request.Request(url, headers={"User-Agent": "TiffinBreakNewsBot/1.0"})
    with urllib.request.urlopen(req, timeout=20) as r:
        root = ET.fromstring(r.read())
    items = []
    for it in root.iter("item"):
        title = (it.findtext("title") or "").strip()
        link = (it.findtext("link") or "").strip()
        src = (it.findtext("source") or "").strip()
        if src and title.endswith(" - " + src):
            title = title[: -(len(src) + 3)]
        try:
            dt = parsedate_to_datetime(it.findtext("pubDate"))
        except Exception:
            dt = None
        if title and link:
            items.append({"title": title, "source": src or "Google News", "url": link, "date": dt.strftime("%Y-%m-%d") if dt else "", "_ts": dt.timestamp() if dt else 0})
    return items


def main():
    seen, pool = set(), []
    for q in QUERIES:
        try:
            for i in fetch(q):
                key = i["title"].lower()[:80]
                if key not in seen:
                    seen.add(key)
                    pool.append(i)
        except Exception as e:  # keep going if one query fails
            print("query failed:", q, e)
    pool.sort(key=lambda i: i["_ts"], reverse=True)
    items = [{k: v for k, v in i.items() if k != "_ts"} for i in pool[:KEEP]]
    if not items:
        print("No items fetched; leaving news.json unchanged")
        return
    data = {"updated": datetime.now(timezone.utc).strftime("%Y-%m-%d"), "items": items}
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=0)
    print("Wrote", len(items), "items")


if __name__ == "__main__":
    main()
