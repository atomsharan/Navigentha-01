# chat/utils/data_loader.py
from pathlib import Path
import json
from django.conf import settings

def load_dataset(file_name="career_dataset.json"):
    """
    Load JSON dataset from <project_root>/data/
    """
    file_path = Path(settings.BASE_DIR) / "data" / file_name
    with open(file_path, "r", encoding="utf-8") as f:
        return json.load(f)
