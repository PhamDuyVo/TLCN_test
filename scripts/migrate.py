"""Apply reviewed additive SQL migrations once. Requires mysql CLI and .env.local.
Run from repository root: python scripts/migrate.py
DDL auto-commits in MySQL. On failure, inspect partial changes before retrying.
"""
from pathlib import Path
import os, subprocess, hashlib, shutil, sys
root = Path(__file__).resolve().parents[1]
values = dict(line.split("=", 1) for line in (root / "cinema-backend/.env.local").read_text(encoding="utf-8").splitlines() if "=" in line and not line.startswith("#"))
mysql = os.environ.get("MYSQL_BIN") or shutil.which("mysql") or r"C:\Program Files\MySQL\MySQL Server 9.6\bin\mysql.exe"
env = dict(os.environ, MYSQL_PWD=values.get("DB_PASSWORD", ""))
from urllib.parse import urlparse
url = urlparse(values.get("DB_URL", "jdbc:mysql://localhost:3306/movie_ticket_system_fixed1").removeprefix("jdbc:"))
cmd = [mysql, "--default-character-set=utf8mb4", "--batch", "--skip-column-names", "-h", url.hostname or "localhost", "-P", str(url.port or 3306), "-u", values.get("DB_USERNAME", "root"), url.path.lstrip("/")]
def sql(statement):
    r = subprocess.run(cmd, input=statement.encode("utf-8"), env=env, capture_output=True)
    if r.returncode:
        raise RuntimeError(r.stderr.decode("utf-8", "replace"))
    return r.stdout.decode("utf-8", "replace").strip()
sql("CREATE TABLE IF NOT EXISTS app_schema_migrations (version VARCHAR(100) PRIMARY KEY, checksum CHAR(64) NOT NULL, applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);")
for path in sorted((root / "database/migrations").glob("*.sql")):
    digest = hashlib.sha256(path.read_bytes()).hexdigest()
    version = path.name
    previous = sql(f"SELECT checksum FROM app_schema_migrations WHERE version='{version}'")
    if previous:
        if previous != digest: raise RuntimeError(f"Migration changed after application: {version}")
        print("Already applied:", version)
        continue
    print("Applying:", version)
    sql(path.read_text(encoding="utf-8-sig"))
    sql(f"INSERT INTO app_schema_migrations(version,checksum) VALUES ('{version}','{digest}')")
print("Migrations complete.")
