from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[3]
KNOWLEDGE_PATH = BASE_DIR / "src" / "ai" / "knowledge" / "profile.md"


def load_profile() -> str:
    return KNOWLEDGE_PATH.read_text(encoding="utf-8")


def split_into_chunks(text: str) -> list[str]:
    sections = text.split("\n## ")

    chunks = []

    for index, section in enumerate(sections):
        section = section.strip()

        if not section:
            continue

        if index > 0:
            section = f"## {section}"

        chunks.append(section)

    return chunks
