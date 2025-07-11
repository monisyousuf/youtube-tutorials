#!/usr/bin/env python3
import os
import sys
from time import perf_counter
from pathlib import Path
from rich import box
from rich.console import Console
from rich.table import Table
from rich.prompt import Prompt
from rich.panel import Panel
from rich.align import Align
import psycopg2
from psycopg2 import OperationalError

# ─── CONFIG ────────────────────────────────────────────────────────────────────
PRIMARY_DSN   = os.getenv("PRIMARY_DSN")
REPLICA1_DSN  = os.getenv("REPLICA1_DSN")
REPLICA2_DSN  = os.getenv("REPLICA2_DSN")

# Path to SQL directory
SQL_DIR = Path(__file__).parent / "sql"

# SQL filenames (must exist in `sql/` folder)
WRITE_SQL_FILE = SQL_DIR / "write.sql"
READ_SQL_FILE  = SQL_DIR / "read.sql"
CHECK_REPLICA_REGISTRATION_SQL_FILE = SQL_DIR / "check-replica-registration.sql"
PAUSE_REPLICA_SQL_FILE = SQL_DIR / "pause.sql"
RESUME_REPLICA_SQL_FILE = SQL_DIR / "resume.sql"

console = Console()

# ─── HELPER ────────────────────────────────────────────────────────────────────
def get_conn(dsn: str):
    """
    Attempts to connect to the database. Returns a connection or None on failure.
    """
    try:
        return psycopg2.connect(dsn)
    except OperationalError:
        return None

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
    with console.status("[bold green]Writing data & waiting for replicas...[/bold green]"):
        conn = get_conn(PRIMARY_DSN)
        if not conn:
            console.print(f"Could not connect to replica - PRIMARY")
            with console.status("Press a key to continue...", spinner="dots"):
                console.input()
            return
        with conn:
            with conn.cursor() as cur:
                t0 = perf_counter()
                cur.execute(sql, (msg,))
                t1 = perf_counter()

    console.rule(f":exclamation: Inserted [bold]{msg}[/bold] into [green]PRIMARY[/green]. COMMIT took [bold red]{(t1 - t0)*1000:.2f} ms[/bold red]")
    display_logs(PRIMARY_DSN, title="", label="PRIMARY")


def read_from_replica(dsn: str, label: str):
    console.rule(f"[bold blue]Read from {label}[/]")
    display_logs(dsn, title=f"Logs on [blue]{label}[/blue]", label=label)


def check_replica_registration():
    console.rule(f"[bold green]Check Replication Status[/]")
    display_logs(PRIMARY_DSN, title=f"Status on [green]PRIMARY[/green]", label="PRIMARY", sql_file=CHECK_REPLICA_REGISTRATION_SQL_FILE)


def pause_replica(dsn: str, label: str):
    console.rule(f"[bold blue]Pause {label}[/]")
    display_logs(dsn, title=f"Paused [blue]{label}[/blue]", label=label, sql_file=PAUSE_REPLICA_SQL_FILE)


def resume_replica(dsn: str, label: str):
    console.rule(f"[bold blue]Resume {label}[/]")
    display_logs(dsn, title=f"Resumed [blue]{label}[/blue]", label=label, sql_file=RESUME_REPLICA_SQL_FILE)


def display_logs(dsn: str, title: str, label: str, sql_file=READ_SQL_FILE):
    """
    Executes the given SQL on the specified DSN and displays the results in a table.
    If connection fails, prints an error and asks user to continue.
    """
    conn = get_conn(dsn)
    if not conn:
        console.print(f"Could not connect to replica - {label}")
        with console.status("Press a key to continue...", spinner="dots"):
            console.input()
        return

    sql = sql_file.read_text()
    with conn:
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

    # After successful read/write, prompt to continue
    with console.status("Press a key to continue...", spinner="dots"):
        console.input()

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
