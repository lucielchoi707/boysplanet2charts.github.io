import requests
from bs4 import BeautifulSoup
import csv
import os
import time

BASE_URL = "https://share.mnetplus.world"
LIST_URL = f"{BASE_URL}/boys2planet/participants?hl=en"

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:141.0) Gecko/20100101 Firefox/141.0"
}

# Create folder to store images
os.makedirs("images", exist_ok=True)

# Get main page and collect profile URLs
res = requests.get(LIST_URL, headers=headers)
soup = BeautifulSoup(res.text, "html.parser")

participants = []
all_labels = set()
for idx, a in enumerate(soup.select("a[aria-label^='View details']"), start=1):
    name = a["aria-label"].replace("View details for ", "")
    profile_url = BASE_URL + a["href"]
    img_tag = a.select_one("img")
    img_url = img_tag["src"] if img_tag else ""

    # Download image if available
    if img_url:
        try:
            img_res = requests.get(img_url, headers=headers)
            ext = img_url.split("?")[0].split(".")[-1]  # preserve extension
            img_filename = f"images/{idx}.{ext}"
            with open(img_filename, "wb") as f:
                f.write(img_res.content)
        except Exception as e:
            print(f"Failed to download image for {name}: {e}")
            img_filename = ""
    else:
        img_filename = ""

    participants.append({
        "Name": name,
        "ProfileURL": profile_url,
        "ImageFile": img_filename
    })

# Loop through each profile URL and extract details
for participant in participants:
    profile_res = requests.get(participant["ProfileURL"], headers=headers)
    profile_soup = BeautifulSoup(profile_res.text, "html.parser")

    # Extract structured info
    name_tag = profile_soup.select_one("h1.lyric-title")
    participant["Name"] = name_tag.get_text(strip=True) if name_tag else participant["Name"]

    nickname_tag = profile_soup.select_one("span.lyric-body")
    participant["Nickname"] = nickname_tag.get_text(strip=True) if nickname_tag else ""

    subheading_tag = profile_soup.select_one("span.lyric-subheading")
    participant["Subheading"] = subheading_tag.get_text(strip=True) if subheading_tag else ""

    strongs = profile_soup.select("span.lyric-body-strong")
    participant["Birthday"] = strongs[0].get_text(strip=True) if len(strongs) > 0 else ""
    participant["Height"] = strongs[1].get_text(strip=True) if len(strongs) > 1 else ""

    for li in profile_soup.select("li.flex.flex-col"):
        label_tag = li.select_one("span.text-neutral-tertiary")
        value_tag = li.select_one("span.lyric-body-small-strong")
        if label_tag and value_tag:
            label = label_tag.get_text(strip=True)
            value = value_tag.get_text(strip=True)
            participant[label] = value
            all_labels.add(label)  # keep track of all labels seen

    time.sleep(0.5)  # Delay

# Save everything to CSV
fieldnames = ["Name", "Nickname", "Subheading", "Birthday", "Height", "ProfileURL", "ImageFile"]
fieldnames += sorted(all_labels) 

with open("trainees_detailed.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(participants)

print("Done! Saved trainees_detailed.csv with local images")
