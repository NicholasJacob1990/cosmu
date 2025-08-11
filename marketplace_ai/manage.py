#!/usr/bin/env python
import os
import sys

def main() -> None:
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "marketplace.settings")
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Django não está instalado ou não é visível no PYTHONPATH."
        ) from exc
    execute_from_command_line(sys.argv)

if __name__ == "__main__":
    main()