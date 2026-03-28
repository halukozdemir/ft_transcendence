from pathlib import Path
from better_profanity import profanity

WORDLIST_DIR = Path(__file__).resolve().parent.parent / "wordlists"

_initialized = False


def _ensure_initialized():
    global _initialized
    if _initialized:
        return

    profanity.load_censor_words()

    tr_path = WORDLIST_DIR / "tr_profanity.txt"
    if tr_path.exists():
        words = [
            w.strip()
            for w in tr_path.read_text(encoding="utf-8").splitlines()
            if w.strip() and not w.startswith("#")
        ]
        profanity.add_censor_words(words)

    _initialized = True


def check_text(text: str) -> dict:
    _ensure_initialized()

    if not text or not text.strip():
        return {
            "flagged": False,
            "original": text,
            "censored": text,
        }

    flagged = profanity.contains_profanity(text)
    censored = profanity.censor(text) if flagged else text

    return {
        "flagged": flagged,
        "original": text,
        "censored": censored,
    }
