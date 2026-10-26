from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
import mysql.connector
import platform
import shutil
import psutil
import docker
import jwt
import os
import time
import json
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen
from io import BytesIO

from datetime import datetime, timedelta, timezone
from functools import wraps
from werkzeug.security import generate_password_hash, check_password_hash


# ==========================================================
# FLASK APPLICATION
# ==========================================================

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024


# ==========================================================
# CORS CONFIGURATION
# ==========================================================

ALLOWED_ORIGINS = [
    "http://192.168.56.101:5173",
    "http://192.168.56.101:5174",
    "http://192.168.100.36:5173",
    "http://192.168.100.36:5174",
    "http://192.168.56.104:5173",
    "http://192.168.56.104:5174",
    "http://192.168.100.59:5173",
    "http://192.168.100.59:5174",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
]

CORS(
    app,
    resources={
        r"/api/*": {
            "origins": ALLOWED_ORIGINS
        }
    }
)


# ==========================================================
# CONFIGURATION
# ==========================================================

SECRET_KEY = os.environ.get(
    "SECRET_KEY",
    "system-admin-secret-key-change-this"
)

TOKEN_EXPIRATION_HOURS = 8

database_initialized = False


WORD_TOPIC_CATALOG = [
    ("HISTORY AND EVOLUTION OF UNIX, GNU & LINUX", 1),
    ("OPERATING SYSTEM, LINUX PLATFORM & SYSTEM FOUNDATIONS", 2),
    ("LINUX KERNEL EVOLUTION, MAJOR RELEASES & PLATFORM CAPABILITIES", 3),
    ("KERNEL ARCHITECTURE, SYSTEM LAYERS, RESOURCE MANAGEMENT & KERNEL TYPES", 4),
    ("GNU/LINUX, OPEN SOURCE SOFTWARE, LICENSING & SOFTWARE FREEDOM", 5),
    ("LINUX DISTRIBUTIONS, FAMILIES, PLATFORMS & ECOSYSTEM", 6),
    ("LINUX USER ENVIRONMENTS: DESKTOPS, DISPLAY SERVERS & DISPLAY MANAGERS", 7),
    ("LINUX INSTALLATION, BOOT ARCHITECTURE, BOOT LOADERS & SYSTEM REQUIREMENTS", 8),
    ("LINUX STORAGE, FILESYSTEMS, JOURNALING & DATA ORGANIZATION", 9),
    ("LINUX DIRECTORY HIERARCHY, SYSTEM PATHS & FILE ORGANIZATION", 10),
    ("LINUX SHELLS, TERMINAL ENVIRONMENT & COMMAND-LINE INTERACTION", 11),
    ("LINUX NAVIGATION, PATHS, DIRECTORIES & BASIC FILESYSTEM OPERATIONS", 12),
    ("LINUX FILE OPERATIONS, CONTENT VIEWING, OUTPUT & TEXT HANDLING", 13),
    ("LINUX USERS, GROUPS, ACCOUNTS & IDENTITY ADMINISTRATION", 14),
    ("LINUX SEARCH, FILTERS, UTILITIES, ARCHIVING, COMPRESSION & LINKS", 15),
    ("LINUX NETWORKING COMMANDS, CONNECTIVITY, NAME RESOLUTION & REMOTE ACCESS", 16),
    ("LINUX PERMISSIONS, OWNERSHIP, ACCESS MODES & FILE SECURITY", 17),
    ("ADMINISTRATIVE PRIVILEGES, SUDO, ROOT ACCESS & SECURE PRIVILEGE MANAGEMENT", 18),
    ("LINUX SERVER INSTALLATION, HOST IDENTITY, IP CONFIGURATION & NETWORK SETUP", 19),
    ("SERVER FUNDAMENTALS, CLIENT-SERVER COMPUTING & NETWORK SERVER ARCHITECTURE", 20),
    ("SERVER TYPES, ROLES, SERVICES, PLATFORMS & ENTERPRISE SERVER CONCEPTS", 21),
    ("SOFTWARE INSTALLATION, PACKAGE MANAGEMENT, REPOSITORIES & APPLICATION DEPLOYMENT", 22),
    ("WEB SERVERS, APACHE, LAMP STACK & BASIC WEB APPLICATION HOSTING", 23),
    ("NETWORK SERVICES: SSH, FTP, DHCP & LINUX SERVICE MANAGEMENT", 24),
    ("CYBERSECURITY, ETHICAL HACKING, HACKER CLASSIFICATIONS & ATTACK TARGETS", 25),
    ("ETHICAL HACKING LIFECYCLE, PHASES, PENETRATION TESTING METHODOLOGY & REPORTING", 26),
    ("RECONNAISSANCE, FOOTPRINTING, FINGERPRINTING & TARGET PROFILING", 27),
    ("INFORMATION GATHERING, NETWORK DISCOVERY, OSINT & VULNERABILITY ASSESSMENT TOOLS", 28),
    ("EXPLOITATION, WEB PENETRATION TESTING, KALI LINUX & SECURITY TOOLSETS", 29),
    ("ETHICAL HACKING LABS, LINUX SERVER HARDENING & DEFENSIVE SECURITY PRACTICES", 30),
]

CHATBOT_TOPIC_CONTEXT = "\n".join(
    f"{order}. {title}" for title, order in WORD_TOPIC_CATALOG
)

AI_PROVIDER = os.environ.get("AI_PROVIDER", "").strip().lower()
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", "").strip()
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "").strip()
OPENAI_MODEL = os.environ.get("OPENAI_MODEL", "gpt-4o-mini").strip()
GEMINI_MODEL = os.environ.get("GEMINI_MODEL", "gemini-2.0-flash").strip()


def get_configured_ai_provider():
    configured = AI_PROVIDER
    if configured in {"openai", "gemini", "local"}:
        return configured
    if OPENAI_API_KEY:
        return "openai"
    if GEMINI_API_KEY:
        return "gemini"
    return "local"

CHATBOT_SYSTEM_PROMPT = f"""You are a Linux system administration instructor for the academic course
System Administration and Maintenance. Linux/GNU/Linux is the primary focus.
Before answering, infer the student's intent: definition, explanation, comparison, command usage,
configuration, troubleshooting, installation, administration task, networking, security, server
management, file management, user/account management, permissions, package management, service
management, monitoring, history, architecture, practical task, error diagnosis, exam review, or
scenario reasoning. Do not expose this classification unless it helps the student.
Explain concepts clearly for university IT students. Connect theory to practical administration.
Answer the student's actual question directly before adding background. If a reasonable default
exists, state the assumption, such as Ubuntu/Debian for package examples, then mention the
Fedora/RHEL alternative where useful. Ask a focused follow-up only when the environment changes
the answer substantially.
Connect related concepts instead of treating them as isolated facts. For example:
SSH -> remote access -> authentication -> users -> permissions -> server security.
chmod -> permissions -> ownership -> groups -> file security.
When answering "why", explain the underlying reason. For "what if" questions, explain:
cause -> effect -> system behavior -> consequences -> safe solution.
For commands, explain purpose, syntax, example, expected output, interpretation, administrative use,
and safety notes when relevant. Use an evidence-first troubleshooting workflow. Be accurate and
identify distribution-specific differences. Security and penetration-testing guidance must be limited
to authorized labs, personal virtual machines, CTFs, or explicitly permitted systems.
You are broadly capable across the complete system-administration lifecycle: requirements and
installation, boot and startup, users and groups, authentication, permissions, sudo and least
privilege, shells and scripting, processes and jobs, CPU and memory, filesystems and storage,
partitions, LVM and RAID, networking and DNS, SSH and remote access, firewalls, package
management, repositories, systemd services, logs and observability, backups and recovery,
cron and scheduling, web servers, databases, virtualization, Docker and containers, cloud
instances, performance, availability, incident response, hardening, vulnerability assessment,
and ethical hacking in authorized environments.
For every question, answer the actual question directly before adding context. If the prompt is
ambiguous, state the most likely meaning and ask one focused clarification. Never respond with
only a generic invitation to ask another question. When commands are requested, explain whether
they inspect or modify state, show a safe example, and include verification and rollback or
recovery considerations where applicable.
Use practical scenarios when helpful. For a slow server, guide the student through `top`,
`free -h`, `df -h`, and `ps aux`; for file access problems, guide them through `ls -l`,
`id`, and `groups`. Explain what each output helps determine.
Course topic structure:
{CHATBOT_TOPIC_CONTEXT}
"""


def _post_json(url, payload, headers=None):
    request = Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json", **(headers or {})},
        method="POST",
    )
    with urlopen(request, timeout=45) as response:
        return json.loads(response.read().decode("utf-8"))


def call_external_tutor(message, topic_title, history):
    provider = get_configured_ai_provider()
    if provider == "openai":
        if not OPENAI_API_KEY:
            raise RuntimeError("AI_PROVIDER=openai but OPENAI_API_KEY is not configured.")
        input_messages = [{"role": "system", "content": CHATBOT_SYSTEM_PROMPT}]
        input_messages.extend(
            {"role": item["role"], "content": item["content"]}
            for item in history[-10:]
            if item.get("role") in {"user", "assistant"} and item.get("content")
        )
        input_messages.append({
            "role": "user",
            "content": f"Current lesson topic: {topic_title or 'General course'}\n\n{message}",
        })
        data = _post_json(
            "https://api.openai.com/v1/chat/completions",
            {"model": OPENAI_MODEL, "messages": input_messages, "temperature": 0.3},
            {"Authorization": f"Bearer {OPENAI_API_KEY}"},
        )
        return data["choices"][0]["message"]["content"].strip(), "openai"

    if provider == "gemini":
        if not GEMINI_API_KEY:
            raise RuntimeError("AI_PROVIDER=gemini but GEMINI_API_KEY is not configured.")
        contents = []
        for item in history[-10:]:
            if item.get("role") in {"user", "assistant"} and item.get("content"):
                contents.append({
                    "role": "model" if item["role"] == "assistant" else "user",
                    "parts": [{"text": item["content"]}],
                })
        contents.append({
            "role": "user",
            "parts": [{"text": f"Current lesson topic: {topic_title or 'General course'}\n\n{message}"}],
        })
        data = _post_json(
            f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent?key={GEMINI_API_KEY}",
            {
                "systemInstruction": {"parts": [{"text": CHATBOT_SYSTEM_PROMPT}]},
                "contents": contents,
                "generationConfig": {"temperature": 0.3},
            },
        )
        return data["candidates"][0]["content"]["parts"][0]["text"].strip(), "gemini"

    return build_linux_tutor_reply(message, topic_title), "local"


def build_linux_tutor_reply(message, topic_title=""):
    """Return a safe, deterministic tutor response for the course chatbot."""
    question = str(message).strip()
    lower = question.lower()
    topic = str(topic_title).strip() or "the current Linux administration lesson"

    if lower in {"gnu", "what is gnu", "what is the gnu project"} or "gnu project" in lower:
        return (
            "**GNU** is a free and open-source operating-system project started by Richard Stallman. "
            "It provides important user-space tools such as the Bash shell, core utilities, compiler "
            "and libraries. Linux is the kernel; GNU tools combined with the Linux kernel form what is "
            "commonly called a GNU/Linux system. Administrators use these tools to run commands, "
            "manage files, compile software, and maintain servers."
        )
    if lower in {"ftp", "what is ftp"} or "file transfer protocol" in lower:
        return (
            "**FTP (File Transfer Protocol)** transfers files between a client and server. Traditional "
            "FTP sends credentials and data without encryption, so it should not be used for sensitive "
            "transfers on untrusted networks. Prefer **SFTP**, which runs through SSH, or HTTPS-based "
            "file transfer. In administration, use SFTP with least-privilege accounts and verify "
            "permissions, ownership, and transfer logs."
        )
    if lower in {"sftp", "what is sftp"}:
        return (
            "**SFTP (SSH File Transfer Protocol)** transfers files over an encrypted SSH connection. "
            "Example: `sftp student@server`, then use `put file.txt` to upload or `get file.txt` to "
            "download. SFTP is different from FTP and is generally safer because authentication and "
            "file contents are protected by SSH encryption."
        )
    if "openai" in lower or "chatgpt" in lower:
        return (
            "**OpenAI** is an artificial-intelligence research and product company. **ChatGPT** is its "
            "conversational AI product, while the OpenAI API lets applications send prompts to a model "
            "and receive generated responses. In this project, an OpenAI API key must be configured on "
            "the Flask backend; it must never be placed in the React frontend or committed to source control."
        )
    if "gemini" in lower:
        return (
            "**Gemini** is Google’s generative-AI model family. Applications can call the Gemini API "
            "with a server-side API key and provide conversation history to generate an answer. Like "
            "OpenAI keys, Gemini keys must remain in backend environment variables and should never be "
            "exposed in browser code."
        )
    if lower in {"linux", "what is linux"}:
        return (
            "**Linux** is an open-source kernel that manages hardware, processes, memory, devices, "
            "networking, and filesystems. A complete Linux distribution combines the kernel with tools "
            "such as GNU utilities, libraries, package management, and often systemd. Administrators "
            "use Linux to operate desktops, servers, containers, and cloud workloads."
        )
    if lower in {"bash", "what is bash"}:
        return (
            "**Bash** is a command-line shell commonly used on Linux. It reads commands, expands "
            "variables and wildcards, starts programs, connects pipelines, and reports exit status. "
            "For example, `grep -i error app.log` searches a log for matching lines."
        )
    if "what happens if" in lower or lower.startswith("if i ") or lower.startswith("what if"):
        scenarios = [
            ("/etc", "Deleting `/etc` can remove essential system configuration. Services may fail, users may not be able to log in, and recovery may require a rescue environment or backup. Never test this on a real system; use a disposable VM and verify backups instead."),
            ("777", "Changing a file to mode `777` gives everyone read, write, and execute access. That can allow unauthorized modification or replacement. Prefer the narrowest owner/group permissions needed and verify with `ls -l`."),
            ("disk", "When a filesystem reaches 100%, writes, logs, package operations, and services can fail. Check `df -h` and `du -xhd1`, identify safe cleanup targets, then verify free space and service health."),
            ("dns", "If DNS stops working, names may not resolve even when IP connectivity works. Test with `ip route`, `resolvectl status`, and `dig`; distinguish resolver failure from routing or service failure before changing configuration."),
            ("ssh", "If SSH stops, remote administration may be unavailable. Use console access if authorized, check `systemctl status ssh` and `journalctl -u ssh`, verify configuration with `sshd -t`, then restart only after finding the cause."),
        ]
        match = next((answer for keyword, answer in scenarios if keyword in lower), None)
        if match:
            return match
    if lower.startswith("why ") or lower.startswith("why do") or lower.startswith("why is"):
        return (
            f"The reason matters because system administration is about controlling **{topic}**, "
            "not memorizing commands. Linux separates users, processes, files, services, and "
            "networks so administrators can apply least privilege, isolate failures, observe "
            "state, and recover safely. Share the exact 'why' question and I’ll connect the "
            "cause to system behavior, operational impact, and a safe verification step."
        )
    if "slow server" in lower or "server is slow" in lower:
        return (
            "Treat a slow server as an evidence problem. First record the time and affected service, "
            "then run `uptime`, `top`, `free -h`, `df -h`, and `ps aux --sort=-%cpu | head`. "
            "Check disk I/O and service logs next. Do not restart processes blindly: correlate "
            "CPU, memory, disk, network, and recent changes, apply the least risky fix, and verify "
            "latency and error rates afterward."
        )
    if "cannot access" in lower or "permission denied" in lower:
        return (
            "For a file-access problem, inspect the complete access chain: run `ls -l path`, "
            "`namei -l path`, `id username`, and `groups username`. Check the file owner, group, "
            "mode bits, and execute permission on each parent directory. Fix ownership or "
            "permissions only when justified, then retry as the affected user and verify with "
            "`sudo -u username test -r path`."
        )
    areas = {
        "user": ("user and group administration", "`id`, `groups`, `useradd`, `usermod`, and `passwd`"),
        "permission": ("permissions and ownership", "`ls -l`, `chmod`, `chown`, and `getfacl`"),
        "process": ("process and resource management", "`ps`, `top`, `free`, `df`, and `kill`"),
        "memory": ("memory management", "`free -h`, `vmstat`, and process inspection"),
        "disk": ("storage and filesystem management", "`lsblk`, `df -h`, `du`, mounts, and filesystem health"),
        "storage": ("storage and filesystem management", "`lsblk`, `df -h`, `du`, mounts, and filesystem health"),
        "network": ("network administration", "`ip`, `ss`, `ping`, DNS checks, routing, and firewall policy"),
        "dns": ("DNS troubleshooting", "resolver configuration, `dig`/`resolvectl`, routes, and service logs"),
        "package": ("software and package management", "`apt`, `dnf`, repositories, dependencies, and verification"),
        "service": ("service management", "`systemctl`, unit dependencies, ports, and `journalctl`"),
        "log": ("logging and observability", "`journalctl`, application logs, timestamps, severity, and correlation"),
        "backup": ("backup and recovery", "backup scope, retention, encryption, restore testing, and recovery objectives"),
        "docker": ("container administration", "images, containers, volumes, networks, resource limits, and logs"),
        "container": ("container administration", "images, containers, volumes, networks, resource limits, and logs"),
        "apache": ("web-server administration", "virtual hosts, ports, TLS, logs, configuration tests, and least privilege"),
        "database": ("database administration", "accounts, connectivity, backups, storage, logs, and recovery testing"),
        "cron": ("job scheduling", "`cron`, systemd timers, environment differences, logging, and failure handling"),
        "firewall": ("firewall and host security", "least-privilege rules, exposed ports, logging, and verification"),
        "ssh": ("secure remote administration", "host keys, authentication, least privilege, forwarding, and audit logs"),
        "kernel": ("kernel and operating-system foundations", "hardware interfaces, processes, memory, devices, and system calls"),
    }
    matched_area = next((details for keyword, details in areas.items() if keyword in lower), None)
    if matched_area:
        area, tools = matched_area
        return (
            f"**{area.title()}** is a core system-administration responsibility. "
            f"Start by gathering evidence with {tools}. Then identify the expected state, "
            "make the smallest authorized change, and verify the result. For a precise answer, "
            "include your Linux distribution, the exact command or error, and whether this is "
            "a personal lab or production system."
        )
    if "chmod" in lower:
        return (
            "**chmod** changes file permissions. For example, `chmod 750 script.sh` "
            "gives the owner full access, the group read/execute access, and others no access. "
            "Use `ls -l script.sh` to verify the result. Apply it only to files you are "
            "authorized to administer; overly broad permissions can expose sensitive data."
        )
    if "systemctl" in lower or "service" in lower:
        return (
            "`systemctl status <service>` shows whether a systemd service is running and "
            "includes recent state information. Check `journalctl -u <service> --since today` "
            "for evidence before restarting it. This follows the administration loop: identify, "
            "inspect, change the least amount possible, then verify."
        )
    if "ssh" in lower:
        return (
            "SSH provides an encrypted remote administration session. Start with "
            "`ssh user@server`, verify the host identity, and prefer key-based authentication "
            "with least-privilege accounts. Restrict SSH to authorized servers and review "
            "authentication logs when troubleshooting."
        )
    if "troubleshoot" in lower or "problem" in lower or "error" in lower:
        return (
            "Use an evidence-first workflow: define the symptom, check system status and "
            "recent logs, inspect configuration and connectivity, make the least risky fix, "
            "and verify normal operation. Useful starting points are `systemctl status`, "
            "`journalctl`, `df -h`, `free -h`, `ip addr`, and `ss -tulpn`."
        )
    if "command" in lower or "linux" in lower or "kernel" in lower:
        return (
            f"For **{topic}**, connect the theory to administration: understand what the "
            "system is doing, choose the command that provides evidence, interpret its output, "
            "and verify the result. A safe first step is usually an inspection command such "
            "as `pwd`, `ls -la`, `ps`, `df -h`, or `systemctl status` rather than a destructive change."
        )
    return (
        f"**{question}** is a system-administration question related to **{topic}**. "
        "A reliable administration approach is: define the desired state, collect evidence, "
        "check status and logs, inspect configuration and connectivity, apply the least risky "
        "authorized change, and verify recovery. This tutor covers Linux installation, users, "
        "permissions, processes, storage, networking, DNS, SSH, services, packages, logs, "
        "backups, containers, web servers, databases, monitoring, security, and troubleshooting. "
        "For a command-specific answer, share the command, output, distribution, and error message."
    )


# ==========================================================
# ALLOWED DOCKER CONTAINERS
# ==========================================================

ALLOWED_CONTAINERS = {
    "mysql_database",
    "flask_backend",
    "react_frontend",
}


# ==========================================================
# DATABASE CONNECTION
# ==========================================================

def get_db_connection():
    return mysql.connector.connect(
        host=os.environ.get("MYSQL_HOST", "database"),
        port=int(os.environ.get("MYSQL_PORT", "3306")),
        database=os.environ.get("MYSQL_DATABASE", "systemdb"),
        user=os.environ.get("MYSQL_USER", "systemuser"),
        password=os.environ.get("MYSQL_PASSWORD", "systempassword"),
    )


MAX_ORDER_NUMBER = 2_147_483_647
MIN_ORDER_NUMBER = -2_147_483_648
ORDER_LOCK_TIMEOUT_SECONDS = 10
TOPIC_ORDER_LOCK_NAME = "systemadmin:topics:order:v1"
SYSTEM_ADMINISTRATION_MODULE = "system_administration"
PYTHON_MODULE = "python"
VALID_MODULE_KEYS = {SYSTEM_ADMINISTRATION_MODULE, PYTHON_MODULE}


def normalize_module_key(value=None):
    module_key = str(value or SYSTEM_ADMINISTRATION_MODULE).strip().lower()
    if module_key not in VALID_MODULE_KEYS:
        raise ValueError("Unknown learning module.")
    return module_key


def requested_module_key(data=None):
    value = request.args.get("module_key")
    if value is None and data is not None:
        value = data.get("module_key")
    return normalize_module_key(value)


def topic_order_lock_name(module_key):
    if module_key == SYSTEM_ADMINISTRATION_MODULE:
        return TOPIC_ORDER_LOCK_NAME
    return f"python:topics:order:v1:{module_key}"


def topic_belongs_to_module(cursor, topic_id, module_key, for_update=False):
    cursor.execute(
        "SELECT id FROM topics WHERE id = %s AND module_key = %s" +
        (" FOR UPDATE" if for_update else ""),
        (topic_id, module_key),
    )
    return cursor.fetchone() is not None


def subtopic_belongs_to_module(cursor, subtopic_id, module_key, for_update=False):
    cursor.execute(
        """
        SELECT s.id, s.topic_id
        FROM subtopics s
        JOIN topics t ON t.id = s.topic_id
        WHERE s.id = %s AND t.module_key = %s
        """ + (" FOR UPDATE" if for_update else ""),
        (subtopic_id, module_key),
    )
    return cursor.fetchone()


def subtopic_order_lock_name(topic_id):
    return f"systemadmin:subtopics:order:v1:{topic_id}"


class OrderLockTimeoutError(Exception):
    pass


def parse_order_number(value):
    if isinstance(value, bool):
        raise ValueError("Order number must be a positive integer.")

    if isinstance(value, int):
        order_number = value
    elif isinstance(value, str):
        digits = value
        if not digits or not digits.isascii() or not digits.isdecimal():
            raise ValueError("Order number must be a positive integer.")
        order_number = int(digits)
    else:
        raise ValueError("Order number must be a positive integer.")

    if not 1 <= order_number <= MAX_ORDER_NUMBER:
        raise ValueError("Order number must be a positive integer.")

    return order_number


def parse_order_id(value):
    if isinstance(value, bool) or not isinstance(value, int):
        raise ValueError("IDs must be positive integers.")
    if not 1 <= value <= MAX_ORDER_NUMBER:
        raise ValueError("IDs must be positive integers.")
    return value


def parse_reorder_payload(data):
    if not isinstance(data, dict):
        raise ValueError("Request body must be a JSON object.")

    expected_rows = data.get("expected")
    ordered_ids = data.get("ordered_ids")
    if not isinstance(expected_rows, list) or not isinstance(ordered_ids, list):
        raise ValueError("Expected snapshot and ordered IDs must be lists.")

    expected = {}
    for row in expected_rows:
        if not isinstance(row, dict) or set(row) != {"id", "order_number"}:
            raise ValueError("Each expected row must include only id and order_number.")
        row_id = parse_order_id(row["id"])
        order_number = row["order_number"]
        if (
            isinstance(order_number, bool)
            or not isinstance(order_number, int)
            or not MIN_ORDER_NUMBER <= order_number <= MAX_ORDER_NUMBER
        ):
            raise ValueError("Snapshot order numbers must be signed INT values.")
        if row_id in expected:
            raise ValueError("Expected snapshot contains duplicate IDs.")
        expected[row_id] = order_number

    ordered = [parse_order_id(row_id) for row_id in ordered_ids]
    if len(ordered) != len(set(ordered)):
        raise ValueError("Ordered IDs must not contain duplicates.")
    if set(ordered) != set(expected):
        raise ValueError("Ordered IDs must exactly match the expected snapshot IDs.")

    return expected, ordered


def acquire_order_lock(cursor, lock_name):
    cursor.execute(
        "SELECT GET_LOCK(%s, %s)",
        (lock_name, ORDER_LOCK_TIMEOUT_SECONDS),
    )
    result = cursor.fetchone()
    value = next(iter(result.values())) if isinstance(result, dict) else result[0]
    if value != 1:
        raise OrderLockTimeoutError(lock_name)


def release_order_locks(cursor, lock_names):
    for lock_name in reversed(lock_names):
        try:
            cursor.execute("SELECT RELEASE_LOCK(%s)", (lock_name,))
            cursor.fetchone()
        except Exception as error:
            print("ORDER LOCK RELEASE ERROR:", error)


def allocate_temporary_order_numbers(rows, final_count, temporary_count):
    if temporary_count == 0:
        return []

    upper_bound = len(rows) + final_count + temporary_count
    if upper_bound > MAX_ORDER_NUMBER:
        raise ValueError("Not enough positive INT values to stage this reorder.")

    occupied = {row["order_number"] for row in rows}
    temporary = []
    for candidate in range(final_count + 1, upper_bound + 1):
        if candidate not in occupied:
            temporary.append(candidate)
            if len(temporary) == temporary_count:
                return temporary

    raise ValueError("Not enough positive INT values to stage this reorder.")


def stage_order_numbers(cursor, table_name, rows, final_count, temporary_count=None):
    if table_name not in {"topics", "subtopics"}:
        raise ValueError("Unsupported ordering table.")

    temporary_count = len(rows) if temporary_count is None else temporary_count
    temporary = allocate_temporary_order_numbers(
        rows,
        final_count,
        temporary_count,
    )
    staged = list(zip(rows, temporary[:len(rows)]))
    if staged:
        cursor.executemany(
            f"UPDATE {table_name} SET order_number = %s WHERE id = %s",
            [(value, row["id"]) for row, value in staged],
        )
    return temporary


def assign_dense_order_numbers(cursor, table_name, ordered_ids):
    if table_name not in {"topics", "subtopics"}:
        raise ValueError("Unsupported ordering table.")
    if ordered_ids:
        cursor.executemany(
            f"UPDATE {table_name} SET order_number = %s WHERE id = %s",
            [(order_number, row_id) for order_number, row_id in enumerate(ordered_ids, 1)],
        )


def fetch_topic_order_rows(cursor, module_key=SYSTEM_ADMINISTRATION_MODULE):
    cursor.execute(
        """
        SELECT id, order_number
        FROM topics
        WHERE module_key = %s
        ORDER BY order_number, id
        FOR UPDATE
        """,
        (module_key,),
    )
    return cursor.fetchall()


def next_legacy_topic_order_number(cursor):
    rows = fetch_topic_order_rows(cursor)
    order_numbers = [
        row["order_number"] if isinstance(row, dict) else row[1]
        for row in rows
    ]
    if order_numbers != list(range(1, len(rows) + 1)):
        raise ValueError("Legacy topic seeds require a dense existing topic order.")
    if len(rows) >= MAX_ORDER_NUMBER:
        raise ValueError("No topic order positions remain for legacy seeds.")
    return len(rows) + 1


def fetch_subtopic_order_rows(cursor, topic_id):
    cursor.execute(
        """
        SELECT id, order_number
        FROM subtopics
        WHERE topic_id = %s
        ORDER BY order_number, id
        FOR UPDATE
        """,
        (topic_id,),
    )
    return cursor.fetchall()


def move_ordered_id(ordered_ids, row_id, order_number):
    if not 1 <= order_number <= len(ordered_ids):
        raise ValueError("Order number must identify a position in the current list.")
    reordered = [current_id for current_id in ordered_ids if current_id != row_id]
    reordered.insert(order_number - 1, row_id)
    return reordered


# ==========================================================
# DOCKER CONNECTION
# ==========================================================

def get_docker_client():
    try:
        client = docker.from_env()
        client.ping()
        return client
    except Exception as error:
        print("DOCKER CONNECTION ERROR:", error)
        return None


# ==========================================================
# JWT TOKEN CREATION
# ==========================================================

def create_token(user):
    now = datetime.now(timezone.utc)

    payload = {
        "user_id": user["id"],
        "name": user["name"],
        "email": user["email"],
        "role": user["role"],
        "profile_picture": user.get("profile_picture"),
        "iat": now,
        "exp": now + timedelta(
            hours=TOKEN_EXPIRATION_HOURS
        ),
    }

    return jwt.encode(
        payload,
        SECRET_KEY,
        algorithm="HS256",
    )


# ==========================================================
# GET CURRENT USER
# ==========================================================

def get_current_user():

    auth_header = request.headers.get(
        "Authorization",
        ""
    ).strip()

    if not auth_header:
        return None

    if not auth_header.startswith("Bearer "):
        return None

    token = auth_header[
        len("Bearer "):
    ].strip()

    if not token:
        return None

    try:

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=["HS256"],
        )

        required_claims = [
            "user_id",
            "name",
            "email",
            "role",
            "exp",
        ]

        for claim in required_claims:

            if claim not in payload:
                return None

        return payload

    except jwt.ExpiredSignatureError:

        print("JWT ERROR: Token expired")
        return None

    except jwt.InvalidTokenError as error:

        print(
            "JWT ERROR:",
            error
        )

        return None

    except Exception as error:

        print(
            "JWT ERROR:",
            error
        )

        return None


# ==========================================================
# LOGIN REQUIRED
# ==========================================================

def login_required(function):

    @wraps(function)
    def decorated(*args, **kwargs):

        user = get_current_user()

        if not user:

            return jsonify({
                "status": "error",
                "message": "Authentication required.",
            }), 401

        return function(*args, **kwargs)

    return decorated


# ==========================================================
# ADMIN REQUIRED
# ==========================================================

def admin_required(function):

    @wraps(function)
    def decorated(*args, **kwargs):

        user = get_current_user()

        if not user:

            return jsonify({
                "status": "error",
                "message": "Authentication required.",
            }), 401

        if user.get("role") != "Administrator":

            return jsonify({
                "status": "error",
                "message": "Administrator access required.",
            }), 403

        return function(*args, **kwargs)

    return decorated


# ==========================================================
# DATABASE INITIALIZATION
# ==========================================================

def initialize_database():
    global database_initialized

    connection = None
    cursor = None
    acquired_order_locks = []

    try:

        connection = get_db_connection()
        cursor = connection.cursor()

        # --------------------------------------------------
        # USERS TABLE
        # --------------------------------------------------

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                role VARCHAR(50) NOT NULL DEFAULT 'User',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        connection.commit()

        # --------------------------------------------------
        # PASSWORD COLUMN
        # --------------------------------------------------

        cursor.execute("""
            SELECT COUNT(*)
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = 'systemdb'
            AND TABLE_NAME = 'users'
            AND COLUMN_NAME = 'password_hash'
        """)

        password_column_exists = cursor.fetchone()[0]

        if not password_column_exists:

            cursor.execute("""
                ALTER TABLE users
                ADD COLUMN password_hash VARCHAR(255) NULL
            """)

            connection.commit()

        cursor.execute("""
            SELECT COUNT(*)
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = 'systemdb'
            AND TABLE_NAME = 'users'
            AND COLUMN_NAME = 'profile_picture'
        """)

        profile_picture_column_exists = cursor.fetchone()[0]

        if not profile_picture_column_exists:
            cursor.execute("""
                ALTER TABLE users
                ADD COLUMN profile_picture MEDIUMTEXT NULL
            """)

            connection.commit()

        # --------------------------------------------------
        # TOPICS TABLE
        # --------------------------------------------------

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS topics (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                order_number INT NOT NULL DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    ON UPDATE CURRENT_TIMESTAMP
            )
        """)

        cursor.execute("""
            SELECT COUNT(*)
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = 'systemdb'
            AND TABLE_NAME = 'topics'
            AND COLUMN_NAME = 'file_data'
        """)

        topic_file_column_exists = cursor.fetchone()[0]

        if not topic_file_column_exists:
            cursor.execute("""
                ALTER TABLE topics
                ADD COLUMN file_data LONGBLOB NULL,
                ADD COLUMN file_name VARCHAR(255) NULL,
                ADD COLUMN file_type VARCHAR(100) NULL
            """)

            connection.commit()

        cursor.execute("""
            SELECT COUNT(*)
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = 'systemdb'
            AND TABLE_NAME = 'topics'
            AND COLUMN_NAME = 'image_data'
        """)

        if not cursor.fetchone()[0]:
            cursor.execute("""
                ALTER TABLE topics
                ADD COLUMN image_data MEDIUMBLOB NULL,
                ADD COLUMN image_name VARCHAR(255) NULL,
                ADD COLUMN image_type VARCHAR(100) NULL
            """)
            connection.commit()

        cursor.execute("""
            SELECT COUNT(*)
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = 'systemdb'
            AND TABLE_NAME = 'topics'
            AND COLUMN_NAME = 'slides_json'
        """)

        if not cursor.fetchone()[0]:
            cursor.execute("""
                ALTER TABLE topics
                ADD COLUMN slides_json LONGTEXT NULL
            """)
            connection.commit()

        # --------------------------------------------------
        # SUBTOPICS TABLE
        # --------------------------------------------------

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS subtopics (
                id INT AUTO_INCREMENT PRIMARY KEY,
                topic_id INT NOT NULL,
                title VARCHAR(255) NOT NULL,
                content LONGTEXT,
                order_number INT NOT NULL DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    ON UPDATE CURRENT_TIMESTAMP,

                CONSTRAINT fk_subtopics_topic
                    FOREIGN KEY (topic_id)
                    REFERENCES topics(id)
                    ON DELETE CASCADE
            )
        """)

        cursor.execute("""
            SELECT COUNT(*)
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = 'systemdb'
            AND TABLE_NAME = 'subtopics'
            AND COLUMN_NAME = 'image_data'
        """)

        if not cursor.fetchone()[0]:
            cursor.execute("""
                ALTER TABLE subtopics
                ADD COLUMN image_data MEDIUMBLOB NULL,
                ADD COLUMN image_name VARCHAR(255) NULL,
                ADD COLUMN image_type VARCHAR(100) NULL
            """)
            connection.commit()

        connection.commit()

        # ==================================================
        # DEMO USERS
        # ==================================================

        demo_users = [
            {
                "name": "System Administrator",
                "email": "admin@sysadmin.local",
                "password": "Admin123!",
                "role": "Administrator",
            },
            {
                "name": "System User",
                "email": "user@sysadmin.local",
                "password": "User123!",
                "role": "User",
            },
        ]

        for demo in demo_users:

            cursor.execute(
                """
                SELECT
                    id,
                    password_hash,
                    role
                FROM users
                WHERE email = %s
                """,
                (demo["email"],),
            )

            existing = cursor.fetchone()

            if existing is None:

                password_hash = generate_password_hash(
                    demo["password"]
                )

                cursor.execute(
                    """
                    INSERT INTO users
                    (
                        name,
                        email,
                        role,
                        password_hash
                    )
                    VALUES
                    (
                        %s,
                        %s,
                        %s,
                        %s
                    )
                    """,
                    (
                        demo["name"],
                        demo["email"],
                        demo["role"],
                        password_hash,
                    ),
                )

            else:

                user_id = existing[0]
                existing_password = existing[1]

                if not existing_password:

                    password_hash = generate_password_hash(
                        demo["password"]
                    )

                    cursor.execute(
                        """
                        UPDATE users
                        SET
                            password_hash = %s,
                            role = %s
                        WHERE id = %s
                        """,
                        (
                            password_hash,
                            demo["role"],
                            user_id,
                        ),
                    )

        connection.commit()

        if os.environ.get("ENABLE_LEGACY_TOPIC_SEEDS") != "1":
            database_initialized = True
            print("Legacy topic seeding is disabled.")
            return

        cursor.execute(
            """
            SELECT id
            FROM topics
            WHERE id BETWEEN 1 AND 30
            LIMIT 1
            """
        )

        if cursor.fetchone():
            database_initialized = True
            print(
                "Legacy topic seeding skipped because canonical "
                "topic IDs are already in use."
            )
            return

        connection.start_transaction()
        acquire_order_lock(cursor, TOPIC_ORDER_LOCK_NAME)
        acquired_order_locks.append(TOPIC_ORDER_LOCK_NAME)

        # ==================================================
        # SEED LINUX SYSTEM ADMINISTRATION
        # ==================================================

        cursor.execute(
            """
            SELECT id
            FROM topics
            WHERE title = %s
            LIMIT 1
            """,
            ("Linux System Administration",),
        )

        existing_topic = cursor.fetchone()

        if existing_topic is None:

            cursor.execute(
                """
                INSERT INTO topics
                (
                    title,
                    description,
                    order_number
                )
                VALUES
                (
                    %s,
                    %s,
                    %s
                )
                """,
                (
                    "Linux System Administration",
                    (
                        "Learn the fundamentals of Linux system "
                        "administration, including Linux history, "
                        "kernel architecture, command line shells, "
                        "filesystem architecture, graphical display "
                        "systems, Linux distributions, package "
                        "management, boot loaders, and system "
                        "installation."
                    ),
                    next_legacy_topic_order_number(cursor),
                ),
            )

            topic_id = cursor.lastrowid
            lesson_lock_name = subtopic_order_lock_name(topic_id)
            acquire_order_lock(cursor, lesson_lock_name)
            acquired_order_locks.append(lesson_lock_name)

            subtopics = [

                (
                    "Fundamentals & History",
                    """
Linux is a free, open-source, monolithic, modular,
multitasking, Unix-like kernel created by Linus Torvalds
in 1991.

Linux becomes a complete operating system when combined
with GNU components, utilities, libraries, and other
software. This is commonly referred to as GNU/Linux.

Creator:
Linus Torvalds was born on December 28, 1969. He is the
creator of the Linux kernel and Git.

Unix/Linux Timeline:

1969/1971:
Unix was created by Ken Thompson and Dennis Ritchie at
Bell Labs.

1977:
BSD (Berkeley Software Distribution) was released.

1983:
Richard Stallman launched the GNU Project.

1987:
Andrew Tanenbaum developed MINIX.

September 17, 1991:
The first Linux kernel release was published.

Kernel Milestones:

Linux 0.01 (1991):
The initial public Linux kernel release targeted the
i386/AT platform.

Linux 1.0 (1994):
Introduced major improvements including multiprogramming,
virtual memory, and true multitasking.

Linux 2.0 (1996):
Added improvements to memory management, CPU scheduling,
networking, and filesystem scalability.

Linux 3.0 (2011):
Included improvements such as virtualization enhancements
and support for Btrfs.

Licensing:

Linux is distributed under the GNU General Public License
(GNU GPL), which allows users to use, study, modify, and
redistribute the software according to the license terms.
""".strip(),
                    1,
                ),

                (
                    "Kernel Architecture & Types",
                    """
The Linux kernel is the core component of the operating
system.

It acts as a bridge between applications and computer
hardware through system calls and inter-process
communication.

The kernel manages:

- CPU and processor resources
- Memory
- Input and output devices
- Processes
- Filesystems
- Security
- Hardware communication

Execution Modes:

User Mode:
Applications normally execute in user mode. Access to
critical hardware and kernel resources is restricted.

Kernel Mode:
The kernel operates in kernel mode and has privileged
access to system resources and hardware.

Basic Architecture:

Applications
        ↓
Daemons
        ↓
Display Systems
        ↓
C Libraries
        ↓
System Call Interface
        ↓
Kernel Subsystems
        ↓
Hardware

Kernel Classifications:

Monolithic Kernel:
Most operating system services run inside kernel space.
This provides high performance.

Examples:
Linux and traditional Unix systems.

Microkernel:
Only essential functions remain in kernel space while
many services operate in user space.

Examples:
Mach, L4, and MINIX.

Hybrid Kernel:
Combines concepts from monolithic and microkernel designs
to balance performance and modularity.

Example:
Windows NT.

Exokernel:
Provides minimal abstractions and attempts to give
applications more direct control over hardware.

Examples:
Nemesis and ExOS.

Nanokernel:
Provides a very small hardware abstraction layer.

Example:
EROS.
""".strip(),
                    2,
                ),

                (
                    "Command Line Shells",
                    """
A command-line shell is a text-based interface that allows
users to communicate with the operating system.

A shell receives commands entered by the user, interprets
them, and requests the operating system to perform the
required operations.

Common prompts include:

$ for a normal user

# for the root user

Basic command flow:

User Commands
      ↓
Shell
      ↓
Kernel
      ↓
Hardware

Common Linux Shells:

sh:
The Bourne Shell.

bash:
Bourne Again Shell. It is one of the most commonly used
Linux shells and provides command history, editing,
scripting, and other interactive features.

csh:
C Shell.

tcsh:
An enhanced version of C Shell.

ksh:
Korn Shell.

zsh:
An advanced interactive shell with many customization
features.

fish:
A user-friendly interactive shell with modern features.
""".strip(),
                    3,
                ),

                (
                    "Filesystem Architecture",
                    """
Linux supports several filesystem types.

ext2:
A non-journaling filesystem.

Maximum file size:
Approximately 2 TB.

Maximum filesystem volume:
Approximately 32 TB.

ext3:
A journaling filesystem based on ext2.

Maximum file size:
Approximately 2 TB.

Maximum filesystem volume:
Approximately 32 TB.

ext4:
A modern journaling filesystem designed for high-capacity
storage.

Maximum file size:
Approximately 16 TB.

Maximum filesystem volume:
Approximately 1 EB.

Btrfs:
A copy-on-write filesystem supporting features such as
snapshots and RAID.

Maximum volume:
Approximately 16 EB.

XFS:
A high-performance journaling filesystem designed for
large files and large storage systems.

Maximum volume:
Approximately 8 EB.

ZFS:
A storage platform and filesystem providing storage pools,
data integrity, snapshots, and advanced management features.

Maximum volume:
Approximately 256 ZB.

Windows Filesystem Comparison:

FAT32:
Common older filesystem with a 4 GB maximum individual
file size.

NTFS:
Windows journaling filesystem with support for very large
files and storage.

exFAT:
Designed primarily for removable storage and cross-platform
compatibility.

ReFS:
Microsoft filesystem designed for resilience and
large-scale storage.

Linux Filesystem Hierarchy Standard:

/
Root directory.

/bin
Essential user binaries.

/sbin
Essential system binaries.

/boot
Bootloader files and kernel images.

/dev
Device nodes.

/etc
System configuration files.

/home
Normal user home directories.

/root
Root user's home directory.

/lib
System libraries.

/media
Mount points for removable media.

/mnt
Temporary mount point.

/proc
Virtual filesystem containing process and kernel information.

/sys
Virtual filesystem containing kernel and hardware information.

/tmp
Temporary files.

/usr
User applications and supporting files.

/var
Variable data such as logs, caches, and spools.
""".strip(),
                    4,
                ),

                (
                    "Graphical Display Stack & Distributions",
                    """
Linux graphical systems provide the components required
to display graphical applications and desktop environments.

Display Servers:

Xorg/X11:
A traditional display server system widely used by Linux
desktop environments.

Wayland:
A newer display protocol designed to provide a modern
replacement for the traditional X11 architecture.

Display Managers:

GDM:
GNOME Display Manager.

SDDM:
Simple Desktop Display Manager.

LightDM:
Light Display Manager.

Linux Distribution History:

1993-2002:

Slackware
Debian
SUSE
Red Hat
Gentoo

2002-2011:

Arch Linux
Fedora
CentOS
Ubuntu
Alpine Linux
Oracle Linux
Android

Ubuntu Server:

Ubuntu Server is commonly used for:

- Long-term support deployments
- Stable server environments
- Containerized workloads
- Enterprise infrastructure
- Cloud computing

Arch Linux:

Arch Linux follows a rolling-release model.

Characteristics include:

- Minimal base installation
- User-driven configuration
- pacman package manager
- Rolling software updates
- Highly customizable system
""".strip(),
                    5,
                ),

                (
                    "Package Management & System Administration",
                    """
Package management allows administrators to install,
update, remove, and maintain software packages.

Debian/Ubuntu:

Package format:
.deb

Package tools:
apt
dpkg

Common commands:

sudo apt update

sudo apt upgrade

CentOS/Fedora:

Package format:
.rpm

Package managers:

dnf
yum

Common command:

sudo dnf update

Arch Linux:

Package manager:

pacman

Common command:

sudo pacman -Syu

openSUSE:

Package manager:

zypper

Desktop Environment Installation:

Ubuntu/Debian example:

sudo apt install kde-standard

Fedora example:

sudo dnf groupinstall "KDE Plasma"

Boot Loaders:

GRUB2:
A common Linux bootloader that supports multiple
operating systems, network booting, and an interactive
bootloader shell.

LILO:
A legacy Linux bootloader. It was discontinued in 2015.

Syslinux:
A lightweight bootloader commonly used for USB devices,
PXE environments, and live media.

Linux Installation Sequence:

1. Keyboard and Locale
   Select the keyboard layout, language, and locale.

2. Disk Partitioning
   Common partitions include:

   /
   /home
   swap

3. Timezone
   Configure the correct system timezone.

4. User Account
   Create the initial user account and configure
   authentication information.

5. File Copy
   The installer copies the operating system files
   to the selected storage device.
""".strip(),
                    6,
                ),
            ]

            for title, content, order_number in subtopics:

                cursor.execute(
                    """
                    INSERT INTO subtopics
                    (
                        topic_id,
                        title,
                        content,
                        order_number
                    )
                    VALUES
                    (
                        %s,
                        %s,
                        %s,
                        %s
                    )
                    """,
                    (
                        topic_id,
                        title,
                        content,
                        order_number,
                    ),
                )

            connection.commit()

            print("----------------------------------------")
            print("TOPIC SEEDED SUCCESSFULLY")
            print("Linux System Administration")
            print("6 subtopics created")
            print("----------------------------------------")

        else:

            print("----------------------------------------")
            print("TOPIC ALREADY EXISTS")
            print("Skipping topic seed.")
            print("----------------------------------------")

        # ==================================================
        # SEED OPERATING SYSTEMS TOPIC
        # ==================================================

        cursor.execute(
            """
            SELECT id
            FROM topics
            WHERE title = %s
            LIMIT 1
            """,
            ("What is an Operating System?",),
        )

        operating_system_topic = cursor.fetchone()

        if operating_system_topic is None:
            cursor.execute(
                """
                INSERT INTO topics
                (
                    title,
                    description,
                    order_number
                )
                VALUES
                (
                    %s,
                    %s,
                    %s
                )
                """,
                (
                    "What is an Operating System?",
                    (
                        "Learn how operating systems manage hardware, "
                        "processes, memory, filesystems, devices, users, "
                        "security, networking, virtualization, containers, "
                        "and modern cloud infrastructure."
                    ),
                    next_legacy_topic_order_number(cursor),
                ),
            )

            connection.commit()
            print("Operating Systems topic seeded successfully")
        else:
            print("Operating Systems topic already exists")

        # ==================================================
        # SEED PROCESS MANAGEMENT TOPIC
        # ==================================================

        cursor.execute(
            """
            SELECT id
            FROM topics
            WHERE title = %s
            LIMIT 1
            """,
            ("Process Management",),
        )

        process_management_topic = cursor.fetchone()

        if process_management_topic is None:
            cursor.execute(
                """
                INSERT INTO topics
                (
                    title,
                    description,
                    order_number
                )
                VALUES
                (
                    %s,
                    %s,
                    %s
                )
                """,
                (
                    "Process Management",
                    (
                        "Learn process lifecycles, scheduling, PIDs, "
                        "threads, signals, monitoring, systemd, cgroups, "
                        "namespaces, containers, and process security."
                    ),
                    next_legacy_topic_order_number(cursor),
                ),
            )

            connection.commit()
            print("Process Management topic seeded successfully")
        else:
            print("Process Management topic already exists")

        # ==================================================
        # SEED MEMORY MANAGEMENT TOPIC
        # ==================================================

        cursor.execute(
            """
            SELECT id
            FROM topics
            WHERE title = %s
            LIMIT 1
            """,
            ("Memory Management",),
        )

        memory_management_topic = cursor.fetchone()

        if memory_management_topic is None:
            cursor.execute(
                """
                INSERT INTO topics
                (
                    title,
                    description,
                    order_number
                )
                VALUES
                (
                    %s,
                    %s,
                    %s
                )
                """,
                (
                    "Memory Management",
                    (
                        "Learn how operating systems manage RAM, virtual "
                        "memory, paging, page tables, swap, memory sharing, "
                        "Linux memory monitoring, OOM conditions, security, "
                        "virtual machines, containers, Kubernetes, and AI "
                        "memory resources."
                    ),
                    next_legacy_topic_order_number(cursor),
                ),
            )

            connection.commit()
            print("Memory Management topic seeded successfully")
        else:
            print("Memory Management topic already exists")

        # ==================================================
        # SEED FILE AND DEVICE MANAGEMENT TOPIC
        # ==================================================

        cursor.execute(
            """
            SELECT id
            FROM topics
            WHERE title = %s
            LIMIT 1
            """,
            ("File and Device Management",),
        )

        file_device_topic = cursor.fetchone()

        if file_device_topic is None:
            cursor.execute(
                """
                INSERT INTO topics
                (
                    title,
                    description,
                    order_number
                )
                VALUES
                (
                    %s,
                    %s,
                    %s
                )
                """,
                (
                    "File and Device Management",
                    (
                        "Learn how Linux organizes files and directories, "
                        "controls permissions, communicates with devices, "
                        "manages storage and filesystems, mounts volumes, "
                        "uses RAID and LVM, and supports virtualization, "
                        "containers, encryption, monitoring, cloud storage, "
                        "and cybersecurity."
                    ),
                    next_legacy_topic_order_number(cursor),
                ),
            )

            connection.commit()
            print("File and Device Management topic seeded successfully")
        else:
            print("File and Device Management topic already exists")

        # ==================================================
        # SEED OPERATING SYSTEM SECURITY TOPIC
        # ==================================================

        cursor.execute(
            """
            SELECT id
            FROM topics
            WHERE title = %s
            LIMIT 1
            """,
            ("Operating System Security Fundamentals",),
        )

        security_topic = cursor.fetchone()

        if security_topic is None:
            cursor.execute(
                """
                INSERT INTO topics
                (
                    title,
                    description,
                    order_number
                )
                VALUES
                (
                    %s,
                    %s,
                    %s
                )
                """,
                (
                    "Operating System Security Fundamentals",
                    (
                        "Learn operating system security, the CIA triad, "
                        "AAA, least privilege, Linux permissions, secure "
                        "authentication, SSH, firewalls, hardening, "
                        "monitoring, backups, incident response, cloud "
                        "security, containers, supply chains, and AI "
                        "infrastructure."
                    ),
                    next_legacy_topic_order_number(cursor),
                ),
            )

            connection.commit()
            print("Operating System Security topic seeded successfully")
        else:
            print("Operating System Security topic already exists")

        # ==================================================
        # SEED PROCESS MANAGEMENT AND SCHEDULING TOPIC
        # ==================================================

        cursor.execute(
            """
            SELECT id
            FROM topics
            WHERE title = %s
            LIMIT 1
            """,
            ("Process Management and Scheduling",),
        )

        process_scheduling_topic = cursor.fetchone()

        if process_scheduling_topic is None:
            cursor.execute(
                """
                INSERT INTO topics
                (
                    title,
                    description,
                    order_number
                )
                VALUES
                (
                    %s,
                    %s,
                    %s
                )
                """,
                (
                    "Process Management and Scheduling",
                    (
                        "Learn processes, PIDs, parent and child processes, "
                        "systemd, process states, monitoring, signals, CPU "
                        "scheduling, priorities, threads, IPC, services, "
                        "cron, systemd timers, cgroups, namespaces, "
                        "containers, Kubernetes, troubleshooting, and "
                        "modern cloud and AI workloads."
                    ),
                    next_legacy_topic_order_number(cursor),
                ),
            )

            connection.commit()
            print("Process Management and Scheduling topic seeded successfully")
        else:
            print("Process Management and Scheduling topic already exists")

        # ==================================================
        # SEED MEMORY MANAGEMENT AND VIRTUAL MEMORY TOPIC
        # ==================================================

        cursor.execute(
            """
            SELECT id
            FROM topics
            WHERE title = %s
            LIMIT 1
            """,
            ("Memory Management and Virtual Memory",),
        )

        virtual_memory_topic = cursor.fetchone()

        if virtual_memory_topic is None:
            cursor.execute(
                """
                INSERT INTO topics
                (
                    title,
                    description,
                    order_number
                )
                VALUES
                (
                    %s,
                    %s,
                    %s
                )
                """,
                (
                    "Memory Management and Virtual Memory",
                    (
                        "Learn RAM, physical and virtual memory, address spaces, "
                        "pages, page tables, MMU, TLB, page faults, demand "
                        "paging, swap, swappiness, OOM, copy-on-write, memory "
                        "allocation, leaks, security, page cache, monitoring, "
                        "NUMA, VMs, containers, Kubernetes, databases, AI, "
                        "diagnostics, and memory best practices."
                    ),
                    next_legacy_topic_order_number(cursor),
                ),
            )

            connection.commit()
            print("Memory Management and Virtual Memory topic seeded successfully")
        else:
            print("Memory Management and Virtual Memory topic already exists")

        # ==================================================
        # SEED STORAGE DEVICES, DISK MANAGEMENT, AND I/O TOPIC
        # ==================================================

        cursor.execute(
            """
            SELECT id
            FROM topics
            WHERE title = %s
            LIMIT 1
            """,
            ("Storage Devices, Disk Management, and I/O",),
        )

        storage_topic = cursor.fetchone()

        if storage_topic is None:
            cursor.execute(
                """
                INSERT INTO topics (title, description, order_number)
                VALUES (%s, %s, %s)
                """,
                (
                    "Storage Devices, Disk Management, and I/O",
                    (
                        "Learn HDDs, SSDs, NVMe, USB and virtual disks, block "
                        "devices, partitions, MBR, GPT, filesystems, mounting, "
                        "fstab, disk usage, I/O, caching, SMART, TRIM, RAID, "
                        "LVM, encryption, virtual machines, containers, cloud "
                        "storage, troubleshooting, and safe administration."
                    ),
                    next_legacy_topic_order_number(cursor),
                ),
            )
            connection.commit()
            print("Storage Devices, Disk Management, and I/O topic seeded successfully")
        else:
            print("Storage Devices, Disk Management, and I/O topic already exists")

        # ==================================================
        # SEED LINUX FILESYSTEMS AND FILESYSTEM MANAGEMENT TOPIC
        # ==================================================

        cursor.execute(
            """
            SELECT id FROM topics
            WHERE title = %s
            LIMIT 1
            """,
            ("Linux Filesystems and Filesystem Management",),
        )

        filesystem_topic = cursor.fetchone()

        if filesystem_topic is None:
            cursor.execute(
                """
                INSERT INTO topics (title, description, order_number)
                VALUES (%s, %s, %s)
                """,
                (
                    "Linux Filesystems and Filesystem Management",
                    (
                        "Learn filesystems, partitions, metadata, inodes, "
                        "blocks, extents, journaling, ext4, XFS, Btrfs, "
                        "mounting, fstab, capacity, performance, repair, "
                        "security, backups, cloud storage, containers, and "
                        "filesystem troubleshooting."
                    ),
                    next_legacy_topic_order_number(cursor),
                ),
            )
            connection.commit()
            print("Linux Filesystems topic seeded successfully")
        else:
            print("Linux Filesystems topic already exists")

        # ==================================================
        # SEED LINUX SHELLS, CLI, AND SHELL SCRIPTING TOPIC
        # ==================================================

        cursor.execute(
            """
            SELECT id FROM topics
            WHERE title = %s
            LIMIT 1
            """,
            ("Linux Shells, Command-Line Interfaces, and Shell Scripting",),
        )

        shell_topic = cursor.fetchone()

        if shell_topic is None:
            cursor.execute(
                """
                INSERT INTO topics (title, description, order_number)
                VALUES (%s, %s, %s)
                """,
                (
                    "Linux Shells, Command-Line Interfaces, and Shell Scripting",
                    (
                        "Learn shells, terminals, commands, variables, "
                        "pipelines, redirection, permissions, scripting, "
                        "automation, debugging, security, and modern Linux "
                        "administration."
                    ),
                    next_legacy_topic_order_number(cursor),
                ),
            )
            connection.commit()
            print("Linux Shells topic seeded successfully")
        else:
            print("Linux Shells topic already exists")

        # ==================================================
        # SEED LINUX FILE OPERATIONS AND TEXT PROCESSING TOPIC
        # ==================================================

        cursor.execute(
            """
            SELECT id FROM topics
            WHERE title = %s
            LIMIT 1
            """,
            ("Linux File Operations, Navigation, and Text Processing",),
        )

        file_operations_topic = cursor.fetchone()

        if file_operations_topic is None:
            cursor.execute(
                """
                INSERT INTO topics (title, description, order_number)
                VALUES (%s, %s, %s)
                """,
                (
                    "Linux File Operations, Navigation, and Text Processing",
                    (
                        "Learn Linux navigation, files and directories, "
                        "copying, moving, viewing, searching, filtering, "
                        "sorting, links, archives, permissions, logs, "
                        "automation, DevOps, and cybersecurity."
                    ),
                    next_legacy_topic_order_number(cursor),
                ),
            )
            connection.commit()
            print("Linux File Operations topic seeded successfully")
        else:
            print("Linux File Operations topic already exists")

        # ==================================================
        # SEED LINUX USER, GROUP, AND PRIVILEGE MANAGEMENT TOPIC
        # ==================================================

        cursor.execute(
            """
            SELECT id FROM topics
            WHERE title = %s
            LIMIT 1
            """,
            ("Linux User, Group, and Privilege Management",),
        )

        user_privilege_topic = cursor.fetchone()

        if user_privilege_topic is None:
            cursor.execute(
                """
                INSERT INTO topics (title, description, order_number)
                VALUES (%s, %s, %s)
                """,
                (
                    "Linux User, Group, and Privilege Management",
                    (
                        "Learn Linux users, groups, UIDs, GIDs, passwords, "
                        "account lifecycle, sudo, ownership, service accounts, "
                        "SSH keys, auditing, capabilities, cloud IAM, "
                        "automation, and containers."
                    ),
                    next_legacy_topic_order_number(cursor),
                ),
            )
            connection.commit()
            print("Linux User and Privilege topic seeded successfully")
        else:
            print("Linux User and Privilege topic already exists")

        # ==================================================
        # SEED TOPICS 11 AND 15-30
        # ==================================================

        additional_topics = [
            (
                "Linux Directory Structure and File Hierarchy",
                "Learn the Linux directory hierarchy, root filesystem, system paths, configuration directories, runtime information, permissions, navigation, troubleshooting, security, backups, and administration.",
                11,
            ),
            (
                "Linux Networking and Network Configuration",
                "Learn Linux networking, interfaces, addresses, routing, DNS, services, troubleshooting, security, cloud networking, and automation.",
                15,
            ),
            (
                "Linux Services, Servers, and Service Management",
                "Learn Linux services, daemons, systemd, server roles, logs, startup, monitoring, security, containers, cloud, and automation.",
                16,
            ),
            (
                "Software, Package, and System Management",
                "Learn Linux packages, repositories, package managers, software lifecycle, updates, dependencies, system maintenance, automation, and security.",
                17,
            ),
            (
                "Ethical Hacking, Security, and Linux Server Hardening",
                "Learn ethical hacking, Linux security, reconnaissance, vulnerability assessment, hardening, monitoring, incident response, and defense.",
                18,
            ),
            (
                "Linux Networking Fundamentals and Network Administration",
                "Learn Linux networking fundamentals, interfaces, addressing, routing, DNS, troubleshooting, security, and administration.",
                19,
            ),
            (
                "Linux Network Services and Server Services",
                "Learn Linux network services, server applications, ports, protocols, configuration, security, monitoring, and administration.",
                20,
            ),
            (
                "Linux Web Servers, Reverse Proxies, and Application Deployment",
                "Learn web servers, reverse proxies, application deployment, TLS, performance, monitoring, containers, and cloud hosting.",
                21,
            ),
            (
                "Linux Firewalls and Network Security",
                "Learn firewalls, packet filtering, network security, zones, rules, services, monitoring, troubleshooting, and defense.",
                22,
            ),
            (
                "System Monitoring and Troubleshooting",
                "Learn Linux monitoring, metrics, logs, performance analysis, diagnostics, incident response, and troubleshooting workflows.",
                23,
            ),
            (
                "Logging and Observability",
                "Learn Linux logging, journald, log files, metrics, traces, alerting, dashboards, retention, and observability practices.",
                24,
            ),
            (
                "Automation & Shell Scripting",
                "Learn automation, shell scripting, repeatable administration, variables, control flow, functions, scheduling, testing, security, and DevOps.",
                25,
            ),
            (
                "Virtualization & VM Administration",
                "Learn virtualization, hypervisors, virtual machines, virtual hardware, networking, storage, snapshots, migration, security, and cloud administration.",
                26,
            ),
            (
                "Docker & Container Administration",
                "Learn containers, Docker, images, registries, networking, volumes, orchestration, security, monitoring, and administration.",
                27,
            ),
            (
                "Database Administration",
                "Learn database administration, schemas, users, queries, performance, backups, replication, security, monitoring, and recovery.",
                28,
            ),
            (
                "Backup & Disaster Recovery",
                "Learn backup strategies, recovery planning, RPO, RTO, snapshots, replication, testing, incidents, and disaster recovery.",
                29,
            ),
            (
                "Enterprise Linux, DevOps & Cloud",
                "Learn enterprise Linux, DevOps, cloud infrastructure, automation, CI/CD, observability, security, scalability, and operations.",
                30,
            ),
        ]

        for topic_title, topic_description, _legacy_order in additional_topics:
            cursor.execute(
                """
                SELECT id FROM topics
                WHERE title = %s
                LIMIT 1
                """,
                (topic_title,),
            )
            if cursor.fetchone() is None:
                cursor.execute(
                    """
                    INSERT INTO topics (title, description, order_number)
                    VALUES (%s, %s, %s)
                    """,
                    (
                        topic_title,
                        topic_description,
                        next_legacy_topic_order_number(cursor),
                    ),
                )
                connection.commit()
                print(f"{topic_title} topic seeded successfully")

        connection.commit()

        print("----------------------------------------")
        print("DATABASE INITIALIZATION COMPLETE")
        print("----------------------------------------")
        database_initialized = True

    except Exception as error:

        if connection:
            connection.rollback()

        print(
            "DATABASE INITIALIZATION ERROR:",
            error
        )

    finally:

        if cursor:
            release_order_locks(cursor, acquired_order_locks)
            cursor.close()

        if connection:
            connection.close()


# ==========================================================
# HOME
# ==========================================================

@app.route("/")
def home():

    return jsonify({
        "status": "success",
        "message": "Flask backend is working!",
    })


# ==========================================================
# HEALTH CHECK
# ==========================================================

@app.route(
    "/api/health",
    methods=["GET"]
)
def health():

    database_status = "unknown"

    connection = None

    try:

        connection = get_db_connection()

        if connection.is_connected():
            database_status = "connected"

        else:
            database_status = "disconnected"

    except Exception:

        database_status = "disconnected"

    finally:

        if connection:

            try:
                connection.close()
            except Exception:
                pass

    return jsonify({
        "status": "success",
        "backend": "online",
        "database": database_status,
    })


# ==========================================================
# LOGIN
# ==========================================================

@app.route(
    "/api/register",
    methods=["POST"]
)
def register():

    data = request.get_json(silent=True) or {}
    name = str(data.get("name", "")).strip()
    email = str(data.get("email", "")).strip().lower()
    password = str(data.get("password", ""))

    if not name or not email or not password:
        return jsonify({
            "status": "error",
            "message": "Name, email, and password are required.",
        }), 400

    if len(password) < 8:
        return jsonify({
            "status": "error",
            "message": "Password must be at least 8 characters.",
        }), 400

    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute(
            """
            INSERT INTO users
                (name, email, role, password_hash)
            VALUES
                (%s, %s, 'User', %s)
            """,
            (name, email, generate_password_hash(password)),
        )
        connection.commit()

        return jsonify({
            "status": "success",
            "message": "Registration successful. You can now sign in.",
        }), 201

    except mysql.connector.IntegrityError:
        if connection:
            connection.rollback()

        return jsonify({
            "status": "error",
            "message": "Email address already exists.",
        }), 409

    except Exception as error:
        if connection:
            connection.rollback()

        print("REGISTRATION ERROR:", error)

        return jsonify({
            "status": "error",
            "message": "Unable to create account.",
        }), 500

    finally:
        if cursor:
            cursor.close()

        if connection:
            connection.close()


@app.route(
    "/api/login",
    methods=["POST"]
)
def login():

    data = request.get_json(silent=True) or {}

    email = str(
        data.get("email", "")
    ).strip().lower()

    password = str(
        data.get("password", "")
    )

    if not email or not password:

        return jsonify({
            "status": "error",
            "message": "Email and password are required.",
        }), 400

    connection = None
    cursor = None

    try:

        connection = get_db_connection()

        cursor = connection.cursor(
            dictionary=True
        )

        cursor.execute(
            """
            SELECT
                id,
                name,
                email,
                role,
                password_hash,
                profile_picture,
                created_at
            FROM users
            WHERE LOWER(email) = %s
            LIMIT 1
            """,
            (email,),
        )

        user = cursor.fetchone()

        if not user:

            return jsonify({
                "status": "error",
                "message": "Invalid email or password.",
            }), 401

        password_hash = user.get(
            "password_hash"
        )

        if not password_hash:

            return jsonify({
                "status": "error",
                "message":
                    "This account does not have a password configured.",
            }), 401

        if not check_password_hash(
            password_hash,
            password
        ):

            return jsonify({
                "status": "error",
                "message": "Invalid email or password.",
            }), 401

        token = create_token(user)

        return jsonify({
            "status": "success",
            "message": "Login successful.",
            "token": token,
            "user": {
                "id": user["id"],
                "name": user["name"],
                "email": user["email"],
                "role": user["role"],
                "profile_picture": user.get("profile_picture"),
            },
        })

    except Exception as error:

        print(
            "LOGIN ERROR:",
            error
        )

        return jsonify({
            "status": "error",
            "message": "Database error during login.",
        }), 500

    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()


# ==========================================================
# CURRENT USER
# ==========================================================

@app.route(
    "/api/me",
    methods=["GET"]
)
@login_required
def current_user():

    user = get_current_user()

    return jsonify({
        "status": "success",
        "user": user,
    })


@app.route("/api/chat", methods=["POST"])
@login_required
def chat():
    data = request.get_json(silent=True) or {}
    message = str(data.get("message", "")).strip()
    topic_title = str(data.get("topic_title", "")).strip()
    history = data.get("history", [])

    if not message:
        return jsonify({
            "status": "error",
            "message": "Ask a Linux administration question first.",
        }), 400

    if len(message) > 2000:
        return jsonify({
            "status": "error",
            "message": "Please keep questions under 2,000 characters.",
        }), 400

    if not isinstance(history, list):
        return jsonify({
            "status": "error",
            "message": "Chat history must be a list.",
        }), 400

    try:
        reply, provider = call_external_tutor(message, topic_title, history)
        return jsonify({
            "status": "success",
            "reply": reply,
            "provider": provider,
            "course": "System Administration and Maintenance",
            "focus": "Linux / GNU/Linux",
        })
    except (HTTPError, URLError, KeyError, IndexError, json.JSONDecodeError) as error:
        print("AI PROVIDER ERROR:", error)
        return jsonify({
            "status": "error",
            "message": "The selected AI provider could not answer. Check its key, model, and network configuration.",
        }), 502
    except RuntimeError as error:
        return jsonify({
            "status": "error",
            "message": str(error),
        }), 503


@app.route("/api/chat/status", methods=["GET"])
@login_required
def chat_status():
    provider = get_configured_ai_provider()
    return jsonify({
        "status": "success",
        "provider": provider,
        "intelligent": provider in {"openai", "gemini"},
        "model": OPENAI_MODEL if provider == "openai" else GEMINI_MODEL if provider == "gemini" else None,
    })


@app.route(
    "/api/me",
    methods=["PUT"]
)
@login_required
def update_current_user():

    current = get_current_user()
    data = request.get_json(silent=True) or {}

    name = str(data.get("name", "")).strip()
    email = str(data.get("email", "")).strip().lower()
    password = str(data.get("password", ""))
    profile_picture = data.get("profile_picture")

    if not name or not email:
        return jsonify({
            "status": "error",
            "message": "Name and email are required.",
        }), 400

    if profile_picture is not None:
        profile_picture = str(profile_picture)
        if profile_picture and (
            not profile_picture.startswith("data:image/")
            or len(profile_picture) > 1500000
        ):
            return jsonify({
                "status": "error",
                "message": "Profile picture must be a valid image under 1 MB.",
            }), 400

    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        fields = [
            "name = %s",
            "email = %s",
        ]
        values = [name, email]

        if password:
            fields.append("password_hash = %s")
            values.append(generate_password_hash(password))

        if profile_picture is not None:
            fields.append("profile_picture = %s")
            values.append(profile_picture or None)

        values.append(current["user_id"])
        update_fields = ", ".join(fields)

        cursor.execute(
            f"""
                UPDATE users
                SET {update_fields}
                WHERE id = %s
            """,
            tuple(values),
        )

        if cursor.rowcount == 0:
            return jsonify({
                "status": "error",
                "message": "User not found.",
            }), 404

        connection.commit()

        updated_user = {
            "id": current["user_id"],
            "name": name,
            "email": email,
            "role": current["role"],
            "profile_picture": (
                profile_picture
                if profile_picture is not None
                else current.get("profile_picture")
            ),
        }

        return jsonify({
            "status": "success",
            "message": "Profile updated successfully.",
            "user": updated_user,
            "token": create_token(updated_user),
        })

    except mysql.connector.IntegrityError:
        if connection:
            connection.rollback()

        return jsonify({
            "status": "error",
            "message": "Email address already exists.",
        }), 409

    except Exception as error:
        if connection:
            connection.rollback()

        print("UPDATE PROFILE ERROR:", error)

        return jsonify({
            "status": "error",
            "message": str(error),
        }), 500

    finally:
        if cursor:
            cursor.close()

        if connection:
            connection.close()


# ==========================================================
# SYSTEM INFORMATION
# ==========================================================

@app.route(
    "/api/system",
    methods=["GET"]
)
@login_required
def system_information():

    memory = psutil.virtual_memory()
    disk = shutil.disk_usage("/")

    cpu_usage = psutil.cpu_percent(
        interval=0.2
    )

    return jsonify({

        "hostname": platform.node(),

        "operating_system": platform.system(),

        "os_version": platform.version(),

        "architecture": platform.machine(),

        "processor": platform.processor(),

        "python_version": platform.python_version(),

        "cpu_usage": cpu_usage,

        "cpu_count": psutil.cpu_count(),

        "memory_usage": memory.percent,

        "memory_total_gb": round(
            memory.total / (1024 ** 3),
            2
        ),

        "memory_used_gb": round(
            memory.used / (1024 ** 3),
            2
        ),

        "memory_free_gb": round(
            memory.available / (1024 ** 3),
            2
        ),

        "disk_usage": round(
            (disk.used / disk.total) * 100,
            2
        ),

        "disk_total_gb": round(
            disk.total / (1024 ** 3),
            2
        ),

        "disk_used_gb": round(
            disk.used / (1024 ** 3),
            2
        ),

        "disk_free_gb": round(
            disk.free / (1024 ** 3),
            2
        ),
    })


# ==========================================================
# SERVER STATUS
# ==========================================================

@app.route(
    "/api/server-status",
    methods=["GET"]
)
@login_required
def server_status():

    uptime_seconds = (
        time.time() - psutil.boot_time()
    )

    days = int(
        uptime_seconds // 86400
    )

    hours = int(
        (uptime_seconds % 86400) // 3600
    )

    minutes = int(
        (uptime_seconds % 3600) // 60
    )

    uptime = (
        f"{days}d "
        f"{hours}h "
        f"{minutes}m"
    )

    return jsonify({

        "status": "Online",

        "uptime": uptime,

        "timestamp":
            datetime.now(
                timezone.utc
            ).isoformat(),
    })


# ==========================================================
# DATABASE MONITORING
# ADMIN ONLY
# ==========================================================

def get_database_table(table_name):
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute(
        """
        SELECT TABLE_NAME
        FROM information_schema.TABLES
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = %s
        LIMIT 1
        """,
        (table_name,),
    )

    table = cursor.fetchone()
    cursor.close()
    connection.close()
    return table


@app.route(
    "/api/database/tables",
    methods=["GET"]
)
@admin_required
def database_tables():
    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        cursor.execute(
            """
            SELECT
                t.TABLE_NAME AS name,
                t.TABLE_ROWS AS row_count,
                t.ENGINE AS engine,
                t.CREATE_TIME AS created_at,
                t.UPDATE_TIME AS updated_at
            FROM information_schema.TABLES t
            WHERE t.TABLE_SCHEMA = DATABASE()
            ORDER BY t.TABLE_NAME
            """
        )

        return jsonify({
            "status": "success",
            "tables": cursor.fetchall(),
        })

    except Exception as error:
        print("DATABASE TABLES ERROR:", error)
        return jsonify({
            "status": "error",
            "message": "Unable to read database tables.",
        }), 500

    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()


@app.route(
    "/api/database/tables/<table_name>",
    methods=["GET"]
)
@admin_required
def database_table_rows(table_name):
    connection = None
    cursor = None

    try:
        try:
            module_key = requested_module_key()
        except ValueError as error:
            return jsonify({"status": "error", "message": str(error)}), 400

        table = get_database_table(table_name)
        if not table:
            return jsonify({
                "status": "error",
                "message": "Database table was not found.",
            }), 404

        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        cursor.execute(
            """
            SELECT
                COLUMN_NAME AS name,
                DATA_TYPE AS data_type,
                IS_NULLABLE AS nullable,
                COLUMN_KEY AS column_key
            FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = %s
            ORDER BY ORDINAL_POSITION
            """,
            (table_name,),
        )
        columns = cursor.fetchall()
        primary_key = next(
            (
                column["name"]
                for column in columns
                if column["column_key"] == "PRI"
            ),
            None,
        )

        escaped_table = table_name.replace("`", "``")
        if table_name == "topics":
            cursor.execute(
                "SELECT * FROM topics WHERE module_key = %s LIMIT 100",
                (module_key,),
            )
        elif table_name == "subtopics":
            cursor.execute(
                """
                SELECT s.*
                FROM subtopics s
                JOIN topics t ON t.id = s.topic_id
                WHERE t.module_key = %s
                ORDER BY s.topic_id, s.order_number, s.id
                LIMIT 100
                """,
                (module_key,),
            )
        else:
            cursor.execute(
                f"SELECT * FROM `{escaped_table}` LIMIT 100"
            )

        return jsonify({
            "status": "success",
            "table": table_name,
            "module_key": module_key if table_name in {"topics", "subtopics"} else None,
            "columns": columns,
            "primary_key": primary_key,
            "rows": cursor.fetchall(),
        })

    except Exception as error:
        print("DATABASE ROWS ERROR:", error)
        return jsonify({
            "status": "error",
            "message": "Unable to read database table.",
        }), 500

    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()


@app.route(
    "/api/database/tables/<table_name>/rows/<path:primary_key_value>",
    methods=["DELETE"]
)
@admin_required
def delete_database_row(table_name, primary_key_value):
    try:
        module_key = requested_module_key()
    except ValueError as error:
        return jsonify({"status": "error", "message": str(error)}), 400

    connection = None
    cursor = None
    acquired_locks = []

    try:
        table = get_database_table(table_name)
        if not table:
            return jsonify({
                "status": "error",
                "message": "Database table was not found.",
            }), 404

        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        if table_name in {"topics", "subtopics"}:
            connection.start_transaction()
        cursor.execute(
            """
            SELECT COLUMN_NAME
            FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = %s
              AND COLUMN_KEY = 'PRI'
            ORDER BY ORDINAL_POSITION
            LIMIT 1
            """,
            (table_name,),
        )
        primary_key = cursor.fetchone()

        if not primary_key:
            return jsonify({
                "status": "error",
                "message": "This table has no primary key and cannot be edited safely.",
            }), 400

        escaped_table = table_name.replace("`", "``")
        escaped_column = primary_key["COLUMN_NAME"].replace("`", "``")

        if table_name == "topics":
            lock_name = topic_order_lock_name(module_key)
            acquire_order_lock(cursor, lock_name)
            acquired_locks.append(lock_name)
            cursor.execute(
                "SELECT id FROM topics WHERE id = %s AND module_key = %s",
                (primary_key_value, module_key),
            )
            if cursor.fetchone() is None:
                connection.rollback()
                return jsonify({
                    "status": "error",
                    "message": "No matching row was found.",
                }), 404

            lesson_lock_name = subtopic_order_lock_name(int(primary_key_value))
            acquire_order_lock(cursor, lesson_lock_name)
            acquired_locks.append(lesson_lock_name)
            topic_rows = fetch_topic_order_rows(cursor, module_key)
            topic_ids = [row["id"] for row in topic_rows]
            stage_order_numbers(cursor, "topics", topic_rows, len(topic_rows) - 1)
            cursor.execute(
                "DELETE FROM topics WHERE id = %s AND module_key = %s",
                (primary_key_value, module_key),
            )
            remaining_ids = [row_id for row_id in topic_ids if row_id != int(primary_key_value)]
            assign_dense_order_numbers(cursor, "topics", remaining_ids)
            connection.commit()
            return jsonify({
                "status": "success",
                "message": "Database row deleted successfully.",
            })

        if table_name == "subtopics":
            cursor.execute(
                """
                SELECT s.topic_id
                FROM subtopics s
                JOIN topics t ON t.id = s.topic_id
                WHERE s.id = %s AND t.module_key = %s
                """,
                (primary_key_value, module_key),
            )
            parent = cursor.fetchone()
            if parent is None:
                connection.rollback()
                return jsonify({
                    "status": "error",
                    "message": "No matching row was found.",
                }), 404

            topic_id = parent["topic_id"]
            lock_name = subtopic_order_lock_name(topic_id)
            acquire_order_lock(cursor, lock_name)
            acquired_locks.append(lock_name)
            lesson_rows = fetch_subtopic_order_rows(cursor, topic_id)
            lesson_ids = [row["id"] for row in lesson_rows]
            subtopic_id = int(primary_key_value)
            if subtopic_id not in lesson_ids:
                connection.rollback()
                return jsonify({
                    "status": "error",
                    "message": "No matching row was found.",
                }), 404

            stage_order_numbers(cursor, "subtopics", lesson_rows, len(lesson_rows) - 1)
            cursor.execute(
                """
                DELETE FROM subtopics
                WHERE id = %s
                  AND topic_id IN (
                    SELECT id FROM topics WHERE module_key = %s
                  )
                """,
                (subtopic_id, module_key),
            )
            remaining_ids = [row_id for row_id in lesson_ids if row_id != subtopic_id]
            assign_dense_order_numbers(cursor, "subtopics", remaining_ids)
            connection.commit()
            return jsonify({
                "status": "success",
                "message": "Database row deleted successfully.",
            })

        cursor.execute(
            f"DELETE FROM `{escaped_table}` WHERE `{escaped_column}` = %s",
            (primary_key_value,),
        )
        connection.commit()

        if cursor.rowcount == 0:
            return jsonify({
                "status": "error",
                "message": "No matching row was found.",
            }), 404

        return jsonify({
            "status": "success",
            "message": "Database row deleted successfully.",
        })

    except OrderLockTimeoutError:
        if connection:
            connection.rollback()
        return jsonify({
            "status": "error",
            "message": "Topic or lesson order is busy. Try again shortly.",
        }), 503

    except Exception as error:
        if connection:
            connection.rollback()
        print("DATABASE DELETE ERROR:", error)
        return jsonify({
            "status": "error",
            "message": "Unable to delete database row.",
        }), 500

    finally:
        if cursor:
            release_order_locks(cursor, acquired_locks)
            cursor.close()
        if connection:
            connection.close()


# ==========================================================
# DOCKER SERVICES
# ==========================================================

@app.route(
    "/api/services",
    methods=["GET"]
)
@login_required
def get_services():

    client = get_docker_client()

    if not client:

        return jsonify({
            "status": "error",
            "message": "Docker is unavailable.",
            "services": [],
        }), 500

    services = [
        {
            "service": "MySQL Database",
            "container": "mysql_database",
        },
        {
            "service": "Flask Backend",
            "container": "flask_backend",
        },
        {
            "service": "React Frontend",
            "container": "react_frontend",
        },
    ]

    results = []

    for service in services:

        container_name = service["container"]

        try:

            container = client.containers.get(
                container_name
            )

            docker_status = container.status

            status = (
                "Running"
                if docker_status == "running"
                else "Stopped"
            )

        except docker.errors.NotFound:

            docker_status = "not_found"
            status = "Stopped"

        except Exception as error:

            docker_status = str(error)
            status = "Unknown"

        results.append({
            "service": service["service"],
            "container": container_name,
            "docker_status": docker_status,
            "status": status,
        })

    return jsonify(results)


# ==========================================================
# START SERVICE
# ==========================================================

@app.route(
    "/api/services/<container_name>/start",
    methods=["POST"]
)
@admin_required
def start_service(container_name):

    if container_name not in ALLOWED_CONTAINERS:

        return jsonify({
            "status": "error",
            "message": "Container is not allowed.",
        }), 403

    client = get_docker_client()

    if not client:

        return jsonify({
            "status": "error",
            "message": "Docker is unavailable.",
        }), 500

    try:

        container = client.containers.get(
            container_name
        )

        container.start()

        return jsonify({
            "status": "success",
            "message":
                f"{container_name} started successfully.",
        })

    except docker.errors.NotFound:

        return jsonify({
            "status": "error",
            "message":
                f"Container {container_name} was not found.",
        }), 404

    except Exception as error:

        return jsonify({
            "status": "error",
            "message": str(error),
        }), 500


# ==========================================================
# STOP SERVICE
# ==========================================================

@app.route(
    "/api/services/<container_name>/stop",
    methods=["POST"]
)
@admin_required
def stop_service(container_name):

    if container_name not in ALLOWED_CONTAINERS:

        return jsonify({
            "status": "error",
            "message": "Container is not allowed.",
        }), 403

    if container_name == "flask_backend":

        return jsonify({
            "status": "error",
            "message":
                "The Flask backend cannot be stopped from "
                "the web interface because it hosts the API.",
        }), 400

    client = get_docker_client()

    if not client:

        return jsonify({
            "status": "error",
            "message": "Docker is unavailable.",
        }), 500

    try:

        container = client.containers.get(
            container_name
        )

        container.stop()

        return jsonify({
            "status": "success",
            "message":
                f"{container_name} stopped successfully.",
        })

    except docker.errors.NotFound:

        return jsonify({
            "status": "error",
            "message":
                f"Container {container_name} was not found.",
        }), 404

    except Exception as error:

        return jsonify({
            "status": "error",
            "message": str(error),
        }), 500


# ==========================================================
# RESTART SERVICE
# ==========================================================

@app.route(
    "/api/services/<container_name>/restart",
    methods=["POST"]
)
@admin_required
def restart_service(container_name):

    if container_name not in ALLOWED_CONTAINERS:

        return jsonify({
            "status": "error",
            "message": "Container is not allowed.",
        }), 403

    if container_name == "flask_backend":

        return jsonify({
            "status": "error",
            "message":
                "The Flask backend cannot be restarted from "
                "the web interface because it hosts the API.",
        }), 400

    client = get_docker_client()

    if not client:

        return jsonify({
            "status": "error",
            "message": "Docker is unavailable.",
        }), 500

    try:

        container = client.containers.get(
            container_name
        )

        container.restart()

        return jsonify({
            "status": "success",
            "message":
                f"{container_name} restarted successfully.",
        })

    except docker.errors.NotFound:

        return jsonify({
            "status": "error",
            "message":
                f"Container {container_name} was not found.",
        }), 404

    except Exception as error:

        return jsonify({
            "status": "error",
            "message": str(error),
        }), 500


# ==========================================================
# SYSTEM LOGS
# ==========================================================

@app.route(
    "/api/logs",
    methods=["GET"]
)
@login_required
def logs():

    current_time = datetime.now().strftime(
        "%Y-%m-%d %H:%M:%S"
    )

    logs_data = [
        {
            "time": current_time,
            "level": "INFO",
            "message":
                "System monitoring is active.",
        },
        {
            "time": current_time,
            "level": "INFO",
            "message":
                "Docker service monitoring is active.",
        },
        {
            "time": current_time,
            "level": "INFO",
            "message":
                "Flask backend is running.",
        },
    ]

    return jsonify(logs_data)


# ==========================================================
# GET USERS
# ADMIN ONLY
# ==========================================================

@app.route(
    "/api/users",
    methods=["GET"]
)
@admin_required
def get_users():

    connection = None
    cursor = None

    try:

        connection = get_db_connection()

        cursor = connection.cursor(
            dictionary=True
        )

        cursor.execute("""
            SELECT
                id,
                name,
                email,
                role,
                created_at
            FROM users
            ORDER BY id ASC
        """)

        users = cursor.fetchall()

        for user in users:

            if user["created_at"]:

                user["created_at"] = (
                    user["created_at"]
                    .strftime(
                        "%Y-%m-%d %H:%M:%S"
                    )
                )

        return jsonify(users)

    except Exception as error:

        print(
            "GET USERS ERROR:",
            error
        )

        return jsonify({
            "status": "error",
            "message": str(error),
        }), 500

    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()


# ==========================================================
# CREATE USER
# ADMIN ONLY
# ==========================================================

@app.route(
    "/api/users",
    methods=["POST"]
)
@admin_required
def create_user():

    data = request.get_json(silent=True) or {}

    name = str(
        data.get("name", "")
    ).strip()

    email = str(
        data.get("email", "")
    ).strip().lower()

    role = str(
        data.get("role", "User")
    ).strip()

    password = str(
        data.get("password", "")
    )

    if not name or not email or not password:

        return jsonify({
            "status": "error",
            "message":
                "Name, email, and password are required.",
        }), 400

    if role not in [
        "User",
        "Administrator",
    ]:

        return jsonify({
            "status": "error",
            "message": "Invalid role.",
        }), 400

    connection = None
    cursor = None

    try:

        connection = get_db_connection()
        cursor = connection.cursor()

        password_hash = generate_password_hash(
            password
        )

        cursor.execute(
            """
            INSERT INTO users
            (
                name,
                email,
                role,
                password_hash
            )
            VALUES
            (
                %s,
                %s,
                %s,
                %s,
                %s,
                %s,
                %s,
                %s,
                %s
            )
            """,
            (
                name,
                email,
                role,
                password_hash,
            ),
        )

        connection.commit()

        return jsonify({
            "status": "success",
            "message":
                "User created successfully.",
        }), 201

    except mysql.connector.IntegrityError:

        if connection:
            connection.rollback()

        return jsonify({
            "status": "error",
            "message":
                "Email address already exists.",
        }), 409

    except Exception as error:

        if connection:
            connection.rollback()

        return jsonify({
            "status": "error",
            "message": str(error),
        }), 500

    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()


# ==========================================================
# UPDATE USER
# ADMIN ONLY
# ==========================================================

@app.route(
    "/api/users/<int:user_id>",
    methods=["PUT"]
)
@admin_required
def update_user(user_id):

    data = request.get_json(
        silent=True
    ) or {}

    name = str(
        data.get("name", "")
    ).strip()

    email = str(
        data.get("email", "")
    ).strip().lower()

    role = str(
        data.get("role", "User")
    ).strip()

    password = str(
        data.get("password", "")
    )

    if not name or not email:

        return jsonify({
            "status": "error",
            "message":
                "Name and email are required.",
        }), 400

    if role not in [
        "User",
        "Administrator",
    ]:

        return jsonify({
            "status": "error",
            "message": "Invalid role.",
        }), 400

    connection = None
    cursor = None

    try:

        connection = get_db_connection()
        cursor = connection.cursor()

        if password:

            password_hash = generate_password_hash(
                password
            )

            cursor.execute(
                """
                UPDATE users
                SET
                    name = %s,
                    email = %s,
                    role = %s,
                    password_hash = %s
                WHERE id = %s
                """,
                (
                    name,
                    email,
                    role,
                    password_hash,
                    user_id,
                ),
            )

        else:

            cursor.execute(
                """
                UPDATE users
                SET
                    name = %s,
                    email = %s,
                    role = %s
                WHERE id = %s
                """,
                (
                    name,
                    email,
                    role,
                    user_id,
                ),
            )

        if cursor.rowcount == 0:

            return jsonify({
                "status": "error",
                "message": "User not found.",
            }), 404

        connection.commit()

        return jsonify({
            "status": "success",
            "message":
                "User updated successfully.",
        })

    except mysql.connector.IntegrityError:

        if connection:
            connection.rollback()

        return jsonify({
            "status": "error",
            "message":
                "Email address already exists.",
        }), 409

    except Exception as error:

        if connection:
            connection.rollback()

        return jsonify({
            "status": "error",
            "message": str(error),
        }), 500

    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()


# ==========================================================
# DELETE USER
# ADMIN ONLY
# ==========================================================

@app.route(
    "/api/users/<int:user_id>",
    methods=["DELETE"]
)
@admin_required
def delete_user(user_id):

    current_user = get_current_user()

    if current_user.get("user_id") == user_id:

        return jsonify({
            "status": "error",
            "message":
                "You cannot delete your own account while logged in.",
        }), 400

    connection = None
    cursor = None

    try:

        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute(
            """
            DELETE FROM users
            WHERE id = %s
            """,
            (user_id,),
        )

        if cursor.rowcount == 0:

            return jsonify({
                "status": "error",
                "message": "User not found.",
            }), 404

        connection.commit()

        return jsonify({
            "status": "success",
            "message":
                "User deleted successfully.",
        })

    except Exception as error:

        if connection:
            connection.rollback()

        return jsonify({
            "status": "error",
            "message": str(error),
        }), 500

    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()


# ==========================================================
# GET ALL TOPICS
# USER + ADMIN
# ==========================================================

@app.route(
    "/api/topics",
    methods=["GET"]
)
@login_required
def get_topics():

    connection = None
    cursor = None

    try:
        try:
            module_key = requested_module_key()
        except ValueError as error:
            return jsonify({"status": "error", "message": str(error)}), 400

        if not database_initialized:
            initialize_database()

        connection = get_db_connection()

        cursor = connection.cursor(
            dictionary=True
        )

        cursor.execute("""
            SELECT
                t.id,
                t.title,
                t.description,
                t.order_number,
                t.file_name,
                t.file_type,
                t.image_name,
                t.image_type,
                t.module_key,
                t.created_at,
                t.updated_at,
                COUNT(s.id) AS subtopic_count
            FROM topics t
            LEFT JOIN subtopics s
                ON t.id = s.topic_id
            WHERE t.module_key = %s
            GROUP BY
                t.id,
                t.title,
                t.description,
                t.order_number,
                t.file_name,
                t.file_type,
                t.image_name,
                t.image_type,
                t.module_key,
                t.created_at,
                t.updated_at
            ORDER BY
                t.order_number ASC,
                t.id ASC
        """, (module_key,))

        topics = cursor.fetchall()

        for topic in topics:

            if topic["created_at"]:

                topic["created_at"] = (
                    topic["created_at"]
                    .strftime(
                        "%Y-%m-%d %H:%M:%S"
                    )
                )

            if topic["updated_at"]:

                topic["updated_at"] = (
                    topic["updated_at"]
                    .strftime(
                        "%Y-%m-%d %H:%M:%S"
                    )
                )

            topic["subtopic_count"] = int(
                topic["subtopic_count"] or 0
            )

        return jsonify({
            "status": "success",
            "topics": topics,
        })

    except Exception as error:

        print(
            "GET TOPICS ERROR:",
            error
        )

        return jsonify({
            "status": "error",
            "message": str(error),
            "topics": [],
        }), 500

    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()


@app.route("/api/topics/order", methods=["PUT"])
@admin_required
def reorder_topics():
    payload = request.get_json(silent=True) or {}
    try:
        module_key = requested_module_key(payload)
        expected, ordered_ids = parse_reorder_payload(
            payload
        )
    except ValueError as error:
        return jsonify({"status": "error", "message": str(error)}), 400

    connection = None
    cursor = None
    acquired_locks = []
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        connection.start_transaction()
        lock_name = topic_order_lock_name(module_key)
        acquire_order_lock(cursor, lock_name)
        acquired_locks.append(lock_name)

        rows = fetch_topic_order_rows(cursor, module_key)
        current_snapshot = {row["id"]: row["order_number"] for row in rows}
        if expected != current_snapshot:
            connection.rollback()
            return jsonify({
                "status": "error",
                "message": "Topic order changed. Reload the list and try again.",
            }), 409

        if len(ordered_ids) > MAX_ORDER_NUMBER:
            connection.rollback()
            return jsonify({
                "status": "error",
                "message": "Too many topics to assign valid order numbers.",
            }), 400

        stage_order_numbers(
            cursor,
            "topics",
            rows,
            len(ordered_ids),
        )
        assign_dense_order_numbers(cursor, "topics", ordered_ids)
        connection.commit()

        return jsonify({
            "status": "success",
            "message": "Topic order updated.",
            "ordered_ids": ordered_ids,
        })
    except OrderLockTimeoutError:
        if connection:
            connection.rollback()
        return jsonify({
            "status": "error",
            "message": "Topic order is busy. Try again shortly.",
        }), 503
    except Exception as error:
        if connection:
            connection.rollback()
        print("REORDER TOPICS ERROR:", error)
        return jsonify({
            "status": "error",
            "message": "Unable to reorder topics.",
        }), 500
    finally:
        if cursor:
            release_order_locks(cursor, acquired_locks)
            cursor.close()
        if connection:
            connection.close()


@app.route(
    "/api/topics/<int:topic_id>/subtopics/order",
    methods=["PUT"],
)
@admin_required
def reorder_subtopics(topic_id):
    payload = request.get_json(silent=True) or {}
    try:
        module_key = requested_module_key(payload)
        expected, ordered_ids = parse_reorder_payload(
            payload
        )
    except ValueError as error:
        return jsonify({"status": "error", "message": str(error)}), 400

    connection = None
    cursor = None
    acquired_locks = []
    lock_name = subtopic_order_lock_name(topic_id)
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        connection.start_transaction()
        acquire_order_lock(cursor, lock_name)
        acquired_locks.append(lock_name)

        if not topic_belongs_to_module(cursor, topic_id, module_key, for_update=True):
            connection.rollback()
            return jsonify({
                "status": "error",
                "message": "Topic not found.",
            }), 404

        rows = fetch_subtopic_order_rows(cursor, topic_id)
        current_snapshot = {row["id"]: row["order_number"] for row in rows}
        if expected != current_snapshot:
            connection.rollback()
            return jsonify({
                "status": "error",
                "message": "Lesson order changed. Reload the list and try again.",
            }), 409

        if len(ordered_ids) > MAX_ORDER_NUMBER:
            connection.rollback()
            return jsonify({
                "status": "error",
                "message": "Too many lessons to assign valid order numbers.",
            }), 400

        stage_order_numbers(
            cursor,
            "subtopics",
            rows,
            len(ordered_ids),
        )
        assign_dense_order_numbers(cursor, "subtopics", ordered_ids)
        connection.commit()

        return jsonify({
            "status": "success",
            "message": "Lesson order updated.",
            "ordered_ids": ordered_ids,
        })
    except OrderLockTimeoutError:
        if connection:
            connection.rollback()
        return jsonify({
            "status": "error",
            "message": "Lesson order is busy. Try again shortly.",
        }), 503
    except Exception as error:
        if connection:
            connection.rollback()
        print("REORDER SUBTOPICS ERROR:", error)
        return jsonify({
            "status": "error",
            "message": "Unable to reorder lessons.",
        }), 500
    finally:
        if cursor:
            release_order_locks(cursor, acquired_locks)
            cursor.close()
        if connection:
            connection.close()


# ==========================================================
# GET SINGLE TOPIC
# USER + ADMIN
# ==========================================================

@app.route(
    "/api/topics/<int:topic_id>",
    methods=["GET"]
)
@login_required
def get_topic(topic_id):

    connection = None
    cursor = None

    try:
        try:
            module_key = requested_module_key()
        except ValueError as error:
            return jsonify({"status": "error", "message": str(error)}), 400

        connection = get_db_connection()

        cursor = connection.cursor(
            dictionary=True
        )

        cursor.execute(
            """
            SELECT
                id,
                title,
                description,
                order_number,
                file_name,
                file_type,
                image_name,
                image_type,
                created_at,
                updated_at
            FROM topics
            WHERE id = %s AND module_key = %s
            """,
            (topic_id, module_key),
        )

        topic = cursor.fetchone()

        if not topic:
            connection.rollback()

            return jsonify({
                "status": "error",
                "message": "Topic not found.",
            }), 404

        if topic["created_at"]:

            topic["created_at"] = (
                topic["created_at"]
                .strftime(
                    "%Y-%m-%d %H:%M:%S"
                )
            )

        if topic["updated_at"]:

            topic["updated_at"] = (
                topic["updated_at"]
                .strftime(
                    "%Y-%m-%d %H:%M:%S"
                )
            )

        return jsonify({
            "status": "success",
            "topic": topic,
        })

    except Exception as error:

        print(
            "GET TOPIC ERROR:",
            error
        )

        return jsonify({
            "status": "error",
            "message": str(error),
        }), 500

    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()


@app.route(
    "/api/topics/<int:topic_id>/file",
    methods=["GET"]
)
@login_required
def get_topic_file(topic_id):

    connection = None
    cursor = None

    try:
            module_key = requested_module_key()
            connection = get_db_connection()
            cursor = connection.cursor(dictionary=True)
            cursor.execute(
                """
                SELECT file_data, file_name, file_type
                FROM topics
                WHERE id = %s AND module_key = %s
                """,
                (topic_id, module_key),
            )
            topic = cursor.fetchone()

            if not topic or not topic["file_data"]:
                return jsonify({
                    "status": "error",
                    "message": "Topic file not found.",
                }), 404

            return send_file(
                BytesIO(topic["file_data"]),
                mimetype=topic["file_type"],
                as_attachment=False,
                download_name=topic["file_name"],
            )

    except Exception as error:
            print("GET TOPIC FILE ERROR:", error)
            return jsonify({
                "status": "error",
                "message": "Unable to retrieve topic file.",
            }), 500

    finally:
            if cursor:
                cursor.close()
            if connection:
                connection.close()


@app.route("/api/topics/<int:topic_id>/image", methods=["GET"])
@login_required
def get_topic_image(topic_id):
    connection = None
    cursor = None

    try:
            module_key = requested_module_key()
            connection = get_db_connection()
            cursor = connection.cursor(dictionary=True)
            cursor.execute(
                """
                SELECT image_data, image_name, image_type
                FROM topics WHERE id = %s AND module_key = %s
                """,
                (topic_id, module_key),
            )
            image = cursor.fetchone()

            if not image or not image["image_data"]:
                return jsonify({
                    "status": "error",
                    "message": "Topic image not found.",
                }), 404

            return send_file(
                BytesIO(image["image_data"]),
                mimetype=image["image_type"],
                as_attachment=False,
                download_name=image["image_name"],
            )
    finally:
            if cursor:
                cursor.close()
            if connection:
                connection.close()


@app.route("/api/topics/<int:topic_id>/slides", methods=["GET"])
@login_required
def get_topic_slides(topic_id):
    connection = None
    cursor = None
    try:
        module_key = requested_module_key()
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        cursor.execute(
            "SELECT id, slides_json FROM topics WHERE id = %s AND module_key = %s",
            (topic_id, module_key),
        )
        topic = cursor.fetchone()
        if not topic:
            return jsonify({"status": "error", "message": "Topic not found."}), 404

        slides = []
        if topic["slides_json"]:
            try:
                slides = json.loads(topic["slides_json"])
            except (TypeError, ValueError):
                return jsonify({
                    "status": "error",
                    "message": "Saved slide layout is invalid.",
                }), 500

        return jsonify({"status": "success", "slides": slides})
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()


@app.route("/api/topics/<int:topic_id>/slides", methods=["PUT"])
@admin_required
def update_topic_slides(topic_id):
    data = request.get_json(silent=True) or {}
    try:
        module_key = requested_module_key(data)
    except ValueError as error:
        return jsonify({"status": "error", "message": str(error)}), 400
    slides = data.get("slides")
    if not isinstance(slides, list):
        return jsonify({
            "status": "error",
            "message": "Slides must be a list.",
        }), 400

    try:
        slides_json = json.dumps(slides, ensure_ascii=False)
    except (TypeError, ValueError) as error:
        return jsonify({
            "status": "error",
            "message": f"Slides could not be serialized: {error}",
        }), 400

    connection = None
    cursor = None
    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute(
            "UPDATE topics SET slides_json = %s WHERE id = %s AND module_key = %s",
            (slides_json, topic_id, module_key),
        )
        if cursor.rowcount == 0:
            return jsonify({"status": "error", "message": "Topic not found."}), 404
        connection.commit()
        return jsonify({"status": "success", "message": "Slide layout saved."})
    except Exception as error:
        if connection:
            connection.rollback()
        print("UPDATE TOPIC SLIDES ERROR:", error)
        return jsonify({
            "status": "error",
            "message": "Unable to save slide layout.",
        }), 500
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()


# ==========================================================
# GET TOPIC SUBTOPICS
# USER + ADMIN
# ==========================================================

@app.route(
    "/api/topics/<int:topic_id>/subtopics",
    methods=["GET"]
)
@login_required
def get_topic_subtopics(topic_id):

    connection = None
    cursor = None

    try:
        try:
            module_key = requested_module_key()
        except ValueError as error:
            return jsonify({"status": "error", "message": str(error)}), 400

        connection = get_db_connection()

        cursor = connection.cursor(
            dictionary=True
        )

        cursor.execute(
            """
            SELECT id
            FROM topics
            WHERE id = %s AND module_key = %s
            """,
            (topic_id, module_key),
        )

        topic = cursor.fetchone()

        if not topic:

            return jsonify({
                "status": "error",
                "message": "Topic not found.",
                "subtopics": [],
            }), 404

        cursor.execute(
            """
            SELECT
                id,
                topic_id,
                title,
                content,
                order_number,
                image_name,
                image_type,
                created_at,
                updated_at
            FROM subtopics
            WHERE topic_id = %s
            ORDER BY
                order_number ASC,
                id ASC
            """,
            (topic_id,),
        )

        subtopics = cursor.fetchall()

        for subtopic in subtopics:

            if subtopic["created_at"]:

                subtopic["created_at"] = (
                    subtopic["created_at"]
                    .strftime(
                        "%Y-%m-%d %H:%M:%S"
                    )
                )

            if subtopic["updated_at"]:

                subtopic["updated_at"] = (
                    subtopic["updated_at"]
                    .strftime(
                        "%Y-%m-%d %H:%M:%S"
                    )
                )

        return jsonify({
            "status": "success",
            "subtopics": subtopics,
        })

    except Exception as error:

        print(
            "GET SUBTOPICS ERROR:",
            error
        )

        return jsonify({
            "status": "error",
            "message": str(error),
            "subtopics": [],
        }), 500

    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()


@app.route("/api/subtopics/<int:subtopic_id>/image", methods=["GET"])
@login_required
def get_subtopic_image(subtopic_id):
    connection = None
    cursor = None

    try:
        module_key = requested_module_key()
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        cursor.execute(
            """
            SELECT s.image_data, s.image_name, s.image_type
            FROM subtopics s
            JOIN topics t ON t.id = s.topic_id
            WHERE s.id = %s AND t.module_key = %s
            """,
            (subtopic_id, module_key),
        )
        image = cursor.fetchone()

        if not image or not image["image_data"]:
            return jsonify({
                "status": "error",
                "message": "Subtopic image not found.",
            }), 404

        return send_file(
            BytesIO(image["image_data"]),
            mimetype=image["image_type"],
            as_attachment=False,
            download_name=image["image_name"],
        )
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()


# ==========================================================
# CREATE TOPIC
# ADMIN ONLY
# ==========================================================

@app.route(
    "/api/topics",
    methods=["POST"]
)
@admin_required
def create_topic():

    data = request.form if request.form else (
        request.get_json(silent=True) or {}
    )
    try:
        module_key = requested_module_key(data)
    except ValueError as error:
        return jsonify({"status": "error", "message": str(error)}), 400

    title = str(
        data.get("title", "")
    ).strip()

    description = str(
        data.get("description", "")
    ).strip()

    order_number = data.get("order_number")
    uploaded_file = request.files.get("file")
    uploaded_image = request.files.get("image")

    if uploaded_file and (
        uploaded_file.mimetype not in [
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            "application/octet-stream",
        ]
        or not uploaded_file.filename.lower().endswith((".pdf", ".pptx"))
    ):
        return jsonify({
            "status": "error",
            "message": "Only PDF and PPTX files are allowed.",
        }), 400

    if uploaded_image and (
        uploaded_image.mimetype not in [
            "image/jpeg", "image/png", "image/gif", "image/webp"
        ]
        or uploaded_image.content_length and uploaded_image.content_length > 5 * 1024 * 1024
    ):
        return jsonify({
            "status": "error",
            "message": "Topic images must be JPG, PNG, GIF, or WebP files under 5 MB.",
        }), 400

    if uploaded_image and (
        uploaded_image.mimetype not in [
            "image/jpeg", "image/png", "image/gif", "image/webp"
        ]
        or uploaded_image.content_length and uploaded_image.content_length > 5 * 1024 * 1024
    ):
        return jsonify({
            "status": "error",
            "message": "Topic images must be JPG, PNG, GIF, or WebP files under 5 MB.",
        }), 400

    if not title:

        return jsonify({
            "status": "error",
            "message": "Topic title is required.",
        }), 400

    try:
        order_number = parse_order_number(order_number)
    except ValueError:

        return jsonify({
            "status": "error",
            "message":
                "Order number must be a positive integer between 1 and 2147483647.",
        }), 400

    connection = None
    cursor = None
    acquired_locks = []

    try:

        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        connection.start_transaction()
        lock_name = topic_order_lock_name(module_key)
        acquire_order_lock(cursor, lock_name)
        acquired_locks.append(lock_name)

        existing_topics = fetch_topic_order_rows(cursor, module_key)
        if order_number > len(existing_topics) + 1:
            connection.rollback()
            return jsonify({
                "status": "error",
                "message": "Topic order must be between 1 and the next available position.",
            }), 400

        ordered_ids = [topic["id"] for topic in existing_topics]
        ordered_ids.insert(order_number - 1, None)
        temporary_orders = stage_order_numbers(
            cursor,
            "topics",
            existing_topics,
            len(ordered_ids),
            len(existing_topics) + 1,
        )

        cursor.execute(
            """
            INSERT INTO topics
            (
                title,
                description,
                order_number,
                module_key,
                file_data,
                file_name,
                file_type,
                image_data,
                image_name,
                image_type
            )
            VALUES
            (
                %s,
                %s,
                %s,
                %s,
                %s,
                %s,
                %s,
                %s,
                %s,
                %s
            )
            """,
            (
                title,
                description,
                temporary_orders[-1],
                module_key,
                uploaded_file.read() if uploaded_file else None,
                uploaded_file.filename if uploaded_file else None,
                uploaded_file.mimetype if uploaded_file else None,
                uploaded_image.read() if uploaded_image else None,
                uploaded_image.filename if uploaded_image else None,
                uploaded_image.mimetype if uploaded_image else None,
            ),
        )

        topic_id = cursor.lastrowid
        ordered_ids[order_number - 1] = topic_id
        assign_dense_order_numbers(cursor, "topics", ordered_ids)
        connection.commit()

        return jsonify({
            "status": "success",
            "message":
                "Topic created successfully.",
            "topic_id": topic_id,
        }), 201

    except OrderLockTimeoutError:
        if connection:
            connection.rollback()
        return jsonify({
            "status": "error",
            "message": "Topic order is busy. Try again shortly.",
        }), 503

    except Exception as error:

        if connection:
            connection.rollback()

        print(
            "CREATE TOPIC ERROR:",
            error
        )

        return jsonify({
            "status": "error",
            "message": "Unable to create topic.",
        }), 500

    finally:

        if cursor:
            release_order_locks(cursor, acquired_locks)
            cursor.close()

        if connection:
            connection.close()


# ==========================================================
# UPDATE TOPIC
# ADMIN ONLY
# ==========================================================

@app.route(
    "/api/topics/<int:topic_id>",
    methods=["PUT"]
)
@admin_required
def update_topic(topic_id):

    data = request.form if request.form else (
        request.get_json(silent=True) or {}
    )
    try:
        module_key = requested_module_key(data)
    except ValueError as error:
        return jsonify({"status": "error", "message": str(error)}), 400

    title = str(
        data.get("title", "")
    ).strip()

    description = str(
        data.get("description", "")
    ).strip()

    order_number = data.get("order_number")
    uploaded_file = request.files.get("file")
    uploaded_image = request.files.get("image")

    if uploaded_file and (
        uploaded_file.mimetype not in [
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            "application/octet-stream",
        ]
        or not uploaded_file.filename.lower().endswith((".pdf", ".pptx"))
    ):
        return jsonify({
            "status": "error",
            "message": "Only PDF and PPTX files are allowed.",
        }), 400

    if uploaded_image and (
        uploaded_image.mimetype not in [
            "image/jpeg", "image/png", "image/gif", "image/webp"
        ]
        or uploaded_image.content_length and uploaded_image.content_length > 5 * 1024 * 1024
    ):
        return jsonify({
            "status": "error",
            "message": "Topic images must be JPG, PNG, GIF, or WebP files under 5 MB.",
        }), 400

    if not title:

        return jsonify({
            "status": "error",
            "message": "Topic title is required.",
        }), 400

    try:
        order_number = parse_order_number(order_number)
    except ValueError:

        return jsonify({
            "status": "error",
            "message":
                "Order number must be a positive integer between 1 and 2147483647.",
        }), 400

    connection = None
    cursor = None
    acquired_locks = []

    try:

        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        connection.start_transaction()
        lock_name = topic_order_lock_name(module_key)
        acquire_order_lock(cursor, lock_name)
        acquired_locks.append(lock_name)

        topics = fetch_topic_order_rows(cursor, module_key)
        topic_ids = [topic["id"] for topic in topics]
        if topic_id not in topic_ids:
            connection.rollback()
            return jsonify({
                "status": "error",
                "message": "Topic not found.",
            }), 404
        if order_number > len(topics):
            connection.rollback()
            return jsonify({
                "status": "error",
                "message": "Topic order must be between 1 and the current topic count.",
            }), 400

        ordered_ids = move_ordered_id(topic_ids, topic_id, order_number)
        stage_order_numbers(cursor, "topics", topics, len(ordered_ids))

        fields = [
            "title = %s",
            "description = %s",
        ]
        values = [title, description]

        if uploaded_file:
            fields.extend([
                "file_data = %s",
                "file_name = %s",
                "file_type = %s",
            ])
            values.extend([
                uploaded_file.read(),
                uploaded_file.filename,
                uploaded_file.mimetype,
            ])

        if uploaded_image:
            fields.extend([
                "image_data = %s",
                "image_name = %s",
                "image_type = %s",
            ])
            values.extend([
                uploaded_image.read(),
                uploaded_image.filename,
                uploaded_image.mimetype,
            ])

        values.append(topic_id)
        cursor.execute(
            f"""
            UPDATE topics
            SET {", ".join(fields)}
            WHERE id = %s AND module_key = %s
            """,
            tuple(values + [module_key]),
        )

        assign_dense_order_numbers(cursor, "topics", ordered_ids)
        connection.commit()

        return jsonify({
            "status": "success",
            "message":
                "Topic updated successfully.",
        })

    except OrderLockTimeoutError:
        if connection:
            connection.rollback()
        return jsonify({
            "status": "error",
            "message": "Topic order is busy. Try again shortly.",
        }), 503

    except Exception as error:

        if connection:
            connection.rollback()

        print(
            "UPDATE TOPIC ERROR:",
            error
        )

        return jsonify({
            "status": "error",
            "message": str(error),
        }), 500

    finally:

        if cursor:
            release_order_locks(cursor, acquired_locks)
            cursor.close()

        if connection:
            connection.close()


# ==========================================================
# DELETE TOPIC
# ADMIN ONLY
# ==========================================================

@app.route(
    "/api/topics/<int:topic_id>",
    methods=["DELETE"]
)
@admin_required
def delete_topic(topic_id):

    try:
        module_key = requested_module_key()
    except ValueError as error:
        return jsonify({"status": "error", "message": str(error)}), 400

    connection = None
    cursor = None
    acquired_locks = []

    try:

        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        connection.start_transaction()
        lock_name = topic_order_lock_name(module_key)
        acquire_order_lock(cursor, lock_name)
        acquired_locks.append(lock_name)

        cursor.execute(
            "SELECT id FROM topics WHERE id = %s AND module_key = %s",
            (topic_id, module_key),
        )
        if cursor.fetchone() is None:
            connection.rollback()
            return jsonify({
                "status": "error",
                "message": "Topic not found.",
            }), 404

        lesson_lock_name = subtopic_order_lock_name(topic_id)
        acquire_order_lock(cursor, lesson_lock_name)
        acquired_locks.append(lesson_lock_name)

        topics = fetch_topic_order_rows(cursor, module_key)
        topic_ids = [topic["id"] for topic in topics]
        stage_order_numbers(cursor, "topics", topics, len(topics) - 1)

        cursor.execute(
            """
            DELETE FROM topics
            WHERE id = %s AND module_key = %s
            """,
            (topic_id, module_key),
        )

        remaining_ids = [row_id for row_id in topic_ids if row_id != topic_id]
        assign_dense_order_numbers(cursor, "topics", remaining_ids)
        connection.commit()

        return jsonify({
            "status": "success",
            "message":
                "Topic and its subtopics deleted successfully.",
        })

    except OrderLockTimeoutError:
        if connection:
            connection.rollback()
        return jsonify({
            "status": "error",
            "message": "Topic or lesson order is busy. Try again shortly.",
        }), 503

    except Exception as error:

        if connection:
            connection.rollback()

        print(
            "DELETE TOPIC ERROR:",
            error
        )

        return jsonify({
            "status": "error",
            "message": str(error),
        }), 500

    finally:

        if cursor:
            release_order_locks(cursor, acquired_locks)
            cursor.close()

        if connection:
            connection.close()


# ==========================================================
# CREATE SUBTOPIC
# ADMIN ONLY
# ==========================================================

@app.route(
    "/api/topics/<int:topic_id>/subtopics",
    methods=["POST"]
)
@admin_required
def create_subtopic(topic_id):

    data = request.form if request.form else (
        request.get_json(silent=True) or {}
    )
    try:
        module_key = requested_module_key(data)
    except ValueError as error:
        return jsonify({"status": "error", "message": str(error)}), 400

    title = str(
        data.get("title", "")
    ).strip()

    content = str(
        data.get("content", "")
    )

    order_number = data.get("order_number")
    uploaded_image = request.files.get("image")

    if uploaded_image and (
        uploaded_image.mimetype not in [
            "image/jpeg", "image/png", "image/gif", "image/webp"
        ]
        or uploaded_image.content_length and uploaded_image.content_length > 5 * 1024 * 1024
    ):
        return jsonify({
            "status": "error",
            "message": "Subtopic images must be JPG, PNG, GIF, or WebP files under 5 MB.",
        }), 400

    if not title:

        return jsonify({
            "status": "error",
            "message":
                "Subtopic title is required.",
        }), 400

    try:
        order_number = parse_order_number(order_number)
    except ValueError:

        return jsonify({
            "status": "error",
            "message":
                "Order number must be a positive integer between 1 and 2147483647.",
        }), 400

    connection = None
    cursor = None
    acquired_locks = []

    try:

        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        connection.start_transaction()
        lock_name = subtopic_order_lock_name(topic_id)
        acquire_order_lock(cursor, lock_name)
        acquired_locks.append(lock_name)

        if not topic_belongs_to_module(cursor, topic_id, module_key, for_update=True):

            return jsonify({
                "status": "error",
                "message": "Topic not found.",
            }), 404

        existing_subtopics = fetch_subtopic_order_rows(cursor, topic_id)
        if order_number > len(existing_subtopics) + 1:
            connection.rollback()
            return jsonify({
                "status": "error",
                "message": "Lesson order must be between 1 and the next available position.",
            }), 400

        ordered_ids = [subtopic["id"] for subtopic in existing_subtopics]
        ordered_ids.insert(order_number - 1, None)
        temporary_orders = stage_order_numbers(
            cursor,
            "subtopics",
            existing_subtopics,
            len(ordered_ids),
            len(existing_subtopics) + 1,
        )

        cursor.execute(
            """
            INSERT INTO subtopics
            (
                topic_id,
                title,
                content,
                order_number,
                image_data,
                image_name,
                image_type
            )
            VALUES
            (
                %s,
                %s,
                %s,
                %s,
                %s,
                %s,
                %s
            )
            """,
            (
                topic_id,
                title,
                content,
                temporary_orders[-1],
                uploaded_image.read() if uploaded_image else None,
                uploaded_image.filename if uploaded_image else None,
                uploaded_image.mimetype if uploaded_image else None,
            ),
        )

        subtopic_id = cursor.lastrowid
        ordered_ids[order_number - 1] = subtopic_id
        assign_dense_order_numbers(cursor, "subtopics", ordered_ids)
        connection.commit()

        return jsonify({
            "status": "success",
            "message":
                "Subtopic created successfully.",
            "subtopic_id":
                subtopic_id,
        }), 201

    except OrderLockTimeoutError:
        if connection:
            connection.rollback()
        return jsonify({
            "status": "error",
            "message": "Lesson order is busy. Try again shortly.",
        }), 503

    except Exception as error:

        if connection:
            connection.rollback()

        print(
            "CREATE SUBTOPIC ERROR:",
            error
        )

        return jsonify({
            "status": "error",
            "message": str(error),
        }), 500

    finally:

        if cursor:
            release_order_locks(cursor, acquired_locks)
            cursor.close()

        if connection:
            connection.close()


# ==========================================================
# UPDATE SUBTOPIC
# ADMIN ONLY
# ==========================================================

@app.route(
    "/api/subtopics/<int:subtopic_id>",
    methods=["PUT"]
)
@admin_required
def update_subtopic(subtopic_id):

    data = request.form if request.form else (
        request.get_json(silent=True) or {}
    )
    try:
        module_key = requested_module_key(data)
    except ValueError as error:
        return jsonify({"status": "error", "message": str(error)}), 400

    title = str(
        data.get("title", "")
    ).strip()

    content = str(
        data.get("content", "")
    )

    order_number = data.get("order_number")
    uploaded_image = request.files.get("image")

    if uploaded_image and (
        uploaded_image.mimetype not in [
            "image/jpeg", "image/png", "image/gif", "image/webp"
        ]
        or uploaded_image.content_length and uploaded_image.content_length > 5 * 1024 * 1024
    ):
        return jsonify({
            "status": "error",
            "message": "Subtopic images must be JPG, PNG, GIF, or WebP files under 5 MB.",
        }), 400

    if not title:

        return jsonify({
            "status": "error",
            "message":
                "Subtopic title is required.",
        }), 400

    try:
        order_number = parse_order_number(order_number)
    except ValueError:

        return jsonify({
            "status": "error",
            "message":
                "Order number must be a positive integer between 1 and 2147483647.",
        }), 400

    connection = None
    cursor = None
    acquired_locks = []

    try:

        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        connection.start_transaction()

        existing = subtopic_belongs_to_module(
            cursor, subtopic_id, module_key, for_update=True
        )
        if existing is None:
            connection.rollback()
            return jsonify({
                "status": "error",
                "message": "Subtopic not found.",
            }), 404

        topic_id = existing["topic_id"]
        lock_name = subtopic_order_lock_name(topic_id)
        acquire_order_lock(cursor, lock_name)
        acquired_locks.append(lock_name)

        subtopics = fetch_subtopic_order_rows(cursor, topic_id)
        subtopic_ids = [subtopic["id"] for subtopic in subtopics]
        if subtopic_id not in subtopic_ids:
            connection.rollback()
            return jsonify({
                "status": "error",
                "message": "Subtopic not found.",
            }), 404
        if order_number > len(subtopics):
            connection.rollback()
            return jsonify({
                "status": "error",
                "message": "Lesson order must be between 1 and the current lesson count.",
            }), 400

        ordered_ids = move_ordered_id(subtopic_ids, subtopic_id, order_number)
        stage_order_numbers(cursor, "subtopics", subtopics, len(ordered_ids))
        cursor.execute(
            """
            UPDATE subtopics
            SET
                title = %s,
                content = %s,
                image_data = COALESCE(%s, image_data),
                image_name = COALESCE(%s, image_name),
                image_type = COALESCE(%s, image_type)
            WHERE id = %s
                AND topic_id IN (
                    SELECT id FROM topics WHERE module_key = %s
                )
            """,
            (
                title,
                content,
                uploaded_image.read() if uploaded_image else None,
                uploaded_image.filename if uploaded_image else None,
                uploaded_image.mimetype if uploaded_image else None,
                subtopic_id,
                module_key,
            ),
        )

        assign_dense_order_numbers(cursor, "subtopics", ordered_ids)
        connection.commit()

        return jsonify({
            "status": "success",
            "message":
                "Subtopic updated successfully.",
        })

    except OrderLockTimeoutError:
        if connection:
            connection.rollback()
        return jsonify({
            "status": "error",
            "message": "Lesson order is busy. Try again shortly.",
        }), 503

    except Exception as error:

        if connection:
            connection.rollback()

        print(
            "UPDATE SUBTOPIC ERROR:",
            error
        )

        return jsonify({
            "status": "error",
            "message": str(error),
        }), 500

    finally:

        if cursor:
            release_order_locks(cursor, acquired_locks)
            cursor.close()

        if connection:
            connection.close()


# ==========================================================
# DELETE SUBTOPIC
# ADMIN ONLY
# ==========================================================

@app.route(
    "/api/subtopics/<int:subtopic_id>",
    methods=["DELETE"]
)
@admin_required
def delete_subtopic(subtopic_id):

    try:
        module_key = requested_module_key()
    except ValueError as error:
        return jsonify({"status": "error", "message": str(error)}), 400

    connection = None
    cursor = None
    acquired_locks = []

    try:

        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        connection.start_transaction()

        existing = subtopic_belongs_to_module(
            cursor, subtopic_id, module_key, for_update=True
        )
        if existing is None:
            connection.rollback()
            return jsonify({
                "status": "error",
                "message": "Subtopic not found.",
            }), 404

        topic_id = existing["topic_id"]
        lock_name = subtopic_order_lock_name(topic_id)
        acquire_order_lock(cursor, lock_name)
        acquired_locks.append(lock_name)

        subtopics = fetch_subtopic_order_rows(cursor, topic_id)
        subtopic_ids = [subtopic["id"] for subtopic in subtopics]
        if subtopic_id not in subtopic_ids:
            connection.rollback()
            return jsonify({
                "status": "error",
                "message": "Subtopic not found.",
            }), 404

        stage_order_numbers(cursor, "subtopics", subtopics, len(subtopics) - 1)

        cursor.execute(
            """
            DELETE FROM subtopics
            WHERE id = %s
                AND topic_id IN (
                    SELECT id FROM topics WHERE module_key = %s
                )
            """,
            (subtopic_id, module_key),
        )

        remaining_ids = [row_id for row_id in subtopic_ids if row_id != subtopic_id]
        assign_dense_order_numbers(cursor, "subtopics", remaining_ids)
        connection.commit()

        return jsonify({
            "status": "success",
            "message":
                "Subtopic deleted successfully.",
        })

    except OrderLockTimeoutError:
        if connection:
            connection.rollback()
        return jsonify({
            "status": "error",
            "message": "Lesson order is busy. Try again shortly.",
        }), 503

    except Exception as error:

        if connection:
            connection.rollback()

        print(
            "DELETE SUBTOPIC ERROR:",
            error
        )

        return jsonify({
            "status": "error",
            "message": str(error),
        }), 500

    finally:

        if cursor:
            release_order_locks(cursor, acquired_locks)
            cursor.close()

        if connection:
            connection.close()


# ==========================================================
# ERROR HANDLERS
# ==========================================================

@app.errorhandler(404)
def not_found(error):

    return jsonify({
        "status": "error",
        "message": "Endpoint not found.",
    }), 404


@app.errorhandler(500)
def internal_error(error):

    return jsonify({
        "status": "error",
        "message": "Internal server error.",
    }), 500


# ==========================================================
# START APPLICATION
# ==========================================================

if __name__ == "__main__":

    initialize_database()

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True,
    )
