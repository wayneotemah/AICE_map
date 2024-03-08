import pandas as pd
from django.conf import settings
import os

csv_path = os.path.join(
    settings.STATIC_ROOT,
    "map_data",
    "kenya-population-by-sex-and-county.csv",
)


df = pd.read_csv(csv_path)
print("loaded csv file successfully!")


def get_county_total_data():
    data = df.iloc[6]
    nOfCounties = len(df.iloc[7:])
    return {
        "nOfCounties": nOfCounties,
        "total": data[4],
        "male": data[1],
        "female": data[2],
        "intersex": data[3],
    }


def get_county_data():
    data = df.iloc[7:]
    return data.to_dict(orient="records")
