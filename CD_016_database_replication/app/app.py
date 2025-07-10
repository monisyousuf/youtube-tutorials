#!/usr/bin/env python3
import os
import sys
from pathlib import Path
from rich import box
from rich.console import Console
from rich.table import Table
from rich.prompt import Prompt, IntPrompt
from rich.panel import Panel
from rich.align import Align
import psycopg2

# ─── CONFIG ────────────────────────────────────────────────────────────────────
# DSNs for your databases (can also be set via env vars)
PRIMARY_DSN   = os.getenv("PRIMARY_DSN")
REPLICA1_DSN  = os.getenv("REPLICA1_DSN")
REPLICA2_DSN  = os.getenv("REPLICA2_DSN")

# Path to SQL directory
SQL_DIR = Path(__file__).parent / "sql"

# SQL filenames (must exist in `sql/` folder)
WRITE_SQL_FILE = SQL_DIR / "write.sql"
READ_SQL_FILE  = SQL_DIR / "read.sql"
CHECK_REPLICA_REGISTRATION_SQL_FILE = SQL_DIR / "check-replica-registration.sql"

console = Console()

# ─── HELPER ────────────────────────────────────────────────────────────────────
def get_conn(dsn: str):
    try:
        return psycopg2.connect(dsn)
    except OperationalError as e:
        console.print(f"[red]DB Connection Error:[/red] {e}")
        sys.exit(1)

# Ensure SQL files exist on startup
for f in (WRITE_SQL_FILE, READ_SQL_FILE):
    if not f.exists():
        console.print(f"[red]Missing file:[/red] {f}")
        sys.exit(1)

# ─── ACTIONS ───────────────────────────────────────────────────────────────────
def write_to_primary():
    console.rule("[bold green]Write to PRIMARY[/]")
    try:
        msg = Prompt.ask("Enter your message (max 255 chars)").strip()[:255]
    except (KeyboardInterrupt, EOFError):
        console.print("[red]Input cancelled[/red]")
        return
    sql = WRITE_SQL_FILE.read_text()
    with get_conn(PRIMARY_DSN) as conn:
        with conn.cursor() as cur:
            cur.execute(sql, (msg,))
            conn.commit()
    console.print(f":white_check_mark: Inserted [bold]{msg}[/bold] into PRIMARY")
    display_logs(PRIMARY_DSN, title="Current rows on [green]PRIMARY[/green]")


def read_from_replica(dsn: str, label: str):
    console.rule(f"[bold blue]Read from {label}[/]")
    display_logs(dsn, title=f"Logs on [blue]{label}[/blue]")


def check_replica_registration():
    console.rule(f"[bold green]Read from PRIMARY[/]")
    display_logs(PRIMARY_DSN, title=f"Status on [green]PRIMARY[/green]", sql_file=CHECK_REPLICA_REGISTRATION_SQL_FILE)


def display_logs(dsn: str, title: str, sql_file=READ_SQL_FILE):
    sql = sql_file.read_text()
    with get_conn(dsn) as conn:
        with conn.cursor() as cur:
            cur.execute(sql)
            rows = cur.fetchall()
            cols = [desc.name for desc in cur.description]
    table = Table(title=title, box=box.SIMPLE)
    for c in cols:
        table.add_column(c, overflow="fold")
    for row in rows:
        table.add_row(*[str(v) for v in row])
    console.print(table)
    console.print()

# ─── MENU ─────────────────────────────────────────────────────────────────────
def main_menu():
    while True:
        console.print(Panel.fit(
            Align.center(
                "[0] Check [red]REPLICATION STATUS[/red]\n"
                "[1] Write to [green]PRIMARY[/green]\n"
                "[2] Read from [blue]REPLICA 1[/blue]\n"
                "[3] Read from [blue]REPLICA 2[/blue]\n"
                "[4] Quit",
                vertical="middle"
            ),
            title="[bold yellow]Mini DB Admin[/bold yellow]",
            border_style="yellow"
        ))
        try:
            # Rich prompt for menu selection
            choice = console.input("[bold]Select an option [0-4]:[/]").strip()[:255]
        except (EOFError, KeyboardInterrupt):
            console.print("\n[red]Selection cancelled, exiting.[/red]")
            sys.exit(1)
        if choice == '0':
            check_replica_registration()
        elif choice == '1':
            write_to_primary()
        elif choice == '2':
            read_from_replica(REPLICA1_DSN, "REPLICA 1")
        elif choice == '3':
            read_from_replica(REPLICA2_DSN, "REPLICA 2")
        elif choice == '4':
            console.print("\n:wave: Goodbye!\n")
            sys.exit(0)
        else:
            console.print("[red]Invalid choice[/red], please enter 0–4.")

if __name__ == "__main__":
    try:
        main_menu()
    except KeyboardInterrupt:
        console.print("\n\n:skull: Interrupted. Exiting.")
        sys.exit(1)
