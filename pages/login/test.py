import json

import hashlib
import hmac
import base64
import secrets
import unicodedata
DEFAULT_ITERATIONS = 260_000
SALT_BYTES = 16
DKLEN = 32  # 32 bytes = 256 bits derived key

def _normalize(text: str) -> bytes:
    # Normalize to NFKC and convert to UTF-8 bytes.
    if text is None:
        raise ValueError("text must not be None")
    normalized = unicodedata.normalize("NFKC", text)
    return normalized.encode("utf-8")

def hash_secret(secret: str, iterations: int = DEFAULT_ITERATIONS) -> str:
    # Hash a secret (password or answer) and return a single string suitable for storage.
    secret_bytes = _normalize(secret)
    salt = secrets.token_bytes(SALT_BYTES)
    dk = hashlib.pbkdf2_hmac("sha256", secret_bytes, salt, iterations, dklen=DKLEN)

    salt_b64 = base64.b64encode(salt).decode("ascii")
    dk_b64 = base64.b64encode(dk).decode("ascii")

    return f"pbkdf2_sha256${iterations}${salt_b64}${dk_b64}"

print(hash_secret("bomb2003"))