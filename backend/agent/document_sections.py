"""Helpers for grouping retrieved medical documents by section."""


def collect_section_docs(docs):
    """Group non-empty documents into symptoms, treatment, and other buckets."""

    grouped_docs = {
        "symptoms": [],
        "treatment": [],
        "others": [],
    }

    for doc in docs:
        section = doc.get("section", "").lower()
        text = " ".join(doc.get("text", "").split())

        if not text:
            continue

        if "symptom" in section:
            grouped_docs["symptoms"].append(doc)
        elif "treatment" in section:
            grouped_docs["treatment"].append(doc)
        else:
            grouped_docs["others"].append(doc)

    return grouped_docs


def collect_section_texts(docs):
    """Group retrieved document text into symptoms, treatment, and other buckets."""

    return {
        key: [" ".join(doc.get("text", "").split()) for doc in values]
        for key, values in collect_section_docs(docs).items()
    }
