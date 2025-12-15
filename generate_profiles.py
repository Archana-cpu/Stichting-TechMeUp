#!/usr/bin/env python3
import uuid
import random
import json
import argparse
from faker import Faker

PROVINCES = [
    "Drenthe", "Flevoland", "Friesland", "Gelderland", "Groningen",
    "Limburg", "Noord-Brabant", "Noord-Holland", "Overijssel", "Utrecht",
    "Zeeland", "Zuid-Holland"
]

ETHNICITIES = [
    "Dutch", "Turkish", "Moroccan", "Surinamese", "Indonesian",
    "Antillean", "Other European", "Asian", "African", "Other"
]

ALLERGIES = ["None", "Pollen", "Peanuts", "Shellfish", "Dust", "Latex", "Penicillin"]

DISABILITIES = [
    'None', 'Mobility impairment', 'Hearing impairment', 'Visual impairment', 'Chronic illness'
]

fake = Faker()


def make_entry():
    gender = random.choices(['male', 'female', 'other'], weights=[48, 48, 4])[0]
    age = random.randint(0, 100)
    base_height = 170 if gender != 'female' else 165
    height_cm = max(120, int(random.gauss(base_height, 10)))
    weight_kg = max(30, int(random.gauss(70, 15)))
    allergy_count = random.choices([0, 1, 2], weights=[70, 25, 5])[0]
    allergies = [] if allergy_count == 0 else random.sample(ALLERGIES[1:], k=allergy_count)

    entry = {
        "id": str(uuid.uuid4()),
        "name": fake.name(),
        "province": random.choice(PROVINCES),
        "city": fake.city(),
        "age": age,
        "ethnicity": random.choice(ETHNICITIES),
        "gender": gender,
        "height (cm)": height_cm,
        "weight (kg)": weight_kg,
        "disabilities": random.choices(DISABILITIES, weights=[85, 5, 5, 3, 2])[0],
        "email": fake.email(),
        "phoneNumber": fake.phone_number(),
        "allergies": allergies,
        "image [String]": f"https://example.com/images/{uuid.uuid4()}.jpg",
        "patientId[array]": [str(uuid.uuid4()) for _ in range(random.randint(1, 3))],
        "metricId[array]": [str(uuid.uuid4()) for _ in range(random.randint(1, 4))],
        "healthId[aarray]": [str(uuid.uuid4()) for _ in range(random.randint(0, 2))]
    }
    return entry


def generate(count, out_path, pretty=False):
    with open(out_path, 'w', encoding='utf-8') as f:
        f.write('[\n')
        for i in range(count):
            entry = make_entry()
            if pretty:
                line = json.dumps(entry, ensure_ascii=False, indent=2)
            else:
                line = json.dumps(entry, ensure_ascii=False)
            if i != count - 1:
                f.write(line + ',\n')
            else:
                f.write(line + '\n')
        f.write(']\n')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Generate synthetic profiles JSON')
    parser.add_argument('--count', type=int, default=100000, help='Number of records')
    parser.add_argument('--output', type=str, default='dutch_synthetic_profiles.json', help='Output file')
    parser.add_argument('--pretty', action='store_true', help='Pretty-print JSON entries')
    args = parser.parse_args()
    generate(args.count, args.output, pretty=args.pretty)
