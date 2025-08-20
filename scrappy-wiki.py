import requests
from bs4 import BeautifulSoup
import csv

# URL of the Wikipedia page
URL = "https://en.wikipedia.org/wiki/List_of_Boys_II_Planet_contestants"

def fetch_and_parse_table(url):
    resp = requests.get(url)
    resp.raise_for_status()
    soup = BeautifulSoup(resp.text, "html.parser")

    # Find the first wikitable; you may adjust if multiple tables exist
    table = soup.find("table", class_="wikitable sortable collapsible")
    if table is None:
        raise ValueError("Couldn't locate the table on the page.")

    headers = [th.get_text(strip=True) for th in table.find("tr").find_all("th")]
    print("Headers found:", headers)

    data = []
    for row in table.find_all("tr")[1:]:
        cells = row.find_all(["td", "th"])
        if not cells:
            continue
        values = [cell.get_text(strip=True).replace('\xa0',' ') for cell in cells]
        if len(values) < 2:
            continue
        data.append(values)

    return headers, data

def save_to_csv(headers, rows, filename="boys_ii_planet_contestants.csv"):
    with open(filename, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(headers)  
        writer.writerows(rows)   
    print(f"✅ Data exported to {filename}")

def main():
    headers, rows = fetch_and_parse_table(URL)
    print(f"Extracted {len(rows)} rows.")

   
    print("First row data:", rows[0])

    # Export to CSV
    save_to_csv(headers, rows)

if __name__ == "__main__":
    main()
