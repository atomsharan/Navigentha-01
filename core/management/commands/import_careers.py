# core/management/commands/import_careers.py
from django.core.management.base import BaseCommand
from django.apps import apps
from django.conf import settings
from pathlib import Path
import json

class Command(BaseCommand):
    help = "Import careers from data/career_dataset.json into core.Career or core.CareerPath model"

    def handle(self, *args, **options):
        file_path = Path(settings.BASE_DIR) / "data" / "career_dataset.json"
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        # try to get model dynamically
        try:
            Career = apps.get_model('core', 'Career')
        except LookupError:
            try:
                Career = apps.get_model('core', 'CareerPath')
            except LookupError:
                self.stdout.write(self.style.ERROR("No Career/CareerPath model found in core app."))
                return

        Career.objects.all().delete()
        for item in data:
            Career.objects.create(
                name = item.get("name",""),
                stage = item.get("stage",""),
                description = item.get("description",""),
                salary_range = item.get("salary_range",""),
                skills = item.get("skills",[]),
                specialties = item.get("specialties",[]),
                future_paths = item.get("future_paths",[]),
                jobs = item.get("jobs",[]),
                tags = item.get("tags",[]),
                mentor_templates = item.get("mentor_templates",{}),
                intelligence_layer = item.get("intelligence_layer",{})
            )
        self.stdout.write(self.style.SUCCESS("Imported careers successfully."))
