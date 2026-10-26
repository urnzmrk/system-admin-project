import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import "./App.css";
import "./PolishedUI.css";

const API_URL = import.meta.env.VITE_API_URL || "";
const MAX_ORDER_NUMBER = 2_147_483_647;

function createBlockId(type) {
  return `${type}-${Date.now()}`;
}

const TOPIC_CONTENT_ASSETS = Object.freeze({
  1: "/topic1.txt",
  2: "/topic2.txt",
  3: "/topic3.txt",
  4: "/topic4.txt",
  5: "/topic5.txt",
  6: "/topic6.txt",
  7: "/topic7.txt",
  8: "/topic8.txt",
  9: "/topic9.txt",
  10: "/topic10.txt",
  11: "/topic11.txt",
  12: "/topic12.txt",
  13: "/topic13.txt",
  14: "/topic14.txt",
  15: "/topic15.txt",
  16: "/topic16.txt",
  17: "/topic17.txt",
  18: "/topic18.txt",
  19: "/topic19.txt",
  20: "/topic20.txt",
  21: "/topic21.txt",
  22: "/topic22.txt",
  23: "/topic23.txt",
  24: "/topic24.txt",
  25: "/topic25.txt",
  26: "/topic26.txt",
  27: "/topic27.txt",
  28: "/topic28.txt",
  29: "/topic29.txt",
  30: "/topic30.txt",
  1534: "/topic1.txt",
  1535: "/topic2.txt",
  1536: "/topic3.txt",
  1537: "/topic4.txt",
  1538: "/topic5.txt",
  1539: "/topic6.txt",
  1540: "/topic7.txt",
  1541: "/topic8.txt",
  1542: "/topic9.txt",
  1543: "/topic10.txt",
  1544: "/topic11.txt",
  1545: "/topic12.txt",
  1546: "/topic13.txt",
  1547: "/topic14.txt",
  1548: "/topic15.txt",
  1549: "/topic16.txt",
  1550: "/topic17.txt",
  1551: "/topic18.txt",
  1552: "/topic19.txt",
  1553: "/topic20.txt",
  1554: "/topic21.txt",
  1555: "/topic22.txt",
  1556: "/topic23.txt",
  1557: "/topic24.txt",
  1558: "/topic25.txt",
  1559: "/topic26.txt",
  1560: "/topic27.txt",
  1561: "/topic28.txt",
  1562: "/topic29.txt",
  1563: "/topic30.txt",
  1474: "/topic1.txt",
  1475: "/topic2.txt",
  1476: "/topic3.txt",
  1477: "/topic4.txt",
  1478: "/topic5.txt",
  1479: "/topic6.txt",
  1480: "/topic7.txt",
  1481: "/topic8.txt",
  1482: "/topic9.txt",
  1483: "/topic10.txt",
  1484: "/topic11.txt",
  1485: "/topic12.txt",
  1486: "/topic13.txt",
  1487: "/topic14.txt",
  1488: "/topic15.txt",
  1489: "/topic16.txt",
  1490: "/topic17.txt",
  1491: "/topic18.txt",
  1492: "/topic19.txt",
  1493: "/topic20.txt",
  1494: "/topic21.txt",
  1495: "/topic22.txt",
  1496: "/topic23.txt",
  1497: "/topic24.txt",
  1498: "/topic25.txt",
  1499: "/topic26.txt",
  1500: "/topic27.txt",
  1501: "/topic28.txt",
  1502: "/topic29.txt",
  1503: "/topic30.txt",
});

function getTopicContentAsset(topic) {
  const topicId = Number(topic?.id);
  return Number.isSafeInteger(topicId)
    ? TOPIC_CONTENT_ASSETS[topicId] || null
    : null;
}

function isFirstMappedTopic(topic) {
  return getTopicContentAsset(topic) === TOPIC_CONTENT_ASSETS[1474];
}


/* ==========================================================
   API HELPERS
========================================================== */

/*
  Your Flask API sometimes returns arrays directly and sometimes
  wraps them inside an object.

  Examples:

  Direct:
  [
    {...},
    {...}
  ]

  Wrapped:
  {
    status: "success",
    topics: [...]
  }


  if (page === "profile") {
    return (
      <Profile
        user={user}
        apiFetch={apiFetch}
        onProfileUpdate={onProfileUpdate}
      />
    );
  }

  This helper supports both formats.
*/
function getArrayData(data, keys = []) {
  if (Array.isArray(data)) {
    return data;
  }

  for (const key of keys) {
    if (Array.isArray(data?.[key])) {
      return data[key];
    }
  }

  return [];
}


/*
  Safely read a JSON response.

  This prevents the frontend from crashing if Flask returns
  an empty response or non-JSON response.
*/
async function readJson(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}


function getTopicSubjectMeta(title = "") {
  const normalized = String(title).toLowerCase();

  if (normalized.includes("linux")) {
    return {
      label: "Linux",
      accent: "linux",
    };
  }

  if (
    normalized.includes("network") ||
    normalized.includes("socket") ||
    normalized.includes("routing")
  ) {
    return {
      label: "Networking",
      accent: "network",
    };
  }

  if (
    normalized.includes("security") ||
    normalized.includes("access") ||
    normalized.includes("authentication")
  ) {
    return {
      label: "Security",
      accent: "security",
    };
  }

  if (
    normalized.includes("docker") ||
    normalized.includes("container") ||
    normalized.includes("service")
  ) {
    return {
      label: "Services",
      accent: "services",
    };
  }

  if (
    normalized.includes("filesystem") ||
    normalized.includes("storage") ||
    normalized.includes("disk")
  ) {
    return {
      label: "Storage",
      accent: "storage",
    };
  }

  return {
    label: "Infrastructure",
    accent: "infrastructure",
  };
}

function getSubjectIcon(title = "") {
  const normalized = String(title).toLowerCase();

  if (normalized.includes("linux")) return "🐧";
  if (normalized.includes("network")) return "🌐";
  if (normalized.includes("security")) return "🛡";
  if (normalized.includes("docker") || normalized.includes("container")) return "◈";
  if (normalized.includes("storage") || normalized.includes("filesystem")) return "▤";
  return "⚙";
}

function VisualAsset({
  apiFetch,
  url,
  alt,
  className,
}) {
  const [source, setSource] = useState("");

  useEffect(() => {
    let objectUrl = "";

    async function loadImage() {
      const response = await apiFetch(url);

      if (!response || !response.ok) return;

      const blob = await response.blob();
      objectUrl = URL.createObjectURL(blob);
      setSource(objectUrl);
    }

    loadImage().catch((error) => {
      console.error("Load visual asset error:", error);
    });

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [apiFetch, url]);

  if (!source) return null;

  return (
    <img
      className={className}
      src={source}
      alt={alt}
    />
  );
}


/*
  Extract a useful error message from Flask.
*/
async function getResponseError(
  response,
  fallbackMessage
) {
  const data = await readJson(response);

  return (
    data?.message ||
    data?.error ||
    fallbackMessage
  );
}


/*
  Central API request helper.

  Automatically:
  - Adds JSON headers
  - Adds JWT Authorization header
  - Handles expired/invalid JWT
  - Prevents automatic logout for login requests
*/
async function apiFetch(url, options = {}) {
  const token =
    localStorage.getItem(
      "sysadmin_token"
    );

  const headers = {
    ...(options.body instanceof FormData
      ? {}
      : { "Content-Type": "application/json" }),
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization =
      `Bearer ${token}`;
  }

  try {
    const response =
      await fetch(url, {
        ...options,
        headers,
      });

    /*
      If the token is expired or invalid,
      return the user to the login screen.

      Do not do this for /api/login because login itself
      can legitimately return 401.
    */
    if (
      response.status === 401 &&
      !url.endsWith("/api/login")
    ) {
      localStorage.removeItem(
        "sysadmin_token"
      );

      localStorage.removeItem(
        "sysadmin_user"
      );

      window.location.href = "/";

      return null;
    }

    // Older tokens included the full base64 profile picture and can exceed
    // the proxy's request-header limit. Clear those sessions and issue a
    // compact token at the next login.
    if (response.status === 431) {
      localStorage.removeItem("sysadmin_token");
      localStorage.removeItem("sysadmin_user");
      window.location.href = "/";
      return null;
    }

    return response;
  } catch (error) {
    console.error(
      "API request failed:",
      error
    );

    throw error;
  }
}


/* ==========================================================
   APP
========================================================== */

function App() {
  const [user, setUser] =
    useState(() => {
      const saved =
        localStorage.getItem(
          "sysadmin_user"
        );

      const token =
        localStorage.getItem(
          "sysadmin_token"
        );

      if (!saved || !token) {
        localStorage.removeItem(
          "sysadmin_user"
        );

        localStorage.removeItem(
          "sysadmin_token"
        );

        return null;
      }

      try {
        return JSON.parse(saved);
      } catch {
        localStorage.removeItem(
          "sysadmin_user"
        );

        return null;
      }
    });

  function handleLogin(
    loggedInUser,
    token
  ) {
    localStorage.setItem(
      "sysadmin_token",
      token
    );

    localStorage.setItem(
      "sysadmin_user",
      JSON.stringify(
        loggedInUser
      )
    );

    setUser(loggedInUser);
  }


  function handleLogout() {
    localStorage.removeItem(
      "sysadmin_token"
    );

    localStorage.removeItem(
      "sysadmin_user"
    );

    setUser(null);
  }


  function handleProfileUpdate(updatedUser, token) {
    localStorage.setItem(
      "sysadmin_token",
      token
    );

    localStorage.setItem(
      "sysadmin_user",
      JSON.stringify(updatedUser)
    );

    setUser(updatedUser);
  }


  if (!user) {
    return (
      <Login
        onLogin={handleLogin}
      />
    );
  }


  return (
    <AdminApplication
      user={user}
      onLogout={handleLogout}
      onProfileUpdate={handleProfileUpdate}
    />
  );
}


/* ==========================================================
   LOGIN
========================================================== */

function Login({ onLogin }) {
  const [registerMode, setRegisterMode] =
    useState(false);

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");


  async function handleSubmit(
    event
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response =
        await fetch(
          `${API_URL}/${registerMode ? "api/register" : "api/login"}`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              ...(registerMode ? { name } : {}),
              email,
              password,
            }),
          }
        );

      const data =
        await readJson(response);

      if (!response.ok) {
        setError(
          data?.message ||
            "Invalid email or password."
        );

        return;
      }

      if (registerMode) {
        setRegisterMode(false);
        setName("");
        setPassword("");
        setSuccess(
          data?.message ||
          "Registration successful. You can now sign in."
        );
        return;
      }

      if (!data?.user || !data?.token) {
        setError(
          "The server returned an invalid login response."
        );

        return;
      }

      onLogin(
        data.user,
        data.token
      );
    } catch (error) {
      console.error(error);

      setError(
        "Unable to connect to the server. Please check that the backend is running."
      );
    } finally {
      setLoading(false);
    }
  }


  return (
    <div className="login-page">

      <div className="login-grid"></div>

      <div className="login-glow login-glow-one"></div>

      <div className="login-glow login-glow-two"></div>


      <div className="login-layout">

        {/* LEFT INFORMATION */}

        <div className="login-brand-section">

          <div className="brand-mark large">
            <span>⌘</span>
          </div>

          <div className="login-brand-text">

            <span className="eyebrow">
              SYSTEM ADMINISTRATION
            </span>

            <h1>
              SYSTEM ADMINISTRATION
              <br />
              MAINTENANCE
            </h1>

            <p>
              A centralized platform for monitoring
              server resources, managing Docker services,
              controlling system users, and reviewing
              operational logs.
            </p>

          </div>


          <div className="login-feature-list">

            <div className="login-feature">
              <div>◉</div>
              <span>
                Real-time server monitoring
              </span>
            </div>

            <div className="login-feature">
              <div>◉</div>
              <span>
                Docker service management
              </span>
            </div>

            <div className="login-feature">
              <div>◉</div>
              <span>
                Role-based administration
              </span>
            </div>

          </div>

        </div>


        {/* LOGIN CARD */}

        <div className="login-panel">

          <div className="login-panel-top">

            <div className="brand-mark">
              <span>⌘</span>
            </div>

            <div>
              <strong>
                SysAdmin
              </strong>

              <span>
                Management System
              </span>
            </div>

          </div>


          <div className="login-heading">

            <span className="section-label">
              {registerMode ? "CREATE ACCOUNT" : "SECURE ACCESS"}
            </span>

            <h2>
              {registerMode ? "Join the console" : "Welcome back"}
            </h2>

            <p>
              {registerMode
                ? "Create a standard user account to access the platform."
                : "Sign in to access the administration console."}
            </p>

          </div>


          <form
            onSubmit={handleSubmit}
          >

            {registerMode && (
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Your full name"
                  required
                />
              </div>
            )}

            <div className="form-group">

              <label>
                Email Address
              </label>

              <div className="input-wrapper">

                <span className="input-icon">
                  @
                </span>

                <input
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(
                      event.target.value
                    )
                  }
                  placeholder="admin@example.com"
                  required
                />

              </div>

            </div>


            <div className="form-group">

              <label>
                Password
              </label>

              <div className="input-wrapper">

                <span className="input-icon">
                  ●
                </span>

                <input
                  type="password"
                  value={password}
                  onChange={(event) =>
                    setPassword(
                      event.target.value
                    )
                  }
                  placeholder="Enter your password"
                  minLength={registerMode ? 8 : undefined}
                  required
                />

              </div>

            </div>


            {error && (
              <div className="login-error">

                <span>!</span>

                <p>
                  {error}
                </p>

              </div>
            )}

            {success && (
              <div className="login-success">
                <p>{success}</p>
              </div>
            )}


            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >

              {loading ? (
                <>
                  <span className="button-spinner"></span>
                  Authenticating...
                </>
              ) : (
                <>
                  {registerMode ? "Create account" : "Sign in to console"}
                  <span>→</span>
                </>
              )}

            </button>

          </form>

          <button
            type="button"
            className="login-mode-toggle"
            onClick={() => {
              setRegisterMode(!registerMode);
              setError("");
              setSuccess("");
            }}
          >
            {registerMode
              ? "Already have an account? Sign in"
              : "Need an account? Register here"}
          </button>


          <div className="login-security">

            <span>▣</span>

            <div>

              <strong>
                Protected environment
              </strong>

              <p>
                Authorized users only. All
                administration actions are protected
                by role-based access control.
              </p>

            </div>

          </div>


          <div className="login-footer">
            System Administration Maintenance System
          </div>

        </div>

      </div>

    </div>
  );
}


/* ==========================================================
   ADMIN APPLICATION
========================================================== */

function AdminApplication({
  user,
  onLogout,
  onProfileUpdate,
}) {
  const [page, setPage] =
    useState("system-administration");

  const [systemAdministrationResetKey, setSystemAdministrationResetKey] =
    useState(0);

  const [system, setSystem] =
    useState(null);

  const [status, setStatus] =
    useState(null);

  const [services, setServices] =
    useState([]);

  const [users, setUsers] =
    useState([]);

  const [logs, setLogs] =
    useState([]);

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const isAdmin =
    user.role === "Administrator";

  const serverStatusLabel =
    typeof status?.status === "string" && status.status.trim()
      ? status.status.trim()
      : null;

  const serverStatusTone =
    serverStatusLabel == null
      ? "unknown"
      : serverStatusLabel === "Online" || serverStatusLabel === "Running"
        ? "healthy"
        : "error";


  useEffect(() => {
    loadDashboard();

    const interval =
      setInterval(
        loadMonitoring,
        5000
      );

    return () =>
      clearInterval(interval);
  }, []);


  async function loadDashboard() {
    try {
      const [
        systemRes,
        statusRes,
        servicesRes,
        logsRes,
      ] = await Promise.all([
        apiFetch(
          `${API_URL}/api/system`
        ),

        apiFetch(
          `${API_URL}/api/server-status`
        ),

        apiFetch(
          `${API_URL}/api/services`
        ),

        apiFetch(
          `${API_URL}/api/logs`
        ),
      ]);


      if (
        !systemRes ||
        !statusRes ||
        !servicesRes ||
        !logsRes
      ) {
        return;
      }


      const systemData =
        await readJson(
          systemRes
        );

      const statusData =
        await readJson(
          statusRes
        );

      const servicesData =
        await readJson(
          servicesRes
        );

      const logsData =
        await readJson(
          logsRes
        );


      setSystem(
        systemData
      );

      setStatus(
        statusData
      );

      setServices(
        getArrayData(
          servicesData,
          ["services"]
        )
      );

      setLogs(
        getArrayData(
          logsData,
          ["logs"]
        )
      );


      if (isAdmin) {
        await refreshUsers();
      }

    } catch (error) {
      console.error(
        "Dashboard API error:",
        error
      );
    }
  }


  async function loadMonitoring() {
    try {
      const [
        systemRes,
        statusRes,
        servicesRes,
        logsRes,
      ] = await Promise.all([
        apiFetch(
          `${API_URL}/api/system`
        ),

        apiFetch(
          `${API_URL}/api/server-status`
        ),

        apiFetch(
          `${API_URL}/api/services`
        ),

        apiFetch(
          `${API_URL}/api/logs`
        ),
      ]);


      if (
        !systemRes ||
        !statusRes ||
        !servicesRes ||
        !logsRes
      ) {
        return;
      }


      const systemData =
        await readJson(
          systemRes
        );

      const statusData =
        await readJson(
          statusRes
        );

      const servicesData =
        await readJson(
          servicesRes
        );

      const logsData =
        await readJson(
          logsRes
        );


      setSystem(
        systemData
      );

      setStatus(
        statusData
      );

      setServices(
        getArrayData(
          servicesData,
          ["services"]
        )
      );

      setLogs(
        getArrayData(
          logsData,
          ["logs"]
        )
      );

    } catch (error) {
      console.error(
        "Monitoring API error:",
        error
      );
    }
  }


  async function refreshUsers() {
    if (!isAdmin) {
      return;
    }

    try {
      const response =
        await apiFetch(
          `${API_URL}/api/users`
        );

      if (
        !response ||
        !response.ok
      ) {
        return;
      }

      const data =
        await readJson(
          response
        );

      setUsers(
        getArrayData(
          data,
          ["users"]
        )
      );

    } catch (error) {
      console.error(
        "Users API error:",
        error
      );
    }
  }


  function navigate(target) {
    if (target === "system-administration") {
      setSystemAdministrationResetKey((value) => value + 1);
    }
    setPage(target);
    setSidebarOpen(false);
  }


  function renderPage() {

    if (
      page === "users" &&
      !isAdmin
    ) {
      return (
        <AccessDenied
          title="Access Restricted"
          message="Only administrators can access user management."
        />
      );
    }


    if (
      page === "manage-topics" &&
      !isAdmin
    ) {
      return (
        <AccessDenied
          title="Access Restricted"
          message="Only administrators can manage learning topics."
        />
      );
    }


    if (page === "dashboard") {
      return (
        <Dashboard
          system={system}
          status={status}
          services={services}
          users={users}
          isAdmin={isAdmin}
          user={user}
        />
      );
    }


    if (page === "users") {
      return (
        <Users
          users={users}
          refreshUsers={
            refreshUsers
          }
        />
      );
    }


    if (page === "profile") {
      return (
        <Profile
          user={user}
          apiFetch={apiFetch}
          onProfileUpdate={onProfileUpdate}
        />
      );
    }


    if (page === "system") {
      return (
        <SystemInfo
          system={system}
          status={status}
          services={services}
        />
      );
    }


    if (page === "services") {
      return (
        <Services
          services={services}
          isAdmin={isAdmin}
          refreshServices={
            loadMonitoring
          }
        />
      );
    }


    if (page === "logs") {
      return (
        <Logs logs={logs} />
      );
    }

    if (page === "database" && !isAdmin) {
      return (
        <AccessDenied
          title="Access Restricted"
          message="Only administrators can access database management."
        />
      );
    }

    if (page === "database") {
      return (
        <DatabaseManagement apiFetch={apiFetch} />
      );
    }

    if (page === "chatbot") {
      return <LinuxTutorChat />;
    }


    if (
      page ===
      "system-administration"
    ) {
      return (
        <SystemAdministration
          apiFetch={apiFetch}
          resetKey={systemAdministrationResetKey}
        />
      );
    }

    if (page === "python") {
      return <PythonModule apiFetch={apiFetch} isAdmin={isAdmin} studentId={user.id ?? user.email ?? user.username} />;
    }


    if (
      page ===
      "manage-topics"
    ) {
      return (
        <ManageTopics
          apiFetch={apiFetch}
        />
      );
    }


    return null;
  }


  const pageTitles = {
    dashboard:
      "Dashboard",

    users:
      "User Management",

    profile:
      "My Profile",

    system:
      "System Monitoring",

    services:
      "Docker Services",

    logs:
      "System Logs",

    database:
      "Database Management",

    chatbot:
      "Linux Tutor",

    "system-administration":
      "System Administration",

    python:
      "Python",

    "manage-topics":
      "Manage Topics",
  };


  return (
    <div className={page === "system-administration"
      ? "app-shell bg-app-bg text-app-primary font-sans"
      : "app-shell app-shell--polished bg-app-bg text-app-primary font-sans"}>

      {sidebarOpen && (
        <button
          type="button"
          className="sidebar-overlay focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
          aria-label="Close navigation menu"
          onClick={() =>
            setSidebarOpen(false)
          }
        />
      )}


      {/* SIDEBAR */}

      <aside
        id="primary-navigation"
        aria-label="Primary navigation"
        className={
          sidebarOpen
            ? "sidebar open"
            : "sidebar"
        }
      >

        <div className="sidebar-brand">

          <div className="brand-mark">
            <span>⌘</span>
          </div>

          <div>

            <strong>
              SysAdmin
            </strong>

            <span>
              Management System
            </span>

          </div>

        </div>


        <div className={`sidebar-status status-${serverStatusTone}`} aria-live="polite">

          <span className="status-pulse"></span>

          <div>

            <strong>
              {serverStatusLabel || "Status unavailable"}
            </strong>

            <span>
              {serverStatusLabel ? "Server health" : "Waiting for health data"}
            </span>

          </div>

        </div>


        <div className="sidebar-section-label">
          ADMINISTRATION
        </div>

        <nav className="sidebar-nav" aria-label="Administration">

          <NavButton
            icon="▣"
            label="System Administration"
            active={
              page ===
              "system-administration"
            }
            onClick={() =>
              navigate(
                "system-administration"
              )
            }
          />

          <NavButton
            icon="⌘"
            label="Python"
            active={page === "python"}
            onClick={() => navigate("python")}
          />

          <NavButton
            icon="✦"
            label="Linux Tutor"
            active={page === "chatbot"}
            onClick={() => navigate("chatbot")}
          />

          {isAdmin && (
            <>
              <NavButton
                icon="♙"
                label="Users"
                active={
                  page === "users"
                }
                onClick={() =>
                  navigate("users")
                }
              />

              <NavButton
                icon="▤"
                label="Manage Topics"
                active={
                  page ===
                  "manage-topics"
                }
                onClick={() =>
                  navigate(
                    "manage-topics"
                  )
                }
              />
            </>
          )}

        </nav>


        <div className="sidebar-section-label">
          MONITORING
        </div>

        <nav className="sidebar-nav" aria-label="Monitoring">

          <NavButton
            icon="▦"
            label="Dashboard"
            active={
              page === "dashboard"
            }
            onClick={() =>
              navigate("dashboard")
            }
          />

          <NavButton
            icon="◫"
            label="System"
            active={
              page === "system"
            }
            onClick={() =>
              navigate("system")
            }
          />

          <NavButton
            icon="⚙"
            label="Services"
            active={
              page === "services"
            }
            onClick={() =>
              navigate("services")
            }
          />

          <NavButton
            icon="≡"
            label="Logs"
            active={
              page === "logs"
            }
            onClick={() =>
              navigate("logs")
            }
          />

          {isAdmin && (
            <NavButton
              icon="▥"
              label="Database"
              active={
                page === "database"
              }
              onClick={() =>
                navigate("database")
              }
            />
          )}

        </nav>


        <div className="sidebar-section-label">
          ACCOUNT
        </div>


        <nav className="sidebar-nav profile-nav" aria-label="Account">

          <NavButton
            icon="◎"
            label="My Profile"
            active={
              page === "profile"
            }
            onClick={() =>
              navigate("profile")
            }
          />

        </nav>


        <div className="sidebar-account">

          <div className="account-avatar">
            {user.profile_picture ? (
              <img
                src={user.profile_picture}
                alt=""
              />
            ) : (
              isAdmin ? "A" : "U"
            )}
          </div>

          <div className="account-details">

            <strong>
              {user.name}
            </strong>

            <span>
              {user.role}
            </span>

          </div>

        </div>


        <div className="sidebar-bottom">

          <button
            className="logout-button"
            onClick={onLogout}
          >
            <span>↪</span>
            Sign Out
          </button>

          <div className="sidebar-version">
            SYSADMIN v1.0
          </div>

        </div>

      </aside>


      {/* MAIN */}

      <main className="main-area">

        <header className="topbar">

          <div className="topbar-left">

            <button
              type="button"
              className="mobile-menu-button"
              aria-label="Open navigation menu"
              aria-expanded={sidebarOpen}
              aria-controls="primary-navigation"
              onClick={() =>
                setSidebarOpen(true)
              }
            >
              ☰
            </button>

            <div>

              <div className="breadcrumb">
                {page === "python" ? "Learning Modules" : "System Administration"}
                <span>/</span>
                {pageTitles[page]}
              </div>

              <h1>
                {pageTitles[page]}
              </h1>

            </div>

          </div>


          <div className="topbar-right">

            <div className={`topbar-server status-${serverStatusTone}`} role="status" aria-live="polite">

              <span className="online-dot"></span>

              <div>

                <strong>
                  {serverStatusLabel || "Status unavailable"}
                </strong>

                <span>
                  {serverStatusLabel ? "Server health" : "Health data unavailable"}
                </span>

              </div>

            </div>


            <div className="topbar-user">

              <div className="topbar-avatar">
                {user.profile_picture ? (
                  <img
                    src={user.profile_picture}
                    alt=""
                  />
                ) : (
                  isAdmin ? "A" : "U"
                )}
              </div>

              <div>

                <strong>
                  {user.name}
                </strong>

                <span>
                  {user.role}
                </span>

              </div>

            </div>

          </div>

        </header>


        <div className="content-area bg-app-bg text-app-primary font-sans">
          {renderPage()}
        </div>

      </main>

    </div>
  );
}


/* ==========================================================
   NAV BUTTON
========================================================== */

function NavButton({
  icon,
  label,
  active,
  onClick,
}) {
  return (
    <button
      className={
        active
          ? "nav-button active"
          : "nav-button"
      }
      aria-current={active ? "page" : undefined}
      onClick={onClick}
    >

      <span className="nav-icon">
        {icon}
      </span>

      <span>
        {label}
      </span>

      {active && (
        <span className="nav-active-line"></span>
      )}

    </button>
  );
}


/* ==========================================================
   SYSTEM ADMINISTRATION LEARNING
========================================================== */

function getSubtopicPreview(
  content
) {
  if (!content) {
    return "No lecture description available.";
  }

  const plainText =
    String(content)
      .replace(
        /<[^>]*>/g,
        ""
      )
      .replace(
        /\s+/g,
        " "
      )
      .trim();

  if (
    plainText.length <= 150
  ) {
    return plainText;
  }

  return `${plainText.substring(
    0,
    150
  )}...`;
}

function TopicIllustration({ kind }) {
  if (kind === "architecture") {
    return (
      <svg viewBox="0 0 360 170" role="img" aria-label="Operating system architecture">
        <rect x="20" y="16" width="320" height="28" rx="8" fill="#dbeafe" />
        <rect x="54" y="58" width="252" height="28" rx="8" fill="#bfdbfe" />
        <rect x="87" y="100" width="186" height="28" rx="8" fill="#93c5fd" />
        <rect x="120" y="142" width="120" height="18" rx="6" fill="#2563eb" />
        <text x="180" y="35" textAnchor="middle" fill="#1e3a8a">Users</text>
        <text x="180" y="77" textAnchor="middle" fill="#1e3a8a">Applications</text>
        <text x="180" y="119" textAnchor="middle" fill="#1e3a8a">Operating System</text>
        <text x="180" y="155" textAnchor="middle" fill="white" fontSize="11">Kernel</text>
        <path d="M180 45v11M180 87v11M180 129v11" stroke="#0f766e" strokeWidth="2" />
      </svg>
    );
  }

  if (kind === "terminal") {
    return (
      <svg viewBox="0 0 360 170" role="img" aria-label="Linux terminal">
        <rect x="18" y="18" width="324" height="134" rx="12" fill="#0f172a" />
        <rect x="18" y="18" width="324" height="27" rx="12" fill="#1e293b" />
        <circle cx="38" cy="31" r="4" fill="#fb7185" /><circle cx="52" cy="31" r="4" fill="#fbbf24" /><circle cx="66" cy="31" r="4" fill="#34d399" />
        <text x="36" y="70" fill="#67e8f9" fontSize="12">$ sudo apt update</text>
        <text x="36" y="94" fill="#a7f3d0" fontSize="12">✓ package lists updated</text>
        <text x="36" y="122" fill="#67e8f9" fontSize="12">$ systemctl status ssh</text>
        <rect x="36" y="132" width="7" height="2" fill="#f8fafc" />
      </svg>
    );
  }

  if (kind === "security") {
    return (
      <svg viewBox="0 0 360 170" role="img" aria-label="Cybersecurity shield and network">
        <path d="M180 18l72 28v39c0 39-27 62-72 78-45-16-72-39-72-78V46z" fill="#ede9fe" stroke="#7c3aed" strokeWidth="4" />
        <path d="M180 52v55M153 80h54" stroke="#7c3aed" strokeWidth="9" strokeLinecap="round" />
        <circle cx="55" cy="48" r="14" fill="#bfdbfe" /><circle cx="305" cy="48" r="14" fill="#bfdbfe" />
        <circle cx="55" cy="126" r="14" fill="#bfdbfe" /><circle cx="305" cy="126" r="14" fill="#bfdbfe" />
        <path d="M69 52l42 20M291 52l-42 20M69 122l42-20M291 122l-42-20" stroke="#94a3b8" strokeWidth="3" />
        <text x="180" y="158" textAnchor="middle" fill="#6d28d9" fontSize="11">protect • monitor • recover</text>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 360 170" role="img" aria-label="Cloud containers and automation">
      <path d="M76 108h208c20 0 34-12 34-28 0-17-15-30-34-30-6-22-26-36-50-36-24 0-44 14-51 35-7-4-15-6-24-6-25 0-45 15-48 36-20 2-35 14-35 30 0 15 14 27 32 27z" fill="#e0f2fe" stroke="#0284c7" strokeWidth="3" />
      <rect x="112" y="79" width="42" height="31" rx="5" fill="#2563eb" /><rect x="160" y="79" width="42" height="31" rx="5" fill="#0f766e" /><rect x="208" y="79" width="42" height="31" rx="5" fill="#7c3aed" />
      <path d="M133 110v20M181 110v20M229 110v20M105 130h152" stroke="#64748b" strokeWidth="3" />
      <text x="180" y="154" textAnchor="middle" fill="#0369a1" fontSize="11">cloud • containers • automation</text>
    </svg>
  );
}

function TopicVisualGallery() {
  const visuals = [
    ["architecture", "Operating system layers", "Users and applications communicate with hardware through the OS and kernel."],
    ["terminal", "Linux administration", "Commands help administrators update packages and inspect services."],
    ["security", "Cybersecurity controls", "Layered controls protect confidentiality, integrity, and availability."],
    ["cloud", "Modern infrastructure", "Cloud platforms, containers, and automation power current IT environments."],
  ];

  return (
    <section className="topic-visual-gallery" aria-label="Topic illustrations">
      {visuals.map(([kind, title, description]) => (
        <article className="topic-visual-card" key={kind}>
          <div className="topic-illustration">
            <TopicIllustration kind={kind} />
          </div>
          <h3>{title}</h3>
          <p>{description}</p>
        </article>
      ))}
    </section>
  );
}

function OperatingSystemsContent() {
  const osTypes = [
    ["Desktop", "Windows, Ubuntu, macOS", "GUI, applications, multimedia, and productivity."],
    ["Server", "Ubuntu Server, RHEL, Debian, Windows Server", "Web hosting, databases, file sharing, and remote access."],
    ["Mobile", "Android, iOS", "Touch interfaces, battery efficiency, wireless communication, and apps."],
    ["Embedded", "Routers, smart TVs, IoT devices", "Purpose-built systems that are lightweight and customizable."],
  ];

  return (
    <div className="topic-learning-scroll">
      <section className="topic-intro-panel">
        <div className="topic-intro-icon">02</div>
        <div>
          <span className="section-label">OPERATING SYSTEMS</span>
          <h2>What is an Operating System?</h2>
          <p>
            An operating system is the fundamental software that manages
            computer hardware and software resources. It provides the
            interface between users, applications, and hardware.
          </p>
        </div>
      </section>

      <TopicVisualGallery />

      <InteractiveExample
        title="What happens when an application starts?"
        scenario="Use a text editor as the example application."
        steps={[
          "The operating system loads the program and creates a process.",
          "It allocates memory, schedules CPU time, and provides device access.",
          "The application uses files and displays its interface through the OS.",
        ]}
        result="The OS is the controlled bridge between the application, hardware, files, devices, and users."
        visual={<div className="interactive-example__flow"><span>Program</span><b>→</b><span>Process</span><b>→</b><span>Memory</span><b>→</b><span>Screen</span></div>}
      />

      <TopicContentSection number="01" title="The Main Role of an Operating System" tone="blue">
        <p>
          The OS acts as a manager and coordinator of computer resources. It
          gives applications a controlled environment so they can run without
          directly managing every hardware component.
        </p>
        <pre className="topic-code-block">{`User
  |
Applications
  |
Operating System
  |
Hardware`}</pre>
        <p>
          When a browser opens, the OS loads it into memory, assigns CPU
          resources, provides network access, manages keyboard and mouse input,
          and displays the result on screen.
        </p>
      </TopicContentSection>

      <TopicContentSection number="02" title="Major Components" tone="cyan">
        <div className="topic-detail-grid">
          <TopicDetail title="Kernel">
            The core component that manages CPU scheduling, memory, devices,
            filesystems, networking, and security. Linux uses the Linux kernel.
          </TopicDetail>
          <TopicDetail title="Graphical User Interface (GUI)">
            Visual windows, icons, buttons, menus, and pointers. Examples
            include Windows Desktop, GNOME, and KDE Plasma.
          </TopicDetail>
          <TopicDetail title="Command-Line Interface (CLI)">
            A text-based interface used heavily by Linux administrators because
            it is fast, powerful, scriptable, and suitable for remote access.
            <div className="topic-command-row"><code>ls</code><code>ps</code><code>systemctl status</code></div>
          </TopicDetail>
        </div>
      </TopicContentSection>

      <TopicContentSection number="03" title="CPU and Process Management" tone="teal">
        <p>
          The CPU executes program instructions, but many programs may run at
          once. The operating system uses process scheduling to decide which
          process runs, when it runs, how long it runs, and which CPU core it
          uses.
        </p>
        <div className="topic-detail-grid">
          <TopicDetail title="Processes">
            A process is a program currently running. The OS manages its
            creation, execution, scheduling, communication, and termination.
            <div className="topic-command-row"><code>ps</code><code>top</code><code>htop</code></div>
          </TopicDetail>
          <TopicDetail title="Multitasking">
            Multiple programs appear to run simultaneously as the OS rapidly
            switches CPU attention between processes. Multi-core systems can
            execute processes on different cores at the same time.
          </TopicDetail>
        </div>
        <pre className="topic-code-block">{`CPU
├── Core 1
├── Core 2
├── Core 3
└── Core 4`}</pre>
      </TopicContentSection>

      <TopicContentSection number="04" title="Memory Management" tone="indigo">
        <p>
          The operating system allocates and releases RAM, protects one
          application from another, and manages virtual memory.
        </p>
        <pre className="topic-code-block">{`RAM
├── Operating System
├── Web Browser
├── Text Editor
├── Background Services
└── Other Applications`}</pre>
        <p>
          Virtual memory gives programs independent memory addresses. When RAM
          is limited, Linux can use swap partitions or swap files, but storage
          is slower than RAM and excessive swap can reduce performance.
        </p>
      </TopicContentSection>

      <TopicContentSection number="05" title="File Systems and Storage" tone="blue">
        <p>
          A file system organizes files, directories, metadata, and
          permissions. Linux examples include ext4, Btrfs, XFS, and ZFS.
          Windows commonly uses NTFS and exFAT.
        </p>
        <div className="topic-command-row">
          <code>touch document.txt</code><code>mkdir project</code>
        </div>
        <p>
          These interfaces let users create, read, modify, and delete data
          while the OS manages where it is stored on physical disks.
        </p>
      </TopicContentSection>

      <TopicContentSection number="06" title="Device Management" tone="cyan">
        <p>
          Keyboards, mice, monitors, printers, storage drives, network
          adapters, graphics cards, and USB devices are managed through device
          drivers.
        </p>
        <pre className="topic-code-block">{`Application
      |
Operating System
      |
Device Driver
      |
Hardware Device`}</pre>
        <p>
          A device driver allows the operating system to communicate with a
          particular hardware device and its manufacturer-specific interface.
        </p>
      </TopicContentSection>

      <TopicContentSection number="07" title="Security and User Management" tone="purple">
        <div className="topic-detail-grid">
          <TopicDetail title="Operating system security">
            User accounts, passwords, permissions, authentication,
            authorization, encryption, and firewalls protect users and data.
            Linux also supports SELinux, AppArmor, LSM, and access controls.
          </TopicDetail>
          <TopicDetail title="Linux permissions">
            Linux permissions are based on user, group, and others.
            <div className="topic-command-row"><code>rwxr-xr-x</code></div>
          </TopicDetail>
          <TopicDetail title="User identities">
            Users have a UID (User ID), while groups have a GID (Group ID).
            These identifiers control access to files and resources.
          </TopicDetail>
          <TopicDetail title="Authentication and authorization">
            Authentication verifies who a user is. Authorization determines
            what that authenticated user is allowed to do.
          </TopicDetail>
        </div>
      </TopicContentSection>

      <TopicContentSection number="08" title="Networking and Applications" tone="teal">
        <p>
          Operating systems provide IP addressing, DNS, routing, TCP/IP
          communication, and network interface management. When visiting a
          website, the OS connects the application to the network hardware.
        </p>
        <pre className="topic-code-block">{`Computer
   |
Network
   |
Internet
   |
Web Server`}</pre>
        <p>
          Applications rely on the OS for program execution, memory
          allocation, file access, network access, and device access. This
          improves security, stability, and hardware compatibility.
        </p>
      </TopicContentSection>

      <TopicContentSection number="09" title="Types of Operating Systems" tone="slate">
        <div className="topic-area-grid">
          {osTypes.map(([title, examples, description]) => (
            <article className="topic-area-card" key={title}>
              <span className="topic-area-icon">◈</span>
              <h3>{title} operating systems</h3>
              <p><strong>{examples}</strong></p>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </TopicContentSection>

      <TopicContentSection number="10" title="Virtualization and Containers" tone="indigo">
        <div className="topic-detail-grid">
          <TopicDetail title="Virtual machines">
            A hypervisor allows multiple operating systems to run on the same
            physical hardware. Examples include VirtualBox, VMware, KVM, and
            Hyper-V.
            <pre className="topic-mini-code">{`Physical Hardware
        |
     Hypervisor
   ┌────┼────┐
 Ubuntu  Windows  Linux`}</pre>
          </TopicDetail>
          <TopicDetail title="Containers">
            Containers package applications, libraries, and dependencies.
            Docker, Podman, and Kubernetes are popular technologies. Containers
            generally share the host operating system kernel.
            <pre className="topic-mini-code">{`Hardware
    |
Operating System
    |
Container Engine
    |
Containers`}</pre>
          </TopicDetail>
        </div>
      </TopicContentSection>

      <TopicContentSection number="11" title="Cloud Computing and Updates" tone="blue">
        <p>
          Cloud providers create virtual servers, networks, and storage on
          demand. Linux remains widely used in cloud infrastructure, but cloud
          servers still require security, updates, user management, networking,
          and monitoring.
        </p>
        <div className="topic-detail-grid">
          <TopicDetail title="Safe update practice">
            Test updates, use staging, deploy carefully, monitor results, and
            maintain a rollback plan.
          </TopicDetail>
          <TopicDetail title="Ubuntu example">
            <div className="topic-command-row"><code>sudo apt update</code><code>sudo apt upgrade</code></div>
            Package managers make regular maintenance easier for Linux systems.
          </TopicDetail>
        </div>
      </TopicContentSection>

      <TopicContentSection number="12" title="Modern Trends and Future Relevance" tone="orange">
        <div className="topic-detail-grid">
          <TopicDetail title="Cloud-native systems">Containers, Kubernetes, microservices, and automated infrastructure.</TopicDetail>
          <TopicDetail title="Artificial intelligence">GPU workloads, machine learning frameworks, large-scale computing, and AI servers.</TopicDetail>
          <TopicDetail title="Edge computing">Lightweight, secure, and efficient systems run closer to users and devices.</TopicDetail>
          <TopicDetail title="AI-assisted administration">Log analysis, troubleshooting, performance monitoring, automation, and security analysis, with human validation.</TopicDetail>
        </div>
      </TopicContentSection>

      <TopicContentSection number="13" title="The Complete Operating-System Architecture" tone="blue">
        <p>
          An operating system coordinates several layers at the same time.
          Applications request services through system calls and libraries.
          The kernel schedules CPU time, manages memory, communicates with
          drivers, organizes files, and enforces security. Hardware performs
          the physical work, while users interact through a GUI or CLI.
        </p>
        <pre className="topic-code-block">{`User
  |
GUI or Command-Line Interface
  |
Applications and Libraries
  |
System Calls
  |
Kernel
  |
Drivers and Hardware`}</pre>
        <p>
          This layered design means an application does not need a separate
          implementation for every keyboard, disk, network adapter, or CPU.
          It uses the operating system's standard interfaces, which improves
          portability, stability, security, and hardware compatibility.
        </p>
      </TopicContentSection>

      <TopicContentSection number="14" title="What Happens When an Application Runs?" tone="cyan">
        <p>
          Starting an application involves several coordinated operations. The
          OS locates the program on storage, creates a process, assigns an
          address space, loads program instructions and libraries into memory,
          schedules CPU time, and applies the user's permissions.
        </p>
        <div className="topic-detail-grid">
          <TopicDetail title="Program loading">
            The executable and required libraries are read from storage into
            memory. The operating system prepares the process before its first
            instruction runs.
          </TopicDetail>
          <TopicDetail title="Resource access">
            The application requests files, devices, network connections, or
            additional memory through operating-system interfaces rather than
            controlling hardware directly.
          </TopicDetail>
          <TopicDetail title="Protection">
            The process receives a protected memory area and the permissions
            associated with its user. A normal application should not be able
            to modify kernel memory or another user's private data.
          </TopicDetail>
          <TopicDetail title="Completion">
            When the program exits, the OS records its result, closes files,
            releases memory, and makes resources available to other processes.
          </TopicDetail>
        </div>
      </TopicContentSection>

      <TopicContentSection number="15" title="Memory Protection and Virtual Memory" tone="indigo">
        <p>
          Each process normally sees its own virtual address space. The
          operating system and hardware memory-management unit translate those
          virtual addresses into physical RAM locations. This prevents one
          application from casually reading or overwriting another
          application's memory.
        </p>
        <div className="topic-detail-grid">
          <TopicDetail title="RAM">
            RAM is fast working memory used for the operating system, active
            programs, caches, and current data. It is volatile, so its contents
            do not survive a power loss.
          </TopicDetail>
          <TopicDetail title="Virtual memory">
            Virtual memory allows programs to use independent addresses and
            gives the OS flexibility to move less-active pages out of RAM.
          </TopicDetail>
          <TopicDetail title="Swap">
            Linux can use a swap partition or swap file when RAM is limited.
            Swap provides capacity but is much slower than RAM, so heavy swap
            use can reduce responsiveness.
          </TopicDetail>
          <TopicDetail title="Memory failure">
            A faulty or excessive application can consume memory, causing
            swapping, slow performance, or an out-of-memory response. Logs and
            monitoring help identify the responsible process.
          </TopicDetail>
        </div>
      </TopicContentSection>

      <TopicContentSection number="16" title="Filesystems, Permissions, and Devices" tone="teal">
        <p>
          A filesystem defines how files, directories, metadata, and free space
          are organized on storage. The OS provides a consistent path-based
          interface even when the underlying device is a local disk, removable
          drive, network share, or virtual volume.
        </p>
        <div className="topic-detail-grid">
          <TopicDetail title="Filesystem responsibilities">
            The OS tracks names, locations, sizes, timestamps, ownership,
            permissions, free blocks, and recovery information.
          </TopicDetail>
          <TopicDetail title="Linux examples">
            ext4 is widely used for general Linux systems. Btrfs provides
            advanced features, XFS is common for large filesystems, and ZFS is
            known for storage management and data integrity features.
          </TopicDetail>
          <TopicDetail title="Windows examples">
            NTFS provides permissions, journaling, and large-volume support.
            exFAT is commonly used for removable storage compatibility.
          </TopicDetail>
          <TopicDetail title="Device drivers">
            Drivers translate the OS's standard requests into hardware-specific
            operations for keyboards, monitors, disks, printers, network
            adapters, graphics cards, and USB devices.
          </TopicDetail>
        </div>
      </TopicContentSection>

      <TopicContentSection number="17" title="Networking Inside the Operating System" tone="purple">
        <p>
          Networking support is built into the operating system. Network
          interfaces send and receive frames, the TCP/IP stack moves packets,
          routing selects a path, DNS resolves names, and applications use
          sockets to communicate with remote services.
        </p>
        <pre className="topic-code-block">{`Application
     |
Socket interface
     |
TCP / UDP
     |
IP routing
     |
Network driver and adapter
     |
Network`}</pre>
        <p>
          When a user visits a website, the browser asks DNS for an address,
          opens a connection, sends requests through the network stack, and
          receives data that the OS passes back to the application. Firewalls
          and permissions can allow or deny each stage.
        </p>
      </TopicContentSection>

      <TopicContentSection number="18" title="Security Controls in an Operating System" tone="red">
        <p>
          Operating-system security combines identity, permissions, isolation,
          encryption, updates, and monitoring. No single control is enough:
          a strong password does not protect an unpatched service, and an
          updated system is still exposed if every user has administrator
          access.
        </p>
        <div className="topic-detail-grid">
          <TopicDetail title="Authentication">Proves who a user is using passwords, SSH keys, certificates, security keys, or biometrics.</TopicDetail>
          <TopicDetail title="Authorization">Determines which files, processes, devices, and administrative actions an authenticated identity may use.</TopicDetail>
          <TopicDetail title="Isolation">Separates users, processes, virtual machines, containers, and kernel operations to reduce the effect of failures or attacks.</TopicDetail>
          <TopicDetail title="Updates and patching">Fixes vulnerabilities, bugs, and compatibility issues. Production updates should be tested and monitored.</TopicDetail>
          <TopicDetail title="Linux security technologies">SELinux, AppArmor, Linux Security Modules, firewall systems, and file permissions add policy and access control.</TopicDetail>
          <TopicDetail title="Audit and monitoring">Logs record authentication, service, process, and security events so administrators can investigate and respond.</TopicDetail>
        </div>
      </TopicContentSection>

      <TopicContentSection number="19" title="Virtual Machines, Containers, and Cloud" tone="blue">
        <p>
          Virtualization abstracts physical hardware so multiple operating
          systems can share one machine. A hypervisor allocates CPU, memory,
          storage, and virtual network devices to each virtual machine.
        </p>
        <pre className="topic-code-block">{`Physical Hardware
        |
     Hypervisor
   ┌────┼─────┐
 Ubuntu VM  Windows VM  Linux VM`}</pre>
        <p>
          Containers use a different model. They package an application and
          its libraries while sharing the host kernel. Namespaces provide
          isolation and control groups limit resource use.
        </p>
        <pre className="topic-code-block">{`Cloud infrastructure
        |
Virtual machines and networks
        |
Container engine
        |
Applications and microservices`}</pre>
        <p>
          Cloud servers are still operating systems that require user
          management, updates, network configuration, storage planning,
          monitoring, backups, and security. Cloud changes where infrastructure
          is hosted, not the need to understand how systems operate.
        </p>
      </TopicContentSection>

      <TopicContentSection number="20" title="Operating-System Maintenance and Troubleshooting" tone="orange">
        <p>
          Administrators troubleshoot by collecting evidence rather than
          guessing. They define the symptom, identify when it started, check
          recent changes, inspect CPU, memory, disk, network, processes, and
          logs, test one hypothesis at a time, and verify the repair.
        </p>
        <div className="topic-detail-grid">
          <TopicDetail title="Slow system">
            Check CPU load, memory pressure, swap, disk latency, running
            processes, and network activity. A slow system may be caused by a
            single process, failing storage, insufficient capacity, or a
            remote dependency.
          </TopicDetail>
          <TopicDetail title="Service failure">
            Check whether the service is running, inspect its configuration
            and dependencies, review logs, verify ports and permissions, and
            restart only after understanding the failure.
          </TopicDetail>
          <TopicDetail title="Network failure">
            Check the interface, address, route, DNS resolution, firewall,
            service port, and remote endpoint in that order.
          </TopicDetail>
          <TopicDetail title="Update failure">
            Read package-manager output, check dependencies and available disk
            space, test in staging, preserve a rollback path, and monitor the
            system after deployment.
          </TopicDetail>
        </div>
      </TopicContentSection>

      <section className="topic-takeaways">
        <span className="section-label">KEY TAKEAWAYS</span>
        <h2>Operating systems are the foundation of IT</h2>
        <p>
          Understanding operating systems is essential for Linux
          administration, networking, cloud computing, cybersecurity, software
          development, and careers in IT support, infrastructure, DevOps, and
          engineering.
        </p>
      </section>
    </div>
  );
}

function ProcessManagementSchedulingContent() {
  const sections = [
    ["01", "What Is a Process?", "A process is an instance of a program currently being executed. A program stored on disk becomes a process when a user or service starts it.", "python3 app.py"],
    ["02", "Program vs. Process", "A program is passive instructions stored on disk. A process is active, uses CPU and memory, owns resources, and has a lifecycle.", "ps aux"],
    ["03", "Process Control Block (PCB)", "The kernel maintains process information such as PID, state, CPU registers, memory information, priority, scheduling information, and open files.", "PID + state + priority + memory + resources"],
    ["04", "Process ID (PID)", "Every process has a unique process identifier. Administrators use PIDs to inspect, monitor, signal, and troubleshoot processes.", "ps -ef"],
    ["05", "Parent and Child Processes", "A process can create another process. The creator is the parent and the newly created process is the child, forming a process hierarchy.", "pstree"],
    ["06", "PID 1 and System Initialization", "The first userspace process is traditionally PID 1. On many modern Linux distributions, systemd starts and manages system services and processes.", "ps -p 1 -f"],
    ["07", "Process States", "Processes move through a lifecycle such as new, ready, running, waiting, ready again, and terminated.", "new → ready → running → waiting → terminated"],
    ["08", "Common Linux Process States", "Linux tools commonly show R for running or runnable, S for interruptible sleep, D for uninterruptible sleep, T for stopped, and Z for zombie.", "ps -eo pid,stat,comm"],
    ["09", "Running State", "A running process is executing or ready to execute on a CPU. The scheduler decides which runnable task receives CPU time next.", "top"],
    ["10", "Waiting and Sleeping", "Processes may wait for disk I/O, network data, user input, or another process. Sleeping tasks normally consume little or no CPU while waiting.", "ps -eo state,pid,comm"],
    ["11", "Zombie Processes", "A zombie has finished execution but remains in the process table because its parent has not collected its exit status. Excessive zombies can indicate a parent-process problem.", "ps aux | grep ' Z'"],
    ["12", "Orphan Processes", "An orphan continues after its parent terminates. Linux re-parents it to an appropriate process-management parent so it can still be handled.", "pstree -p"],
    ["13", "Viewing Processes with ps", "ps displays a process snapshot. ps, ps aux, and ps -ef provide different views useful for administration and troubleshooting.", "ps aux"],
    ["14", "Understanding ps aux", "Important columns include USER, PID, %CPU, %MEM, STAT, and COMMAND. These identify ownership, resource use, state, and the executed command.", "ps aux --sort=-%cpu"],
    ["15", "Process Monitoring with top", "top provides real-time CPU, memory, load, and process information. It helps locate resource-heavy or stuck processes.", "top"],
    ["16", "htop", "htop is an interactive monitor with navigation, process-tree views, CPU and memory visualization, and convenient process management.", "htop"],
    ["17", "Process Trees", "pstree displays parent-child relationships such as systemd starting sshd, shells, nginx, Docker, and container processes.", "pstree -p"],
    ["18", "Background Processes", "Appending & starts a command in the background so the shell can continue accepting commands.", "python3 app.py &"],
    ["19", "Foreground Processes", "A foreground process occupies the terminal until it exits or is interrupted. Ctrl+C commonly sends an interrupt.", "python3 app.py"],
    ["20", "Job Control", "Shell job control manages commands started from a terminal. jobs lists background jobs.", "jobs"],
    ["21", "Suspending Processes", "Ctrl+Z suspends a foreground process and places it in a stopped state so it can later be resumed.", "Ctrl+Z"],
    ["22", "bg and fg", "bg resumes a stopped job in the background. fg brings a job back to the foreground, for example fg %1.", "bg; fg %1"],
    ["23", "Process Signals", "Signals communicate events to processes, including interruption, termination, stopping, continuing, and configuration reload requests.", "kill -l"],
    ["24", "Common Linux Signals", "SIGTERM requests termination, SIGKILL forces termination, SIGINT interrupts, SIGHUP can request reload behavior, SIGSTOP stops, and SIGCONT continues.", "kill -TERM PID"],
    ["25", "The kill Command", "kill sends a selected signal to a PID. Verify the target before sending a signal.", "kill 1234"],
    ["26", "SIGTERM", "SIGTERM requests graceful termination and gives an application an opportunity to close files, save data, and release resources.", "kill -TERM 1234"],
    ["27", "SIGKILL", "SIGKILL immediately forces termination and cannot be handled by the process. Prefer SIGTERM first because SIGKILL can leave incomplete work.", "kill -9 1234"],
    ["28", "pkill and killall", "These commands target processes by name. Administrators should verify the name because multiple processes may match.", "pkill firefox"],
    ["29", "CPU Scheduling", "The CPU scheduler decides which waiting process should use the CPU next so many programs can share processor resources.", "processes → scheduler → CPU"],
    ["30", "Scheduling Goals", "Schedulers balance responsiveness, fairness, throughput, low latency, and efficient CPU utilization. Desktop, server, and real-time workloads have different goals.", "response + fairness + throughput"],
    ["31", "Context Switching", "A context switch saves one task's CPU state and loads another task's state. Switching enables multitasking but creates overhead when excessive.", "save A → load B"],
    ["32", "Scheduling Algorithms", "Historical approaches include First-Come First-Served, Shortest Job First, Round Robin, and Priority Scheduling. Modern kernels use more advanced mechanisms.", "Round Robin: time slices"],
    ["33", "Linux Scheduling", "Linux provides scheduling policies for normal, real-time, and deadline-sensitive workloads. Behavior depends on kernel version and workload.", "chrt -p PID"],
    ["34", "CFS and Modern Linux Scheduling", "The Completely Fair Scheduler was a major normal-task scheduler for many years. Linux scheduling continues to evolve, so administrators should consider the current kernel.", "cat /proc/schedstat"],
    ["35", "Process Priority and Nice", "Nice values influence normal-process scheduling priority. Values commonly range from -20 for higher priority to 19 for lower priority, with 0 as the default.", "nice -n 10 command"],
    ["36", "The nice Command", "Start a process with a modified nice value. Lower-priority background work can reduce its competition with important services.", "nice -n 10 python3 program.py"],
    ["37", "The renice Command", "renice changes the nice value of an existing process. Priority changes should be used carefully on production systems.", "renice 10 -p 1234"],
    ["38", "Real-Time Processes", "Industrial systems, robotics, audio, and specialized infrastructure may need predictable timing. Incorrect real-time settings can reduce system responsiveness.", "chrt -p PID"],
    ["39", "CPU Affinity", "CPU affinity restricts a process to selected CPU cores. taskset can be useful for specialized or latency-sensitive workloads.", "taskset -cp 0,1 PID"],
    ["40", "Multi-Core Processing", "Schedulers distribute tasks across multiple cores, allowing several processes to execute simultaneously.", "lscpu"],
    ["41", "Threads", "A process can contain multiple threads. Threads are units of execution that share resources belonging to their process.", "ps -eLf"],
    ["42", "Process vs. Thread", "Processes are more isolated and usually have separate memory spaces. Threads are lighter-weight execution units that share process resources.", "process → thread 1 + thread 2"],
    ["43", "Multithreading", "Applications may use separate threads for user interfaces, network processing, rendering, and background work to improve responsiveness.", "threaded application"],
    ["44", "Inter-Process Communication", "IPC lets processes exchange information through pipes, named pipes, signals, sockets, shared memory, and message queues.", "IPC: pipe | socket | shared memory"],
    ["45", "Pipes", "A pipe sends the output of one command to the input of another, a powerful pattern in Linux shells.", "ls | grep '.txt'"],
    ["46", "Named Pipes", "Named pipes, or FIFOs, are filesystem objects that allow processes to communicate beyond a single temporary shell pipeline.", "mkfifo events.pipe"],
    ["47", "Sockets", "Sockets support local or network communication and are fundamental to client-server applications.", "ss -x -t"],
    ["48", "Shared Memory", "Shared memory lets processes access a common memory region quickly, but synchronization is required to protect shared data.", "ipcs -m"],
    ["49", "Process Synchronization", "When processes or threads access shared resources, synchronization coordinates access and prevents inconsistent updates.", "lock → update → unlock"],
    ["50", "Race Conditions", "A race condition occurs when concurrent tasks access shared data in an unsafe order. Locks and other synchronization mechanisms help coordinate access.", "shared data + concurrent writers"],
    ["51", "Deadlocks", "A deadlock occurs when processes wait indefinitely for resources held by each other. Prevention and avoidance are important operating-system concepts.", "A waits for B; B waits for A"],
    ["52", "Services and Daemons", "A daemon is a background process providing a service such as SSH, web hosting, or database access.", "client → network → daemon"],
    ["53", "systemd and Services", "systemd manages services with status, start, stop, restart, and enable operations.", "systemctl status ssh"],
    ["54", "Service Units", "systemd manages service, socket, mount, timer, and target units. A service is commonly represented as service-name.service.", "systemctl list-units"],
    ["55", "Scheduling Tasks with cron", "cron schedules recurring tasks, and crontab manages a user's scheduled jobs. It is common for backups, cleanup, maintenance, and scripts.", "crontab -e"],
    ["56", "Cron Example", "A schedule such as 0 2 * * * /home/user/backup.sh runs a recurring backup at a specified time.", "0 2 * * * /home/user/backup.sh"],
    ["57", "Understanding Cron Fields", "Traditional cron fields are minute, hour, day of month, month, and weekday.", "minute hour day month weekday"],
    ["58", "systemd Timers", "systemd timers schedule service units, integrate with system logging, and are increasingly used in modern Linux environments.", "systemctl list-timers"],
    ["59", "The at Command", "at schedules a command to run once in the future, unlike cron, which commonly runs recurring jobs.", "echo command | at 02:00"],
    ["60", "Process Resource Limits", "Linux can restrict CPU, memory, open files, and process counts to protect systems from excessive resource consumption.", "ulimit -a"],
    ["61", "ulimit", "ulimit displays or configures shell resource limits. Limits should be chosen according to application requirements.", "ulimit -a"],
    ["62", "Control Groups (cgroups)", "cgroups control CPU, memory, I/O, and process resources for groups of processes.", "systemd-cgls"],
    ["63", "cgroups and Containers", "Containers commonly use cgroups so one container cannot consume all available CPU or memory.", "docker stats"],
    ["64", "Namespaces", "Namespaces isolate process IDs, networks, mount points, and users. They are a foundational Linux feature behind containers.", "lsns"],
    ["65", "Containers and Process Management", "Containers combine namespaces, cgroups, and security controls. Container processes remain Linux processes managed by the host kernel.", "namespaces + cgroups + controls"],
    ["66", "Monitoring System Load", "Use uptime and top to inspect load, but interpret load averages together with CPU utilization, I/O activity, CPU count, and process states.", "uptime"],
    ["67", "Modern Process Monitoring", "Modern infrastructure collects CPU, memory, process count, application performance, and service availability metrics across servers, containers, and databases.", "metrics + logs + service health"],
    ["68", "Process Management and Docker", "Docker containers run one or more processes. The Docker host kernel still schedules and manages those processes.", "docker top container_name"],
    ["69", "Process Management and Kubernetes", "Kubernetes manages pods, containers, and their processes. Resource requests and limits support scalability, performance, and availability.", "kubectl top pods"],
    ["70", "Modern Scheduling and Cloud Computing", "Cloud platforms schedule virtual machines, containers, CPU, and memory across available infrastructure.", "workload → scheduler → infrastructure"],
    ["71", "Process Security", "Monitor unknown processes, high CPU usage, suspicious activity, unexpected network connections, and unauthorized privilege escalation.", "ps aux; top; pstree"],
    ["72", "Process Isolation and Security", "User privileges, memory protection, SELinux, AppArmor, namespaces, cgroups, and containers reduce the impact of compromised processes.", "application → isolation → limited access"],
    ["73", "Troubleshooting High CPU Usage", "Find the process, investigate the cause, optimize or restart it when appropriate, and continue monitoring. Do not terminate critical processes without understanding them.", "top → ps aux → investigate → monitor"],
    ["74", "Troubleshooting Memory Problems", "Applications, databases, memory leaks, and excessive processes can cause high memory use. Check free, top, and process details before stopping work.", "free -h; top"],
    ["75", "Best Practices and Future Relevance", "Monitor processes, avoid unnecessary services, schedule carefully, use resource limits, prefer SIGTERM before SIGKILL, monitor CPU/memory/load, and automate with logging and error handling. Containers, Kubernetes, cgroups, systemd, cloud scheduling, AI workloads, and observability keep process management essential.", "CPU + memory + load + processes + logs"],
  ];

  return (
    <div className="topic-learning-scroll">
      <section className="topic-intro-panel">
        <div className="topic-intro-icon">07</div>
        <div>
          <span className="section-label">PROCESS MANAGEMENT</span>
          <h2>Process Management and Scheduling</h2>
          <p>
            Learn how Linux creates, schedules, monitors, communicates with,
            isolates, and terminates processes, from a single command-line job
            to containers, Kubernetes, cloud infrastructure, and AI workloads.
          </p>
        </div>
      </section>

      <TopicVisualGallery />

      <InteractiveExample
        title="Trace a process lifecycle"
        scenario="Start a background application and follow how Linux manages it."
        steps={[
          "The program is loaded and becomes a process with a PID and parent.",
          "The scheduler moves it between running, sleeping, waiting, and ready states.",
          "The administrator monitors it, sends signals, and observes termination or re-parenting.",
        ]}
        result="A process is not just a command: it has identity, state, resources, priority, relationships, and a managed lifecycle."
        visual={<div className="interactive-example__flow"><span>Program</span><b>→</b><span>PID</span><b>→</b><span>Scheduler</span><b>→</b><span>Service</span><b>→</b><span>Exit</span></div>}
      />

      <ProcessControlSimulator />

      <div className="topic-area-grid">
        {[
          ["Lifecycle", "Create, run, wait, stop, and terminate.", "◉"],
          ["Scheduling", "Share CPU time fairly and efficiently.", "◫"],
          ["Control", "Use signals, priority, affinity, and limits.", "⚙"],
          ["Isolation", "Use namespaces, cgroups, and containers.", "◈"],
        ].map(([title, description, icon]) => (
          <article className="topic-area-card" key={title}>
            <span className="topic-area-icon">{icon}</span>
            <h3>{title}</h3>
            <p>{description}</p>
          </article>
        ))}
      </div>

      <TopicContentSection number="00" title="Process management at a glance" tone="blue">
        <pre className="topic-code-block">{`Program on disk
      |
      v
Process + PID + PCB
      |
      +--> Scheduler --> CPU cores
      +--> Memory + open files
      +--> IPC + signals
      +--> Services + timers
      +--> cgroups + namespaces
      |
Termination and exit status`}</pre>
      </TopicContentSection>

      <InteractiveExample
        title="Choose a safe process-control action"
        scenario="A service is unresponsive and its PID is 1234."
        steps={[
          "Inspect the command, owner, state, resources, and parent before acting.",
          "Send SIGTERM first so the process can close files and release resources.",
          "Wait and monitor; use SIGKILL only when graceful termination fails and the impact is understood.",
        ]}
        result="Graceful termination protects data and reduces the risk of incomplete operations. Forceful termination is a last resort."
        visual={<div className="interactive-example__flow"><span>Inspect</span><b>→</b><span>SIGTERM</span><b>→</b><span>Wait</span><b>→</b><span>SIGKILL if needed</span></div>}
      />

      <TopicContentSection number="01-75" title="Complete lecture coverage" tone="slate">
        <p>
          The sections below follow the supplied Topic 7 lecture from process
          fundamentals through scheduling, IPC, services, automation, resource
          control, containers, troubleshooting, security, and future trends.
        </p>
      </TopicContentSection>

      {sections.map(([number, title, content, command], index) => (
        <TopicContentSection
          key={number}
          number={number}
          title={title}
          tone={["blue", "cyan", "teal", "indigo", "purple", "slate", "orange"][index % 7]}
        >
          <p>{content}</p>
          <div className="topic-command-row">
            <code>{command}</code>
          </div>
        </TopicContentSection>
      ))}
    </div>
  );
}

function ProcessManagementContent() {
  const tools = [
    ["ps", "Process snapshot", "ps aux"],
    ["top", "Live resource monitor", "top"],
    ["htop", "Interactive monitor", "htop"],
    ["pstree", "Process hierarchy", "pstree"],
  ];

  return (
    <div className="topic-learning-scroll">
      <section className="topic-intro-panel">
        <div className="topic-intro-icon">03</div>
        <div>
          <span className="section-label">LINUX ADMINISTRATION</span>
          <h2>Process Management</h2>
          <p>Learn how an operating system creates, schedules, monitors, controls, and terminates processes while sharing system resources.</p>
        </div>
      </section>

      <section className="process-hero-visual">
        <div>
          <span className="section-label">THE PROCESS JOURNEY</span>
          <h2>From a program on disk to a managed process</h2>
          <p>A program is stored instructions; a process is an active instance loaded into memory and tracked by the operating system.</p>
        </div>
        <div className="process-lifecycle">
          {["New", "Ready", "Running", "Waiting", "Terminated"].map((state, index) => (
            <span key={state}>{index > 0 && <b>→</b>}<i>{String(index + 1).padStart(2, "0")}</i>{state}</span>
          ))}
        </div>
      </section>

      <InteractiveExample
        title="Follow a process lifecycle"
        scenario="Imagine starting a long-running web server from a terminal."
        steps={[
          "The shell starts the program and the operating system assigns a PID.",
          "The scheduler moves it between ready, running, and waiting states.",
          "An administrator can inspect it with ps or top and stop it with a signal.",
        ]}
        result="A process is active work managed by the operating system, not just a file stored on disk."
        visual={<div className="interactive-example__flow"><span>New</span><b>→</b><span>Ready</span><b>→</b><span>Running</span><b>→</b><span>Waiting</span><b>→</b><span>Exit</span></div>}
      />

      <TopicContentSection number="01" title="What Is a Process?" tone="blue">
        <p>Opening a browser, running Python, starting a web server, or launching a background service creates one or more processes. A browser may use separate processes for tabs, extensions, rendering, and GPU operations.</p>
        <pre className="topic-code-block">{`Program on Disk
      |
User Executes Program
      |
Operating System Loads Program
      |
Process Created in Memory`}</pre>
      </TopicContentSection>

      <TopicContentSection number="02" title="Process Lifecycle" tone="cyan">
        <div className="topic-detail-grid">
          <TopicDetail title="New">The OS creates the process and prepares its resources.</TopicDetail>
          <TopicDetail title="Ready">The process can run but waits for CPU time from the scheduler.</TopicDetail>
          <TopicDetail title="Running">The process is currently executing instructions on a CPU.</TopicDetail>
          <TopicDetail title="Waiting / blocked">The process waits for disk, keyboard, network data, or another process.</TopicDetail>
          <TopicDetail title="Terminated">The process finished or was stopped and its resources are released.</TopicDetail>
        </div>
      </TopicContentSection>

      <TopicContentSection number="03" title="PCB, PID, and Process Hierarchies" tone="indigo">
        <p>A Process Control Block stores a process ID, state, CPU registers, memory information, priority, scheduling data, and open files.</p>
        <div className="topic-detail-grid">
          <TopicDetail title="PID — Process Identifier">Every running process normally has a unique PID. Use <code>ps</code> or <code>ps aux</code> to inspect it.</TopicDetail>
          <TopicDetail title="Parent and child processes">Processes can create children, forming a hierarchy visible with <code>pstree</code>.</TopicDetail>
          <TopicDetail title="systemd (PID 1)">Modern Linux commonly uses systemd to initialize the system and manage SSH, networking, databases, web servers, and Docker.</TopicDetail>
        </div>
      </TopicContentSection>

      <TopicContentSection number="03A" title="Creating Processes: fork, exec, and Daemons" tone="purple">
        <p>
          On Linux, a parent commonly creates a child with <code>fork()</code>.
          The child can then replace its program image with <code>exec()</code>.
          This model underpins shells, service launchers, and many server
          architectures.
        </p>
        <div className="topic-detail-grid">
          <TopicDetail title="fork()">Duplicates the calling process and gives the child a new PID.</TopicDetail>
          <TopicDetail title="exec()">Loads a different executable into the current process.</TopicDetail>
          <TopicDetail title="Daemon">A background service detached from an interactive terminal, often supervised by systemd.</TopicDetail>
          <TopicDetail title="/proc">A virtual filesystem exposing live process and kernel information, such as <code>/proc/&lt;pid&gt;/status</code>.</TopicDetail>
        </div>
        <div className="topic-command-row"><code>ps -ef</code><code>cat /proc/1/status</code><code>systemctl list-units</code></div>
      </TopicContentSection>

      <TopicContentSection number="04" title="Scheduling and Context Switching" tone="teal">
        <p>The scheduler decides which process runs next, how long it runs, which core it uses, and which processes receive priority. Context switching saves one process state and loads another.</p>
        <div className="topic-flow"><span>Process A running</span><b>→</b><span>Save state</span><b>→</b><span>Load Process B</span><b>→</b><span>Process B running</span></div>
        <p>Context switching enables multitasking but has overhead because CPU time is used to save and restore state.</p>
      </TopicContentSection>

      <TopicContentSection number="05" title="Multitasking, Multicore CPUs, and Threads" tone="blue">
        <div className="topic-detail-grid">
          <TopicDetail title="Multitasking">Browsing, music, downloads, and editing can appear simultaneous as CPU time is shared.</TopicDetail>
          <TopicDetail title="Multicore processing">Schedulers distribute processes across cores for performance and parallel processing.</TopicDetail>
          <TopicDetail title="Threads">A thread is a smaller execution unit inside a process. Threads share process resources.</TopicDetail>
          <TopicDetail title="Single vs. multithreaded">One thread executes a single-threaded program; multiple cooperating threads execute a multithreaded program.</TopicDetail>
        </div>
        <pre className="topic-code-block">{`Process
├── Thread 1
├── Thread 2
└── Thread 3`}</pre>
      </TopicContentSection>

      <TopicContentSection number="06" title="Linux Process States" tone="slate">
        <div className="topic-chip-list">{["Running", "Sleeping", "Stopped", "Zombie", "Idle", "Waiting"].map((state) => <span key={state}>{state}</span>)}</div>
        <div className="topic-detail-grid">
          <TopicDetail title="Zombie process">A finished child remains in the process table because its parent has not collected its exit status. Many zombies can indicate an application problem.</TopicDetail>
          <TopicDetail title="Orphan process">A child continues after its parent exits and is adopted by the system process-management hierarchy, commonly systemd.</TopicDetail>
        </div>
      </TopicContentSection>

      <TopicContentSection number="07" title="Viewing and Controlling Processes" tone="purple">
        <div className="topic-tool-grid">{tools.map(([command, description, example]) => <article className="topic-tool-card" key={command}><code>{command}</code><strong>{description}</strong><span>{example}</span></article>)}</div>
        <div className="topic-detail-grid">
          <TopicDetail title="Graceful termination"><code>kill 1234</code> sends SIGTERM, allowing an application to save data and release resources.</TopicDetail>
          <TopicDetail title="Force termination"><code>kill -9 1234</code> sends SIGKILL and immediately stops a process. Use it only when necessary.</TopicDetail>
        </div>
      </TopicContentSection>

      <TopicContentSection number="08" title="Priority, Jobs, and Signals" tone="orange">
        <div className="topic-detail-grid">
          <TopicDetail title="Priority"><code>nice -n 10 command</code> and <code>renice</code> influence scheduling priority.</TopicDetail>
          <TopicDetail title="Foreground and background"><code>python program.py &amp;</code> runs in the background. Use <code>jobs</code>, <code>fg</code>, and <code>bg</code> to manage jobs.</TopicDetail>
          <TopicDetail title="Common signals">SIGTERM requests graceful termination, SIGKILL forces it, SIGSTOP pauses, SIGCONT resumes, and SIGHUP commonly triggers service reload behavior.</TopicDetail>
        </div>
      </TopicContentSection>

      <TopicContentSection number="09" title="Inter-Process Communication" tone="indigo">
        <p>Processes communicate using pipes, named pipes, signals, shared memory, message queues, and sockets.</p>
        <div className="topic-flow"><span>Process A</span><b>⇄ IPC</b><span>Process B</span></div>
        <p>IPC supports client-server applications, databases, web servers, and distributed systems.</p>
      </TopicContentSection>

      <TopicContentSection number="10" title="Resources, Monitoring, and Security" tone="red">
        <p>Processes consume CPU, RAM, storage, and network bandwidth. Administrators investigate high usage, memory leaks, too many processes, and stuck processes before optimizing or restarting.</p>
        <pre className="topic-code-block">{`High CPU Usage
       |
Identify Process
       |
Investigate Application
       |
Optimize or Restart`}</pre>
        <p>Process inspection also helps identify suspicious applications, unauthorized services, malware, and resource abuse. Investigate carefully before deleting a process.</p>
      </TopicContentSection>

      <TopicContentSection number="11" title="systemd, cgroups, and Namespaces" tone="teal">
        <div className="topic-detail-grid">
          <TopicDetail title="systemd">Manages system startup, services, and background processes.</TopicDetail>
          <TopicDetail title="cgroups">Control CPU, memory, disk I/O, and process limits for groups of processes.</TopicDetail>
          <TopicDetail title="Namespaces">Isolate processes, networks, users, and mount points.</TopicDetail>
          <TopicDetail title="Containers">Docker, Podman, and Kubernetes combine namespaces, cgroups, and kernel isolation while sharing the host kernel.</TopicDetail>
        </div>
        <pre className="topic-code-block">{`Linux Operating System
        |
   ┌────┼────┐
Container A  Container B  Container C
  Processes    Processes    Processes`}</pre>
      </TopicContentSection>

      <TopicContentSection number="12" title="Modern Monitoring and Future Relevance" tone="blue">
        <div className="topic-detail-grid">
          <TopicDetail title="Observability">Modern platforms combine metrics, logs, traces, alerts, and performance monitoring.</TopicDetail>
          <TopicDetail title="Cloud and Kubernetes">Cloud servers may run thousands of processes; Kubernetes manages containers, pods, limits, and failures.</TopicDetail>
          <TopicDetail title="AI workloads">Data processing, model training, GPU tasks, and distributed computing require coordinated processes.</TopicDetail>
          <TopicDetail title="AI-assisted monitoring">Automated tools detect abnormal processes and analyze logs, but administrators must validate results.</TopicDetail>
        </div>
      </TopicContentSection>

      <TopicContentSection number="13" title="Process Creation and Program Execution" tone="indigo">
        <p>
          A program is a set of instructions stored on disk, while a process
          is a live execution of those instructions. When a shell starts a
          command, the operating system creates a process, assigns it a PID,
          gives it memory and file descriptors, and schedules it on a CPU.
        </p>
        <p>
          Linux commonly uses <code>fork()</code> to create a child process.
          The child initially resembles the parent, then <code>exec()</code>
          can replace its program image with another executable. This model is
          used by shells, service managers, scripts, and server applications.
        </p>
        <pre className="topic-code-block">{`Shell process
      |
    fork()
      |
Child process
      |
    exec()
      |
New program running`}</pre>
        <div className="topic-detail-grid">
          <TopicDetail title="Process resources">
            A process receives an address space, CPU state, open file
            descriptors, environment variables, a working directory, signal
            handlers, and security credentials.
          </TopicDetail>
          <TopicDetail title="Exit status">
            When a process ends, it returns an exit status. The parent can
            collect that status, which prevents completed child processes from
            remaining as zombies.
          </TopicDetail>
          <TopicDetail title="Daemons">
            A daemon is a background service that is detached from an
            interactive terminal. Web servers, schedulers, logging services,
            and database services commonly run as daemons.
          </TopicDetail>
          <TopicDetail title="/proc">
            Linux exposes live process and kernel information through the
            virtual <code>/proc</code> filesystem. For example,
            <code>/proc/&lt;pid&gt;/status</code> contains state and resource
            details for a process.
          </TopicDetail>
        </div>
        <div className="topic-command-row">
          <code>ps -ef</code><code>cat /proc/1/status</code><code>systemctl list-units</code>
        </div>
      </TopicContentSection>

      <TopicContentSection number="14" title="Process Scheduling in Detail" tone="teal">
        <p>
          A scheduler must balance responsiveness, fairness, throughput, and
          priority. Interactive programs should respond quickly, while batch
          work should use available CPU time efficiently. The scheduler
          maintains runnable processes and chooses which one receives a time
          slice.
        </p>
        <div className="topic-detail-grid">
          <TopicDetail title="Ready queue">
            Processes that are able to run wait in a scheduler queue until a
            CPU core is available.
          </TopicDetail>
          <TopicDetail title="Time slice">
            A process commonly runs for a limited period before the scheduler
            gives another runnable process an opportunity.
          </TopicDetail>
          <TopicDetail title="Priority">
            A process's priority and nice value influence how favorably it is
            scheduled. Administrators should change priority carefully because
            helping one workload can delay another.
          </TopicDetail>
          <TopicDetail title="CPU affinity">
            Work can sometimes be restricted to selected CPU cores for
            performance, isolation, or predictable behavior.
          </TopicDetail>
        </div>
        <p>
          Context switching requires saving registers and scheduling state,
          loading another process's state, and changing memory context. Too
          many switches can add overhead, especially when workloads create
          large numbers of short-lived tasks.
        </p>
      </TopicContentSection>

      <TopicContentSection number="15" title="Process States, Zombies, and Orphans" tone="slate">
        <p>
          Linux process states describe what a process is doing at a particular
          moment. A running process is executing or ready to execute; a
          sleeping process is waiting for an event; a stopped process has been
          paused; and an idle process is waiting for work or resources.
        </p>
        <div className="topic-detail-grid">
          <TopicDetail title="Zombie process">
            A child can finish while its parent is still running. Until the
            parent collects the child's exit status, the kernel keeps a small
            process-table entry. A zombie does not normally consume CPU, but a
            large number can exhaust process-table capacity.
          </TopicDetail>
          <TopicDetail title="Orphan process">
            If a parent exits while a child continues, the child becomes an
            orphan. Linux adopts it into the system process hierarchy so it
            still has a process responsible for collecting its status.
          </TopicDetail>
          <TopicDetail title="Investigation">
            Use process listings, parent IDs, logs, and application behavior to
            determine why a process was not collected or why a parent ended.
          </TopicDetail>
          <TopicDetail title="Prevention">
            Correct application code, reliable service supervision, and proper
            signal handling reduce process leaks and uncontrolled child
            creation.
          </TopicDetail>
        </div>
      </TopicContentSection>

      <TopicContentSection number="16" title="Threads and Concurrency" tone="blue">
        <p>
          A process provides an isolated resource environment, while threads
          are execution paths inside that process. Threads normally share the
          process's memory and open resources, which makes communication fast
          but also means that an unsafe thread can corrupt shared state.
        </p>
        <div className="topic-detail-grid">
          <TopicDetail title="Single-threaded program">
            One execution path performs work in sequence. This is simpler to
            reason about but may wait while one operation blocks.
          </TopicDetail>
          <TopicDetail title="Multithreaded program">
            Several execution paths can handle work concurrently, such as
            network requests, rendering, input, and background tasks.
          </TopicDetail>
          <TopicDetail title="Shared state">
            Threads can access the same memory, so synchronization is needed
            to prevent race conditions and inconsistent data.
          </TopicDetail>
          <TopicDetail title="Multicore execution">
            On a multicore system, independent threads can execute at the same
            time, improving throughput when the application is designed for
            parallel work.
          </TopicDetail>
        </div>
      </TopicContentSection>

      <TopicContentSection number="17" title="Signals and Safe Process Control" tone="purple">
        <p>
          Signals are asynchronous notifications sent to processes. They are
          used by users, administrators, the kernel, and services to request
          an action. A process may handle some signals, but SIGKILL cannot be
          caught or ignored.
        </p>
        <div className="topic-detail-grid">
          <TopicDetail title="SIGTERM">
            Requests graceful termination. The process can close files, finish
            work, save state, and release resources.
          </TopicDetail>
          <TopicDetail title="SIGKILL">
            Immediately terminates a process. It should be a last resort
            because the application cannot clean up its state.
          </TopicDetail>
          <TopicDetail title="SIGSTOP and SIGCONT">
            SIGSTOP pauses a process and SIGCONT allows a stopped process to
            continue.
          </TopicDetail>
          <TopicDetail title="SIGHUP">
            Historically represented a terminal hangup and is also commonly
            used by services to request a configuration reload.
          </TopicDetail>
        </div>
        <div className="topic-command-row"><code>kill 1234</code><code>kill -9 1234</code><code>kill -l</code></div>
        <p>
          Administrators should identify the correct PID, understand the
          process's role, try graceful termination first, and check service
          dependencies before using a forceful signal.
        </p>
      </TopicContentSection>

      <TopicContentSection number="18" title="Foreground, Background, and Job Control" tone="orange">
        <p>
          A foreground process occupies the terminal, so the shell waits for
          it or displays its output. A background process allows the terminal
          to accept more commands. This distinction is useful for long-running
          administrative commands, scripts, downloads, and test servers.
        </p>
        <div className="topic-detail-grid">
          <TopicDetail title="Foreground">
            <code>python program.py</code> runs attached to the terminal. Its
            output is visible and the shell normally waits for completion.
          </TopicDetail>
          <TopicDetail title="Background">
            <code>python program.py &amp;</code> starts a job while returning
            control to the shell.
          </TopicDetail>
          <TopicDetail title="jobs">
            <code>jobs</code> lists jobs associated with the current shell.
          </TopicDetail>
          <TopicDetail title="fg and bg">
            <code>fg</code> brings a stopped or background job to the
            foreground, while <code>bg</code> resumes a stopped job in the
            background.
          </TopicDetail>
        </div>
      </TopicContentSection>

      <TopicContentSection number="19" title="Inter-Process Communication" tone="indigo">
        <p>
          Independent processes need communication mechanisms because each
          process has its own protected memory. IPC lets processes exchange
          data, coordinate events, and build larger applications from smaller
          components.
        </p>
        <div className="topic-detail-grid">
          <TopicDetail title="Pipes">Connect the output of one process to the input of another, often in shell commands.</TopicDetail>
          <TopicDetail title="Named pipes">Provide a filesystem-visible channel that unrelated processes can open.</TopicDetail>
          <TopicDetail title="Shared memory">Allows processes to access a shared region quickly, but requires synchronization.</TopicDetail>
          <TopicDetail title="Message queues">Pass structured messages between processes without requiring both to run at exactly the same moment.</TopicDetail>
          <TopicDetail title="Sockets">Support communication between local processes or applications across a network.</TopicDetail>
          <TopicDetail title="Signals">Notify a process of events such as termination, pause, continuation, or reload.</TopicDetail>
        </div>
      </TopicContentSection>

      <TopicContentSection number="20" title="Resource Management and Performance" tone="red">
        <p>
          Every process consumes resources. CPU time affects computation,
          memory holds working data, storage supports files and paging, and
          network bandwidth carries input and output. Resource problems often
          interact: a memory shortage can increase swap I/O, which raises disk
          activity and makes processes appear slow.
        </p>
        <div className="topic-detail-grid">
          <TopicDetail title="High CPU usage">
            Identify the process, determine whether the workload is expected,
            inspect threads and recent changes, then optimize, limit, or
            restart it safely.
          </TopicDetail>
          <TopicDetail title="High memory usage">
            Look for leaks, large caches, too many workers, or an unexpectedly
            large workload. Confirm whether swap is being used heavily.
          </TopicDetail>
          <TopicDetail title="Too many processes">
            A service may be creating children without collecting them or
            retrying failed work too aggressively.
          </TopicDetail>
          <TopicDetail title="Stuck processes">
            A process may be waiting on storage, a network resource, a lock, or
            another service. Killing it without understanding the wait can
            cause data loss.
          </TopicDetail>
        </div>
        <pre className="topic-code-block">{`Measure
  |
Identify process
  |
Understand cause
  |
Change or limit workload
  |
Verify and monitor`}</pre>
      </TopicContentSection>

      <TopicContentSection number="21" title="Containers and Linux Process Isolation" tone="teal">
        <p>
          Containers are groups of Linux processes isolated from one another
          while sharing the host kernel. They are not complete virtual
          machines: a container normally does not contain its own kernel.
        </p>
        <div className="topic-detail-grid">
          <TopicDetail title="Namespaces">
            Isolate process IDs, networks, users, mount points, and other views
            of the system so a container sees its own environment.
          </TopicDetail>
          <TopicDetail title="cgroups">
            Control how much CPU, memory, disk I/O, and number of processes a
            group can consume.
          </TopicDetail>
          <TopicDetail title="Kernel isolation">
            The host kernel still enforces permissions, scheduling, and device
            access. A container's security depends on both configuration and
            the host.
          </TopicDetail>
          <TopicDetail title="Container platforms">
            Docker and Podman run containers, while Kubernetes schedules and
            manages them across multiple machines.
          </TopicDetail>
        </div>
      </TopicContentSection>

      <TopicContentSection number="22" title="Observability, Cloud, and AI Workloads" tone="blue">
        <p>
          Modern monitoring combines metrics, logs, traces, alerts, and
          process information. This broader practice is observability: using
          evidence from the system to understand not only whether it is
          failing, but why it is failing.
        </p>
        <div className="topic-detail-grid">
          <TopicDetail title="Cloud computing">
            Cloud servers can run thousands of processes and services across
            many virtual machines. Resource limits and automation help keep
            workloads predictable.
          </TopicDetail>
          <TopicDetail title="Kubernetes">
            Kubernetes manages containerized applications, pods, resource
            limits, restarts, placement, and failures across a cluster.
          </TopicDetail>
          <TopicDetail title="AI workloads">
            Data preparation, model training, GPU workloads, inference, and
            distributed computing can require many coordinated processes.
          </TopicDetail>
          <TopicDetail title="AI-assisted monitoring">
            Tools can detect abnormal processes, analyze logs, recognize
            performance patterns, and suggest actions. Administrators must
            validate automated recommendations before applying them.
          </TopicDetail>
        </div>
      </TopicContentSection>

      <section className="topic-takeaways"><span className="section-label">KEY TAKEAWAYS</span><h2>Processes are the moving parts of every system</h2><p>Process management is fundamental to Linux administration, programming, DevOps, cloud computing, cybersecurity, containers, performance monitoring, and system stability.</p></section>
    </div>
  );
}

function LinuxFundamentalsContent() {
  const areas = [
    ["Operating Systems", "How users, applications, hardware, and the kernel work together.", "◈"],
    ["Linux", "The open-source ecosystem used across servers, cloud, networking, and security.", "⌘"],
    ["System Administration", "The daily practice of managing users, services, storage, networks, and logs.", "⚙"],
    ["Cybersecurity", "Protecting systems, networks, applications, data, and users from threats.", "◉"],
  ];

  const skills = [
    ["Operating Systems", "Linux, Windows, processes, memory, and filesystems"],
    ["Networking", "IP addresses, DNS, routing, TCP/IP, and SSH"],
    ["Administration", "Users, permissions, services, storage, and logs"],
    ["Cybersecurity", "Authentication, firewalls, vulnerability management, monitoring, and backups"],
    ["Modern Technologies", "Cloud, virtualization, containers, automation, and Infrastructure as Code"],
  ];

  return (
    <div className="topic-learning-scroll">
      <section className="topic-intro-panel">
        <div className="topic-intro-icon">01</div>
        <div>
          <span className="section-label">FOUNDATION TOPIC</span>
          <h2>Linux System Administration, Operating Systems, and Cybersecurity Fundamentals</h2>
          <p>
            Learn how computer systems work, how Linux environments are managed,
            and how systems are protected from security threats. These three
            areas are closely connected: understanding an operating system is
            essential to managing and securing it.
          </p>
        </div>
      </section>

      <TopicVisualGallery />

      <InteractiveExample
        title="Trace a request through a Linux system"
        scenario="Imagine a user opening a web application on a Linux server."
        steps={[
          "The user request reaches the network interface.",
          "The operating system and kernel provide processes, memory, files, and networking.",
          "The service reads configuration and data, then returns a response.",
        ]}
        result="The same system-administration ideas connect the operating system, Linux commands, security controls, and modern services."
        visual={<div className="interactive-example__flow"><span>User</span><b>→</b><span>Linux service</span><b>→</b><span>Kernel</span><b>→</b><span>Hardware</span></div>}
      />

      <div className="topic-area-grid">
        {areas.map(([title, description, icon]) => (
          <article className="topic-area-card" key={title}>
            <span className="topic-area-icon">{icon}</span>
            <h3>{title}</h3>
            <p>{description}</p>
          </article>
        ))}
      </div>

      <TopicContentSection number="01" title="Operating Systems" tone="blue">
        <p>
          An Operating System (OS) is the main software that manages the
          hardware and software resources of a computer. Examples include
          Linux, Windows, macOS, Android, and iOS.
        </p>
        <p>The operating system acts as a bridge between users, applications, and hardware.</p>
        <pre className="topic-code-block">{`User
   |
Applications
   |
Operating System
   |
Kernel
   |
Hardware`}</pre>
        <p>
          Without an operating system, users and applications would have
          difficulty communicating directly with computer hardware.
        </p>
        <pre className="topic-code-block">{`Power on
   |
Firmware / bootloader
   |
Kernel loads
   |
Services start
   |
Login and applications`}</pre>
        <p>
          During startup, firmware finds a bootloader, the bootloader loads
          the kernel, and the kernel starts the first system service. This
          boot path explains why administrators troubleshoot both hardware
          initialization and service startup.
        </p>
      </TopicContentSection>

      <TopicContentSection number="02" title="Linux" tone="cyan">
        <p>
          Linux is an open-source operating system ecosystem built around the
          Linux kernel. It is widely used in servers, cloud computing, web
          hosting, supercomputers, networking devices, embedded systems, IoT,
          Android, cybersecurity, and AI infrastructure.
        </p>
        <p>
          Linux is popular because it is open source, flexible, secure,
          customizable, stable, and efficient. Its source code and modular
          design allow organizations to adapt the system for many different
          workloads, from a small embedded device to a large cloud data
          center.
        </p>
        <div className="topic-chip-list">
          {["Open source", "Flexible", "Secure", "Customizable", "Stable", "Efficient", "Cloud ready"].map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </TopicContentSection>

      <TopicContentSection number="03" title="Linux System Administration" tone="teal">
        <p>
          Linux System Administration means managing, configuring, maintaining,
          and securing Linux computers and servers. Administrators ensure that
          systems work correctly, efficiently, and securely.
        </p>
        <div className="topic-detail-grid">
          <TopicDetail title="Common responsibilities">
            A Linux system administrator creates user accounts, manages
            passwords, configures permissions, installs software and operating
            system updates, manages services, configures networks, manages
            storage, monitors system performance, reviews logs, creates
            backups, and secures servers. The goal is to keep systems
            available, efficient, reliable, and protected.
          </TopicDetail>
          <TopicDetail title="Useful commands">
            On Debian-based systems, <code>sudo apt update</code> updates
            package information. An administrator can inspect services with
            <code>systemctl status</code> and connect to another server with
            <code>ssh username@server-ip</code>.
          </TopicDetail>
        </div>
      </TopicContentSection>

      <TopicContentSection number="04" title="Operating System Administration" tone="indigo">
        <div className="topic-detail-grid">
          <TopicDetail title="User management">
            Administrators manage user accounts, groups, passwords, and
            administrative privileges. Groups make it possible to assign
            access to a team, while administrative privileges should be given
            only when required.
            <div className="topic-command-row"><code>useradd</code><code>usermod</code><code>passwd</code><code>sudo</code></div>
          </TopicDetail>
          <TopicDetail title="File management">
            File management includes creating and organizing files and
            directories, setting permissions and ownership, and managing
            storage devices. Permissions help prevent unauthorized reading,
            modification, or execution.
            <div className="topic-command-row"><code>ls</code><code>cp</code><code>mv</code><code>chmod</code><code>chown</code></div>
          </TopicDetail>
          <TopicDetail title="Process management">
            A computer runs programs as processes. Administrators view running
            processes, monitor CPU and memory usage, stop problematic
            programs, and manage system resources so one application does not
            affect the entire server.
          </TopicDetail>
          <TopicDetail title="Service management">
            Background programs are services or daemons. Examples include an
            SSH server, web server, database server, and Docker service.
            Modern Linux systems commonly use systemd to start, stop, enable,
            monitor, and restart these services.
            <div className="topic-command-row"><code>sudo systemctl start ssh</code></div>
          </TopicDetail>
        </div>
      </TopicContentSection>

      <TopicContentSection number="04A" title="User Space, Kernel Space, and System Calls" tone="blue">
        <p>
          Applications normally run in user space with restricted privileges.
          They request protected operations through system calls, while the
          kernel runs in kernel space and mediates access to CPU, memory,
          files, devices, and networks.
        </p>
        <pre className="topic-code-block">{`Application (user space)
          |
      system call
          |
Kernel (privileged space)
          |
Hardware and devices`}</pre>
        <p>
          This boundary limits the damage a faulty application can cause and
          makes permissions, isolation, and auditing possible.
        </p>
      </TopicContentSection>

      <TopicContentSection number="05" title="Cybersecurity Fundamentals" tone="purple">
        <p>
          Cybersecurity protects computers, servers, networks, applications,
          data, and users from unauthorized access, attacks, damage, and
          disruption. A poorly configured system can become vulnerable, so
          security is a core administration responsibility.
        </p>
        <p>
          A secure system requires more than one setting. Administrators must
          apply updates, configure authentication and permissions, protect
          network services, monitor activity, review logs, and maintain
          recoverable backups.
        </p>
        <div className="cia-grid">
          <TopicDetail title="Confidentiality">Only authorized users can access information.</TopicDetail>
          <TopicDetail title="Integrity">Data remains accurate and cannot be changed without authorization.</TopicDetail>
          <TopicDetail title="Availability">Systems and information remain available when authorized users need them.</TopicDetail>
        </div>
      </TopicContentSection>

      <TopicContentSection number="06" title="Linux and Cybersecurity" tone="purple">
        <p>
          Linux supports security monitoring, server security, network
          administration, penetration testing, digital forensics, security
          research, and cloud security. Linux is not automatically secure:
          protection depends on configuration, updates, authentication,
          permissions, network security, monitoring, and backups.
        </p>
        <p>
          Linux is commonly used for security monitoring, server security,
          network administration, penetration testing, digital forensics,
          security research, and cloud security. However, Linux is not
          automatically secure simply because it is Linux. Security depends
          on proper configuration, updates, authentication, permissions,
          network security, monitoring, and backups.
        </p>
      </TopicContentSection>

      <TopicContentSection number="07" title="Administration and Cybersecurity Connection" tone="slate">
        <div className="role-comparison">
          <TopicDetail title="System administrator">Creates users, configures services, installs software, and manages networks.</TopicDetail>
          <TopicDetail title="Cybersecurity professional">Identifies vulnerabilities, monitors threats, reviews logs, tests controls, and recommends improvements.</TopicDetail>
        </div>
        <p>
          System administration and cybersecurity work together. The
          administrator creates users, configures services, installs software,
          and manages networks. The cybersecurity professional identifies
          vulnerabilities, monitors threats, reviews logs, tests security
          controls, and recommends improvements. In modern IT environments,
          these responsibilities often overlap.
        </p>
      </TopicContentSection>

      <TopicContentSection number="08" title="Modern Linux System Administration" tone="blue">
        <p>
          Administration now extends beyond individual physical servers into
          cloud computing, virtual machines, containers, automation,
          Infrastructure as Code, DevOps, DevSecOps, and AI-assisted
          administration.
        </p>
        <div className="topic-detail-grid">
          <TopicDetail title="Cloud computing">
            Linux is heavily used in cloud infrastructure. Administrators
            manage virtual servers, cloud networking, storage, security
            groups, identity and access management, and automation.
          </TopicDetail>
          <TopicDetail title="Containers">
            Containers run applications in isolated environments. Docker,
            Podman, and Kubernetes are widely used to package, deploy, and
            manage modern applications.
          </TopicDetail>
          <TopicDetail title="Automation">
            Bash, Python, Ansible, and Terraform automate repetitive work.
            Automation saves time, reduces human errors, manages multiple
            servers, and standardizes configurations.
          </TopicDetail>
        </div>
      </TopicContentSection>

      <TopicContentSection number="09" title="DevOps and DevSecOps" tone="orange">
        <p>
          DevOps combines software development and IT operations to improve
          collaboration, automation, software deployment, and reliability.
          DevSecOps adds security to the development and operations process.
          Instead of checking security only after development, security is
          included throughout the entire lifecycle.
        </p>
        <div className="topic-flow">
          {["Development", "Testing", "Security", "Deployment", "Monitoring"].map((item, index) => (
            <span key={item}>{index > 0 && <b>→</b>}{item}</span>
          ))}
        </div>
      </TopicContentSection>

      <TopicContentSection number="10" title="Modern Cybersecurity Concepts" tone="red">
        <div className="topic-detail-grid">
          <TopicDetail title="Zero Trust">
            Zero Trust follows the principle: “Never automatically trust; always
            verify.” Users, devices, and applications should be continuously
            verified rather than trusted simply because they are inside a
            network.
          </TopicDetail>
          <TopicDetail title="Multi-Factor Authentication">
            MFA requires more than one authentication method, such as a
            password plus an authentication application, security key, or
            biometric authentication.
          </TopicDetail>
          <TopicDetail title="Principle of least privilege">
            Users should receive only the permissions necessary to perform
            their tasks. A normal user should not automatically have
            administrator access.
          </TopicDetail>
          <TopicDetail title="Defense in depth">
            Systems use multiple layers of security: firewalls,
            authentication, permissions, encryption, monitoring, and backups.
            If one control fails, other controls can still provide protection.
          </TopicDetail>
        </div>
      </TopicContentSection>

      <TopicContentSection number="11" title="Skills for Modern IT Professionals" tone="teal">
        <div className="skills-list">
          {skills.map(([title, description]) => (
            <div key={title}><strong>{title}</strong><span>{description}</span></div>
          ))}
        </div>
        <p>
          These skills connect together: operating system knowledge supports
          administration; networking enables remote access and services;
          cybersecurity protects the environment; and cloud, virtualization,
          containers, automation, and Infrastructure as Code support modern
          infrastructure.
        </p>
      </TopicContentSection>

      <TopicContentSection number="12" title="Updates and Future Relevance" tone="cyan">
        <div className="topic-detail-grid">
          <TopicDetail title="Cloud-native computing">
            Applications are increasingly designed around containers,
            Kubernetes, microservices, and automated infrastructure.
          </TopicDetail>
          <TopicDetail title="Artificial intelligence infrastructure">
            Linux is widely used for AI servers, machine learning environments,
            GPU computing, and data centers.
          </TopicDetail>
          <TopicDetail title="Edge computing">
            Some processing happens closer to devices instead of only in
            centralized cloud servers. Linux is common in edge servers, IoT
            devices, and embedded systems.
          </TopicDetail>
          <TopicDetail title="AI-assisted system administration">
            AI can assist with log analysis, monitoring, troubleshooting,
            automation, and security analysis. Administrators still need
            technical knowledge because AI-generated recommendations must be
            reviewed and validated.
          </TopicDetail>
        </div>
      </TopicContentSection>

      <TopicContentSection number="13" title="How the Main Linux Components Work Together" tone="indigo">
        <p>
          A Linux computer is not one single program. It is a collection of
          cooperating layers. The kernel communicates with hardware, system
          libraries provide common functions, services run in the background,
          shells accept commands, and applications provide user-facing work.
          Administrators troubleshoot a system by identifying which layer is
          responsible for a problem.
        </p>
        <pre className="topic-code-block">{`Users and applications
          |
       Shell / GUI
          |
    Libraries and APIs
          |
 Background services
          |
        Kernel
          |
 CPU • Memory • Disk • Network devices`}</pre>
        <div className="topic-detail-grid">
          <TopicDetail title="Hardware layer">
            Processors execute instructions, memory holds active data, disks
            persist information, and network devices move data between systems.
          </TopicDetail>
          <TopicDetail title="Kernel layer">
            The kernel schedules CPU work, isolates memory, provides drivers,
            enforces permissions, exposes filesystems, and handles network
            communication.
          </TopicDetail>
          <TopicDetail title="Service layer">
            Services such as SSH, web servers, databases, and container engines
            provide capabilities that other applications can use.
          </TopicDetail>
          <TopicDetail title="Application layer">
            Applications solve user or business problems while relying on the
            operating system instead of controlling hardware directly.
          </TopicDetail>
        </div>
      </TopicContentSection>

      <TopicContentSection number="14" title="A Practical Administration Workflow" tone="blue">
        <p>
          System administration is an ongoing operational cycle, not a single
          command. An administrator first identifies the intended service and
          its requirements, applies a controlled configuration, tests the
          result, monitors the system, records the change, and prepares a
          recovery plan.
        </p>
        <div className="topic-flow">
          {["Plan", "Configure", "Test", "Deploy", "Monitor", "Document", "Improve"].map((item, index) => (
            <span key={item}>{index > 0 && <b>→</b>}{item}</span>
          ))}
        </div>
        <div className="topic-detail-grid">
          <TopicDetail title="Plan and assess">
            Define the service, required ports, users, storage, dependencies,
            security controls, expected load, and recovery objective before
            changing a server.
          </TopicDetail>
          <TopicDetail title="Configure and validate">
            Apply the smallest required configuration, test it in a safe
            environment, check logs, and verify that only intended users can
            access the service.
          </TopicDetail>
          <TopicDetail title="Monitor and document">
            Record what changed, when it changed, who approved it, and how to
            undo it. Monitor health, capacity, errors, and security events.
          </TopicDetail>
          <TopicDetail title="Recover and improve">
            Backups, rollback procedures, spare capacity, and incident
            runbooks let the administrator restore service and improve the
            design after an outage.
          </TopicDetail>
        </div>
      </TopicContentSection>

      <TopicContentSection number="15" title="Networking Foundations for Administrators" tone="cyan">
        <p>
          Linux administration depends on networking because users, servers,
          databases, cloud resources, and monitoring systems communicate over
          networks. An administrator needs to understand addresses, names,
          routes, ports, and protocols before diagnosing a connection problem.
        </p>
        <div className="topic-detail-grid">
          <TopicDetail title="IP addressing">
            An IP address identifies an interface on a network. Subnets define
            which addresses are local, while a default gateway forwards traffic
            to other networks.
          </TopicDetail>
          <TopicDetail title="DNS">
            DNS translates names such as a service hostname into IP addresses.
            A website can be reachable by address but fail by name when DNS is
            misconfigured.
          </TopicDetail>
          <TopicDetail title="Ports and services">
            A server may run several services at once. Port numbers identify
            the destination service, while firewalls decide which connections
            are allowed.
          </TopicDetail>
          <TopicDetail title="SSH administration">
            SSH provides encrypted remote administration. Administrators should
            use strong authentication, protect keys, restrict access, and
            review login logs.
          </TopicDetail>
        </div>
        <pre className="topic-code-block">{`Client
  |
DNS name → IP address
  |
Firewall rules
  |
Service port
  |
Server application`}</pre>
      </TopicContentSection>

      <TopicContentSection number="16" title="Storage, Backups, and Reliability" tone="teal">
        <p>
          Storage administration is more than creating directories. It
          includes understanding capacity, ownership, permissions, filesystem
          health, performance, redundancy, and recovery. A system can be
          online but still be unhealthy if a filesystem is full or a disk is
          failing.
        </p>
        <div className="topic-detail-grid">
          <TopicDetail title="Capacity management">
            Administrators monitor free space, logs, temporary files, database
            growth, and application data before a full disk interrupts a
            service.
          </TopicDetail>
          <TopicDetail title="Backup strategy">
            Backups should be regular, protected from unauthorized access,
            tested by restoring data, and stored separately enough to survive a
            failure affecting the main system.
          </TopicDetail>
          <TopicDetail title="Reliability">
            Redundancy, health checks, service restart policies, monitoring,
            and documented recovery procedures reduce downtime.
          </TopicDetail>
          <TopicDetail title="Operational evidence">
            Logs, metrics, alerts, and change records help explain what
            happened during an incident and prevent repeated failures.
          </TopicDetail>
        </div>
      </TopicContentSection>

      <TopicContentSection number="17" title="Security Operations in Daily Administration" tone="purple">
        <p>
          Security is part of every administrative task. Creating an account,
          opening a firewall port, installing a package, exposing an API, or
          granting storage access changes the system's risk. Administrators
          should ask what is being protected, who needs access, how access is
          verified, and how suspicious activity will be detected.
        </p>
        <div className="topic-detail-grid">
          <TopicDetail title="Authentication">
            Verify identity with passwords, SSH keys, MFA, certificates, or
            other trusted factors. Remove unused accounts and rotate
            credentials according to policy.
          </TopicDetail>
          <TopicDetail title="Authorization">
            Separate identity from permission. A user may be authenticated
            successfully but still be denied access to an administrative
            operation.
          </TopicDetail>
          <TopicDetail title="Hardening">
            Disable unnecessary services, apply updates, restrict network
            exposure, protect secrets, use least privilege, and configure
            secure defaults.
          </TopicDetail>
          <TopicDetail title="Detection and response">
            Monitor logs and processes, investigate unusual activity, contain
            affected systems, preserve evidence, restore safely, and document
            lessons learned.
          </TopicDetail>
        </div>
        <pre className="topic-code-block">{`Prevent → Detect → Respond → Recover → Improve`}</pre>
      </TopicContentSection>

      <TopicContentSection number="18" title="Why This Foundation Matters" tone="orange">
        <p>
          A web application, database, cloud platform, or security tool still
          depends on operating-system services underneath it. When an
          application is slow, an administrator considers CPU, memory, disk,
          network, processes, permissions, dependencies, and logs rather than
          treating the application as an isolated object.
        </p>
        <p>
          This foundation also makes later technologies easier to understand.
          Containers use Linux isolation and resource controls. Cloud servers
          still need users, updates, networking, storage, monitoring, and
          security. DevOps depends on repeatable administration, and
          cybersecurity depends on knowing what normal system behavior looks
          like.
        </p>
        <div className="topic-detail-grid">
          <TopicDetail title="For support professionals">
            Operating-system knowledge helps explain user problems, software
            failures, permissions, connectivity, and device behavior.
          </TopicDetail>
          <TopicDetail title="For infrastructure professionals">
            Administration skills support reliable servers, networks, cloud
            platforms, deployment pipelines, and scalable services.
          </TopicDetail>
          <TopicDetail title="For security professionals">
            Understanding processes, users, files, services, logs, and network
            activity supports vulnerability analysis and incident response.
          </TopicDetail>
          <TopicDetail title="For engineers">
            Systems knowledge improves application performance, observability,
            deployment safety, automation, and architecture decisions.
          </TopicDetail>
        </div>
      </TopicContentSection>

      <section className="topic-takeaways">
        <span className="section-label">KEY TAKEAWAYS</span>
        <h2>Build the foundation for modern IT careers</h2>
        <p>
          An operating system manages computer hardware and software
          resources. The Linux kernel is the core of a Linux system. Linux
          system administration manages users, services, networks, storage,
          and security. Cybersecurity protects systems, networks, and data.
          Modern administration includes cloud computing, containers,
          automation, and Infrastructure as Code. Modern security emphasizes
          Zero Trust, MFA, least privilege, monitoring, and continuous
          updates. Linux remains important for servers, cloud computing,
          cybersecurity, containers, AI, and edge computing.
        </p>
        <p>
          This foundation supports careers as a Linux System Administrator,
          Network Administrator, Cloud Engineer, DevOps Engineer, Site
          Reliability Engineer, Cybersecurity Analyst, Security Engineer,
          Cloud Security Engineer, Infrastructure Engineer, and IT Support
          Specialist.
        </p>
      </section>
    </div>
  );
}


function MemoryManagementVirtualMemoryContent() {
  const sections = [
    ["01", "What Is Computer Memory?", "Memory temporarily stores data and instructions needed by running programs. The normal speed hierarchy is CPU cache, RAM, and persistent SSD/HDD storage.", "CPU cache → RAM → SSD/HDD"],
    ["02", "RAM", "Random Access Memory is the primary working memory used by the operating system and applications. Executable code and active data are loaded into RAM while programs run.", "free -h"],
    ["03", "Memory Management", "The operating system decides which processes receive memory, how much they can use, where data is mapped, how memory is shared, and what happens when RAM is limited.", "RAM: kernel + applications + cache"],
    ["04", "Physical Memory", "Physical memory is the actual RAM installed in a computer. Its capacity limits how much data can be held directly in memory at one time.", "lsmem"],
    ["05", "Virtual Memory", "Virtual memory gives each process the abstraction of a large private address space while the OS maps it to physical RAM or, when necessary, storage.", "virtual address → physical RAM"],
    ["06", "Virtual Address Space", "Each process normally receives its own virtual address space. This abstraction helps isolate applications so one process cannot simply access another process's memory.", "cat /proc/PID/maps"],
    ["07", "Memory Protection", "Memory protection prevents one application from modifying another application's memory, reducing crashes and security problems.", "process A ✕ process B"],
    ["08", "User Space and Kernel Space", "Normal applications run in user space. The Linux kernel, drivers, networking, filesystems, and memory manager run in privileged kernel space.", "user space → system call → kernel space"],
    ["09", "Kernel Memory", "The kernel needs protected memory for code, process management, drivers, networking, filesystems, and memory-management data structures.", "cat /proc/meminfo"],
    ["10", "Memory Pages", "Linux divides memory into fixed-size pages rather than one continuous block. A common page size is 4 KB, although larger mechanisms also exist.", "getconf PAGE_SIZE"],
    ["11", "Page Frames", "A page frame is a physical RAM block that can hold a virtual page after the OS establishes a mapping.", "virtual page → physical frame"],
    ["12", "Page Tables", "Page tables maintain mappings between virtual addresses and physical addresses. The CPU and kernel use them during address translation.", "virtual address → page table → physical address"],
    ["13", "Memory Management Unit", "The MMU is hardware that translates virtual addresses into physical addresses, making process isolation and virtual memory practical.", "CPU → MMU → RAM"],
    ["14", "Translation Lookaside Buffer", "The TLB caches recent virtual-to-physical translations. A TLB hit is fast; a miss requires page-table lookup.", "TLB hit → fast; miss → page table"],
    ["15", "Page Faults", "A page fault occurs when a process accesses a virtual page requiring OS handling. It may be normal demand loading, copy-on-write, storage access, or an invalid access.", "minor fault / major fault"],
    ["16", "Minor vs. Major Page Faults", "A minor fault can be resolved without disk I/O. A major fault requires relatively expensive storage I/O and can affect performance.", "major fault → storage I/O"],
    ["17", "Demand Paging", "Demand paging loads pages only when they are needed, reducing unnecessary memory use when a program starts.", "program starts → required pages loaded"],
    ["18", "Swapping", "Under memory pressure, Linux may move memory contents from RAM to swap. Storage is much slower than RAM, so heavy swapping hurts performance.", "RAM pressure → swap → storage"],
    ["19", "Swap Space", "Linux can use a swap partition or swap file. swapon --show and free -h show swap configuration and usage.", "swapon --show"],
    ["20", "Swap Is Not a Replacement for RAM", "Swap increases virtual capacity but cannot provide RAM performance. Adding swap is not equivalent to installing more physical memory.", "RAM: fast; swap: much slower"],
    ["21", "Swappiness", "The vm.swappiness setting influences how aggressively the kernel considers swapping. Workload and system configuration should guide changes; do not change it blindly.", "cat /proc/sys/vm/swappiness"],
    ["22", "Out-of-Memory Condition", "When the system cannot satisfy memory demand it reaches an OOM condition. The kernel may invoke the OOM killer to recover memory, which can disrupt services.", "memory pressure → OOM"],
    ["23", "OOM Killer", "The OOM mechanism selects processes using memory usage and scoring considerations. Administrators should investigate the root cause of application, database, or container termination.", "dmesg | grep -i oom"],
    ["24", "Copy-on-Write", "Copy-on-write lets processes initially share physical pages safely. A private copy is created only when a process modifies a shared page.", "shared page → write → private copy"],
    ["25", "fork() and Memory", "A forked child initially shares memory pages with its parent through copy-on-write. Only modified pages need to be copied.", "parent → fork() → child"],
    ["26", "Memory Allocation", "Programs request memory through language and runtime mechanisms. Functions such as malloc() and free() manage allocations, while the OS handles physical mappings.", "malloc() → use → free()"],
    ["27", "Memory Leaks", "A memory leak occurs when an application allocates memory but fails to release it. Usage can grow until performance degrades or the system becomes unstable.", "allocate → forget to release → growth"],
    ["28", "Buffer Overflow", "A buffer overflow writes beyond a buffer's intended boundary, causing crashes, corruption, or security vulnerabilities. Secure programming and platform defenses are important.", "bounded buffer → prevent overwrite"],
    ["29", "Address Space Layout Randomization", "ASLR randomizes memory locations so attackers cannot easily predict addresses used by code and data.", "fixed address → randomized address"],
    ["30", "NX / DEP", "Non-executable memory marks selected data regions as not executable. NX and DEP make it harder to run injected data as code.", "data page: read/write, not execute"],
    ["31", "Memory Protection and Security", "Memory isolation, ASLR, non-executable memory, process permissions, and kernel security features provide defense in depth rather than one complete protection.", "isolation + ASLR + NX + permissions"],
    ["32", "Shared Memory", "Processes can intentionally share memory for fast IPC. Shared regions require synchronization to prevent inconsistent or unsafe updates.", "process A ⇄ shared memory ⇄ process B"],
    ["33", "Memory-Mapped Files", "mmap() maps files into a process's virtual address space and is useful for file processing, databases, shared memory, and performance-sensitive applications.", "file → mmap() → address space"],
    ["34", "Page Cache", "Linux uses available RAM to cache file data so repeated reads can be faster than accessing storage each time.", "storage → page cache → application"],
    ["35", "Why Used Memory Can Look High", "Linux intentionally uses available RAM for applications, the kernel, and file cache. High used memory does not automatically mean a problem; available memory and pressure are more useful.", "used = applications + kernel + cache"],
    ["36", "free Command", "free -h summarizes total, used, free, available, and swap memory. Available memory is especially useful when evaluating pressure.", "free -h"],
    ["37", "/proc/meminfo", "The virtual /proc/meminfo file exposes detailed total, available, cached, swap, page, and kernel memory information.", "cat /proc/meminfo"],
    ["38", "/proc Filesystem", "The /proc filesystem exposes live process and kernel state. Numeric directories usually correspond to PIDs such as /proc/1.", "ls /proc"],
    ["39", "Process Memory", "Inspect process memory with ps, top, htop, and /proc/PID/status. Compare usage over time to identify growth and leaks.", "ps aux --sort=-%mem"],
    ["40", "Resident Set Size", "RSS is the portion of a process's memory currently held in physical RAM. Shared pages can make simple totals difficult to interpret.", "ps -o pid,rss,comm"],
    ["41", "Virtual Memory Size", "VSZ is the total virtual address space reserved or mapped by a process. It is not the same as physical RAM currently consumed.", "ps -o pid,vsz,rss,comm"],
    ["42", "Memory Pressure", "Memory pressure appears when available memory falls, reclaim increases, swapping grows, or applications experience allocation delays.", "vmstat 1"],
    ["43", "Memory Reclamation", "Linux reclaims page cache and other reclaimable memory, writes dirty pages, and may swap less-active pages when necessary.", "vmstat 1"],
    ["44", "Huge Pages", "Huge pages use larger memory pages to reduce page-table and TLB overhead for suitable workloads such as databases and high-performance applications.", "grep Huge /proc/meminfo"],
    ["45", "Transparent Huge Pages", "THP automatically attempts to use larger pages without requiring every application to manage them. Its effect depends on workload and configuration.", "cat /sys/kernel/mm/transparent_hugepage/enabled"],
    ["46", "NUMA", "Non-Uniform Memory Access systems have multiple memory nodes with different access costs. Placement and locality matter for large servers.", "numactl --hardware"],
    ["47", "Memory in Virtual Machines", "A hypervisor maps guest virtual memory to guest physical memory and host physical memory. Overcommit, ballooning, swapping, and host pressure affect guests.", "VM → guest memory → host memory"],
    ["48", "Memory Overcommit", "Memory overcommit allows promised virtual allocations to exceed immediately available physical RAM. It can improve utilization but increases OOM risk if demand arrives.", "promised memory > physical RAM"],
    ["49", "Memory in Containers", "Containers share the host kernel and use cgroups to limit memory. A container can still create pressure or be terminated when its limit is exceeded.", "container → cgroup memory limit"],
    ["50", "Docker Memory Limits", "Docker can set memory and swap limits so one container does not consume all host memory.", "docker run --memory 512m image"],
    ["51", "Kubernetes Requests and Limits", "Requests influence scheduling capacity; limits cap resource usage. Correct values improve placement, stability, and predictable behavior.", "request = plan; limit = cap"],
    ["52", "Memory Management for Databases", "Databases use memory for caches, indexes, connections, query work, and buffers. Administrators must balance database settings with OS and other-service needs.", "database cache + OS cache + workload"],
    ["53", "Memory Management for AI Systems", "AI workloads may need large CPU RAM, GPU memory, model weights, tensors, datasets, and distributed-memory coordination.", "model → tensors → CPU/GPU memory"],
    ["54", "Diagnosing Memory Problems", "Use free, top, htop, vmstat, ps, /proc/meminfo, dmesg, and service logs. Check usage, available memory, swap, faults, processes, and OOM events together.", "free → top → vmstat → logs"],
    ["55", "Common Memory Problems", "Memory leaks, insufficient RAM, excessive swap, OOM events, and poor application configuration are common causes of memory incidents.", "symptom → evidence → root cause"],
    ["56", "Best Practices", "Monitor regularly, interpret available memory, monitor swap, investigate leaks, configure containers, avoid blind optimization, and maintain backups and recovery procedures.", "measure → understand → change → verify"],
    ["57", "Modern Memory Trends", "Modern systems use memory compression, persistent memory, NUMA-aware workloads, containers, Kubernetes, cloud memory tiers, GPUs, and AI memory systems.", "RAM + compression + tiers + GPU"],
    ["58", "Key Commands", "Important commands include free -h, top, htop, vmstat, ps aux, swapon --show, /proc/meminfo, dmesg, numactl, and container resource commands.", "free -h | top | vmstat | ps aux"],
    ["59", "Important Security Concepts", "Memory isolation, ASLR, NX/DEP, permissions, sandboxing, container limits, and kernel security features help protect memory and reduce exploitation impact.", "isolation + randomization + limits"],
    ["60", "Key Takeaways", "The OS manages RAM, virtual memory, pages, mappings, faults, swap, cache, and reclamation. Monitoring and correct limits matter across servers, VMs, containers, databases, cloud infrastructure, and AI workloads.", "allocate → map → monitor → protect → recover"],
  ];

  return (
    <div className="topic-learning-scroll">
      <section className="topic-intro-panel">
        <div className="topic-intro-icon">08</div>
        <div>
          <span className="section-label">MEMORY MANAGEMENT</span>
          <h2>Memory Management and Virtual Memory</h2>
          <p>
            Understand how Linux manages RAM, virtual addresses, pages, swap,
            cache, process memory, containers, virtual machines, databases,
            cloud systems, and AI workloads.
          </p>
        </div>
      </section>

      <TopicVisualGallery />

      <InteractiveExample
        title="Trace a memory access"
        scenario="A process reads data through its virtual address space."
        steps={[
          "The CPU produces a virtual address and the TLB checks for a cached translation.",
          "On a miss, page tables and the MMU locate a physical page frame.",
          "If the page is unavailable, a page fault lets the kernel load, map, copy, or reject it.",
        ]}
        result="Virtual memory hides physical placement while page tables, the MMU, TLB, and page-fault handler coordinate safe access."
        visual={<div className="interactive-example__flow"><span>CPU address</span><b>→</b><span>TLB</span><b>→</b><span>MMU</span><b>→</b><span>Page frame</span></div>}
      />

      <InteractiveExample
        title="Read memory pressure"
        scenario="A server reports high memory usage. Decide what to inspect before changing anything."
        steps={[
          "Check available memory and swap with free -h; used memory may include useful page cache.",
          "Inspect processes with top, ps aux --sort=-%mem, and /proc/meminfo.",
          "Check vmstat, service logs, and dmesg for swapping, faults, reclaim, or OOM events.",
        ]}
        result="Measure pressure and identify the cause before adding swap, killing processes, or changing kernel settings."
        visual={<div className="interactive-example__meter"><span>Applications<br /><b>Process RSS</b></span><span>Kernel<br /><b>Reclaimable cache</b></span><span>Pressure<br /><b>Swap / OOM</b></span></div>}
      />

      <div className="topic-area-grid">
        {[
          ["Addressing", "Virtual addresses, pages, page tables, MMU, and TLB.", "⌁"],
          ["Pressure", "Swap, reclamation, page cache, and OOM behavior.", "▥"],
          ["Security", "Isolation, ASLR, NX/DEP, and protected memory.", "▣"],
          ["Modern workloads", "VMs, containers, Kubernetes, databases, and AI.", "◈"],
        ].map(([title, description, icon]) => (
          <article className="topic-area-card" key={title}>
            <span className="topic-area-icon">{icon}</span>
            <h3>{title}</h3>
            <p>{description}</p>
          </article>
        ))}
      </div>

      <TopicContentSection number="00" title="Memory management at a glance" tone="blue">
        <pre className="topic-code-block">{`Application
    |
Virtual address space
    |
Page tables + MMU + TLB
    |
Physical page frames / page cache
    |
RAM  ⇄  swap / storage
    |
Protection, monitoring, limits, recovery`}</pre>
      </TopicContentSection>

      <TopicContentSection number="01-60" title="Complete lecture coverage" tone="slate">
        <p>
          The following sections follow the supplied Topic 8 lecture from
          memory fundamentals and address translation through swap, security,
          monitoring, virtualization, containers, Kubernetes, databases, AI,
          diagnosis, best practices, and key takeaways.
        </p>
      </TopicContentSection>

      {sections.map(([number, title, content, command], index) => (
        <TopicContentSection
          key={number}
          number={number}
          title={title}
          tone={["blue", "cyan", "teal", "indigo", "purple", "slate", "orange"][index % 7]}
        >
          <p>{content}</p>
          <div className="topic-command-row"><code>{command}</code></div>
        </TopicContentSection>
      ))}
    </div>
  );
}

function MemoryManagementContent() {
  const sections = [
    {
      number: "01",
      title: "What Is Computer Memory?",
      tone: "blue",
      content: (
        <>
          <p>
            Memory stores the data and instructions needed by the processor.
            The most important type for an operating system is RAM (Random
            Access Memory).
          </p>
          <p>
            RAM temporarily stores running programs, operating system
            components, application data, process information, and cached
            files. RAM is much faster than traditional storage devices such as
            hard drives, but it is usually limited in capacity.
          </p>
          <pre className="topic-code-block">{`Computer Memory (RAM)

├── Operating System
├── Web Browser
├── Python Application
├── Database Service
├── Background Services
└── File Cache`}</pre>
        </>
      ),
    },
    {
      number: "02",
      title: "The Role of the Operating System in Memory Management",
      tone: "cyan",
      content: (
        <>
          <p>
            The operating system acts as a memory manager. Its major
            responsibilities are memory allocation, memory deallocation,
            memory protection, virtual memory management, memory sharing, and
            memory optimization.
          </p>
          <pre className="topic-code-block">{`Applications
     ↓
Operating System Memory Manager
     ↓
Physical Memory (RAM)`}</pre>
          <p>Applications normally do not directly control physical RAM.</p>
        </>
      ),
    },
    {
      number: "03",
      title: "Memory Allocation and Deallocation",
      tone: "teal",
      content: (
        <>
          <p>
            When a program starts, it requests memory and the operating system
            allocates it so the program can execute. Different programs
            require different amounts: a terminal generally uses little, a
            text editor uses low to medium memory, a web browser uses medium to
            high memory, a database server uses high memory, and a virtual
            machine can use high memory.
          </p>
          <pre className="topic-code-block">{`Program Starts → Requests Memory → Operating System
→ Memory Allocated → Program Executes

Application Closes → Operating System → Memory Released
→ Memory Available for Other Processes`}</pre>
          <p>
            Proper deallocation prevents unnecessary memory usage and makes
            memory available for other processes.
          </p>
        </>
      ),
    },
    {
      number: "04",
      title: "Physical Memory",
      tone: "indigo",
      content: (
        <>
          <p>
            Physical memory is the actual RAM installed in a computer. The
            operating system manages how this memory is shared among
            processes. Actual usage changes constantly as applications and
            services run.
          </p>
          <pre className="topic-code-block">{`16 GB RAM

├── Operating System — 2 GB
├── Browser — 4 GB
├── Applications — 3 GB
├── Services — 2 GB
└── Available / Cache — 5 GB`}</pre>
        </>
      ),
    },
    {
      number: "05",
      title: "Virtual Memory and Virtual Address Space",
      tone: "blue",
      content: (
        <>
          <p>
            Virtual memory allows each process to operate as if it has its own
            memory space. Applications use virtual addresses rather than
            directly accessing physical RAM. This improves security, stability,
            multitasking, and memory isolation.
          </p>
          <pre className="topic-code-block">{`Application → Virtual Address
→ Operating System + CPU Memory Management
→ Physical Memory Address → RAM`}</pre>
          <p>
            Each process normally has its own virtual address space containing
            code, data, heap, and stack. Process A should not normally access
            Process B's protected memory.
          </p>
        </>
      ),
    },
    {
      number: "06",
      title: "Memory Protection",
      tone: "purple",
      content: (
        <>
          <p>
            Memory protection prevents programs from accessing memory that they
            are not authorized to access. The operating system and CPU enforce
            memory boundaries. Without protection, one faulty application could
            modify another program, corrupt the operating system, or cause
            system crashes.
          </p>
          <p>
            Modern systems use hardware-supported memory protection so multiple
            programs can run safely at the same time.
          </p>
        </>
      ),
    },
    {
      number: "07",
      title: "Memory Segments",
      tone: "teal",
      content: (
        <>
          <p>A process commonly contains several memory regions:</p>
          <div className="topic-detail-grid">
            <TopicDetail title="Code segment">Contains the instructions of the program.</TopicDetail>
            <TopicDetail title="Data segment">Stores initialized global and static variables.</TopicDetail>
            <TopicDetail title="Heap">Stores dynamically allocated objects, lists, arrays, and data structures.</TopicDetail>
            <TopicDetail title="Stack">Stores function calls, local variables, and return addresses.</TopicDetail>
          </div>
          <pre className="topic-code-block">{`High Address
─────────────
Stack     ↓
Free Memory
     ↑
Heap
─────────────
Data
─────────────
Code
Low Address`}</pre>
        </>
      ),
    },
    {
      number: "08",
      title: "Paging, Page Tables, MMU, and TLB",
      tone: "cyan",
      content: (
        <>
          <p>
            Paging divides memory into fixed-size blocks. Virtual memory uses
            pages and physical memory uses frames. Pages do not need to be
            stored continuously in physical memory.
          </p>
          <pre className="topic-code-block">{`Virtual Memory                 Physical RAM
Page 1                          Frame 8
Page 2              →           Frame 2
Page 3                          Frame 15
Page 4                          Frame 6`}</pre>
          <p>
            Page tables map virtual addresses to physical addresses. The MMU
            (Memory Management Unit) helps translate those addresses. The TLB
            (Translation Lookaside Buffer) is a small, fast cache of recently
            used translations; a TLB hit provides fast translation, while a
            miss requires checking the page table.
          </p>
        </>
      ),
    },
    {
      number: "09",
      title: "Page Faults and Swap Space",
      tone: "orange",
      content: (
        <>
          <p>
            A page fault occurs when a process accesses a memory page that is
            not currently available in physical RAM. The operating system
            handles the request and loads the page. Page faults are not always
            errors, but excessive page faults can reduce performance.
          </p>
          <p>
            Linux can use storage as an extension of memory. This is swap
            space, configured as a swap partition or swap file. Swap is useful
            when RAM is limited, but storage is slower than RAM.
          </p>
          <pre className="topic-code-block">{`RAM → Memory Becomes Limited → Operating System
→ Moves Some Memory Pages → Swap Space on Storage`}</pre>
        </>
      ),
    },
    {
      number: "10",
      title: "Swap, Swappiness, and Fragmentation",
      tone: "slate",
      content: (
        <>
          <p>
            A small amount of swap is not necessarily a problem. Heavy
            swapping increases storage activity and can make the system slow.
            Linux's <code>vm.swappiness</code> setting influences the kernel's
            tendency to move pages toward swap under memory pressure.
          </p>
          <pre className="topic-code-block">{`cat /proc/sys/vm/swappiness`}</pre>
          <p>
            Swappiness should not be changed blindly. Appropriate settings
            depend on workload, available RAM, storage performance, and system
            requirements.
          </p>
          <p>
            Fragmentation occurs when available memory becomes divided into
            separate areas. Modern operating systems use advanced strategies
            to manage its effects.
          </p>
        </>
      ),
    },
    {
      number: "11",
      title: "Memory Sharing and Copy-on-Write",
      tone: "blue",
      content: (
        <>
          <p>
            Multiple programs may use the same shared library instead of
            loading separate copies. This can reduce memory usage.
          </p>
          <pre className="topic-code-block">{`Program A ──┐
Program B ──┼── Shared Library in Memory
Program C ──┘`}</pre>
          <p>
            With Copy-on-Write (COW), processes initially share memory. A copy
            is created only when one process modifies shared data. COW is
            important in process creation, virtualization, containers, and
            modern file systems.
          </p>
        </>
      ),
    },
    {
      number: "12",
      title: "Linux Memory Management and Page Cache",
      tone: "teal",
      content: (
        <>
          <p>
            Linux manages virtual memory, pages, page cache, swap, memory
            allocation, memory reclamation, and out-of-memory handling. The
            kernel continuously manages memory based on system activity.
          </p>
          <p>
            The page cache stores frequently accessed file data in memory. When
            the same data is requested again, it may be served from RAM rather
            than slower storage.
          </p>
          <pre className="topic-code-block">{`Storage Device → File Read → Linux Page Cache → Application`}</pre>
          <p>
            Unused RAM is not always wasted RAM. Linux may use available RAM
            for caching and reclaim it when applications need more memory.
            High memory usage alone does not automatically mean the system has
            a memory problem.
          </p>
        </>
      ),
    },
    {
      number: "13",
      title: "Checking Memory Usage in Linux",
      tone: "cyan",
      content: (
        <>
          <p>
            Administrators should analyze available memory, swap activity,
            memory pressure, and application behavior rather than relying on
            only one number.
          </p>
          <div className="topic-command-row">
            <code>free -h</code>
            <code>cat /proc/meminfo</code>
            <code>top</code>
            <code>htop</code>
          </div>
          <p>
            <code>free -h</code> reports total, used, available, and swap
            memory in human-readable form. <code>top</code> shows real-time
            CPU, memory, and process information. <code>htop</code> provides
            an interactive view of resources and processes.
          </p>
        </>
      ),
    },
    {
      number: "14",
      title: "Out-of-Memory Conditions and the OOM Killer",
      tone: "red",
      content: (
        <>
          <p>
            An out-of-memory condition can occur when applications require
            more memory than the system can provide. Linux may reclaim memory,
            use swap, and, if memory is still insufficient, invoke the OOM
            Killer as a last-resort mechanism.
          </p>
          <pre className="topic-code-block">{`Applications Require Memory → RAM Becomes Exhausted
→ Memory Reclamation → Swap Usage
→ Still Not Enough Memory → Out-of-Memory Condition`}</pre>
          <p>
            The kernel evaluates processes during severe exhaustion and may
            terminate one or more. Administrators can investigate OOM events
            using <code>journalctl</code> or kernel messages. Causes may
            include insufficient RAM, memory leaks, misconfigured applications,
            or excessive workload.
          </p>
        </>
      ),
    },
    {
      number: "15",
      title: "Memory Leaks and Multitasking",
      tone: "purple",
      content: (
        <>
          <p>
            A memory leak occurs when a program continuously allocates memory
            but does not release memory that is no longer needed. Growing
            memory usage can cause slow performance, excessive swap usage,
            application crashes, and OOM events.
          </p>
          <pre className="topic-code-block">{`Application Starts → Uses 500 MB → Uses 1 GB
→ Uses 2 GB → Uses 4 GB`}</pre>
          <p>
            Memory management makes multitasking possible by allowing the
            operating system, browser, terminal, code editor, database, and
            background services to share RAM.
          </p>
        </>
      ),
    },
    {
      number: "16",
      title: "Memory Management and Security",
      tone: "indigo",
      content: (
        <>
          <p>
            Memory management is important for cybersecurity. Memory protection
            helps prevent processes from accessing protected areas.
          </p>
          <div className="topic-detail-grid">
            <TopicDetail title="ASLR">Address Space Layout Randomization changes certain memory locations between executions.</TopicDetail>
            <TopicDetail title="NX and non-executable memory">Some memory regions can be marked non-executable to help prevent data from being directly executed as instructions.</TopicDetail>
            <TopicDetail title="Privilege separation">Separating privileges limits what a process can do.</TopicDetail>
            <TopicDetail title="W^X and DEP">These are memory-protection approaches associated with defense against certain memory-based attacks.</TopicDetail>
          </div>
        </>
      ),
    },
    {
      number: "17",
      title: "Memory Management in Virtual Machines",
      tone: "blue",
      content: (
        <>
          <p>
            Virtual machines require memory management. A hypervisor manages
            hardware resources for virtual machines, so memory must be planned
            carefully to avoid over-allocation, performance problems, and
            excessive swapping.
          </p>
          <pre className="topic-code-block">{`Physical Server
      │
      ├── Virtual Machine 1 — 4 GB RAM
      ├── Virtual Machine 2 — 8 GB RAM
      └── Virtual Machine 3 — 2 GB RAM`}</pre>
        </>
      ),
    },
    {
      number: "18",
      title: "Memory Management and Containers",
      tone: "cyan",
      content: (
        <>
          <p>
            Containers share the host operating system kernel. Linux uses
            cgroups and namespaces, and cgroups can help control memory usage.
            Memory limits help prevent one container from consuming all
            available system memory.
          </p>
          <pre className="topic-code-block">{`Host System
├── Container A — Memory Limit
├── Container B — Memory Limit
└── Container C — Memory Limit`}</pre>
          <p>This is important in Docker, Podman, and Kubernetes.</p>
        </>
      ),
    },
    {
      number: "19",
      title: "Memory Management in Kubernetes",
      tone: "teal",
      content: (
        <>
          <p>
            Kubernetes manages applications running in containers.
            Administrators can define memory requests and memory limits.
            Proper resource configuration improves stability, scheduling, and
            performance.
          </p>
          <pre className="topic-code-block">{`Application → Container → Memory Request / Limit → Kubernetes`}</pre>
          <p>
            Improper configuration can cause applications to experience memory
            pressure or termination.
          </p>
        </>
      ),
    },
    {
      number: "20",
      title: "Modern Memory Technologies and AI Systems",
      tone: "orange",
      content: (
        <>
          <p>
            Modern systems use DDR4 and DDR5 memory for improvements in
            capacity and bandwidth. High Bandwidth Memory (HBM) is important in
            some high-performance computing and AI environments. GPU memory is
            important for gaming, scientific computing, machine learning, and
            artificial intelligence.
          </p>
          <p>
            AI applications may use training data, AI models, neural network
            parameters, CPU RAM, GPU memory, and high-speed storage.
          </p>
          <pre className="topic-code-block">{`CPU RAM
    +
GPU Memory
    +
High-Speed Storage`}</pre>
          <p>
            Administrators working with AI infrastructure need to understand
            RAM capacity, GPU memory, memory bandwidth, and resource
            monitoring.
          </p>
        </>
      ),
    },
    {
      number: "21",
      title: "Memory Monitoring and Observability",
      tone: "slate",
      content: (
        <>
          <p>
            Modern infrastructure monitors memory usage, available memory,
            swap activity, memory pressure, application memory usage, and
            container memory limits.
          </p>
          <p>
            Observability platforms combine metrics, logs, traces, and alerts.
            This helps administrators identify problems before they affect
            users.
          </p>
        </>
      ),
    },
    {
      number: "22",
      title: "Best Practices for Memory Management",
      tone: "green",
      content: (
        <>
          <p>System administrators should:</p>
          <ul className="topic-bullet-list">
            <li>Monitor memory usage with <code>free -h</code>, <code>top</code>, and <code>htop</code>.</li>
            <li>Monitor swap activity and interpret it together with workload.</li>
            <li>Investigate applications whose memory usage continuously increases.</li>
            <li>Configure resource limits for containers and applications.</li>
            <li>Plan hardware capacity for the operating system, applications, databases, services, and expected workload.</li>
            <li>Test major memory-related configuration changes before production.</li>
          </ul>
        </>
      ),
    },
    {
      number: "23",
      title: "Modern Updates and Future Relevance",
      tone: "blue",
      content: (
        <>
          <p>
            Memory management remains important as workloads become more
            complex. Cloud servers can allocate memory dynamically based on
            workloads. Containers increasingly run with memory limits and
            resource controls. AI systems require increasing amounts of RAM,
            GPU memory, and memory bandwidth.
          </p>
          <p>
            Edge devices often have limited memory, so operating systems must
            efficiently manage available resources. Modern computing also
            balances performance, memory usage, and power consumption.
          </p>
        </>
      ),
    },
    {
      number: "24",
      title: "Why Memory Management Is Important",
      tone: "purple",
      content: (
        <>
          <p>
            Memory management affects system performance, application
            stability, multitasking, security, cloud infrastructure, virtual
            machines, containers, and AI workloads.
          </p>
          <p>
            Poor memory management can result in slow systems, application
            crashes, excessive swapping, OOM events, and service interruptions.
          </p>
        </>
      ),
    },
    {
      number: "25",
      title: "Key Takeaways",
      tone: "teal",
      content: (
        <ul className="topic-bullet-list">
          <li>Memory management controls how RAM is allocated and used.</li>
          <li>The operating system allocates and releases memory for processes.</li>
          <li>Virtual memory provides processes with isolated memory spaces.</li>
          <li>Paging maps virtual memory to physical memory.</li>
          <li>The MMU translates virtual addresses into physical addresses.</li>
          <li>The TLB speeds up address translation.</li>
          <li>Swap can extend available memory but is slower than RAM.</li>
          <li>High Linux memory usage does not automatically mean a problem because memory may be used for caching.</li>
          <li>The page cache improves filesystem performance.</li>
          <li>Severe exhaustion can trigger the Linux OOM Killer.</li>
          <li>Modern systems use cgroups and container memory limits.</li>
          <li>Memory management is critical for virtualization, cloud computing, containers, cybersecurity, and AI infrastructure.</li>
        </ul>
      ),
    },
  ];

  return (
    <div className="topic-learning-scroll">
      <div className="topic-learning-intro">
        <span className="section-label">TOPIC 04 / MEMORY</span>
        <h2>Memory Management</h2>
        <p>
          Learn how the operating system manages RAM and memory resources for
          efficient, safe, and stable computing.
        </p>
      </div>
      <section className="topic-visual-gallery" aria-label="Memory management illustrations">
        <article className="topic-visual-card">
          <svg viewBox="0 0 360 190" role="img" aria-label="Virtual memory address translation">
            <rect x="20" y="25" width="90" height="52" rx="10" fill="#dbeafe" />
            <text x="65" y="55" textAnchor="middle" fill="#1e3a8a">Virtual</text>
            <text x="65" y="69" textAnchor="middle" fill="#1e3a8a">Address</text>
            <path d="M115 51h55" stroke="#2563eb" strokeWidth="3" markerEnd="url(#memory-arrow)" />
            <rect x="175" y="25" width="90" height="52" rx="10" fill="#ccfbf1" />
            <text x="220" y="55" textAnchor="middle" fill="#115e59">MMU</text>
            <text x="220" y="69" textAnchor="middle" fill="#115e59">Page Table</text>
            <path d="M270 51h55" stroke="#0f766e" strokeWidth="3" markerEnd="url(#memory-arrow)" />
            <rect x="135" y="112" width="90" height="52" rx="10" fill="#ede9fe" />
            <text x="180" y="142" textAnchor="middle" fill="#5b21b6">Physical</text>
            <text x="180" y="156" textAnchor="middle" fill="#5b21b6">RAM</text>
            <path d="M310 78v45h-80" fill="none" stroke="#4f46e5" strokeWidth="3" markerEnd="url(#memory-arrow)" />
            <defs>
              <marker id="memory-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
              </marker>
            </defs>
          </svg>
          <h3>Virtual address translation</h3>
          <p>Pages and page tables connect a process's virtual address to physical RAM.</p>
        </article>
        <article className="topic-visual-card">
          <svg viewBox="0 0 360 190" role="img" aria-label="Memory pressure and swap graph">
            <line x1="52" y1="145" x2="330" y2="145" stroke="#94a3b8" />
            <line x1="52" y1="30" x2="52" y2="145" stroke="#94a3b8" />
            <text x="190" y="174" textAnchor="middle" fill="#64748b">Memory pressure</text>
            <text x="18" y="90" textAnchor="middle" fill="#64748b" transform="rotate(-90 18 90)">Usage</text>
            <path d="M58 130 C115 124 132 108 165 102 S220 70 250 57 S298 40 324 34" fill="none" stroke="#2563eb" strokeWidth="5" />
            <path d="M58 142 C145 141 185 137 216 125 S275 91 324 55" fill="none" stroke="#ea580c" strokeWidth="5" />
            <text x="72" y="42" fill="#2563eb">RAM demand</text>
            <text x="72" y="58" fill="#ea580c">Swap activity</text>
          </svg>
          <h3>Memory pressure</h3>
          <p>As demand grows, swap activity can increase and system performance can decline.</p>
        </article>
        <article className="topic-visual-card">
          <svg viewBox="0 0 360 190" role="img" aria-label="Container memory limits">
            <rect x="35" y="25" width="290" height="135" rx="14" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="2" />
            <text x="180" y="48" textAnchor="middle" fill="#334155">Host System</text>
            <rect x="55" y="70" width="75" height="65" rx="8" fill="#dbeafe" />
            <rect x="142" y="70" width="75" height="65" rx="8" fill="#ccfbf1" />
            <rect x="229" y="70" width="75" height="65" rx="8" fill="#ede9fe" />
            <text x="92" y="98" textAnchor="middle" fill="#1e3a8a">Container A</text>
            <text x="92" y="116" textAnchor="middle" fill="#1e3a8a">Limit</text>
            <text x="180" y="98" textAnchor="middle" fill="#115e59">Container B</text>
            <text x="180" y="116" textAnchor="middle" fill="#115e59">Limit</text>
            <text x="267" y="98" textAnchor="middle" fill="#5b21b6">Container C</text>
            <text x="267" y="116" textAnchor="middle" fill="#5b21b6">Limit</text>
          </svg>
          <h3>Container memory limits</h3>
          <p>Cgroups can help prevent one container from consuming all available memory.</p>
        </article>
      </section>
      <InteractiveExample
        title="See memory pressure build"
        scenario="Imagine a browser, database, and several services sharing limited RAM."
        steps={[
          "Applications request memory while the operating system tracks each process.",
          "Available memory falls and the kernel reclaims caches or uses swap.",
          "If demand remains too high, the system may reach an out-of-memory condition.",
        ]}
        result="Available memory, swap activity, and application behavior together explain whether high memory use is a real problem."
        visual={<div className="interactive-example__meter"><span style={{ width: "38%" }}>RAM available</span><span style={{ width: "72%" }}>Memory demand</span><span style={{ width: "90%" }}>Swap pressure</span></div>}
      />
      {sections.map((section) => (
        <TopicContentSection
          key={section.number}
          number={section.number}
          title={section.title}
          tone={section.tone}
        >
          {section.content}
        </TopicContentSection>
      ))}
    </div>
  );
}

function OperatingSystemSecurityContent() {
  const sections = [
    ["Meaning of operating-system security", "An operating system controls users, applications, files, memory, CPU, networks, storage, and hardware. Security therefore protects the entire chain from unauthorized access, misuse, modification, and disruption. It is a combination of secure configuration, access management, authentication, authorization, updates, service hardening, monitoring, backups, and incident response."],
    ["The CIA triad", "Confidentiality restricts information to authorized users through permissions, authentication, and encryption. Integrity keeps data accurate through access control, hashing, digital signatures, and file-integrity monitoring. Availability keeps services usable through backups, redundancy, monitoring, and disaster recovery."],
    ["AAA security model", "Authentication answers 'Who are you?' Authorization answers 'What are you allowed to do?' Accounting records actions such as logins, configuration changes, file access, and privilege use. Together these controls connect identity, permissions, and evidence."],
    ["Least privilege", "Users and applications should receive only the permissions necessary for their tasks. This limits the damage caused by human mistakes, compromised accounts, malware, and vulnerable applications. Avoid the unsafe default of making every user an administrator."],
    ["Linux identities and root", "Linux accounts have a username, UID, home directory, primary group, shell, and authentication credentials. /etc/passwd contains account metadata, /etc/shadow protects password hashes, and /etc/group defines groups. The root user has extensive power and should be carefully controlled."],
    ["sudo and administrative policy", "sudo provides controlled temporary privilege elevation, such as sudo apt update. Sudoers policy should be edited with visudo and should grant only required commands or roles. Logging administrative actions supports accountability and investigation."],
    ["Linux permissions and ownership", "Permissions apply to user/owner, group, and others. Read, write, and execute are represented by r, w, and x with values 4, 2, and 1. chmod changes permissions, chown changes ownership, and ACL tools provide more precise rules when owner/group/others are not enough."],
    ["Special permissions and access control", "SUID runs a program with the owner's identity, SGID can preserve group ownership or group execution context, and the sticky bit protects files in shared directories such as /tmp. These features are useful but should be audited because incorrect settings can create privilege-escalation risks."],
    ["DAC, MAC, SELinux, and AppArmor", "Traditional Linux permissions are discretionary access control because owners and administrators control access. Mandatory access control adds system-enforced policies. SELinux uses labels and policies, while AppArmor uses application profiles; both provide an additional security layer."],
    ["Passwords, MFA, and SSH", "Use long, unique passphrases, secure password storage, SSH keys, security keys, and multi-factor authentication where available. SSH commonly uses /etc/ssh/sshd_config. Restrict administrative login, monitor failures, and test configuration changes in a second session before ending the current connection."],
    ["Firewalls and attack-surface reduction", "nftables, iptables, UFW, and firewalld can restrict network traffic. Allow only necessary ports such as SSH, HTTP, or HTTPS. Remove unused packages, accounts, services, and listeners because every exposed component is a possible attack surface."],
    ["Updates, Secure Boot, and hardening", "Patch management follows identify, review, test, deploy, verify, and monitor. Secure Boot helps verify trusted startup components. Hardening removes unnecessary software, disables unused services, applies secure defaults, protects firmware, and keeps rollback plans available."],
    ["Logging, monitoring, and file integrity", "Review failed logins, unusual processes, service failures, network activity, privilege changes, and system errors. systemd-journald and journalctl provide common Linux logging. Important files such as /etc/passwd, /etc/shadow, and /etc/ssh/sshd_config should be protected and monitored for unexpected changes."],
    ["Malware, isolation, and sandboxing", "Linux can be affected by malware, rootkits, cryptominers, web shells, and malicious scripts. Process isolation, memory protection, namespaces, and sandboxing limit access between applications. Trust software sources, patch systems, monitor processes, and limit privileges."],
    ["Containers and image security", "Containers share the host kernel and are not automatically a complete security boundary. Use trusted and minimal images, scan dependencies, update images, run as a non-root user, set resource limits, protect secrets, and avoid placing credentials in images or logs."],
    ["Backup security and ransomware", "Use backups for hardware failure, accidental deletion, ransomware, and incidents. The 3-2-1 strategy keeps three copies on two storage types with one copy stored separately. Protect backup access and test restoration regularly; a backup that cannot be restored is not a recovery plan."],
    ["Incident response and recovery", "A practical incident process is detection, analysis, containment, eradication, recovery, and lessons learned. Preserve evidence, isolate affected systems carefully, rotate exposed credentials, restore from trusted backups, and document improvements for the next event."],
    ["Cloud, virtual machines, and Zero Trust", "Cloud and VM environments still need updates, strong identity, network isolation, protected storage, secure snapshots, and monitoring. Zero Trust means never automatically trust: verify identity and context continuously, then apply least privilege to every request."],
    ["Supply chain, SBOM, and vulnerabilities", "Applications depend on packages and libraries that can introduce risk. Trusted repositories, package verification, dependency scanning, software inventories, and SBOMs help identify affected components. Vulnerability management identifies, assesses, prioritizes, mitigates, verifies, and monitors risk."],
    ["Security automation and AI", "Automation can apply updates, scan configurations, analyze logs, and check compliance, but changes must be reviewed because one incorrect rule can affect many systems. AI can help with anomaly detection and analysis while introducing data-protection, model-security, access-control, and AI-generated attack concerns."],
  ];

  const lectureSections = [
    ["21", "Service management", "Modern Linux systems commonly use systemd. Administrators should review running services, start or stop services when required, and disable unnecessary services. Disabling unused services reduces exposure and supports attack-surface reduction.", "systemctl status service_name", "teal"],
    ["22", "Logging", "Logs record user logins, service failures, system errors, and security events. systemd-journald is commonly used on modern Linux systems, and journalctl provides a command-line view of those records.", "journalctl", "blue"],
    ["23", "Security monitoring", "Administrators should monitor failed login attempts, unusual processes, system errors, network activity, disk changes, and privilege-escalation attempts. Monitoring helps identify potential problems early.", "journalctl -p warning", "cyan"],
    ["24", "Log management", "Logs need storage, rotation, retention, and sometimes centralized collection. Centralized logs improve security analysis, troubleshooting, and incident investigation.", "journalctl --disk-usage", "indigo"],
    ["25", "File integrity monitoring", "File integrity monitoring checks whether important files have changed. /etc/passwd, /etc/shadow, and /etc/ssh/sshd_config are examples of files that deserve protection and review.", "sha256sum /etc/ssh/sshd_config", "purple"],
    ["26", "Malware protection", "Linux can be affected by malware, rootkits, cryptominers, web shells, and malicious scripts. Use trusted software, apply updates, limit privileges, monitor processes, and use appropriate security tools.", "ps aux --sort=-%cpu", "orange"],
    ["27", "Process isolation", "Operating systems isolate processes using memory boundaries, user privileges, namespaces, and sandboxing. Isolation helps prevent one application from directly accessing another application's protected resources.", "ps -ef", "teal"],
    ["28", "Application sandboxing", "Sandboxing restricts an application from accessing selected files, devices, or network resources. It provides a limited execution environment and reduces the impact of a compromised application.", "systemd-analyze security service_name", "blue"],
    ["29", "Containers and security", "Containers provide application isolation but are not automatically a complete security boundary. Secure containers with minimal images, regular updates, non-root users, resource limits, and secrets management.", "docker inspect container_name", "cyan"],
    ["30", "Container image security", "Container images should be trusted, current, scanned, and as small as practical. Removing unnecessary software reduces the image's potential attack surface.", "docker image ls", "indigo"],
    ["31", "Secrets management", "API keys, database passwords, authentication tokens, and encryption keys are secrets. Do not place them in public repositories, source code, or logs; use a dedicated secrets-management mechanism.", "printenv | grep -i secret", "purple"],
    ["32", "Backup security", "Backups support recovery from system failures, hardware failures, accidental deletion, ransomware, and security incidents. Backup access must be protected and restoration must be tested.", "restore test", "orange"],
    ["33", "The 3-2-1 backup strategy", "Keep three copies of data, on two different storage types, with one copy stored separately. Organizations may extend this strategy for stronger resilience and isolation.", "3 copies → 2 media types → 1 separate copy", "teal"],
    ["34", "Ransomware protection", "Ransomware can encrypt or disrupt data. Offline or protected backups, least privilege, patch management, network segmentation, and monitoring help reduce its impact.", "backup verification", "blue"],
    ["35", "Incident response", "A structured incident process includes detection, analysis, containment, eradication, recovery, and lessons learned. Documented procedures reduce confusion during a security event.", "detect → analyze → contain → recover", "cyan"],
    ["36", "System hardening", "Hardening reduces unnecessary risk by removing software, disabling unused services, applying updates, using strong authentication, configuring firewalls, and limiting privileges.", "systemctl list-unit-files", "indigo"],
    ["37", "Security baselines", "A security baseline defines the minimum required configuration for passwords, firewalls, updates, logging, and user access. Baselines improve consistency across systems.", "baseline → configure → verify", "purple"],
    ["38", "Zero Trust principles", "Zero Trust follows the principle never automatically trust and always verify. Strong identity verification, least privilege, continuous verification, and monitoring are especially important in cloud and remote environments.", "verify every request", "orange"],
    ["39", "Cloud security", "Cloud servers still require operating-system updates, secure accounts, protected network access, secure storage, secrets management, and application security. Responsibilities are divided according to the cloud service model.", "identity → network → storage → workload", "teal"],
    ["40", "Shared responsibility model", "The provider and customer share security responsibilities. The division changes between infrastructure, platform, and software services, so administrators must understand which controls they operate.", "provider controls + customer controls", "blue"],
    ["41", "Virtual-machine security", "Virtual machines need updates, strong authentication, network isolation, resource monitoring, and secure snapshots. Security must exist at the physical server, hypervisor, guest operating system, and application layers.", "hardware → hypervisor → VM → application", "cyan"],
    ["42", "Modern threat landscape", "Linux systems face credential attacks, vulnerability exploitation, malware, ransomware, cryptomining, misconfigured cloud services, and supply-chain attacks. Administrators must continuously update their knowledge.", "identify → prioritize → reduce exposure", "indigo"],
    ["43", "Software supply-chain security", "Applications depend on external libraries and packages. Dependency scanning, software inventories, package verification, and secure repositories help reduce the risk of compromised components.", "application → libraries → packages → repositories", "purple"],
    ["44", "SBOM: Software Bill of Materials", "An SBOM lists the components and dependencies used by an application. It helps organizations identify affected software when a vulnerability is discovered.", "application → library A → package B", "orange"],
    ["45", "Vulnerability management", "Vulnerability management identifies, assesses, prioritizes, patches or mitigates, verifies, and monitors vulnerabilities. Severity, exploitability, exposure, and business impact all influence priority.", "identify → assess → prioritize → patch → verify", "teal"],
    ["46", "Security automation", "Automation supports updates, configuration management, scanning, monitoring, and compliance checks. Automated changes still require review because an incorrect configuration can spread quickly.", "scan → review → automate → verify", "blue"],
    ["47", "Artificial intelligence and security", "AI can support log analysis, threat detection, anomaly detection, and security automation. AI infrastructure also introduces data-protection, model-security, unauthorized-access, and AI-generated-attack concerns.", "events → analysis → human validation", "cyan"],
    ["48", "Security best practice: updates", "Keep systems and applications patched. Regular security updates reduce exposure to known vulnerabilities, but production changes should be tested and monitored.", "sudo apt update && sudo apt upgrade", "indigo"],
    ["49", "Security best practice: least privilege", "Give users, services, and applications only the access they require. Review privileges regularly and remove permissions that are no longer needed.", "required access only", "purple"],
    ["50", "Security best practice: administrative access", "Protect root and sudo access. Prefer controlled elevation, strong authentication, MFA, secure SSH keys, and auditable administrative actions.", "sudo -l", "orange"],
    ["51", "Security best practice: network controls", "Configure firewalls to allow only required traffic, disable unused services, close unnecessary ports, and monitor network activity.", "sudo ufw status", "teal"],
    ["52", "Security best practice: monitoring", "Review logs, suspicious processes, file changes, failed authentication, service failures, and privilege changes. Monitoring turns security controls into detectable evidence.", "journalctl -p warning", "blue"],
    ["53", "Security best practice: backups", "Create protected backups and prepare for failures, deletion, ransomware, and incidents. Regularly test that important data can be restored.", "backup → isolate → restore test", "cyan"],
    ["54", "Security best practice: secrets", "Protect passwords, API keys, tokens, and encryption keys. Never expose secrets in source code, public repositories, container images, or logs.", "secret manager → application", "indigo"],
    ["55", "Security best practice: regular review", "Security is an ongoing process. Review configuration after software changes, new accounts, new services, migrations, incidents, and changes in threat exposure.", "review → improve → repeat", "purple"],
    ["56", "Why operating-system security matters", "Operating-system security protects users, data, applications, networks, servers, and cloud infrastructure. Poor security can cause unauthorized access, data loss, service disruption, financial loss, privacy problems, and system compromise.", "users + data + services + infrastructure", "orange"],
    ["57", "Topic 6 key takeaways", "The CIA triad protects confidentiality, integrity, and availability. AAA connects authentication, authorization, and accounting. Least privilege, Linux permissions, ACLs, SELinux, AppArmor, secure SSH, firewalls, patching, monitoring, backups, Zero Trust, supply-chain security, SBOMs, and vulnerability management form a continuous security practice.", "protect → detect → respond → recover", "teal"],
    ["58", "Complete security model", "A secure operating system verifies identity, limits access, reduces exposure, records activity, detects abnormal behavior, protects backups, responds to incidents, and continuously improves. Security is not a one-time configuration.", "identity → policy → protection → detection → recovery", "blue"],
  ];

  return (
    <div className="topic-learning-scroll">
      <section className="topic-intro-panel">
        <div className="topic-intro-icon">06</div>
        <div>
          <span className="section-label">OPERATING SYSTEM SECURITY</span>
          <h2>Protect the operating system and everything it controls</h2>
          <p>
            Security is a continuous operating practice, not a single product.
            This topic connects identity, permissions, secure access, network
            defense, hardening, monitoring, recovery, and modern infrastructure.
          </p>
        </div>
      </section>

      <TopicVisualGallery />

      <InteractiveExample
        title="Follow an access request"
        scenario="A user attempts to read a protected configuration file over SSH."
        steps={[
          "Authentication verifies the account, SSH key, and optional second factor.",
          "Authorization checks identity, group membership, file ownership, permissions, ACLs, and MAC policy.",
          "Accounting records the login and access result so administrators can review it.",
        ]}
        result="Security is layered: a valid password alone does not guarantee access. Identity, policy, resource permissions, and monitoring all participate."
        visual={<div className="interactive-example__flow"><span>SSH client</span><b>→</b><span>Authentication</span><b>→</b><span>Authorization</span><b>→</b><span>Protected file</span></div>}
      />

      <div className="topic-area-grid">
        {[
          ["Confidentiality", "Prevent unauthorized reading.", "▣"],
          ["Integrity", "Prevent unauthorized changes.", "✓"],
          ["Availability", "Keep services recoverable.", "↻"],
          ["Accountability", "Record and investigate actions.", "◉"],
        ].map(([title, description, icon]) => (
          <article className="topic-area-card" key={title}>
            <span className="topic-area-icon">{icon}</span>
            <h3>{title}</h3>
            <p>{description}</p>
          </article>
        ))}
      </div>

      <TopicContentSection number="01" title="Security is a layered system" tone="blue">
        <p>
          A secure operating system protects resources through multiple
          controls. If one layer fails, another layer should limit the impact.
        </p>
        <pre className="topic-code-block">{`Internet
   |
Firewall / network policy
   |
Authentication + MFA
   |
Authorization + least privilege
   |
Application + filesystem permissions
   |
Logging + monitoring + backups`}</pre>
      </TopicContentSection>

      <TopicContentSection number="02" title="CIA triad and AAA" tone="cyan">
        <div className="topic-detail-grid">
          <TopicDetail title="Confidentiality">File permissions, encryption, authentication, and secrets management prevent unauthorized disclosure.</TopicDetail>
          <TopicDetail title="Integrity">Hashes, signatures, ownership, access control, and file-integrity monitoring reveal unauthorized modification.</TopicDetail>
          <TopicDetail title="Availability">Backups, redundancy, monitoring, capacity planning, and recovery procedures keep services usable.</TopicDetail>
          <TopicDetail title="AAA">Authentication verifies identity, authorization grants actions, and accounting records what happened.</TopicDetail>
        </div>
      </TopicContentSection>

      <InteractiveExample
        title="Decode Linux permissions"
        scenario="Read rwxr-x--- as three independent permission sets."
        steps={[
          "The owner has rwx: read, write, and execute.",
          "The group has r-x: read and execute, but not write.",
          "Others have ---: no access.",
        ]}
        result="The octal equivalent is 750: 7 for rwx, 5 for r-x, and 0 for ---. Grant only what each role needs."
        visual={<div className="interactive-example__meter"><span>Owner<br /><b>rwx / 7</b></span><span>Group<br /><b>r-x / 5</b></span><span>Others<br /><b>--- / 0</b></span></div>}
      />

      <TopicContentSection number="03" title="Identity, privilege, and access control" tone="teal">
        <p>{sections.slice(3, 9).map(([title, text]) => `${title}: ${text}`).join(" ")}</p>
        <div className="topic-command-row">
          <code>id</code><code>getent passwd</code><code>sudo -l</code><code>chmod 750 app.sh</code><code>sudo chown app:app app.sh</code>
        </div>
        <pre className="topic-code-block">{`User identity
      |
Groups / sudo policy
      |
DAC permissions + ACL
      |
SELinux or AppArmor policy
      |
Allow or deny`}</pre>
      </TopicContentSection>

      <TopicContentSection number="04" title="Remote access and network defense" tone="indigo">
        <p>{sections[9][1]} {sections[10][1]}</p>
        <div className="topic-detail-grid">
          <TopicDetail title="SSH review"><div className="topic-command-row"><code>ssh user@server</code><code>ss -tulpn</code><code>journalctl -u ssh</code></div></TopicDetail>
          <TopicDetail title="Firewall review"><div className="topic-command-row"><code>sudo ufw status</code><code>sudo nft list ruleset</code><code>sudo firewall-cmd --list-all</code></div></TopicDetail>
          <TopicDetail title="Attack surface">Review open ports, running services, installed packages, exposed accounts, APIs, and cloud security groups.</TopicDetail>
          <TopicDetail title="MFA and keys">Protect private keys, use passphrases, rotate credentials, and require a second factor for sensitive access.</TopicDetail>
        </div>
      </TopicContentSection>

      <TopicContentSection number="05" title="Hardening, updates, and trusted boot" tone="purple">
        <p>{sections[11][1]}</p>
        <div className="topic-flow"><span>Inventory</span><b>→</b><span>Assess</span><b>→</b><span>Patch</span><b>→</b><span>Verify</span><b>→</b><span>Monitor</span></div>
        <div className="topic-command-row"><code>sudo apt update</code><code>sudo apt upgrade</code><code>systemctl list-unit-files</code><code>systemctl --failed</code></div>
      </TopicContentSection>

      <TopicContentSection number="06" title="Visibility, malware, and integrity" tone="slate">
        <p>{sections[12][1]} {sections[13][1]}</p>
        <pre className="topic-code-block">{`Detect
  ├── Failed logins
  ├── Unexpected processes
  ├── New listeners
  ├── Changed system files
  └── Privilege escalation
             |
        Investigate + contain`}</pre>
        <div className="topic-command-row"><code>journalctl -p warning</code><code>last</code><code>ps aux</code><code>ss -tulpn</code><code>sha256sum file</code></div>
      </TopicContentSection>

      <TopicContentSection number="07" title="Containers, secrets, and modern isolation" tone="teal">
        <p>{sections[14][1]}</p>
        <div className="topic-detail-grid">
          <TopicDetail title="Image hygiene">Use trusted minimal images, pin versions, scan dependencies, remove build tools, and rebuild regularly.</TopicDetail>
          <TopicDetail title="Runtime controls">Prefer non-root users, read-only filesystems, dropped capabilities, resource limits, and network restrictions.</TopicDetail>
          <TopicDetail title="Secrets">Keep API keys, database passwords, and tokens out of source code, images, public repositories, and logs.</TopicDetail>
          <TopicDetail title="Shared responsibility">The host kernel, runtime, image, application, and orchestration platform all require security controls.</TopicDetail>
        </div>
      </TopicContentSection>

      <TopicContentSection number="08" title="Backups and incident response" tone="orange">
        <p>{sections[15][1]} {sections[16][1]}</p>
        <div className="topic-flow"><span>3 copies</span><b>→</b><span>2 media types</span><b>→</b><span>1 separate copy</span><b>→</b><span>Test restore</span></div>
        <div className="topic-command-row"><code>Detection</code><code>Containment</code><code>Eradication</code><code>Recovery</code><code>Lessons learned</code></div>
      </TopicContentSection>

      <TopicContentSection number="09" title="Cloud, supply chain, and AI security" tone="blue">
        <p>{sections[17][1]} {sections[18][1]} {sections[19][1]}</p>
        <div className="topic-detail-grid">
          <TopicDetail title="Zero Trust">Verify identity, device, location, and request context continuously; never grant broad access by default.</TopicDetail>
          <TopicDetail title="SBOM">Track application components and dependencies so vulnerable packages can be located quickly.</TopicDetail>
          <TopicDetail title="Vulnerability lifecycle">Identify, assess, prioritize, patch or mitigate, verify, and continue monitoring.</TopicDetail>
          <TopicDetail title="AI-assisted security">Use AI for log analysis and anomaly detection with human validation, protected data, and controlled access.</TopicDetail>
        </div>
      </TopicContentSection>

      <TopicContentSection number="10" title="Administrator security checklist" tone="purple">
        <div className="topic-chip-list">
          {["Patch regularly", "Use least privilege", "Protect root and sudo", "Require MFA", "Use SSH keys", "Close unused ports", "Disable unused services", "Monitor logs", "Protect secrets", "Test backups", "Scan dependencies", "Document incidents"].map((item) => <span key={item}>{item}</span>)}
        </div>
        <p>
          Security is not a one-time configuration. Reassess systems after
          software changes, new users, new services, infrastructure migrations,
          incidents, and changes in threat exposure.
        </p>
      </TopicContentSection>

      <TopicContentSection number="11-58" title="Complete lecture coverage" tone="slate">
        <p>
          The sections below continue the supplied Topic 6 lecture in its
          original progression, from service management and logging through
          modern cloud, supply-chain, AI, and security best practices.
        </p>
      </TopicContentSection>

      {lectureSections.map(([number, title, content, command, tone]) => (
        <TopicContentSection
          key={number}
          number={number}
          title={title}
          tone={tone}
        >
          <p>{content}</p>
          <div className="topic-command-row">
            <code>{command}</code>
          </div>
        </TopicContentSection>
      ))}
    </div>
  );
}

function StorageDevicesDiskManagementContent() {
  const sections = [
    ["01", "Introduction", "Storage keeps operating systems, applications, configuration, databases, user files, logs, and backups after power is removed. The complete path is Physical Storage → Device → Partition → Filesystem → Mount Point → Files and Directories.", "SSD → /dev/nvme0n1 → partition → ext4 → /data"],
    ["02", "What Is Computer Storage?", "Storage is hardware or virtual infrastructure for persistent or semi-persistent data. Unlike RAM, storage retains operating-system files, applications, documents, databases, logs, and backups after shutdown.", "Operating system + applications + data → storage"],
    ["03", "Storage Hierarchy", "Systems combine CPU registers, cache, RAM, NVMe SSD, SATA SSD, HDD, external, network, and cloud storage. Faster storage generally costs more per capacity and has lower latency.", "registers → cache → RAM → NVMe → HDD → cloud"],
    ["04", "Hard Disk Drives", "HDDs use magnetic platters, a spindle motor, read/write heads, an actuator, and a controller. They provide inexpensive capacity for bulk storage and archives but have mechanical latency and shock sensitivity.", "platters + heads + motor"],
    ["05", "Solid-State Drives", "SSDs use flash memory without moving parts. They provide low latency, fast random access, low noise, and shock resistance, but cost more per gigabyte, have write endurance limits, and can complicate recovery.", "flash cells → controller → SSD"],
    ["06", "SATA SSD vs NVMe SSD", "SATA SSDs are much faster than HDDs but use an interface designed for older storage. NVMe operates over PCIe with lower latency, higher throughput, and more parallelism for databases, VMs, datasets, and AI workloads.", "SATA: compatibility | NVMe: PCIe performance"],
    ["07", "External and Removable Storage", "Linux can use USB flash drives, external HDDs and SSDs, SD cards, and optical media. The kernel detects devices through its device subsystem.", "lsblk; sudo fdisk -l"],
    ["08", "Block Devices", "Block devices provide storage access in blocks rather than a continuous byte stream. Examples include /dev/sda, /dev/sdb, and /dev/nvme0n1.", "/dev/sda | /dev/sdb | /dev/nvme0n1"],
    ["09", "Understanding /dev", "The /dev directory contains file-like interfaces for hardware and virtual devices. Device entries are not ordinary data files; they let the kernel and applications interact with devices.", "ls -l /dev"],
    ["10", "Understanding Device Names", "SATA disks commonly appear as /dev/sda and partitions as /dev/sda1. NVMe devices use names such as /dev/nvme0n1 with partitions /dev/nvme0n1p1.", "lsblk -o NAME,SIZE,TYPE,MOUNTPOINTS"],
    ["11", "What Is a Partition?", "A partition logically divides a disk so separate areas can hold an EFI partition, root filesystem, home/data, swap, recovery, or other purposes.", "/dev/sda → sda1 + sda2 + sda3"],
    ["12", "MBR and GPT", "MBR is an older partitioning scheme with limits on disk size, partition count, and modern boot configurations. GPT is the modern choice for large disks, many partitions, and UEFI systems.", "MBR: legacy | GPT: modern"],
    ["13", "Inspecting Storage with lsblk", "lsblk shows disks, partitions, sizes, types, and mount points in a tree. lsblk -f adds filesystem and UUID information.", "lsblk -f"],
    ["14", "Identifying Filesystems with blkid", "blkid identifies filesystem types, labels, and UUIDs. UUIDs are useful for reliable persistent mounting.", "sudo blkid"],
    ["15", "Partition Management", "fdisk handles common partition tables, gdisk focuses on GPT, and parted supports flexible partition management. Always identify the correct device before changing it.", "sudo fdisk -l; sudo parted -l"],
    ["16", "Filesystems", "A filesystem organizes files, directories, metadata, permissions, free space, and recovery information. Common Linux filesystems include ext4, XFS, Btrfs, and ZFS.", "filesystem → directories → files"],
    ["17", "Formatting a Partition", "mkfs creates a filesystem on a partition, but it can destroy existing data. Verify the target and backup before formatting.", "sudo mkfs.ext4 /dev/sdb1"],
    ["18", "Mounting Storage", "A filesystem becomes accessible through the directory tree after it is mounted. Create a mount point, then mount the partition there.", "sudo mkdir -p /data; sudo mount /dev/sdb1 /data"],
    ["19", "Mount Points", "A mount point is the directory where a filesystem is attached. Linux can combine multiple storage devices into one directory hierarchy.", "findmnt"],
    ["20", "Unmounting Storage", "umount detaches a filesystem before removal, repair, partition changes, or maintenance. If busy, investigate users with lsof or fuser.", "sudo umount /data; sudo lsof /data"],
    ["21", "Persistent Mounting with /etc/fstab", "fstab defines filesystems mounted during startup. Entries contain a device or UUID, mount point, filesystem type, options, dump setting, and filesystem-check order.", "UUID=... /data ext4 defaults 0 2"],
    ["22", "UUIDs", "Filesystem UUIDs are more stable than device names when enumeration order changes. Use blkid or lsblk -f to find them.", "sudo blkid; lsblk -f"],
    ["23", "Disk Usage with df", "df -h reports filesystem size, used space, available space, and percentage used. It answers how full a mounted filesystem is.", "df -h"],
    ["24", "Directory Usage with du", "du identifies how much space files and directories consume. It helps locate large logs, caches, backups, databases, or application data.", "sudo du -sh /var/*"],
    ["25", "Disk Space vs Inode Space", "A filesystem can run out of data blocks or inodes. Millions of small files can exhaust inodes while capacity remains; df -i checks inode usage.", "df -h; df -i"],
    ["26", "When a Disk Becomes Full", "Full filesystems can stop databases, logging, temporary files, updates, and services. Check df, locate large directories with du, remove only verified data, or expand storage.", "df → du → inspect → safely free or expand"],
    ["27", "Disk I/O", "I/O is movement between applications, the kernel, filesystems, storage layers, and disks. Reads, writes, virtual-machine disks, Docker volumes, logs, and databases all generate I/O.", "application → syscall → filesystem → device"],
    ["28", "Read and Write Operations", "Reads move storage data through RAM to an application. Writes move application data through buffers or cache to storage. The OS coordinates both operations.", "read: storage → RAM → app; write: app → cache → storage"],
    ["29", "Page Cache", "Linux caches filesystem data in RAM so repeated reads can avoid storage access. High cache usage is often useful and does not automatically indicate a memory problem.", "storage → page cache → application"],
    ["30", "Buffering and Caching", "Buffers temporarily hold data during movement; caches retain frequently used data. Both reduce the speed gap between CPU/RAM and storage.", "CPU/RAM ⇄ buffer/cache ⇄ storage"],
    ["31", "I/O Wait", "I/O wait occurs when CPU work is delayed while storage or another I/O operation completes. High I/O wait can indicate slow devices, heavy databases, backups, or VM contention.", "top; vmstat; iostat"],
    ["32", "Storage Performance Metrics", "Throughput measures data per second, IOPS measures operations per second, latency measures completion time, and queue depth measures waiting operations. Workloads need different combinations.", "throughput + IOPS + latency + queue depth"],
    ["33", "iostat", "iostat and iostat -xz show CPU and storage I/O statistics such as utilization, throughput, queueing, and latency. It may be provided by sysstat.", "iostat -xz"],
    ["34", "Disk Health and SMART", "SMART provides device health indicators through tools such as smartctl. It can reveal warning signs but never replaces tested backups.", "sudo smartctl -a /dev/sda"],
    ["35", "SSD TRIM", "TRIM tells an SSD which blocks are no longer needed so it can manage flash efficiently. Linux can run periodic or manual fstrim.", "sudo fstrim -av"],
    ["36", "Filesystem Journaling", "Journaling records filesystem changes so recovery after interruption is safer. ext4 and XFS are examples of journaling filesystems.", "journal → metadata recovery"],
    ["37", "Filesystem Checking", "fsck and e2fsck check filesystems. Follow filesystem-specific guidance and normally unmount before repair; repair on an active filesystem can be dangerous.", "sudo e2fsck -f /dev/sdb1"],
    ["38", "Read-Only Filesystems", "Linux may remount a filesystem read-only after serious errors. Inspect dmesg and journalctl, check hardware health, and repair safely rather than forcing writes.", "dmesg; journalctl -k"],
    ["39", "RAID", "RAID combines disks for performance, redundancy, or both. RAID 0 stripes without redundancy, RAID 1 mirrors, RAID 5 uses parity, RAID 6 uses dual parity, and RAID 10 combines mirroring and striping.", "RAID 0 | 1 | 5 | 6 | 10"],
    ["40", "Software RAID", "Linux software RAID can combine devices through mdadm. RAID improves availability or performance depending on its level but is not a backup.", "sudo mdadm --detail /dev/md0"],
    ["41", "Logical Volume Management", "LVM abstracts storage as Physical Volumes, Volume Groups, and Logical Volumes. It makes allocation, expansion, and snapshots more flexible.", "PV → VG → LV → filesystem"],
    ["42", "Physical Volumes", "A Physical Volume is storage prepared for LVM, such as a disk or partition.", "sudo pvcreate /dev/sdb"],
    ["43", "Volume Groups", "A Volume Group combines one or more physical volumes into a storage pool from which logical volumes can be allocated.", "sudo vgcreate vg0 /dev/sdb"],
    ["44", "Logical Volumes", "Logical Volumes are storage areas created from a volume group and can receive a filesystem.", "sudo lvcreate -L 20G -n data vg0"],
    ["45", "Expanding Storage with LVM", "LVM can often expand a logical volume without rebuilding the complete layout. The filesystem must then be expanded with tools such as resize2fs or xfs_growfs.", "lvextend → resize2fs / xfs_growfs"],
    ["46", "Snapshots", "An LVM snapshot provides a point-in-time view useful for testing and some backup workflows. A snapshot is not automatically a backup because the underlying storage can still fail.", "snapshot ≠ independent backup"],
    ["47", "Encryption", "LUKS and dm-crypt encrypt storage so stolen physical devices reveal less data. Encryption is important for laptops, servers, databases, backups, and removable drives.", "disk → encrypted layer → filesystem"],
    ["48", "Storage in Virtual Machines", "VMs usually see virtual disks backed by host files or block devices. The guest filesystem depends on the host, hypervisor, virtual disk, and underlying storage.", "physical SSD → host → hypervisor → virtual disk"],
    ["49", "Storage in Docker", "Containers have writable layers, but important data should use persistent volumes. Databases can lose container-local data when containers are removed.", "container → volume → host storage"],
    ["50", "Storage and Databases", "Databases generate random reads, random writes, sequential operations, transaction logs, temporary files, and index work. Monitor capacity, latency, IOPS, throughput, I/O wait, and logs.", "database workload → storage latency + IOPS"],
    ["51", "Storage and Cloud Computing", "Block storage behaves like a virtual disk, file storage provides shared filesystem access, and object storage stores objects for backups, media, datasets, and archives.", "block: disks | file: shares | object: blobs"],
    ["52", "Common Storage Problems", "Common incidents include full disks, exhausted inodes, undetected devices, read-only filesystems, and slow storage. Troubleshoot from capacity and mounts through logs, performance, filesystem, and hardware health.", "df → lsblk → logs → iostat → fsck → SMART"],
    ["53", "Safe Storage Administration", "mkfs, fdisk, parted, and dd can destroy data. Identify the device, verify size and mounts, confirm data importance, back up, and review commands before execution.", "identify → verify → backup → modify"],
    ["54", "Storage Security Best Practices", "Use appropriate permissions, encrypt sensitive storage, monitor SMART and logs, monitor capacity and inodes, maintain and test backups, and avoid exposing unnecessary mounts.", "permissions + encryption + health + backups"],
    ["55", "Important Storage Commands", "Key tools include lsblk, blkid, fdisk, gdisk, parted, mkfs, mount, umount, df, du, fsck, e2fsck, iostat, vmstat, smartctl, fstrim, mdadm, and LVM commands.", "lsblk | blkid | df | du | iostat | smartctl"],
    ["56", "Practical Storage Workflow", "Detect the device, identify size and type, inspect partitions, choose a filesystem, format, create a mount point, mount, configure fstab, monitor capacity, monitor health, and maintain backups.", "detect → partition → format → mount → monitor → backup"],
    ["57", "Modern Storage Technologies", "Modern systems use NVMe, PCIe storage, cloud block storage, distributed and software-defined storage, container volumes, copy-on-write filesystems, virtualization, object storage, and automated monitoring.", "NVMe + cloud + distributed + software-defined"],
    ["58", "Storage in Modern Infrastructure", "Storage spans physical servers, virtual machines, containers, cloud infrastructure, and distributed systems. The same goals remain: capacity, performance, reliability, security, and availability.", "server → VM → container → cloud → distributed"],
    ["59", "Key Concepts", "Storage persists data, /dev exposes device interfaces, disks contain partitions, filesystems organize data, mounts expose filesystems, df and du measure use, I/O describes transfers, RAID adds redundancy, LVM adds flexibility, encryption protects data, and snapshots are not backups.", "capacity + performance + reliability + security + recovery"],
    ["60", "Summary", "Storage administration ensures data is available, organized, performant, reliable, secure, and recoverable. Administrators monitor continuously, plan capacity, protect data, verify backups, and troubleshoot filesystem and hardware failures.", "device → partition → filesystem → mount → data → recovery"],
  ];

  return (
    <div className="topic-learning-scroll">
      <section className="topic-intro-panel">
        <div className="topic-intro-icon">09</div>
        <div>
          <span className="section-label">STORAGE MANAGEMENT</span>
          <h2>Storage Devices, Disk Management, and I/O</h2>
          <p>
            Learn the complete storage stack from physical disks and block
            devices through partitions, filesystems, mounts, performance,
            reliability, security, virtualization, containers, and cloud data.
          </p>
        </div>
      </section>

      <TopicVisualGallery />

      <InteractiveExample
        title="Build a usable Linux data disk"
        scenario="A new SSD must become persistent /data storage."
        steps={[
          "Detect and verify the device with lsblk, blkid, size, type, and existing mounts.",
          "Create a partition and filesystem only after confirming the target and backup plan.",
          "Mount it, use its UUID in /etc/fstab, test the configuration, and monitor capacity and health.",
        ]}
        result="A disk is not usable application storage until the device, partition, filesystem, mount point, and persistent policy are correctly connected."
        visual={<div className="interactive-example__flow"><span>SSD</span><b>→</b><span>/dev</span><b>→</b><span>Partition</span><b>→</b><span>ext4</span><b>→</b><span>/data</span></div>}
      />

      <InteractiveExample
        title="Troubleshoot a full server"
        scenario="An application cannot write because storage is almost full."
        steps={[
          "Use df -h and df -i to distinguish full data blocks from exhausted inodes.",
          "Use du to locate large logs, caches, databases, backups, or directories with millions of files.",
          "Remove or rotate only verified data, expand storage if needed, then monitor and document the cause.",
        ]}
        result="Never blindly delete files from a full server. Identify the filesystem, evidence, ownership, retention policy, and recovery impact first."
        visual={<div className="interactive-example__meter"><span>Capacity<br /><b>df -h</b></span><span>Directories<br /><b>du -sh</b></span><span>Inodes<br /><b>df -i</b></span></div>}
      />

      <div className="topic-area-grid">
        {[
          ["Storage stack", "Device, partition, filesystem, mount point, directory, file.", "▤"],
          ["Performance", "Throughput, IOPS, latency, queue depth, cache, and I/O wait.", "↗"],
          ["Reliability", "Journaling, SMART, RAID, LVM, snapshots, and tested backups.", "✓"],
          ["Modern infrastructure", "VM disks, Docker volumes, cloud block, file, and object storage.", "◈"],
        ].map(([title, description, icon]) => (
          <article className="topic-area-card" key={title}>
            <span className="topic-area-icon">{icon}</span>
            <h3>{title}</h3>
            <p>{description}</p>
          </article>
        ))}
      </div>

      <TopicContentSection number="00" title="The complete storage stack" tone="blue">
        <pre className="topic-code-block">{`Physical disk / virtual storage
          |
      Block device (/dev)
          |
       Partition table
          |
       Filesystem
          |
       Mount point
          |
     Directories and files
          |
 Capacity + I/O + health + backup + security`}</pre>
      </TopicContentSection>

      <TopicContentSection number="01-60" title="Complete lecture coverage" tone="slate">
        <p>
          The following sections follow the supplied Topic 9 lecture from
          storage hardware and device naming through partitioning, filesystems,
          I/O, health, RAID, LVM, encryption, modern infrastructure,
          troubleshooting, safe administration, and final takeaways.
        </p>
      </TopicContentSection>

      {sections.map(([number, title, content, command], index) => (
        <TopicContentSection
          key={number}
          number={number}
          title={title}
          tone={["blue", "cyan", "teal", "indigo", "purple", "slate", "orange"][index % 7]}
        >
          <p>{content}</p>
          <div className="topic-command-row"><code>{command}</code></div>
        </TopicContentSection>
      ))}
    </div>
  );
}

function LinuxFilesystemManagementContent() {
  const sections = [
    ["01", "Introduction", "A filesystem organizes, locates, accesses, modifies, and protects files on storage. The stack is physical storage → block device → partition or logical volume → filesystem → mount point → directories → files.", "device → partition → filesystem → mount → file"],
    ["02", "What Is a Filesystem?", "A filesystem tracks names, locations, sizes, permissions, ownership, timestamps, directory structures, available space, and metadata between applications and raw storage.", "application → filesystem → storage"],
    ["03", "Why Linux Supports Multiple Filesystems", "Different filesystems target different requirements: ext4 for general use, XFS for large-scale workloads, Btrfs for copy-on-write and snapshots, and older ext2/ext3 for history and legacy compatibility.", "ext4 | XFS | Btrfs | ext3 | ext2"],
    ["04", "Filesystem vs Partition", "A partition defines a region of a disk; a filesystem organizes data inside that region. Filesystems can also be created on logical volumes rather than traditional partitions.", "partition ≠ filesystem"],
    ["05", "Filesystem Metadata", "Metadata describes file contents: size, owner, group, permissions, timestamps, type, and location information. ls -l displays metadata rather than file contents.", "ls -l"],
    ["06", "Inodes", "An inode stores metadata and references to a filesystem object's data blocks. A directory entry maps a filename to an inode.", "filename → directory entry → inode → data blocks"],
    ["07", "Files and Inodes", "Linux filesystem objects include regular files, directories, symbolic links, device files, named pipes, and sockets. Inode information identifies type and metadata.", "ls -li"],
    ["08", "Checking Inode Usage", "A filesystem can have free capacity but no free inodes, especially when caches, sessions, mail queues, logs, or containers create millions of small files.", "df -i"],
    ["09", "File Allocation", "Filesystems allocate storage using blocks, allocation groups, or extents and maintain metadata that locates a file's data as it grows.", "file → allocation metadata → blocks"],
    ["10", "Blocks", "Blocks are fixed-size filesystem storage units, often 4096 bytes. Small files still consume resources according to block and allocation rules.", "block size: 4096 bytes"],
    ["11", "Extents", "An extent describes a contiguous range of blocks by start and length instead of tracking every block separately. ext4 and XFS use extent-based concepts.", "start block + length"],
    ["12", "Filesystem Journaling", "A journaling filesystem records selected changes before updating filesystem structures, helping recovery after interruption.", "operation → journal → filesystem update"],
    ["13", "Why Journaling Matters", "After a crash during metadata updates, the journal helps the filesystem return toward consistency. Journaling improves consistency but does not protect every file from every failure.", "crash → journal replay → consistency"],
    ["14", "ext2", "ext2 is an older, simple filesystem without journaling. It is mainly relevant for legacy systems and filesystem history.", "ext2: simple, no journal"],
    ["15", "ext3", "ext3 added journaling while preserving compatibility with the ext family and became a common predecessor to ext4.", "ext2 + journal → ext3"],
    ["16", "ext4", "ext4 provides journaling, extents, large filesystem and file support, delayed allocation, and strong general-purpose performance for servers, VMs, desktops, and applications.", "sudo mkfs.ext4 /dev/sdb1"],
    ["17", "XFS", "XFS is a high-performance journaling filesystem designed for large files, large filesystems, parallel I/O, and enterprise workloads. It generally grows online but is not reduced in place.", "sudo mkfs.xfs /dev/sdb1"],
    ["18", "Btrfs", "Btrfs uses copy-on-write and supports checksums, snapshots, subvolumes, compression, and advanced storage features.", "sudo mkfs.btrfs /dev/sdb1"],
    ["19", "Copy-on-Write", "Copy-on-write shares unchanged data and creates new blocks only when data is modified. This supports snapshots and efficient duplication.", "shared blocks → change → new blocks"],
    ["20", "Btrfs Snapshots", "Btrfs snapshots provide point-in-time views useful for testing and rollback. They still consume storage as data diverges and are not a substitute for independent backups.", "snapshot ≠ backup"],
    ["21", "Filesystem Compression", "Compression reduces storage usage and I/O for suitable data. Btrfs supports filesystem compression; the benefit depends on data type and CPU cost.", "data → compress → storage"],
    ["22", "Filesystem Checksums", "Checksums help detect corrupted metadata or data. Btrfs uses checksums as part of its data-integrity features.", "write checksum → read verify"],
    ["23", "Filesystem Mounting", "A filesystem must be mounted at a directory before normal access through the Linux tree. mount and findmnt show the relationship.", "mount /dev/sdb1 /data"],
    ["24", "Filesystem Mount Options", "Mount options control behavior and security. ro is read-only, rw is read-write, noexec blocks execution, nosuid ignores SUID/SGID, and nodev prevents device files.", "ro | rw | noexec | nosuid | nodev"],
    ["25", "Read-Only Filesystems", "A filesystem may become read-only after errors or hardware problems. Investigate logs, protect data, check health, and repair safely rather than forcing writes.", "dmesg; journalctl -k"],
    ["26", "Filesystem Hierarchy and Mounting", "Linux presents one directory tree rooted at /. Separate filesystems can provide /home, /var, /boot, or application data while remaining part of that hierarchy.", "/ → /boot + /home + /var"],
    ["27", "/etc/fstab", "fstab defines persistent mounts using a device or UUID, mount point, filesystem type, options, dump setting, and check order. Test changes carefully.", "UUID=... /data ext4 defaults 0 2"],
    ["28", "Filesystem Labels", "Labels provide human-readable filesystem identifiers and can be used with mount configuration. blkid and lsblk -f reveal labels.", "LABEL=data"],
    ["29", "Checking Filesystem Space", "df -h shows mounted filesystem capacity, while df -i shows inode capacity. Both are necessary when diagnosing inability to create files.", "df -h; df -i"],
    ["30", "Checking Directory Size", "du -sh and du -h --max-depth=1 identify directories consuming space. Compare du results with df and remember deleted-but-open files.", "du -h --max-depth=1 /var"],
    ["31", "Filesystem Capacity Planning", "Plan for application growth, logs, database files, backups, temporary files, inode usage, performance headroom, and expansion or migration.", "forecast → reserve → monitor → expand"],
    ["32", "Filesystem Fragmentation", "Fragmentation scatters file extents and may reduce performance, especially on HDDs. Extents, allocation policies, free space, and workload influence fragmentation.", "fragmented extents → more access work"],
    ["33", "Filesystem Performance", "Performance depends on device latency, throughput, IOPS, cache, journaling, filesystem, mount options, fragmentation, workload, and available capacity.", "latency + IOPS + cache + filesystem"],
    ["34", "Filesystem and Database Workloads", "Databases depend on filesystem latency, durability, cache, random I/O, transaction logs, and capacity. Filesystem and database settings must be considered together.", "database → data + WAL/log + temp"],
    ["35", "Filesystem and Docker", "Container writable layers are temporary and can grow. Use volumes or bind mounts for important data, especially databases, and monitor overlay storage.", "container → volume → filesystem"],
    ["36", "Filesystem and Virtual Machines", "VM guest filesystems sit above virtual disks, hypervisors, host filesystems, and physical storage. Performance and snapshots involve every layer.", "guest FS → virtual disk → host FS → device"],
    ["37", "Filesystem Errors", "Errors may result from hardware failure, unexpected shutdown, corruption, bugs, or full capacity. Inspect kernel and service logs before repair.", "symptom → logs → health → repair"],
    ["38", "Filesystem Checking and fsck", "fsck checks filesystem consistency. Follow filesystem-specific instructions and normally unmount before repair; running repair on an active filesystem can be dangerous.", "sudo fsck /dev/sdb1"],
    ["39", "ext4 Filesystem Repair", "e2fsck is used for ext filesystems. Back up or preserve evidence, unmount safely, and follow an appropriate recovery plan before repair.", "sudo e2fsck -f /dev/sdb1"],
    ["40", "XFS Maintenance", "XFS uses tools such as xfs_info, xfs_repair, and xfs_growfs. XFS repair and growth require filesystem-specific procedures.", "xfs_info /data; xfs_growfs /data"],
    ["41", "Identifying Filesystem Type", "Use lsblk -f, blkid, findmnt, and file where appropriate to identify filesystem type, UUID, label, and mount state.", "lsblk -f; blkid; findmnt"],
    ["42", "Filesystem Security", "Protect files with ownership, permissions, ACLs, mount options, SELinux/AppArmor policies, controlled mounts, and monitoring of sensitive paths.", "permissions + ACL + MAC + mount policy"],
    ["43", "Data Encryption", "LUKS and dm-crypt encrypt block storage beneath the filesystem, protecting data if physical devices are lost or accessed without authorization.", "disk → LUKS → filesystem → files"],
    ["44", "Secure Deletion Considerations", "Deletion is not always secure erasure, especially with journaling, SSD wear leveling, snapshots, and backups. Choose destruction or encryption practices appropriate to the threat model.", "delete ≠ guaranteed erase"],
    ["45", "Filesystem Backups", "Back up filesystem data, metadata, permissions, ACLs, extended attributes, database consistency, and application state. Test restoration rather than trusting backup completion alone.", "data + metadata + restore test"],
    ["46", "Snapshot vs Backup", "A snapshot is a fast point-in-time view on related storage. A backup is an independent recoverable copy. Snapshots do not replace off-device or isolated backups.", "snapshot: fast rollback | backup: recovery"],
    ["47", "Filesystem Selection", "Choose ext4 for broad general use, XFS for large-scale and high-throughput workloads, and Btrfs for copy-on-write, snapshots, checksums, and subvolumes when operational requirements support it.", "workload → requirements → filesystem"],
    ["48", "Modern Filesystem Administration", "Modern administration includes automation, monitoring, immutable infrastructure, snapshots, encryption, copy-on-write, policy-driven mounts, and repeatable recovery procedures.", "configure → automate → observe → recover"],
    ["49", "Filesystems in Cloud Environments", "Cloud instances use virtual block devices and managed filesystems. Administrators still manage capacity, mounts, performance, permissions, encryption, backups, and failure domains.", "cloud volume → guest filesystem"],
    ["50", "Filesystems in Modern Data Systems", "Containers, Kubernetes, databases, distributed systems, and AI platforms depend on persistent volumes, shared storage, high throughput, metadata performance, and reliable recovery.", "workload → volume → filesystem → data"],
    ["51", "Common Filesystem Administration Commands", "Important commands include lsblk, blkid, findmnt, mount, umount, df, du, stat, tune2fs, xfs_info, btrfs, fsck, e2fsck, xfs_repair, and journalctl.", "lsblk | mount | df | du | fsck"],
    ["52", "Storage Troubleshooting Workflow", "Check capacity and inodes, identify mounts, inspect logs, verify filesystem type, measure performance, check health, perform safe repair, and expand or migrate when necessary.", "df → findmnt → logs → I/O → health → repair"],
    ["53", "Example: Filesystem Is Full", "Use df -h, locate large directories with du, check deleted-open files, inspect retention and logs, safely clean or expand, then add monitoring.", "df -h → du → lsof +L1 → resolve"],
    ["54", "Example: Inodes Are Full", "Use df -i, locate directories with huge file counts, inspect caches or sessions, remove according to policy, and prevent recurrence with retention controls.", "df -i → find file count → policy cleanup"],
    ["55", "Example: Filesystem Becomes Read-Only", "Check dmesg and journalctl, stop writes if needed, verify device health, unmount safely, run filesystem-specific checks, and restore only after the cause is understood.", "logs → health → unmount → repair"],
    ["56", "Best Practices", "Monitor regularly, choose appropriate filesystems, maintain and test backups, document layouts, plan capacity, avoid unnecessary modifications, and rehearse recovery.", "monitor → document → backup → test"],
    ["57", "Modern and Future-Relevant Concepts", "Filesystem management increasingly includes NVMe, cloud volumes, distributed systems, containers, copy-on-write, immutable systems, automated policy, and large-scale datasets.", "physical → virtual → distributed"],
    ["58", "Key Takeaways", "Filesystems organize data through metadata, inodes, blocks, extents, journaling, mounts, labels, and policies. Filesystem choice affects performance, reliability, security, recovery, and availability.", "metadata + allocation + consistency + recovery"],
    ["59", "Final Summary", "Good filesystem administration makes data organized, available, performant, reliable, secure, and recoverable across physical servers, VMs, containers, databases, cloud systems, and modern data platforms.", "organize → protect → monitor → recover"],
  ];

  return (
    <div className="topic-learning-scroll">
      <section className="topic-intro-panel">
        <div className="topic-intro-icon">10</div>
        <div>
          <span className="section-label">FILESYSTEM MANAGEMENT</span>
          <h2>Linux Filesystems and Filesystem Management</h2>
          <p>
            Understand how Linux organizes storage into filesystems, tracks
            metadata and inodes, mounts and protects data, handles errors, and
            supports servers, databases, containers, virtual machines, and cloud systems.
          </p>
        </div>
      </section>

      <TopicVisualGallery />

      <InteractiveExample
        title="Follow a filename to its data"
        scenario="A process opens /data/report.txt."
        steps={[
          "The directory entry maps report.txt to an inode containing metadata and data-block references.",
          "The filesystem resolves the mount point and allocation structures on the underlying device.",
          "Permissions, ACLs, security policy, cache, and storage I/O determine whether data is returned.",
        ]}
        result="A filename is only the beginning: directories, inodes, blocks or extents, mounts, permissions, and storage all participate."
        visual={<div className="interactive-example__flow"><span>Filename</span><b>→</b><span>Inode</span><b>→</b><span>Extent</span><b>→</b><span>Filesystem</span><b>→</b><span>Device</span></div>}
      />

      <InteractiveExample
        title="Choose the right filesystem response"
        scenario="A filesystem suddenly becomes read-only."
        steps={[
          "Stop destructive changes and inspect dmesg, journalctl, df, findmnt, and device health.",
          "Identify whether the cause is capacity, hardware I/O errors, corruption, or configuration.",
          "Unmount safely and use the filesystem-specific repair process before restoring writes.",
        ]}
        result="Filesystem repair is evidence-driven: forcing a read-write mount without understanding the cause can worsen corruption."
        visual={<div className="interactive-example__flow"><span>Protect</span><b>→</b><span>Inspect</span><b>→</b><span>Identify</span><b>→</b><span>Repair</span><b>→</b><span>Verify</span></div>}
      />

      <div className="topic-area-grid">
        {[
          ["Structure", "Metadata, inodes, blocks, extents, directories, and mounts.", "▤"],
          ["Reliability", "Journaling, checksums, snapshots, repair, and recovery.", "✓"],
          ["Security", "Permissions, ACLs, mount options, encryption, and MAC policies.", "▣"],
          ["Modern workloads", "Databases, Docker, VMs, Kubernetes, cloud, and distributed data.", "◈"],
        ].map(([title, description, icon]) => (
          <article className="topic-area-card" key={title}>
            <span className="topic-area-icon">{icon}</span>
            <h3>{title}</h3>
            <p>{description}</p>
          </article>
        ))}
      </div>

      <TopicContentSection number="00" title="The filesystem stack" tone="blue">
        <pre className="topic-code-block">{`Physical storage
      |
Block device / logical volume
      |
Filesystem metadata + allocation
      |
Mount point and directory tree
      |
Filename → inode → blocks/extents
      |
Permissions + security + cache + recovery`}</pre>
      </TopicContentSection>

      <TopicContentSection number="01-59" title="Complete lecture coverage" tone="slate">
        <p>
          The following sections follow the supplied Topic 10 lecture from
          filesystem fundamentals through ext4, XFS, Btrfs, mounting,
          performance, repair, security, backups, cloud environments,
          troubleshooting, best practices, and final summary.
        </p>
      </TopicContentSection>

      {sections.map(([number, title, content, command], index) => (
        <TopicContentSection
          key={number}
          number={number}
          title={title}
          tone={["blue", "cyan", "teal", "indigo", "purple", "slate", "orange"][index % 7]}
        >
          <p>{content}</p>
          <div className="topic-command-row"><code>{command}</code></div>
        </TopicContentSection>
      ))}
    </div>
  );
}

function normalizeSlideTitle(value = "") {
  return String(value).trim().replace(/\s+/g, " ").toLowerCase();
}

function dedupeSectionsByTitle(sections = []) {
  const seen = new Set();
  return sections.filter((section) => {
    const key = normalizeSlideTitle(section?.title);
    if (!key || seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function parseTopic11Lecture(text) {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const sections = [];
  let current = null;

  for (const line of lines) {
    const heading = !current?.inCode && line.match(/^#{1,6}\s+(?:(\d+)\.\s+)?(.+)$/);
    if (heading) {
      current = {
        number: heading[1] ? heading[1].padStart(2, "0") : "00",
        title: heading[2],
        lines: [],
      };
      sections.push(current);
    } else if (current) {
      current.lines.push(line);
    }
  }

  return dedupeSectionsByTitle(sections);
}

function renderTopic11Inline(text, keyPrefix) {
  const tokens = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
  return tokens.map((token, index) => {
    if (token.startsWith("`") && token.endsWith("`")) {
      return <code key={`${keyPrefix}-code-${index}`}>{token.slice(1, -1)}</code>;
    }
    if (token.startsWith("**") && token.endsWith("**")) {
      return <strong key={`${keyPrefix}-strong-${index}`}>{token.slice(2, -2)}</strong>;
    }
    return token;
  });
}

const COMMAND_REFERENCES = [
  { match: /\bpwd\b/, command: "pwd", output: "/home/student/labs/linux", meaning: "Shows the current working directory.", source: "https://man7.org/linux/man-pages/man1/pwd.1.html", label: "Linux man-pages" },
  { match: /\bls\s+(-la|-l|-a)\b|\bls command\b/, command: "ls -la", output: "drwxr-xr-x  4 student admins 4096 Sep 16 14:22 .", meaning: "Lists hidden entries with permissions, ownership, size, and timestamps.", source: "https://man7.org/linux/man-pages/man1/ls.1.html", label: "Linux man-pages" },
  { match: /\bchmod\b/, command: "chmod 755 script.sh", output: "-rwxr-xr-x 1 student admins 842 Sep 16 14:22 script.sh", meaning: "Sets owner read/write/execute and read/execute for group and others.", source: "https://man7.org/linux/man-pages/man1/chmod.1.html", label: "Linux man-pages" },
  { match: /\bchown\b/, command: "sudo chown student:admins script.sh", output: "-rwxr-xr-x 1 student admins 842 Sep 16 14:22 script.sh", meaning: "Changes the file owner and group.", source: "https://man7.org/linux/man-pages/man1/chown.1.html", label: "Linux man-pages" },
  { match: /\bip\s+(addr|a)\b/, command: "ip addr", output: "inet 192.168.56.10/24 scope global enp0s3", meaning: "Displays network interfaces and assigned addresses.", source: "https://man7.org/linux/man-pages/man8/ip.8.html", label: "Linux man-pages" },
  { match: /\bping\b/, command: "ping -c 3 192.168.56.1", output: "3 packets transmitted, 3 received, 0% packet loss", meaning: "Tests reachability and reports round-trip responses.", source: "https://man7.org/linux/man-pages/man8/ping.8.html", label: "Linux man-pages" },
  { match: /\bssh\b/, command: "ssh student@server", output: "student@server:~$ systemctl status ssh", meaning: "Opens an encrypted remote shell session.", source: "https://man7.org/linux/man-pages/man1/ssh.1.html", label: "OpenSSH / Linux man-pages" },
  { match: /\bsystemctl\b/, command: "systemctl status ssh", output: "Active: active (running) since Wed 2026-09-16 14:22:10 UTC", meaning: "Reports the current state of a systemd service.", source: "https://www.freedesktop.org/software/systemd/man/latest/systemctl.html", label: "freedesktop.org" },
  { match: /\bjournalctl\b/, command: "journalctl -u ssh --since today", output: "Sep 16 14:22:10 lab sshd[842]: Server listening on 0.0.0.0 port 22.", meaning: "Filters systemd journal entries for a service and time range.", source: "https://www.freedesktop.org/software/systemd/man/latest/journalctl.html", label: "freedesktop.org" },
  { match: /\blsblk\b/, command: "lsblk -f", output: "sda  ext4  80G  /dev/sda1  /", meaning: "Maps block devices, filesystems, and mount points.", source: "https://man7.org/linux/man-pages/man8/lsblk.8.html", label: "Linux man-pages" },
  { match: /\bdf\s+-h\b/, command: "df -h /", output: "/dev/sda1  80G  24G  52G  32%  /", meaning: "Reports human-readable filesystem capacity and usage.", source: "https://man7.org/linux/man-pages/man1/df.1.html", label: "Linux man-pages" },
  { match: /\bapt\s+install\b/, command: "sudo apt install apache2", output: "Setting up apache2 ...", meaning: "Installs a package and its dependencies from configured repositories.", source: "https://manpages.debian.org/bookworm/apt/apt.8.en.html", label: "Debian manpages" },
  { match: /\bdpkg\b/, command: "sudo dpkg -i package.deb", output: "Setting up package ...", meaning: "Installs or manages local Debian .deb packages.", source: "https://linuxsimply.com/dpkg-in-linux/", label: "Linux Simply tutorial" },
  { match: /\bgrep\b/, command: "grep -i error app.log", output: "2026-09-16 14:22:10 ERROR connection refused", meaning: "Filters text for matching lines.", source: "https://man7.org/linux/man-pages/man1/grep.1.html", label: "Linux man-pages" },
  { match: /\btar\b/, command: "tar -czf backup.tar.gz project/", output: "project/  project/config.yml  project/data.db", meaning: "Creates a compressed archive from the selected files.", source: "https://www.gnu.org/software/tar/manual/", label: "GNU tar manual" },
  { match: /\buseradd\b/, command: "sudo useradd -m student", output: "account created: student", meaning: "Creates a local user account with a home directory.", source: "https://man7.org/linux/man-pages/man8/useradd.8.html", label: "Linux man-pages" },
  { match: /\bnmap\b/, command: "nmap -sV 10.10.10.20", output: "22/tcp open ssh OpenSSH | 80/tcp open http Apache", meaning: "Identifies services on an authorized lab target.", source: "https://nmap.org/book/man.html", label: "Official Nmap Reference" },
];

function findCommandReference(text) {
  return COMMAND_REFERENCES.find((reference) => reference.match.test(text));
}

function CommandExecutionFigure({ reference }) {
  const previewImage = `https://image.thum.io/get/width/900/crop/700/${reference.source}`;
  return (
    <figure className="command-execution-figure">
      <div className="command-execution-figure__label">EDUCATIONAL EXECUTION DEMONSTRATION</div>
      <div className="command-execution-figure__reference-image">
        <img
          src={previewImage}
          alt={`Internet reference preview for ${reference.command}`}
          loading="lazy"
          onError={(event) => {
            event.currentTarget.closest(".command-execution-figure__reference-image")?.remove();
          }}
        />
        <span>Internet reference preview</span>
      </div>
      <div className="command-execution-figure__terminal">
        <div><i>$</i> {reference.command}</div>
        <div className="command-execution-figure__output">{reference.output}</div>
      </div>
      <figcaption>
        <strong>{reference.command}</strong>
        <span>{reference.meaning}</span>
        <a href={reference.source} target="_blank" rel="noreferrer">Reference: {reference.label} ↗</a>
      </figcaption>
    </figure>
  );
}

function Topic11SectionBody({ lines, sectionNumber, topicTitle = "", sectionTitle = "" }) {
  const blocks = [];
  let paragraph = [];
  let list = [];
  let code = [];
  let inCode = false;

  const flushParagraph = () => {
    if (paragraph.length > 0) {
      blocks.push({ type: "paragraph", lines: paragraph });
      paragraph = [];
    }
  };
  const flushList = () => {
    if (list.length > 0) {
      blocks.push({ type: "list", lines: list });
      list = [];
    }
  };
  const flushCode = () => {
    if (code.length > 0) {
      blocks.push({ type: "code", lines: code });
      code = [];
    }
  };

  for (const line of lines) {
    if (line.trim() === "```") {
      flushParagraph();
      flushList();
      if (inCode) {
        flushCode();
      }
      inCode = !inCode;
    } else if (inCode) {
      code.push(line);
    } else if (/^\s*-\s+/.test(line)) {
      flushParagraph();
      list.push(line.replace(/^\s*-\s+/, ""));
    } else if (line.trim() === "") {
      flushParagraph();
      flushList();
    } else {
      flushList();
      paragraph.push(line);
    }
  }

  flushParagraph();
  flushList();
  flushCode();
  const sectionText = `${sectionTitle}\n${topicTitle}\n${lines.join("\n")}`;
  const commandReference = findCommandReference(sectionText);

  return blocks.map((block, index) => {
    const key = `topic11-${sectionNumber}-${index}`;
    if (block.type === "code") {
      return <pre className="topic-code-block" key={key}>{block.lines.join("\n")}</pre>;
    }
    if (block.type === "list") {
      return (
        <ul className="topic-lecture-list" key={key}>
          {block.lines.map((item, itemIndex) => (
            <li key={`${key}-${itemIndex}`}>{renderTopic11Inline(item, `${key}-${itemIndex}`)}</li>
          ))}
        </ul>
      );
    }
    return (
      <Fragment key={key}>
        {index === 0 && commandReference && <CommandExecutionFigure reference={commandReference} />}
        {block.lines.map((line, lineIndex) => (
          <p key={`${key}-${lineIndex}`}>
            {renderTopic11Inline(line, `${key}-${lineIndex}`)}
          </p>
        ))}
      </Fragment>
    );
  });
}

function CustomSlideDeck({ slides, topic, lectureText = "" }) {
  const [activeSlide, setActiveSlide] = useState(0);
  const slide = slides[activeSlide];
  const visualTheme = getTopicVisualTheme(topic);
  return (
    <div
      className={`topic-learning-scroll topic-slide-deck topic-theme-${visualTheme.key} custom-slide-deck`}
      style={{
        "--topic-accent": visualTheme.accent,
        "--topic-secondary": visualTheme.secondary,
        "--topic-ink": visualTheme.ink,
        "--topic-surface": visualTheme.surface,
        "--topic-deep": visualTheme.deep,
      }}
    >
      <div className="topic-course-navigator__topline">
        <strong>{slide.title}</strong>
        <span>{activeSlide + 1} / {slides.length}</span>
      </div>
      <div
        className="custom-slide-canvas topic-slide-viewport"
        style={{ "--custom-slide-aspect": `16 / ${9 * (Number(slide.heightScale) || 1)}` }}
      >
        <div className="custom-slide-canvas__actual-preview topic-slide-viewport">
          <ActualTopicSlideVisual slide={slide} topic={topic} lectureText={lectureText} />
        </div>
        <button
          type="button"
          className="topic-slide-arrow topic-slide-arrow--previous"
          onClick={() => setActiveSlide((value) => Math.max(0, value - 1))}
          disabled={activeSlide === 0}
          aria-label="Previous slide"
        >
          <span aria-hidden="true">‹</span>
        </button>
        <button
          type="button"
          className="topic-slide-arrow topic-slide-arrow--next"
          onClick={() => setActiveSlide((value) => Math.min(slides.length - 1, value + 1))}
          disabled={activeSlide === slides.length - 1}
          aria-label="Next slide"
        >
          <span aria-hidden="true">›</span>
        </button>
        {slide.blocks.filter((block) => block.custom).map((block) => (
          <div
            className="custom-slide-block"
            key={block.id}
            style={{ left: `${block.x}%`, top: `${block.y}%`, width: `${block.width}%`, height: `${block.height}%` }}
          >
            {block.type === "image" ? (
              <img src={block.src} alt={block.alt || `${topic.title} slide image`} />
            ) : (
              <div>{block.text}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function WordTopicContent({ topic, apiFetch }) {
  const [content, setContent] = useState("");
  const [loadError, setLoadError] = useState("");
  const [customSlides, setCustomSlides] = useState(null);
  const [slidePosition, setSlidePosition] = useState({ key: "", index: 0, direction: "forward" });
  const topicNumber = Number(topic.order_number);
  const contentAsset = getTopicContentAsset(topic);
  const visualTheme = getTopicVisualTheme(topic);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    if (!contentAsset) {
      return () => {
        active = false;
        controller.abort();
      };
    }

    fetch(new URL(contentAsset, window.location.origin).toString(), {
      cache: "no-store",
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Unable to load the mapped lecture for ${topic.title}.`);
        }
        return response.text();
      })
      .then((text) => {
        if (active) {
          setContent(text || `# ${topic.title}\n\n${topic.description || "Lesson content is temporarily unavailable."}`);
          setLoadError("");
        }
      })
      .catch((error) => {
        if (active && error?.name !== "AbortError") {
          const fallbackText = `# ${topic.title}\n\n${topic.description || "Lesson content is temporarily unavailable."}\n\nThis topic is ready for review, and the lesson asset will load automatically when the server responds.`;
          setContent(fallbackText);
          setLoadError(error.message || "Unable to load the mapped lecture content.");
        }
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [contentAsset, topic.id, topic.title, topic.description]);

  useEffect(() => {
    let active = true;
    apiFetch(`${API_URL}/api/topics/${topic.id}/slides`)
      .then(async (response) => {
        const data = response ? await readJson(response) : null;
        if (response?.ok && data?.slides?.length && active) {
          setCustomSlides(data.slides);
        } else if (active) {
          setCustomSlides([]);
        }
      })
      .catch(() => {
        if (active) setCustomSlides([]);
      });
    return () => {
      active = false;
    };
  }, [apiFetch, topic.id]);

  const lectureText = contentAsset ? content : "";
  const slideKey = `${contentAsset || ""}:${topicNumber}:${lectureText}`;
  const contentError = contentAsset
    ? loadError
    : `No lecture file is mapped to topic ID ${topic.id}.`;
  const sections = lectureText ? parseTopic11Lecture(lectureText) : [];
  const hasPeople = isFirstMappedTopic(topic) && PEOPLE_REFERENCES.some((person) => personMatchesContent(lectureText, person));
  const visibleCustomSlides = customSlides?.filter(
    (slide) => isFirstMappedTopic(topic) || slide.kind !== "people",
  ).map((slide) => (
    slide.kind === "people"
      ? {
          ...slide,
          blocks: slide.blocks.map((block) => {
            const person = block.type === "image"
              ? PEOPLE_REFERENCES.find((candidate) => block.alt?.startsWith(candidate.name))
              : null;
            return person ? { ...block, src: person.image } : block;
          }),
        }
      : slide
  ));
  const peopleSlideTitles = hasPeople ? ["People behind the ideas"] : [];
  const slideTitles = [
    "Welcome",
    ...peopleSlideTitles,
    ...sections.map((section) => section.title),
    ...(sections.some((section) => section.title.toLowerCase().includes("takeaway"))
      ? []
      : ["Key takeaways"]),
  ].filter((title, index, array) => {
    const normalized = normalizeSlideTitle(title);
    return normalized && array.findIndex((candidate) => normalizeSlideTitle(candidate) === normalized) === index;
  });
  const slideCount = slideTitles.length;
  const activeSlide = slidePosition.key === slideKey ? slidePosition.index : 0;
  const slideDirection = slidePosition.key === slideKey ? slidePosition.direction : "forward";
  const goToSlide = useCallback((value) => {
    const nextSlide = Math.max(0, Math.min(slideCount - 1, value));
    setSlidePosition({
      key: slideKey,
      index: nextSlide,
      direction: nextSlide >= activeSlide ? "forward" : "backward",
    });
  }, [activeSlide, slideCount, slideKey]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "ArrowRight") goToSlide(activeSlide + 1);
      if (event.key === "ArrowLeft") goToSlide(activeSlide - 1);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeSlide, goToSlide]);

  if (visibleCustomSlides?.length) {
    return (
      <>
        {contentError && <div className="error-message">{contentError}</div>}
        <CustomSlideDeck slides={visibleCustomSlides} topic={topic} lectureText={lectureText} />
      </>
    );
  }

  return (
    <div
      className={`topic-learning-scroll topic-slide-deck topic-theme-${visualTheme.key}`}
      style={{
        "--topic-accent": visualTheme.accent,
        "--topic-secondary": visualTheme.secondary,
        "--topic-ink": visualTheme.ink,
        "--topic-surface": visualTheme.surface,
        "--topic-deep": visualTheme.deep,
      }}
    >
      {lectureText && (
        <TopicCourseNavigator
          slideTitles={slideTitles}
          activeIndex={activeSlide}
          onChange={goToSlide}
        />
      )}
      <div className={`topic-slide-viewport is-${slideDirection}`} aria-live="polite">
        <button
          type="button"
          className="topic-slide-arrow topic-slide-arrow--previous"
          onClick={() => goToSlide(activeSlide - 1)}
          disabled={activeSlide === 0}
          aria-label="Previous slide"
        >
          <span aria-hidden="true">‹</span>
        </button>
        {activeSlide === 0 && (
          <section className="topic-intro-panel topic-slide">
            <div className="topic-intro-icon">{String(topicNumber).padStart(2, "0")}</div>
            <div>
              <span className="section-label">WORD DOCUMENT LESSON</span>
              <h2>{topic.title}</h2>
              <p>The complete lesson content supplied in the Word document is shown below.</p>
            </div>
          </section>
        )}
        {hasPeople && activeSlide === 1 && <PeopleMentionedGallery content={lectureText} />}
        {sections.map((section, index) => {
          const sectionSlide = (hasPeople ? 2 : 1) + index;
          return activeSlide === sectionSlide ? (
            <TopicContentSection
              key={`${topicNumber}-${section.number}-${section.title}`}
              number={section.number}
              title={section.title}
              sectionId={`course-section-${index}`}
              tone={["blue", "cyan", "teal", "indigo", "purple", "slate", "orange"][index % 7]}
            >
              <Topic11SectionBody
                lines={section.lines}
                sectionNumber={`${topicNumber}-${section.number}`}
                topicTitle={topic.title}
                sectionTitle={section.title}
              />
            </TopicContentSection>
          ) : null;
        })}
        {activeSlide === slideTitles.length - 1 &&
          sections.length > 0 &&
          !sections[sections.length - 1].title.toLowerCase().includes("takeaway") && (
          <section className="topic-takeaways topic-slide">
            <span className="section-label">KEY TAKEAWAYS</span>
            <h2>Apply this topic in an authorized lab.</h2>
            <p>Move forward and backward through the lesson using the controls, the section rail, or your keyboard arrow keys.</p>
          </section>
        )}
        {contentError && <div className="error-message">{contentError}</div>}
        {!lectureText && !contentError && <div className="loading-state">Loading Topic {topicNumber}...</div>}
        <button
          type="button"
          className="topic-slide-arrow topic-slide-arrow--next"
          onClick={() => goToSlide(activeSlide + 1)}
          disabled={activeSlide === slideTitles.length - 1}
          aria-label="Next slide"
        >
          <span aria-hidden="true">›</span>
        </button>
        {content && (
          <div className="topic-slide-dots" aria-label="Slide progress">
            {slideTitles.map((title, index) => (
              <button
                type="button"
                key={`${index}-${title}-dot`}
                className={index === activeSlide ? "is-active" : ""}
                onClick={() => goToSlide(index)}
                aria-label={`Go to slide ${index + 1}: ${title}`}
                aria-current={index === activeSlide ? "step" : undefined}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TopicCourseNavigator({ slideTitles, activeIndex, onChange }) {
  const jumpToSection = (index) => onChange(index);

  return (
    <nav className="topic-course-navigator" aria-label="Lesson sections">
      <div className="topic-course-navigator__topline">
        <div>
          <span className="section-label">MICROCOURSE PATH</span>
          <strong>Explore this lesson</strong>
        </div>
        <span>{activeIndex + 1} / {slideTitles.length}</span>
      </div>
      <div className="topic-course-navigator__progress" aria-hidden="true">
        <span style={{ width: `${((activeIndex + 1) / slideTitles.length) * 100}%` }} />
      </div>
      <div className="topic-course-navigator__rail">
        {slideTitles.map((title, index) => (
          <button
            type="button"
            key={`${index}-${title}`}
            className={index === activeIndex ? "is-active" : index < activeIndex ? "is-visited" : ""}
            onClick={() => jumpToSection(index)}
          >
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{title}</strong>
          </button>
        ))}
      </div>
      <div className="topic-course-navigator__controls">
        <button type="button" onClick={() => jumpToSection(activeIndex - 1)} disabled={activeIndex === 0}>← Previous</button>
        <button type="button" className="is-next" onClick={() => jumpToSection(activeIndex + 1)} disabled={activeIndex === slideTitles.length - 1}>Next slide →</button>
      </div>
    </nav>
  );
}

const PEOPLE_REFERENCES = [
  {
    name: "Ken Thompson",
    role: "Unix co-creator",
    birthYear: 1943,
    contribution: "Co-designed Unix and created the B programming language.",
    contributionYear: 1969,
    match: "Ken Thompson",
    aliases: ["Kenneth Thompson"],
    image: "/people/ken-thompson.jpg",
    source: "",
  },
  {
    name: "Dennis Ritchie",
    role: "Unix and C co-creator",
    birthYear: 1941,
    contribution: "Created the C programming language and co-developed Unix.",
    contributionYear: 1972,
    match: "Dennis Ritchie",
    aliases: ["Dennis MacAlistair Ritchie"],
    image: "/people/dennis-ritchie.jpg",
    source: "",
  },
  {
    name: "Richard Stallman",
    role: "GNU Project founder",
    birthYear: 1953,
    contribution: "Started the GNU Project and wrote the GNU Manifesto.",
    contributionYear: 1983,
    match: "Richard Stallman",
    aliases: ["Richard Matthew Stallman"],
    image: "/people/richard-stallman.jpg",
    source: "",
  },
  {
    name: "Andrew S. Tanenbaum",
    role: "MINIX creator",
    birthYear: 1944,
    contribution: "Created MINIX, an influential Unix-like teaching system.",
    contributionYear: 1987,
    match: "Andrew S. Tanenbaum",
    aliases: ["Andrew Tanenbaum", "Tanenbaum"],
    image: "/people/andrew-tanenbaum.jpg",
    source: "",
  },
  {
    name: "Linus Torvalds",
    role: "Linux kernel creator",
    birthYear: 1969,
    contribution: "Created the Linux kernel and released its first version.",
    contributionYear: 1991,
    match: "Linus Torvalds",
    aliases: ["Linus Benedict Torvalds", "Linus B. Torvalds", "Torvalds"],
    image: "/people/linus-torvalds.jpg",
    source: "",
  },
];

function personMatchesContent(content, person) {
  if (!content || !person) return false;

  const searchTerms = [person.match, person.name, ...(person.aliases || [])]
    .filter((term) => typeof term === "string" && term.trim());

  return searchTerms.some((term) => content.toLowerCase().includes(term.toLowerCase()));
}

function PeopleMentionedGallery({ content, groupIndex = null, titleText, descriptionText, selectedBlockId }) {
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const allPeople = PEOPLE_REFERENCES.filter((person) => personMatchesContent(content, person));
  const midpoint = Math.ceil(allPeople.length / 2);
  const people = groupIndex == null
    ? allPeople
    : allPeople.slice(groupIndex === 0 ? 0 : midpoint, groupIndex === 0 ? midpoint : allPeople.length);

  const activeSelectedPerson = people.some((person) => person.name === selectedPerson?.name)
    ? selectedPerson
    : null;
  const activeGalleryIndex = people.length ? galleryIndex % people.length : 0;
  const repeatedPeople = people.length ? [...people, ...people, ...people] : [];
  const offsetIndex = people.length ? people.length + activeGalleryIndex : 0;

  const moveGallery = (direction) => {
    setGalleryIndex((current) => {
      const next = (current + direction + people.length) % people.length;
      return next;
    });
  };

  if (!people.length) return null;

  return (
    <section className="people-mentioned" aria-label="People mentioned in this lesson">
      <div className="people-mentioned__header">
        <div>
          <span className="section-label">PEOPLE MENTIONED</span>
          <h2 className={selectedBlockId === "people-title" ? "is-editing-source" : ""}>
            {titleText || `People behind the ideas${groupIndex == null ? "" : ` — ${groupIndex + 1}`}`}
          </h2>
          <p className={selectedBlockId === "people-description" ? "is-editing-source" : ""}>
            {descriptionText || "Click a portrait to review the person behind the idea."}
          </p>
        </div>
        <span className="people-mentioned__count">{people.length} references</span>
      </div>

      <div className="people-carousel" aria-label="People photo carousel">
        <button
          type="button"
          className="people-carousel__nav people-carousel__nav--prev"
          onClick={() => moveGallery(-1)}
          aria-label="Previous person"
        >
          ‹
        </button>

        <div className="people-carousel__viewport">
          <div
            className="people-carousel__track"
            style={{ transform: `translateX(-${offsetIndex * 100}%)` }}
          >
            {repeatedPeople.map((person, index) => (
              <button
                type="button"
                className={`person-card${activeSelectedPerson?.name === person.name ? " is-selected" : ""}`}
                key={`${person.name}-${index}`}
                onClick={() => setSelectedPerson(person)}
                aria-label={`View details for ${person.name}`}
              >
                <img src={person.image} alt={`${person.name}, ${person.role}`} loading="lazy" />
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          className="people-carousel__nav people-carousel__nav--next"
          onClick={() => moveGallery(1)}
          aria-label="Next person"
        >
          ›
        </button>
      </div>

      {activeSelectedPerson && (
        <div className="person-detail" aria-live="polite">
          <button
            type="button"
            className="person-detail__close"
            onClick={() => setSelectedPerson(null)}
            aria-label={`Close details for ${activeSelectedPerson.name}`}
          >
            Close
          </button>
          <div className="person-detail__content">
            <img src={activeSelectedPerson.image} alt={`${activeSelectedPerson.name}, ${activeSelectedPerson.role}`} className="person-detail__image" />
            <div className="person-detail__body">
              <span className="section-label">PERSON PROFILE</span>
              <h3>{activeSelectedPerson.name}</h3>
              <p className="person-detail__role">{activeSelectedPerson.role}</p>
              <p className="person-detail__summary">{activeSelectedPerson.contribution}</p>
              <dl className="person-card__facts">
                <div><dt>Born</dt><dd>{activeSelectedPerson.birthYear}</dd></div>
                <div><dt>Contribution</dt><dd>{activeSelectedPerson.contribution}</dd></div>
                <div><dt>Year</dt><dd>{activeSelectedPerson.contributionYear}</dd></div>
              </dl>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

const TOPIC_VISUAL_THEMES = [
  ["unix-aurora", "#b5e600", "#22d3ee", "#f8fafc", "#111827", "#07111f"],
  ["foundations-blue", "#60a5fa", "#a78bfa", "#eff6ff", "#172554", "#0b1228"],
  ["kernel-electric", "#38bdf8", "#34d399", "#ecfeff", "#0c3044", "#061722"],
  ["architecture-indigo", "#818cf8", "#22d3ee", "#eef2ff", "#202050", "#0e102b"],
  ["freedom-purple", "#c084fc", "#f0abfc", "#faf5ff", "#32164f", "#190b2c"],
  ["distribution-green", "#4ade80", "#facc15", "#f0fdf4", "#123524", "#071a16"],
  ["desktop-pink", "#f472b6", "#c084fc", "#fdf2f8", "#3b1737", "#1f0c22"],
  ["boot-orange", "#fb923c", "#facc15", "#fff7ed", "#3a2414", "#1d110a"],
  ["storage-teal", "#2dd4bf", "#38bdf8", "#ecfeff", "#103637", "#071b22"],
  ["hierarchy-lime", "#a3e635", "#4ade80", "#f7fee7", "#253817", "#101d0d"],
  ["shell-cyan", "#22d3ee", "#2dd4bf", "#ecfeff", "#0d2933", "#06171f"],
  ["navigation-sky", "#38bdf8", "#34d399", "#f0f9ff", "#123149", "#081a2a"],
  ["text-amber", "#fbbf24", "#fb7185", "#fffbeb", "#3b2514", "#1e120c"],
  ["identity-rose", "#fb7185", "#f472b6", "#fff1f2", "#351827", "#1d0b17"],
  ["utility-violet", "#a78bfa", "#e879f9", "#f5f3ff", "#29204b", "#140e2b"],
  ["network-ocean", "#0ea5e9", "#6366f1", "#eff6ff", "#102e52", "#071426"],
  ["permissions-red", "#f87171", "#fbbf24", "#fff1f2", "#3b1b20", "#200b11"],
  ["privilege-crimson", "#fb7185", "#f97316", "#fff1f2", "#401b28", "#210b16"],
  ["server-green", "#34d399", "#22d3ee", "#ecfdf5", "#10382d", "#071c18"],
  ["client-purple", "#8b5cf6", "#38bdf8", "#f5f3ff", "#252052", "#100d2d"],
  ["enterprise-gold", "#facc15", "#fb923c", "#fefce8", "#302516", "#1b140a"],
  ["packages-coral", "#fb923c", "#f472b6", "#fff7ed", "#3b2020", "#1f0e13"],
  ["apache-red", "#ef4444", "#fb923c", "#fef2f2", "#401b1d", "#210b0e"],
  ["services-cyan", "#06b6d4", "#818cf8", "#ecfeff", "#123145", "#071923"],
  ["security-rose", "#f43f5e", "#e879f9", "#fff1f2", "#40152c", "#21091a"],
  ["lifecycle-magenta", "#d946ef", "#8b5cf6", "#fdf4ff", "#35154d", "#1b0b29"],
  ["recon-yellow", "#facc15", "#84cc16", "#fefce8", "#303214", "#191a0a"],
  ["osint-emerald", "#10b981", "#14b8a6", "#ecfdf5", "#103b36", "#071d1a"],
  ["exploitation-red", "#f43f5e", "#f97316", "#fff1f2", "#401a21", "#210b10"],
  ["hardening-slate", "#94a3b8", "#22d3ee", "#f1f5f9", "#1e293b", "#0b1220"],
].map(([key, accent, secondary, ink, surface, deep]) => ({
  key,
  accent,
  secondary,
  ink,
  surface,
  deep,
}));

function getTopicVisualTheme(topic) {
  const number = Number(topic?.order_number) || 1;
  return TOPIC_VISUAL_THEMES[(number - 1) % TOPIC_VISUAL_THEMES.length];
}

function LinuxDirectoryStructureContent() {
  const [content, setContent] = useState("");
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let active = true;

    fetch("/topic10.txt")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Unable to load the Topic 11 lecture.");
        }
        return response.text();
      })
      .then((text) => {
        if (active) {
          setContent(text);
        }
      })
      .catch((error) => {
        if (active) {
          setLoadError(error.message);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="topic-learning-scroll">
      <section className="topic-intro-panel">
        <div className="topic-intro-icon">11</div>
        <div>
          <span className="section-label">DIRECTORY STRUCTURE</span>
          <h2>Linux Directory Structure and File Hierarchy</h2>
          <p>
            The complete supplied Topic 11 lecture is shown below without
            rewriting or compressing its content.
          </p>
        </div>
      </section>
      {loadError && <div className="error-message">{loadError}</div>}
      {!content && !loadError && <div className="loading-state">Loading Topic 11...</div>}
      {content &&
        parseTopic11Lecture(content).map((section, index) => (
          <TopicContentSection
            key={`${section.number}-${section.title}`}
            number={section.number}
            title={section.title}
            tone={["blue", "cyan", "teal", "indigo", "purple", "slate", "orange"][index % 7]}
          >
            <Topic11SectionBody lines={section.lines} sectionNumber={section.number} />
          </TopicContentSection>
        ))}
    </div>
  );
}

function ShellCommandFlowVisualizer() {
  const stages = [
    ["Command", "grep -i error app.log", "The user enters a command and its arguments."],
    ["Expansion", "grep -i error app.log | less", "The shell expands variables, wildcards, substitutions, and aliases."],
    ["Pipeline", "stdout → pipe → stdin", "The output of one command becomes input to another."],
    ["Process", "fork → exec → wait", "The shell starts the program and tracks its exit status."],
    ["Result", "matching lines", "The command writes output or an error for the user."],
  ];
  const [stage, setStage] = useState(0);
  const current = stages[stage];

  return (
    <section className="process-simulator shell-flow-visualizer">
      <div className="process-simulator__header">
        <div>
          <span className="section-label">INTERACTIVE VISUALIZER</span>
          <h2>Trace a shell command</h2>
          <p>Move through the path from typed command to displayed result.</p>
        </div>
        <span className="process-simulator__pid">CLI 12</span>
      </div>
      <div className="process-simulator__track">
        {stages.map(([label], index) => (
          <button
            type="button"
            key={label}
            className={`process-simulator__state ${index === stage ? "active" : ""} ${index < stage ? "visited" : ""}`}
            onClick={() => setStage(index)}
          >
            <span>{index + 1}</span>
            <b>{label}</b>
          </button>
        ))}
      </div>
      <div className="process-simulator__detail">
        <strong>{current[0]}: <code>{current[1]}</code></strong>
        <p>{current[2]}</p>
        <div className="process-simulator__controls">
          <button type="button" className="secondary-action" onClick={() => setStage((value) => Math.max(0, value - 1))} disabled={stage === 0}>← Previous</button>
          <button type="button" className="primary-button" onClick={() => setStage((value) => Math.min(stages.length - 1, value + 1))} disabled={stage === stages.length - 1}>Next stage →</button>
        </div>
      </div>
    </section>
  );
}

function LinuxShellsContent() {
  const [content, setContent] = useState("");
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let active = true;

    fetch("/topic11.txt")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Unable to load the Topic 12 lecture.");
        }
        return response.text();
      })
      .then((text) => {
        if (active) {
          setContent(text);
        }
      })
      .catch((error) => {
        if (active) {
          setLoadError(error.message);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="topic-learning-scroll">
      <section className="topic-intro-panel">
        <div className="topic-intro-icon">12</div>
        <div>
          <span className="section-label">COMMAND-LINE ADMINISTRATION</span>
          <h2>Linux Shells, Command-Line Interfaces, and Shell Scripting</h2>
          <p>
            The complete supplied Topic 12 lecture is presented in the same
            interactive lesson format while preserving its original content.
          </p>
        </div>
      </section>

      <ShellCommandFlowVisualizer />

      <InteractiveExample
        title="Build a pipeline interactively"
        scenario="Find errors in a log, count them, and inspect the result."
        steps={[
          "Start with a producer such as cat app.log or grep error app.log.",
          "Connect commands with | so each command receives the previous command's output.",
          "Use redirection such as >, >>, or 2> when output must be saved or separated.",
        ]}
        result="Shell composition lets small tools perform larger tasks while keeping each step visible and scriptable."
        visual={<div className="interactive-example__flow"><span>grep</span><b>→ |</b><span>sort</span><b>→ |</b><span>uniq -c</span><b>→</b><span>report</span></div>}
      />

      {loadError && <div className="error-message">{loadError}</div>}
      {!content && !loadError && <div className="loading-state">Loading Topic 12...</div>}
      {content &&
        parseTopic11Lecture(content).map((section, index) => (
          <TopicContentSection
            key={`${section.number}-${section.title}`}
            number={section.number}
            title={section.title}
            tone={["blue", "cyan", "teal", "indigo", "purple", "slate", "orange"][index % 7]}
          >
            <Topic11SectionBody lines={section.lines} sectionNumber={section.number} />
          </TopicContentSection>
        ))}
    </div>
  );
}

function FileOperationsFlowVisualizer() {
  const stages = [
    ["Locate", "pwd + ls -lah", "Confirm the working directory and inspect the available entries."],
    ["Select", "find . -name '*.log'", "Find the exact files or directories that match the task."],
    ["Inspect", "head / tail / less", "Read safely before changing or removing anything."],
    ["Transform", "grep | sort | uniq", "Filter, sort, count, and combine text-processing tools."],
    ["Preserve", "cp / tar / gzip", "Copy or archive the result before destructive maintenance."],
  ];
  const [stage, setStage] = useState(0);
  const current = stages[stage];

  return (
    <section className="process-simulator shell-flow-visualizer">
      <div className="process-simulator__header">
        <div>
          <span className="section-label">INTERACTIVE VISUALIZER</span>
          <h2>Trace a safe file operation</h2>
          <p>Step through the investigation and text-processing workflow.</p>
        </div>
        <span className="process-simulator__pid">FILE 13</span>
      </div>
      <div className="process-simulator__track">
        {stages.map(([label], index) => (
          <button
            type="button"
            key={label}
            className={`process-simulator__state ${index === stage ? "active" : ""} ${index < stage ? "visited" : ""}`}
            onClick={() => setStage(index)}
          >
            <span>{index + 1}</span>
            <b>{label}</b>
          </button>
        ))}
      </div>
      <div className="process-simulator__detail">
        <strong>{current[0]}: <code>{current[1]}</code></strong>
        <p>{current[2]}</p>
        <div className="process-simulator__controls">
          <button type="button" className="secondary-action" onClick={() => setStage((value) => Math.max(0, value - 1))} disabled={stage === 0}>← Previous</button>
          <button type="button" className="primary-button" onClick={() => setStage((value) => Math.min(stages.length - 1, value + 1))} disabled={stage === stages.length - 1}>Next stage →</button>
        </div>
      </div>
    </section>
  );
}

function LinuxFileOperationsContent() {
  const [content, setContent] = useState("");
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let active = true;

    fetch("/topic13.txt")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Unable to load the Topic 13 lecture.");
        }
        return response.text();
      })
      .then((text) => {
        if (active) {
          setContent(text);
        }
      })
      .catch((error) => {
        if (active) {
          setLoadError(error.message);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="topic-learning-scroll">
      <section className="topic-intro-panel">
        <div className="topic-intro-icon">13</div>
        <div>
          <span className="section-label">FILE OPERATIONS</span>
          <h2>Linux File Operations, Navigation, and Text Processing</h2>
          <p>
            The complete supplied Topic 13 lecture is presented in the same
            interactive lesson format while preserving its original content.
          </p>
        </div>
      </section>

      <FileOperationsFlowVisualizer />

      <InteractiveExample
        title="Investigate a growing log"
        scenario="Find recent log files, inspect them, and count repeated messages."
        steps={[
          "Confirm the current location with pwd and identify candidates with find or ls.",
          "Use tail, grep, wc, sort, and uniq to inspect and summarize without editing the source.",
          "Create a safe copy or archive before any cleanup, rename, or removal operation.",
        ]}
        result="The safest file workflow separates locating, inspecting, transforming, and preserving from destructive changes."
        visual={<div className="interactive-example__flow"><span>find</span><b>→</b><span>grep</span><b>→</b><span>sort</span><b>→</b><span>uniq -c</span><b>→</b><span>archive</span></div>}
      />

      {loadError && <div className="error-message">{loadError}</div>}
      {!content && !loadError && <div className="loading-state">Loading Topic 13...</div>}
      {content &&
        parseTopic11Lecture(content).map((section, index) => (
          <TopicContentSection
            key={`${section.number}-${section.title}`}
            number={section.number}
            title={section.title}
            tone={["blue", "cyan", "teal", "indigo", "purple", "slate", "orange"][index % 7]}
          >
            <Topic11SectionBody lines={section.lines} sectionNumber={section.number} />
          </TopicContentSection>
        ))}
    </div>
  );
}

function UserPrivilegeFlowVisualizer() {
  const stages = [
    ["Identity", "id renz", "Resolve the user identity, UID, primary group, and supplementary groups."],
    ["Resource", "ls -l /srv/app", "Inspect the owner, group, mode bits, ACLs, and security context."],
    ["Decision", "sudo -l", "Check whether an administrative action is allowed by policy."],
    ["Action", "sudo systemctl restart app", "Perform only the required operation with controlled elevation."],
    ["Audit", "journalctl / last", "Review activity and retain accountability for privileged changes."],
  ];
  const [stage, setStage] = useState(0);
  const current = stages[stage];

  return (
    <section className="process-simulator shell-flow-visualizer">
      <div className="process-simulator__header">
        <div>
          <span className="section-label">INTERACTIVE VISUALIZER</span>
          <h2>Trace an access decision</h2>
          <p>Follow identity, permissions, privilege, action, and audit evidence.</p>
        </div>
        <span className="process-simulator__pid">IAM 14</span>
      </div>
      <div className="process-simulator__track">
        {stages.map(([label], index) => (
          <button
            type="button"
            key={label}
            className={`process-simulator__state ${index === stage ? "active" : ""} ${index < stage ? "visited" : ""}`}
            onClick={() => setStage(index)}
          >
            <span>{index + 1}</span>
            <b>{label}</b>
          </button>
        ))}
      </div>
      <div className="process-simulator__detail">
        <strong>{current[0]}: <code>{current[1]}</code></strong>
        <p>{current[2]}</p>
        <div className="process-simulator__controls">
          <button type="button" className="secondary-action" onClick={() => setStage((value) => Math.max(0, value - 1))} disabled={stage === 0}>← Previous</button>
          <button type="button" className="primary-button" onClick={() => setStage((value) => Math.min(stages.length - 1, value + 1))} disabled={stage === stages.length - 1}>Next stage →</button>
        </div>
      </div>
    </section>
  );
}

function LinuxUserPrivilegeContent() {
  const [content, setContent] = useState("");
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let active = true;

    fetch("/topic14.txt")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Unable to load the Topic 14 lecture.");
        }
        return response.text();
      })
      .then((text) => {
        if (active) {
          setContent(text);
        }
      })
      .catch((error) => {
        if (active) {
          setLoadError(error.message);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="topic-learning-scroll">
      <section className="topic-intro-panel">
        <div className="topic-intro-icon">14</div>
        <div>
          <span className="section-label">IDENTITY AND ACCESS</span>
          <h2>Linux User, Group, and Privilege Management</h2>
          <p>
            The complete supplied Topic 14 lecture is presented in the same
            interactive lesson format while preserving its original content.
          </p>
        </div>
      </section>

      <UserPrivilegeFlowVisualizer />

      <InteractiveExample
        title="Apply least privilege"
        scenario="A developer needs to restart one service without becoming unrestricted root."
        steps={[
          "Identify the account, service, group membership, and current permissions.",
          "Use a narrowly scoped sudo rule or group permission for the required operation.",
          "Verify the action and audit the change instead of sharing the root password.",
        ]}
        result="Good privilege management connects identity to a specific resource and action, then records what happened."
        visual={<div className="interactive-example__flow"><span>User</span><b>→</b><span>Group</span><b>→</b><span>sudo policy</span><b>→</b><span>One service</span><b>→</b><span>Audit</span></div>}
      />

      {loadError && <div className="error-message">{loadError}</div>}
      {!content && !loadError && <div className="loading-state">Loading Topic 14...</div>}
      {content &&
        parseTopic11Lecture(content).map((section, index) => (
          <TopicContentSection
            key={`${section.number}-${section.title}`}
            number={section.number}
            title={section.title}
            tone={["blue", "cyan", "teal", "indigo", "purple", "slate", "orange"][index % 7]}
          >
            <Topic11SectionBody lines={section.lines} sectionNumber={section.number} />
          </TopicContentSection>
        ))}
    </div>
  );
}

function TopicWorkflowVisualizer({ number, title, stages }) {
  const [stage, setStage] = useState(0);
  const current = stages[stage];

  return (
    <section className="process-simulator shell-flow-visualizer">
      <div className="process-simulator__header">
        <div>
          <span className="section-label">INTERACTIVE VISUALIZER</span>
          <h2>{title}</h2>
          <p>Move through the administration workflow step by step.</p>
        </div>
        <span className="process-simulator__pid">TOPIC {number}</span>
      </div>
      <div className="process-simulator__track">
        {stages.map(([label], index) => (
          <button type="button" key={label} className={`process-simulator__state ${index === stage ? "active" : ""} ${index < stage ? "visited" : ""}`} onClick={() => setStage(index)}>
            <span>{index + 1}</span><b>{label}</b>
          </button>
        ))}
      </div>
      <div className="process-simulator__detail">
        <strong>{current[0]}: <code>{current[1]}</code></strong>
        <p>{current[2]}</p>
        <div className="process-simulator__controls">
          <button type="button" className="secondary-action" onClick={() => setStage((value) => Math.max(0, value - 1))} disabled={stage === 0}>← Previous</button>
          <button type="button" className="primary-button" onClick={() => setStage((value) => Math.min(stages.length - 1, value + 1))} disabled={stage === stages.length - 1}>Next stage →</button>
        </div>
      </div>
    </section>
  );
}

function LinuxTopicLectureContent({ number, title, label, description, asset, visualTitle, stages, exampleTitle, scenario, steps, result, flow }) {
  const [content, setContent] = useState("");
  const [loadError, setLoadError] = useState("");
  const lectureContent = asset ? content : "";
  const contentError = asset
    ? loadError
    : `No confirmed static lecture mapping exists for ${title}.`;

  useEffect(() => {
    let active = true;
    if (!asset) {
      return () => {
        active = false;
      };
    }

    fetch(`/${asset}`)
      .then((response) => {
        if (!response.ok) throw new Error(`Unable to load Topic ${number} lecture.`);
        return response.text();
      })
      .then((text) => {
        if (active) setContent(text);
      })
      .catch((error) => {
        if (active) setLoadError(error.message);
      });
    return () => {
      active = false;
    };
  }, [asset, number, title]);

  return (
    <div className="topic-learning-scroll">
      <section className="topic-intro-panel">
        <div className="topic-intro-icon">{number}</div>
        <div>
          <span className="section-label">{label}</span>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
      </section>
      <TopicWorkflowVisualizer number={number} title={visualTitle} stages={stages} />
      <InteractiveExample title={exampleTitle} scenario={scenario} steps={steps} result={result} visual={<div className="interactive-example__flow">{flow.map((item, index) => <span key={`${item}-${index}`}>{item}</span>)}</div>} />
      {contentError && <div className="error-message">{contentError}</div>}
      {!lectureContent && !contentError && <div className="loading-state">Loading Topic {number}...</div>}
      {lectureContent && parseTopic11Lecture(lectureContent).map((section, index) => (
        <TopicContentSection key={`${section.number}-${section.title}`} number={section.number} title={section.title} tone={["blue", "cyan", "teal", "indigo", "purple", "slate", "orange"][index % 7]}>
          <Topic11SectionBody lines={section.lines} sectionNumber={section.number} />
        </TopicContentSection>
      ))}
    </div>
  );
}

function FileDeviceManagementContent() {
  const sections = [
    ["What Is File Management?", "File management organizes and controls files stored on a computer. The operating system provides tools for creating, reading, editing, copying, moving, renaming, deleting, and protecting text, images, videos, programs, configuration data, databases, and logs."],
    ["What Is a File?", "A file is related data stored on a storage device. Examples include document.txt, image.jpg, video.mp4, program.py, and database.db. Linux uses a unified file-based interface, summarized by the Unix principle that everything is a file, although modern Linux also has exceptions and special interfaces."],
    ["Types of Files in Linux", "Linux supports regular files, directories, character devices, block devices, symbolic links, sockets, and named pipes. Use ls -l to identify file types."],
    ["Regular Files", "Regular files contain normal data such as text, binary data, source code, executable programs, photos, and reports."],
    ["Directories", "Directories organize files and other directories. Linux directories form part of one hierarchical file system."],
    ["Linux File System Hierarchy", "The root directory / is the highest directory. All files and directories exist under it. Common branches include /bin, /boot, /dev, /etc, /home, /proc, /tmp, /usr, and /var."],
    ["Important Linux Directories", "/ contains the whole tree. /home stores users' personal files. /etc stores system configuration. /var stores changing data such as logs, cache, spool files, and application data. /usr stores user-space programs and libraries. /boot stores startup files. /dev provides device interfaces. /proc provides live process and kernel information. /tmp stores temporary files."],
    ["File Paths", "An absolute path starts at /, such as /home/user/Documents/report.txt. A relative path depends on the current directory, such as Documents/report.txt."],
    ["Current Working Directory", "The current directory is the location used by relative paths. Use pwd to display it."],
    ["Navigating Directories", "The cd command changes the current directory. cd /home moves to /home, cd .. moves to the parent, and cd ~ moves to the home directory."],
    ["Listing Files", "ls lists files and directories. ls -l provides a detailed listing, ls -a shows hidden files, and ls -la combines both."],
    ["Hidden Files", "Names beginning with a period are generally hidden by many tools. Examples include .bashrc, .profile, and .config. Use ls -a to view them."],
    ["Creating Files", "touch creates an empty file, creates multiple files when given multiple names, and can update timestamps on existing files."],
    ["Creating Directories", "mkdir creates directories. mkdir -p creates nested directories and any missing parent directories."],
    ["Removing Files", "rm removes files. Linux command-line deletion may not provide a recycle bin, so verify the target before removing it."],
    ["Removing Directories", "rmdir removes an empty directory. rm -r removes a directory and its contents, while rm -rf forces recursive removal. Verify the current directory and command, avoid unnecessary force options, and use backups for important data."],
    ["Copying Files", "cp copies files. cp file.txt backup.txt copies a file, cp file.txt /home/user/Documents/ copies to another directory, cp -r copies directories recursively, and cp -i can prompt before overwriting."],
    ["Moving and Renaming Files", "mv renames or moves files. It can rename a file, move it to another directory, or move and rename it at the same time."],
    ["Viewing File Content", "cat displays a file. less views large files interactively with Space for the next page, b for the previous page, and q to quit. more is another paginated viewer."],
    ["head and tail", "head displays the first lines. tail displays the last lines, tail -n 20 displays the last 20, and tail -f follows new log entries in real time."],
    ["File Metadata", "Metadata includes a file name, size, owner, group, permissions, creation-related timestamps, modification time, and access time. Use stat filename."],
    ["File Permissions", "Linux permissions are read (r, value 4), write (w, value 2), and execute (x, value 1). They apply to the user/owner, group, and others."],
    ["Viewing Permissions", "ls -l shows permissions. In rwxr-xr-x, the owner has rwx, while the group and others have r-x."],
    ["Changing Permissions", "chmod changes permissions. chmod 755 script.sh gives the owner rwx and group and others r-x. chmod u+x adds owner execute permission, while chmod g-w removes group write permission."],
    ["File Ownership", "Files have an owner and group. sudo chown user file.txt changes the owner and sudo chown user:group file.txt changes both. Ownership supports security, multi-user systems, and server administration."],
    ["Access Control Lists", "ACLs provide flexible permission control for additional users or groups. getfacl and setfacl are common tools, depending on filesystem and system configuration."],
    ["What Is Device Management?", "Device management controls and communicates with keyboards, mice, monitors, storage drives, USB devices, network adapters, printers, and graphics cards. The OS coordinates applications and hardware."],
    ["Device Drivers", "A device driver is software that lets the operating system communicate with hardware through a standard interface."],
    ["Devices in Linux", "Linux provides many device interfaces under /dev, including /dev/sda, /dev/sdb, /dev/nvme0n1, and /dev/null."],
    ["Block Devices", "Block devices transfer data in blocks. Hard drives, SSDs, and USB storage are examples. Devices can have partitions such as /dev/sda1, /dev/sda2, and /dev/nvme0n1p1."],
    ["Character Devices", "Character devices handle data as a stream of characters. Terminals, serial devices, and some input devices are examples."],
    ["Device Detection in Linux", "udev manages device events and device nodes. A connected USB device is detected by the kernel, creates an event, passes through device management, and becomes available."],
    ["Viewing Hardware Devices", "lsblk displays block devices, partitions, and mount points. lspci displays PCI devices such as graphics cards and network adapters. lsusb displays USB devices. sudo lshw displays detailed hardware information when available."],
    ["Storage Devices", "Linux supports HDDs, SATA SSDs, NVMe SSDs, USB drives, network storage, SAN, NAS, and cloud storage."],
    ["Partitions", "A disk can be divided into partitions for the operating system, user files, swap, recovery, or separate data."],
    ["File Systems", "A partition normally needs a filesystem. ext4 provides journaling, reliability, large-file support, and good performance. XFS is common for high-performance and large-scale storage. Btrfs provides snapshots, checksums, Copy-on-Write, and advanced storage management."],
    ["Mounting File Systems", "Before a storage device can normally be accessed through the directory tree, its partition and filesystem must be mounted. sudo mount /dev/sdb1 /mnt makes it available at /mnt."],
    ["Mount Points", "A mount point is the directory where a filesystem becomes accessible. Linux combines multiple storage devices into one directory hierarchy."],
    ["Viewing Mounted File Systems", "mount, findmnt, and df -h show mounted filesystems and disk usage."],
    ["Persistent Mounting", "Temporary mounts may disappear after a restart. /etc/fstab configures persistent mounts. UUIDs are commonly preferred over device names because device naming can change. blkid displays UUID information."],
    ["Disk Space Management", "df -h reports each filesystem, total size, used space, available space, and mount point."],
    ["Checking Directory Size", "du -sh /home/user displays approximate directory size. du -h --max-depth=1 helps identify large directories."],
    ["Disk Full Problems", "A full disk can cause application failures, database errors, log-writing failures, and stopped services. Monitor both disk usage and inode usage; df -i checks inodes."],
    ["Journaling File Systems", "A journaling filesystem keeps a journal of certain changes, helping recovery after power failure, system crash, or unexpected shutdown. ext4 and XFS are examples."],
    ["RAID Storage", "RAID combines storage devices. RAID 0 stripes for performance without redundancy; RAID 1 mirrors for redundancy; RAID 5 uses distributed parity; RAID 6 adds parity protection; RAID 10 combines mirroring and striping. Choose based on performance, capacity, redundancy, and cost. RAID is not a replacement for backups."],
    ["LVM — Logical Volume Manager", "LVM provides flexible storage management through Physical Volumes, a Volume Group, and Logical Volumes. It is useful for servers, storage expansion, and logical partition management."],
    ["Modern Device Storage Technologies", "Modern storage includes NVMe, SSD, RAID, LVM, Btrfs, ZFS, network storage, and cloud storage. Storage performance matters for databases, virtual machines, containers, and AI workloads."],
    ["Device Management and Virtualization", "A hypervisor presents virtual devices to a guest operating system: virtual disks, virtual network adapters, and virtual CPUs. Examples include VirtualBox, VMware, KVM, and Hyper-V."],
    ["Device Management and Containers", "Containers generally share the host kernel and interact with virtual networks, mounted volumes, and storage drivers. Container storage must be managed to avoid unnecessary disk usage."],
    ["Docker Volumes", "Docker volumes provide persistent storage so data remains available when a container is recreated. They are important for databases, application data, and persistent services."],
    ["Device Security", "Administrators should control USB devices, storage access, device permissions, and driver updates. Device access policies, encryption, access control, and hardware inventory reduce risks from unauthorized devices."],
    ["Storage Encryption", "Encryption protects data if storage is lost or stolen. Full-disk encryption, encrypted volumes, encrypted files, and LUKS are relevant concepts. Combine encryption with strong authentication, secure key management, and backup planning."],
    ["Monitoring Devices and Storage", "Monitor disk usage, disk health, storage performance, mount status, and hardware errors. Useful commands include lsblk, df -h, findmnt, and dmesg."],
    ["Modern Storage Monitoring", "Monitoring systems collect disk capacity, I/O performance, latency, error rates, and storage health. Centralized monitoring and alerting can protect applications, databases, virtual machines, and containers."],
    ["File Management and Cloud Computing", "Cloud environments provide block storage, object storage, and file storage. Traditional Linux filesystem knowledge remains important on cloud servers."],
    ["File Management and Cybersecurity", "Protect configuration files, password-related files, SSH keys, application data, and logs through correct permissions, ownership, encryption, access control, and secure backups."],
    ["Modern Updates and Future Relevance", "NVMe provides fast access, software-defined storage uses software and distributed systems, cloud storage is remote and distributed, containers require persistent volume management, and AI needs large fast storage for training data, models, datasets, and checkpoints. Edge devices often have limited storage."],
    ["Best Practices", "Organize files logically, monitor disk usage with df -h, use proper permissions, create backups, use UUIDs for persistent mounts, monitor logs for storage and device errors, and carefully verify destructive commands such as rm -rf."],
    ["Why File and Device Management Is Important", "It lets administrators organize information, manage storage and hardware, control file access, monitor disk usage, configure mounted filesystems, and protect sensitive information. It is essential to Linux administration, servers, cloud, DevOps, cybersecurity, and database administration."],
    ["Key Takeaways", "Linux uses a hierarchy beginning at /. Permissions and ownership control access. Drivers connect the OS to hardware. Devices appear under /dev. Storage uses partitions, filesystems, and mount points. /etc/fstab and UUIDs support persistent mounts. RAID, LVM, encryption, containers, cloud storage, and NVMe are modern storage tools. Good file and device management supports performance, security, reliability, and administration."],
  ];

  return (
    <div className="topic-learning-scroll">
      <section className="topic-intro-panel">
        <div className="topic-intro-icon">05</div>
        <div>
          <span className="section-label">LINUX ADMINISTRATION</span>
          <h2>File and Device Management</h2>
          <p>Organize files, control access, communicate with hardware, manage storage, and monitor devices.</p>
        </div>
      </section>
      <section className="topic-visual-gallery" aria-label="File and device management illustrations">
        <article className="topic-visual-card">
          <svg viewBox="0 0 360 190" role="img" aria-label="Linux filesystem hierarchy">
            <circle cx="180" cy="35" r="22" fill="#dbeafe" /><text x="180" y="40" textAnchor="middle" fill="#1e3a8a">/</text>
            {["/etc", "/home", "/var", "/dev"].map((label, index) => {
              const x = 55 + index * 85;
              return <g key={label}><path d={`M180 58v32M180 90H${x + 28}M${x + 28} 90v18`} stroke="#64748b" strokeWidth="2" /><rect x={x} y="108" width="56" height="32" rx="7" fill="#ccfbf1" /><text x={x + 28} y="128" textAnchor="middle" fontSize="11" fill="#115e59">{label}</text></g>;
            })}
          </svg>
          <h3>Filesystem hierarchy</h3><p>Linux organizes files and device interfaces beneath the root directory.</p>
        </article>
        <article className="topic-visual-card">
          <svg viewBox="0 0 360 190" role="img" aria-label="Device management path">
            {["Application", "Operating System", "Driver", "Hardware"].map((label, index) => <g key={label}><rect x="95" y={18 + index * 38} width="170" height="27" rx="7" fill={index % 2 ? "#ccfbf1" : "#dbeafe"} /><text x="180" y={36 + index * 38} textAnchor="middle" fontSize="11" fill="#1e3a8a">{label}</text>{index < 3 && <path d={`M180 ${46 + index * 38}v10`} stroke="#64748b" strokeWidth="2" markerEnd="url(#fd-arrow)" />}</g>)}
            <defs><marker id="fd-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L10 5L0 10z" fill="#64748b" /></marker></defs>
          </svg>
          <h3>Device communication</h3><p>Drivers provide the interface between applications, the OS, and hardware.</p>
        </article>
        <article className="topic-visual-card">
          <svg viewBox="0 0 360 190" role="img" aria-label="Storage management layers">
            {["Disk", "Partition", "Filesystem", "Mount point"].map((label, index) => <g key={label}><rect x={55 + index * 72} y={70 - index * 8} width="62" height={50 + index * 16} rx="7" fill={["#cbd5e1", "#bfdbfe", "#a7f3d0", "#ddd6fe"][index]} /><text x={86 + index * 72} y="105" textAnchor="middle" fontSize="10" fill="#334155">{label}</text></g>)}
          </svg>
          <h3>Storage layers</h3><p>Storage becomes usable through partitions, filesystems, and mount points.</p>
        </article>
      </section>
      <InteractiveExample
        title="Trace a file from disk to an application"
        scenario="Imagine a database reading a file from a mounted SSD."
        steps={[
          "The device provides a partition and filesystem.",
          "Linux mounts the filesystem into the directory hierarchy.",
          "Permissions and ownership are checked before the application reads the file.",
        ]}
        result="Files, devices, filesystems, mount points, and permissions work together to make stored data usable and protected."
        visual={<div className="interactive-example__flow"><span>SSD</span><b>→</b><span>Partition</span><b>→</b><span>Filesystem</span><b>→</b><span>/mnt/data</span><b>→</b><span>App</span></div>}
      />
      {sections.map(([title, text], index) => (
        <TopicContentSection key={title} number={String(index + 1).padStart(2, "0")} title={title} tone={["blue", "cyan", "teal", "indigo", "purple", "slate", "orange"][index % 7]}>
          <p>{text}</p>
          {["Navigating Directories", "Listing Files", "Creating Files", "Creating Directories", "Removing Files", "Copying Files", "Viewing File Content", "File Metadata", "Viewing Permissions", "Changing Permissions", "Mounting File Systems", "Viewing Mounted File Systems", "Persistent Mounting", "Disk Space Management", "Checking Directory Size", "Monitoring Devices and Storage"].includes(title) && <div className="topic-command-row"><code>{title === "Navigating Directories" ? "cd /home" : title === "Listing Files" ? "ls -la" : title === "Creating Files" ? "touch notes.txt" : title === "Creating Directories" ? "mkdir -p project/source/files" : title === "Removing Files" ? "rm notes.txt" : title === "Copying Files" ? "cp -i file.txt backup.txt" : title === "Viewing File Content" ? "less file.txt" : title === "File Metadata" ? "stat filename" : title === "Viewing Permissions" ? "ls -l" : title === "Changing Permissions" ? "chmod 755 script.sh" : title === "Mounting File Systems" ? "sudo mount /dev/sdb1 /mnt" : title === "Viewing Mounted File Systems" ? "findmnt" : title === "Persistent Mounting" ? "blkid" : title === "Disk Space Management" ? "df -h" : title === "Checking Directory Size" ? "du -sh /home/user" : "lsblk"} </code></div>}
        </TopicContentSection>
      ))}
    </div>
  );
}


function TopicContentSection({ number, title, tone, children, sectionId, titleClassName = "" }) {
  const [open, setOpen] = useState(true);
  const [completed, setCompleted] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || !("IntersectionObserver" in window)) {
      section?.classList.add("is-visible");
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          section.classList.add("is-visible");
          observer.unobserve(section);
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.12 },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section id={sectionId} ref={sectionRef} className={`topic-content-section topic-content-section--${tone} ${open ? "" : "is-collapsed"} ${completed ? "is-completed" : ""}`}>
      <div className="topic-section-heading">
        <span>{number}</span>
        <div className="topic-section-title">
          <h2 className={titleClassName}>{title}</h2>
          {completed && <small>Completed</small>}
        </div>
        <div className="topic-section-actions">
          <button
            type="button"
            className="topic-section-action"
            onClick={() => setCompleted((value) => !value)}
            aria-pressed={completed}
          >
            {completed ? "✓ Done" : "Mark done"}
          </button>
          <button
            type="button"
            className="topic-section-action topic-section-toggle"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
          >
            {open ? "Hide" : "Explore"}
          </button>
        </div>
      </div>
      {open && <div className="topic-section-body">{children}</div>}
    </section>
  );
}

function ProcessControlSimulator() {
  const states = [
    ["New", "The kernel creates the process and assigns a PID.", "◌"],
    ["Ready", "The process is able to run and waits for CPU time.", "◷"],
    ["Running", "The scheduler gives the process a CPU time slice.", "▶"],
    ["Waiting", "The process waits for I/O, a signal, or another event.", "Ⅱ"],
    ["Terminated", "The process exits and the parent collects its status.", "✓"],
  ];
  const [step, setStep] = useState(0);
  const current = states[step];

  return (
    <section className="process-simulator">
      <div className="process-simulator__header">
        <div>
          <span className="section-label">INTERACTIVE SIMULATOR</span>
          <h2>Move a process through its lifecycle</h2>
          <p>Use the controls to see what the operating system does at each stage.</p>
        </div>
        <span className="process-simulator__pid">PID 1842</span>
      </div>
      <div className="process-simulator__track">
        {states.map(([label, , icon], index) => (
          <button
            type="button"
            key={label}
            className={`process-simulator__state ${index === step ? "active" : ""} ${index < step ? "visited" : ""}`}
            onClick={() => setStep(index)}
          >
            <span>{icon}</span>
            <b>{label}</b>
          </button>
        ))}
      </div>
      <div className="process-simulator__detail">
        <strong>Stage {step + 1}: {current[0]}</strong>
        <p>{current[1]}</p>
        <div className="process-simulator__controls">
          <button type="button" className="secondary-action" onClick={() => setStep((value) => Math.max(0, value - 1))} disabled={step === 0}>← Previous</button>
          <button type="button" className="primary-button" onClick={() => setStep((value) => Math.min(states.length - 1, value + 1))} disabled={step === states.length - 1}>Next stage →</button>
        </div>
      </div>
    </section>
  );
}

function TopicDetail({ title, children }) {
  return (
    <article className="topic-detail">
      <h3>{title}</h3>
      <p>{children}</p>
    </article>
  );
}

function InteractiveExample({ title, scenario, steps, result, visual }) {
  const [showResult, setShowResult] = useState(false);

  return (
    <section className="interactive-example">
      <div className="interactive-example__header">
        <div>
          <span className="section-label">TRY THIS EXAMPLE</span>
          <h2>{title}</h2>
          <p>{scenario}</p>
        </div>
        <button
          type="button"
          className="interactive-example__button"
          onClick={() => setShowResult((visible) => !visible)}
          aria-expanded={showResult}
        >
          {showResult ? "Hide explanation" : "Show explanation"}
        </button>
      </div>
      <div className="interactive-example__steps">
        {steps.map((step, index) => (
          <div className="interactive-example__step" key={step}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <p>{step}</p>
          </div>
        ))}
      </div>
      {visual}
      {showResult && (
        <div className="interactive-example__result">
          <strong>What the user should notice</strong>
          <p>{result}</p>
        </div>
      )}
    </section>
  );
}


function SystemAdministration({
  apiFetch,
  resetKey,
}) {
  const [topics, setTopics] =
    useState([]);

  const [
    selectedTopic,
    setSelectedTopic,
  ] = useState(null);

  const [
    subtopics,
    setSubtopics,
  ] = useState([]);

  const [
    selectedSubtopic,
    setSelectedSubtopic,
  ] = useState(null);

  const [loading, setLoading] =
    useState(true);

  const [
    topicLoading,
    setTopicLoading,
  ] = useState(false);

  const [error, setError] =
    useState("");


  useEffect(() => {
    loadTopics();
  }, []);

  useEffect(() => {
    closeTopic();
  }, [resetKey]);


  async function loadTopics() {
    try {
      setLoading(true);
      setError("");

      const response =
        await apiFetch(
          `${API_URL}/api/topics`
        );

      if (!response) {
        return;
      }

      if (!response.ok) {
        throw new Error(
          await getResponseError(
            response,
            "Failed to load system administration topics."
          )
        );
      }

      const data =
        await readJson(
          response
        );


      /*
        IMPORTANT FIX:

        Flask returns:

        {
          status: "success",
          topics: [...]
        }

        Previously the code expected the entire
        response itself to be an array.
      */
      setTopics(
        getArrayData(data, ["topics"])
      );

    } catch (error) {
      console.error(
        "Topics API error:",
        error
      );

      setError(
        error.message ||
          "Unable to load topics."
      );

    } finally {
      setLoading(false);
    }
  }

  async function openTopicFile(topic) {
    try {
      const response = await apiFetch(
        `${API_URL}/api/topics/${topic.id}/file`
      );

      if (!response) {
        return;
      }

      if (!response.ok) {
        throw new Error(
          await getResponseError(
            response,
            "Unable to open topic file."
          )
        );
      }

      const blob = await response.blob();
      const fileUrl = URL.createObjectURL(blob);
      const fileWindow = window.open(fileUrl, "_blank");

      if (!fileWindow) {
        const downloadLink = document.createElement("a");
        downloadLink.href = fileUrl;
        downloadLink.download = topic.file_name;
        downloadLink.click();
      }

      window.setTimeout(
        () => URL.revokeObjectURL(fileUrl),
        60000
      );
    } catch (error) {
      console.error("Open topic file error:", error);
      setError(
        error.message || "Unable to open topic file."
      );
    }
  }


  async function openTopic(
    topic
  ) {
    try {
      setSelectedTopic(
        topic
      );

      setSelectedSubtopic(
        null
      );

      setTopicLoading(
        true
      );

      setError("");

      if (
        [
          "operating system security fundamentals",
          "process management and scheduling",
          "memory management and virtual memory",
          "storage devices, disk management, and i/o",
          "linux filesystems and filesystem management",
          "linux directory structure and file hierarchy",
          "linux shells, command-line interfaces, and shell scripting",
          "linux file operations, navigation, and text processing",
          "linux user, group, and privilege management",
          "linux networking and network configuration",
          "linux services, servers, and service management",
          "software, package, and system management",
          "ethical hacking, security, and linux server hardening",
          "linux networking fundamentals and network administration",
          "linux network services and server services",
          "linux web servers, reverse proxies, and application deployment",
          "linux firewalls and network security",
          "system monitoring and troubleshooting",
          "logging and observability",
          "automation & shell scripting",
          "virtualization & vm administration",
          "docker & container administration",
          "database administration",
          "backup & disaster recovery",
          "enterprise linux, devops & cloud",
        ].includes(String(topic.title).toLowerCase())
      ) {
        setTopicLoading(false);
        return;
      }

      const response =
        await apiFetch(
          `${API_URL}/api/topics/${topic.id}/subtopics`
        );

      if (!response) {
        return;
      }
      if (!response.ok) {
        throw new Error(
          await getResponseError(
            response,
            "Failed to load lessons."
          )
        );
      }

      const data =
        await readJson(
          response
        );


      /*
        IMPORTANT FIX:

        Flask returns:

        {
          status: "success",
          subtopics: [...]
        }
      */
      setSubtopics(
        getArrayData(
          data,
          ["subtopics"]
        )
      );

    } catch (error) {
      console.error(
        "Subtopics API error:",
        error
      );

      setError(
        error.message ||
          "Unable to load lessons."
      );

    } finally {
      setTopicLoading(
        false
      );
    }
  }


  function closeTopic() {
    setSelectedTopic(null);
    setSelectedSubtopic(null);
    setSubtopics([]);
    setError("");
  }


  function openLesson(
    subtopic
  ) {
    setSelectedSubtopic(
      subtopic
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }


  function closeLesson() {
    setSelectedSubtopic(
      null
    );
  }


  if (loading) {
    return (
      <div className="page">
        <LoadingPage />
      </div>
    );
  }


  /* FULL LESSON READER */

  if (
    selectedTopic &&
    selectedSubtopic
  ) {
    return (
      <div className="page">

        <button
          className="back-button"
          onClick={
            closeLesson
          }
        >
          ← Back to Lessons
        </button>


        <PageHero
          eyebrow={
            selectedTopic.title
          }
          title={
            selectedSubtopic.title
          }
          description="Read the complete lecture lesson and review the concepts covered in this section."
        />

        <div className="topic-visual topic-visual--detail">
          <span>{getSubjectIcon(selectedTopic.title)}</span>
          {selectedTopic.image_name && (
            <VisualAsset
              apiFetch={apiFetch}
              url={`${API_URL}/api/topics/${selectedTopic.id}/image`}
              alt=""
              className="topic-uploaded-visual"
            />
          )}
        </div>


        {error && (
          <div className="error-message">
            {error}
          </div>
        )}


        <div className="panel">

          <PanelHeader
            eyebrow="LECTURE"
            title={
              selectedSubtopic.title
            }
            description="System Administration learning material."
          />


          <LectureContent
            content={
              selectedSubtopic.content
            }
          />

        </div>


        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            gap: "12px",
            marginTop: "20px",
          }}
        >

          <button
            className="secondary-action"
            onClick={
              closeLesson
            }
          >
            ← Back to Lessons
          </button>

        </div>

      </div>
    );
  }


  if (selectedTopic && getTopicContentAsset(selectedTopic)) {
    return (
      <div className="page">
        <button className="back-button" onClick={closeTopic}>← Back to Topics</button>
        <PageHero
          eyebrow={`SYSTEM ADMINISTRATION / TOPIC ${String(selectedTopic.order_number).padStart(2, "0")}`}
          title={selectedTopic.title}
          description={selectedTopic.description}
        />
        {error && <div className="error-message">{error}</div>}
        <WordTopicContent topic={selectedTopic} apiFetch={apiFetch} />
      </div>
    );
  }


  if (
    selectedTopic &&
    selectedTopic.title.toLowerCase().includes("linux system administration")
  ) {
    return (
      <div className="page">
        <button className="back-button" onClick={closeTopic}>
          ← Back to Topics
        </button>

        <PageHero
          eyebrow="SYSTEM ADMINISTRATION / TOPIC 01"
          title={selectedTopic.title}
          description={selectedTopic.description || "Linux, operating systems, administration, and cybersecurity fundamentals."}
        />

        {error && <div className="error-message">{error}</div>}

        <LinuxFundamentalsContent />
      </div>
    );
  }


  if (
    selectedTopic &&
    selectedTopic.title.toLowerCase().includes("what is an operating system")
  ) {
    return (
      <div className="page">
        <button className="back-button" onClick={closeTopic}>
          ← Back to Topics
        </button>

        <PageHero
          eyebrow="SYSTEM ADMINISTRATION / TOPIC 02"
          title={selectedTopic.title}
          description={selectedTopic.description || "The components, responsibilities, security, and modern technologies of operating systems."}
        />

        {error && <div className="error-message">{error}</div>}

        <OperatingSystemsContent />
      </div>
    );
  }

  if (
    selectedTopic &&
    selectedTopic.title.toLowerCase().includes("process management and scheduling")
  ) {
    return (
      <div className="page">
        <button className="back-button" onClick={closeTopic}>
          ← Back to Topics
        </button>
        <PageHero
          eyebrow="SYSTEM ADMINISTRATION / TOPIC 07"
          title={selectedTopic.title}
          description={
            selectedTopic.description ||
            "Processes, scheduling, monitoring, services, resource control, and modern Linux workloads."
          }
        />
        {error && <div className="error-message">{error}</div>}
        <ProcessManagementSchedulingContent />
      </div>
    );
  }

  if (
    selectedTopic &&
    selectedTopic.title.toLowerCase().includes("process management")
  ) {
    return (
      <div className="page">
        <button className="back-button" onClick={closeTopic}>
          ← Back to Topics
        </button>
        <PageHero
          eyebrow="SYSTEM ADMINISTRATION / TOPIC 03"
          title={selectedTopic.title}
          description={selectedTopic.description || "Processes, scheduling, monitoring, signals, and modern Linux process isolation."}
        />
        {error && <div className="error-message">{error}</div>}
        <ProcessManagementContent />
      </div>
    );
  }

  if (
    selectedTopic &&
    selectedTopic.title.toLowerCase().includes("memory management and virtual memory")
  ) {
    return (
      <div className="page">
        <button className="back-button" onClick={closeTopic}>
          ← Back to Topics
        </button>
        <PageHero
          eyebrow="SYSTEM ADMINISTRATION / TOPIC 08"
          title={selectedTopic.title}
          description={
            selectedTopic.description ||
            "RAM, virtual memory, paging, swap, monitoring, and modern memory workloads."
          }
        />
        {error && <div className="error-message">{error}</div>}
        <MemoryManagementVirtualMemoryContent />
      </div>
    );
  }

  if (
    selectedTopic &&
    selectedTopic.title.toLowerCase().includes("memory management")
  ) {
    return (
      <div className="page">
        <button className="back-button" onClick={closeTopic}>
          ← Back to Topics
        </button>
        <PageHero
          eyebrow="SYSTEM ADMINISTRATION / TOPIC 04"
          title={selectedTopic.title}
          description={
            selectedTopic.description ||
            "RAM, virtual memory, paging, swap, Linux memory monitoring, and resource management."
          }
        />
        {error && <div className="error-message">{error}</div>}
        <MemoryManagementContent />
      </div>
    );
  }

  if (
    selectedTopic &&
    selectedTopic.title.toLowerCase().includes("linux filesystems and filesystem management")
  ) {
    return (
      <div className="page">
        <button className="back-button" onClick={closeTopic}>
          ← Back to Topics
        </button>
        <PageHero
          eyebrow="SYSTEM ADMINISTRATION / TOPIC 10"
          title={selectedTopic.title}
          description={
            selectedTopic.description ||
            "Linux filesystem structures, management, reliability, security, and recovery."
          }
        />
        {error && <div className="error-message">{error}</div>}
        <LinuxFilesystemManagementContent />
      </div>
    );
  }

  if (
    selectedTopic &&
    selectedTopic.title.toLowerCase().includes("linux directory structure and file hierarchy")
  ) {
    return (
      <div className="page">
        <button className="back-button" onClick={closeTopic}>
          ← Back to Topics
        </button>
        <PageHero
          eyebrow="SYSTEM ADMINISTRATION / TOPIC 11"
          title={selectedTopic.title}
          description={
            selectedTopic.description ||
            "Linux directory hierarchy, system paths, navigation, security, and administration."
          }
        />
        {error && <div className="error-message">{error}</div>}
        <LinuxDirectoryStructureContent />
      </div>
    );
  }

  if (
    selectedTopic &&
    selectedTopic.title.toLowerCase().includes("linux shells, command-line interfaces, and shell scripting")
  ) {
    return (
      <div className="page">
        <button className="back-button" onClick={closeTopic}>
          ← Back to Topics
        </button>
        <PageHero
          eyebrow="SYSTEM ADMINISTRATION / TOPIC 12"
          title={selectedTopic.title}
          description={
            selectedTopic.description ||
            "Linux shells, command-line interfaces, shell scripting, automation, and administration."
          }
        />
        {error && <div className="error-message">{error}</div>}
        <LinuxShellsContent />
      </div>
    );
  }

  if (
    selectedTopic &&
    selectedTopic.title.toLowerCase().includes("linux file operations, navigation, and text processing")
  ) {
    return (
      <div className="page">
        <button className="back-button" onClick={closeTopic}>
          ← Back to Topics
        </button>
        <PageHero
          eyebrow="SYSTEM ADMINISTRATION / TOPIC 13"
          title={selectedTopic.title}
          description={
            selectedTopic.description ||
            "Linux file operations, navigation, text processing, links, archives, and safe administration."
          }
        />
        {error && <div className="error-message">{error}</div>}
        <LinuxFileOperationsContent />
      </div>
    );
  }

  if (
    selectedTopic &&
    selectedTopic.title.toLowerCase().includes("linux user, group, and privilege management")
  ) {
    return (
      <div className="page">
        <button className="back-button" onClick={closeTopic}>
          ← Back to Topics
        </button>
        <PageHero
          eyebrow="SYSTEM ADMINISTRATION / TOPIC 14"
          title={selectedTopic.title}
          description={
            selectedTopic.description ||
            "Linux users, groups, authentication, privileges, ownership, auditing, and secure administration."
          }
        />
        {error && <div className="error-message">{error}</div>}
        <LinuxUserPrivilegeContent />
      </div>
    );
  }

  const extendedTopicConfigs = {
    "linux networking and network configuration": {
      number: "15",
      label: "NETWORK ADMINISTRATION",
      asset: "topic16.txt",
      visualTitle: "Trace a network request",
      stages: [["Interface", "ip addr", "Identify the interface and local address."], ["Route", "ip route", "Select the path to the destination."], ["DNS", "resolvectl query", "Resolve a hostname into an address."], ["Transport", "ss -tulpn", "Inspect listening sockets and connections."], ["Verify", "ping / curl", "Test reachability and application response."]],
      exampleTitle: "Diagnose a connection failure",
      scenario: "A service cannot reach its destination.",
      steps: ["Check link and address configuration.", "Inspect routes, DNS, firewall policy, and listening sockets.", "Test each layer separately before changing configuration."],
      result: "Layered network troubleshooting prevents guessing and identifies whether the failure is local, routed, resolved, filtered, or application-level.",
      flow: ["Interface", "Route", "DNS", "Socket", "Service"],
    },
    "linux services, servers, and service management": {
      number: "16",
      label: "SERVICE ADMINISTRATION",
      asset: "topic24.txt",
      visualTitle: "Trace a service lifecycle",
      stages: [["Unit", "systemctl status", "Read the service definition and current state."], ["Start", "systemctl start", "Launch the service and its dependencies."], ["Monitor", "journalctl -u", "Review logs and runtime behavior."], ["Recover", "systemctl restart", "Apply a controlled recovery action."], ["Enable", "systemctl enable", "Configure startup behavior and dependencies."]],
      exampleTitle: "Bring a service online safely",
      scenario: "A server application is down after a restart.",
      steps: ["Inspect status and recent journal entries.", "Confirm dependencies, ports, configuration, and permissions.", "Start or restart only after identifying the cause."],
      result: "Service management combines lifecycle state, dependencies, logs, configuration, and monitoring.",
      flow: ["Unit", "Dependencies", "Process", "Logs", "Health"],
    },
    "software, package, and system management": {
      number: "17",
      label: "SOFTWARE ADMINISTRATION",
      asset: "topic22.txt",
      visualTitle: "Follow the package lifecycle",
      stages: [["Repository", "apt update", "Refresh trusted package metadata."], ["Resolve", "apt install", "Calculate dependencies and planned changes."], ["Install", "dpkg / rpm", "Place files and register package ownership."], ["Update", "apt upgrade", "Apply tested security and feature updates."], ["Verify", "dpkg -V / logs", "Confirm state, versions, and service health."]],
      exampleTitle: "Plan a safe system update",
      scenario: "A security update must be applied without surprising downtime.",
      steps: ["Review repositories, versions, dependencies, and available space.", "Use a maintenance window and preserve configuration or rollback options.", "Verify package state and affected services after updating."],
      result: "Package management is a lifecycle: discover, resolve, install, update, verify, and recover.",
      flow: ["Repository", "Dependencies", "Package", "Update", "Verify"],
    },
    "ethical hacking, security, and linux server hardening": {
      number: "18",
      label: "SECURITY OPERATIONS",
      asset: "topic30.txt",
      visualTitle: "Move through a defensive security cycle",
      stages: [["Scope", "rules of engagement", "Define authorization, targets, timing, and limits."], ["Discover", "nmap / logs", "Identify exposed services and observable behavior."], ["Assess", "vulnerability review", "Prioritize weaknesses by risk and evidence."], ["Harden", "firewall / updates", "Reduce exposure and strengthen controls."], ["Monitor", "audit / alert", "Detect changes, attacks, and remaining risk."]],
      exampleTitle: "Turn an assessment into hardening",
      scenario: "A server exposes more services than its workload requires.",
      steps: ["Confirm the assessment is authorized and document the current surface.", "Disable unnecessary services, patch vulnerabilities, and restrict access.", "Re-scan and monitor to verify that the risk was reduced."],
      result: "Ethical security work is authorized, evidence-based, corrective, and followed by verification.",
      flow: ["Scope", "Discover", "Assess", "Harden", "Monitor"],
    },
    "linux networking fundamentals and network administration": {
      number: "19", label: "NETWORK ADMINISTRATION", asset: "topic16.txt", visualTitle: "Trace a network path",
      stages: [["Interface", "ip addr", "Identify interfaces and local addresses."], ["Route", "ip route", "Select the path to the destination."], ["DNS", "resolvectl", "Resolve names into addresses."], ["Transport", "ss -tulpn", "Inspect sockets and listening services."], ["Verify", "ping / curl", "Test reachability and application response."]],
      exampleTitle: "Diagnose a network failure", scenario: "A host cannot reach a service.", steps: ["Check link, interface, and addressing.", "Inspect routes, DNS, firewall rules, and sockets.", "Test each layer separately before changing configuration."], result: "Layered troubleshooting identifies whether the failure is local, routed, resolved, filtered, or application-level.", flow: ["Interface", "Route", "DNS", "Socket", "Service"],
    },
    "linux network services and server services": {
      number: "20", label: "SERVER SERVICES", asset: "topic24.txt", visualTitle: "Follow a network service",
      stages: [["Port", "ss -tulpn", "Identify the listening port and owning process."], ["Config", "systemctl status", "Check service state and configuration."], ["Access", "firewall-cmd", "Confirm network policy permits the service."], ["Logs", "journalctl -u", "Inspect requests, failures, and startup issues."], ["Health", "curl / client", "Verify the service from a client perspective."]],
      exampleTitle: "Publish a service safely", scenario: "A server application must become reachable.", steps: ["Configure the service and confirm it listens locally.", "Allow only the required port through the firewall.", "Test remotely and monitor logs and resource use."], result: "A network service is more than a process: ports, policy, configuration, logs, and client reachability all matter.", flow: ["Process", "Port", "Firewall", "Logs", "Client"],
    },
    "linux web servers, reverse proxies, and application deployment": {
      number: "21", label: "WEB DEPLOYMENT", asset: "topic23.txt", visualTitle: "Trace a web request",
      stages: [["Client", "HTTPS request", "A browser or API client requests a resource."], ["Proxy", "nginx / Apache", "The reverse proxy terminates TLS and routes the request."], ["App", "localhost:8000", "The application server processes the request."], ["Data", "database / files", "The application reads or writes required data."], ["Response", "2xx / 4xx / 5xx", "The result returns through the proxy to the client."]],
      exampleTitle: "Deploy behind a reverse proxy", scenario: "An application should be reachable securely without exposing its internal port.", steps: ["Run the application on a private local address.", "Configure the proxy, TLS, headers, timeouts, and health checks.", "Test responses and monitor both proxy and application logs."], result: "Reverse proxies create a controlled boundary between clients, TLS, routing, and application processes.", flow: ["Client", "TLS", "Proxy", "App", "Data"],
    },
    "linux firewalls and network security": {
      number: "22", label: "NETWORK SECURITY", asset: null, visualTitle: "Evaluate a firewall decision",
      stages: [["Packet", "source → destination", "A packet arrives with addresses, protocol, and port."], ["Zone", "trusted / public", "The firewall applies the interface or zone policy."], ["Rule", "allow / deny", "Rules are evaluated in policy order."], ["Log", "audit event", "Denied or unusual traffic can be recorded."], ["Result", "accepted / dropped", "The packet reaches the service or is blocked."]],
      exampleTitle: "Open only a required service", scenario: "A web server needs HTTPS but should not expose administration ports.", steps: ["Identify required traffic and the correct network zone.", "Allow HTTPS explicitly and keep management access restricted.", "Test from permitted and denied locations and review logs."], result: "Firewall security is least privilege applied to network flows: allow what is needed and observe what is denied.", flow: ["Packet", "Zone", "Rule", "Log", "Decision"],
    },
    "system monitoring and troubleshooting": {
      number: "23", label: "OPERATIONS", asset: null, visualTitle: "Run a troubleshooting loop",
      stages: [["Signal", "alert / symptom", "Observe an error, slowdown, outage, or capacity warning."], ["Scope", "uptime / metrics", "Determine affected hosts, services, users, and time window."], ["Evidence", "logs / ps / iostat", "Collect facts without making assumptions."], ["Cause", "correlation", "Connect resource, service, and application evidence."], ["Recovery", "fix / verify", "Apply a controlled fix and confirm normal behavior."]],
      exampleTitle: "Investigate a slow server", scenario: "Users report that requests are taking longer than usual.", steps: ["Check time, scope, CPU, memory, disk I/O, network, and service health.", "Correlate metrics with logs and recent changes.", "Recover safely, verify the result, and document the cause."], result: "Effective troubleshooting is an evidence loop rather than a sequence of guesses.", flow: ["Signal", "Scope", "Evidence", "Cause", "Recovery"],
    },
    "logging and observability": {
      number: "24", label: "OBSERVABILITY", asset: null, visualTitle: "Turn events into observability",
      stages: [["Emit", "application / kernel", "Systems and services produce events and measurements."], ["Collect", "journald / agent", "Logs and metrics are gathered consistently."], ["Correlate", "timestamps / labels", "Metadata connects events across components."], ["Alert", "threshold / anomaly", "Important changes notify operators."], ["Learn", "dashboard / review", "Trends and incidents improve future operation."]],
      exampleTitle: "Build a useful alert", scenario: "A service should alert before users experience an outage.", steps: ["Choose a meaningful signal and collect it with context.", "Set a threshold or anomaly rule that avoids alert fatigue.", "Link the alert to logs, dashboards, ownership, and a runbook."], result: "Observability turns raw events into actionable understanding of system behavior.", flow: ["Events", "Collect", "Context", "Alert", "Action"],
    },
    "automation & shell scripting": {
      number: "25", label: "AUTOMATION", asset: null, visualTitle: "Build a safe automation loop",
      stages: [["Plan", "requirements", "Define the desired state, inputs, outputs, and failure behavior."], ["Script", "bash / functions", "Encode repeatable steps with clear variables and control flow."], ["Test", "shellcheck / dry-run", "Test safely before changing real systems."], ["Schedule", "cron / timer / CI", "Run the automation at a controlled time or trigger."], ["Report", "logs / status", "Record results and make failures visible."]],
      exampleTitle: "Automate a maintenance task", scenario: "A recurring cleanup must be reliable and auditable.", steps: ["Define scope, exclusions, permissions, and retention rules.", "Use safe paths, quoting, checks, logging, and a dry-run mode.", "Schedule it, monitor exit status, and review results."], result: "Reliable automation is repeatable, testable, observable, and safe when inputs or environments change.", flow: ["Plan", "Script", "Test", "Schedule", "Report"],
    },
    "virtualization & vm administration": {
      number: "26", label: "VIRTUALIZATION", asset: null, visualTitle: "Trace a virtual machine stack",
      stages: [["Host", "physical CPU / RAM", "The host provides physical resources."], ["Hypervisor", "KVM / VMware", "The hypervisor allocates and isolates virtual hardware."], ["Guest", "VM operating system", "The guest boots and manages its virtual devices."], ["Workload", "app / service", "Applications run inside the guest environment."], ["Operate", "snapshot / migrate", "Administrators monitor, protect, and move workloads."]],
      exampleTitle: "Plan a VM safely", scenario: "A workload needs isolation without a dedicated physical server.", steps: ["Size CPU, memory, storage, and network resources.", "Choose a hypervisor and define guest isolation and access controls.", "Monitor host contention, guest health, snapshots, and backups."], result: "Virtualization adds a resource and management layer between physical hardware and the guest workload.", flow: ["Hardware", "Hypervisor", "Guest", "Workload", "Operate"],
    },
    "docker & container administration": {
      number: "27", label: "CONTAINERS", asset: null, visualTitle: "Follow a container lifecycle",
      stages: [["Image", "docker pull", "Retrieve an immutable application image."], ["Create", "docker run", "Create an isolated container from the image."], ["Connect", "network / volume", "Attach required networks and persistent storage."], ["Operate", "logs / exec", "Monitor and administer the running workload."], ["Replace", "deploy new image", "Update by creating a new controlled container version."]],
      exampleTitle: "Make container data persistent", scenario: "A database runs in a container and must survive recreation.", steps: ["Separate the image and writable container layer from application data.", "Attach a managed volume with correct permissions and backups.", "Test restore and replacement without losing the data."], result: "Containers are replaceable workloads; persistent state belongs in deliberate volumes and recovery processes.", flow: ["Image", "Container", "Network", "Volume", "Deploy"],
    },
    "database administration": {
      number: "28", label: "DATABASE OPERATIONS", asset: null, visualTitle: "Trace a database operation",
      stages: [["Client", "connection", "A client authenticates and sends a request."], ["Query", "SQL", "The database parses and plans the operation."], ["Storage", "data / index", "Rows and indexes are read or changed."], ["Transaction", "commit / WAL", "Durability and consistency are recorded."], ["Observe", "metrics / backup", "Administrators verify health, performance, and recovery."]],
      exampleTitle: "Investigate a slow query", scenario: "An application reports increasing database latency.", steps: ["Measure query timing, connections, locks, CPU, memory, and I/O.", "Inspect the execution plan and recent schema or workload changes.", "Apply a tested optimization and verify application behavior."], result: "Database administration connects correctness, performance, security, capacity, and recoverability.", flow: ["Client", "Query", "Plan", "Storage", "Commit"],
    },
    "backup & disaster recovery": {
      number: "29", label: "RESILIENCE", asset: null, visualTitle: "Move through a recovery plan",
      stages: [["Prepare", "inventory / priorities", "Identify systems, data, owners, dependencies, and risks."], ["Protect", "backup / replicate", "Create independent recoverable copies."], ["Detect", "incident", "Recognize loss, corruption, outage, or attack."], ["Recover", "restore / failover", "Bring prioritized services and data back."], ["Test", "restore drill", "Verify recovery time, integrity, and documentation."]],
      exampleTitle: "Design a recoverable service", scenario: "A critical application must survive storage failure.", steps: ["Define RPO, RTO, dependencies, and recovery order.", "Use tested backups or replication separate from the primary failure domain.", "Perform restore drills and improve the runbook from evidence."], result: "A backup is useful only when it is independent, accessible, complete, and proven restorable.", flow: ["Prepare", "Protect", "Detect", "Recover", "Test"],
    },
    "enterprise linux, devops & cloud": {
      number: "30", label: "ENTERPRISE OPERATIONS", asset: null, visualTitle: "Trace an enterprise delivery loop",
      stages: [["Code", "version control", "Changes are reviewed and tracked."], ["Build", "CI pipeline", "Automation creates tested artifacts."], ["Deploy", "cloud / cluster", "A controlled release reaches infrastructure."], ["Observe", "metrics / logs", "Teams measure reliability and user impact."], ["Improve", "feedback loop", "Operations evidence guides the next change."]],
      exampleTitle: "Release a change safely", scenario: "A team needs to deploy frequently without losing operational control.", steps: ["Review and test changes with reproducible automation.", "Deploy progressively with health checks and rollback options.", "Observe the release and feed incidents or performance data back into delivery."], result: "Enterprise operations connect people, process, automation, infrastructure, security, and feedback.", flow: ["Code", "Build", "Deploy", "Observe", "Improve"],
    },
  };

  const extendedTopic = selectedTopic && extendedTopicConfigs[selectedTopic.title.toLowerCase()];
  if (extendedTopic) {
    return (
      <div className="page">
        <button className="back-button" onClick={closeTopic}>← Back to Topics</button>
        <PageHero eyebrow={`SYSTEM ADMINISTRATION / TOPIC ${extendedTopic.number}`} title={selectedTopic.title} description={selectedTopic.description} />
        {error && <div className="error-message">{error}</div>}
        <LinuxTopicLectureContent {...extendedTopic} title={selectedTopic.title} description={selectedTopic.description} />
      </div>
    );
  }

  if (
    selectedTopic &&
    selectedTopic.title.toLowerCase().includes("storage devices, disk management")
  ) {
    return (
      <div className="page">
        <button className="back-button" onClick={closeTopic}>
          ← Back to Topics
        </button>
        <PageHero
          eyebrow="SYSTEM ADMINISTRATION / TOPIC 09"
          title={selectedTopic.title}
          description={
            selectedTopic.description ||
            "Storage devices, disk management, filesystems, I/O performance, reliability, and recovery."
          }
        />
        {error && <div className="error-message">{error}</div>}
        <StorageDevicesDiskManagementContent />
      </div>
    );
  }

  if (
    selectedTopic &&
    selectedTopic.title.toLowerCase().includes("file and device management")
  ) {
    return (
      <div className="page">
        <button className="back-button" onClick={closeTopic}>
          ← Back to Topics
        </button>
        <PageHero
          eyebrow="SYSTEM ADMINISTRATION / TOPIC 05"
          title={selectedTopic.title}
          description={
            selectedTopic.description ||
            "Linux files, permissions, devices, storage, filesystems, and monitoring."
          }
        />
        {error && <div className="error-message">{error}</div>}
        <FileDeviceManagementContent />
      </div>
    );
  }

  if (
    selectedTopic &&
    selectedTopic.title.toLowerCase().includes("operating system security")
  ) {
    return (
      <div className="page">
        <button className="back-button" onClick={closeTopic}>
          ← Back to Topics
        </button>
        <PageHero
          eyebrow="SYSTEM ADMINISTRATION / TOPIC 06"
          title={selectedTopic.title}
          description={
            selectedTopic.description ||
            "Operating system security, access control, hardening, monitoring, and incident response."
          }
        />
        {error && <div className="error-message">{error}</div>}
        <OperatingSystemSecurityContent />
      </div>
    );
  }

  if (
    selectedTopic &&
    Number(selectedTopic.order_number) >= 1 &&
    Number(selectedTopic.order_number) <= 30
  ) {
    return (
      <div className="page">
        <button className="back-button" onClick={closeTopic}>← Back to Topics</button>
        <PageHero
          eyebrow={`SYSTEM ADMINISTRATION / TOPIC ${String(selectedTopic.order_number).padStart(2, "0")}`}
          title={selectedTopic.title}
          description={selectedTopic.description}
        />
        {error && <div className="error-message">{error}</div>}
        <WordTopicContent topic={selectedTopic} apiFetch={apiFetch} />
      </div>
    );
  }


  /* TOPIC LESSON LIST */

  if (selectedTopic) {
    return (
      <div className="page">

        <button
          className="back-button"
          onClick={
            closeTopic
          }
        >
          ← Back to Topics
        </button>


        <PageHero
          eyebrow="SYSTEM ADMINISTRATION"
          title={
            selectedTopic.title
          }
          description={
            selectedTopic.description ||
            "System Administration learning topic."
          }
        />

        {selectedTopic.file_name && (
          <div className="topic-resource-banner">
            <span>FILE</span>
            <div>
              <strong>Topic resource</strong>
              <p>{selectedTopic.file_name}</p>
            </div>
            <button
              className="primary-action"
              type="button"
              onClick={() => openTopicFile(selectedTopic)}
            >
              Open file
            </button>
          </div>
        )}


        {error && (
          <div className="error-message">
            {error}
          </div>
        )}


        {topicLoading ? (
          <LoadingPage />
        ) : (
          <>

            <SectionHeading
              eyebrow="LESSONS"
              title="Topic Lessons"
              description="Select a lesson to open the complete lecture content."
              action={
                <span className="live-tag">
                  {subtopics.length} LESSONS
                </span>
              }
            />


            <div className="lecture-list">

              {subtopics.length > 0 ? (

                subtopics.map(
                  (
                    subtopic,
                    index
                  ) => (

                    <div
                      className="lecture-card"
                      key={
                        subtopic.id
                      }
                    >

                      <div className="lecture-number">
                        {String(
                          index + 1
                        ).padStart(
                          2,
                          "0"
                        )}
                      </div>

                      {subtopic.image_name && (
                        <VisualAsset
                          apiFetch={apiFetch}
                          url={`${API_URL}/api/subtopics/${subtopic.id}/image`}
                          alt=""
                          className="subtopic-visual"
                        />
                      )}


                      <div className="lecture-content">

                        <h3>
                          {
                            subtopic.title
                          }
                        </h3>


                        <p>
                          {getSubtopicPreview(
                            subtopic.content
                          )}
                        </p>


                        <button
                          className="secondary-button"
                          onClick={() =>
                            openLesson(
                              subtopic
                            )
                          }
                        >
                          Open Lesson →
                        </button>

                      </div>

                    </div>

                  )
                )

              ) : (

                <div className="empty-state">

                  <div className="empty-icon">
                    ▤
                  </div>

                  <h3>
                    No lessons available
                  </h3>

                  <p>
                    This topic does not have
                    any lessons yet.
                  </p>

                </div>

              )}

            </div>

          </>
        )}

      </div>
    );
  }


  /* TOPIC LIST */

  return (
    <div className="page">

      <PageHero
        eyebrow="LEARNING"
        title="System Administration"
        description="Learn the fundamentals of system administration, operating systems, networking, filesystems, servers, and infrastructure management."
        centered
      />


      {error && (
        <div className="error-message">
          {error}
        </div>
      )}


      <div className="topic-grid">

        {topics.length > 0 ? (

          topics.map(
            (
              topic,
              index
            ) => {
              const subject = getTopicSubjectMeta(topic.title);

              return (
                <div
                  className="topic-card"
                  key={topic.id}
                >

                  <div className="topic-card-header">
                    <div className="topic-number">
                      {String(
                        index + 1
                      ).padStart(
                        2,
                        "0"
                      )}
                    </div>

                    <span
                      className={`topic-badge topic-badge--${subject.accent}`}
                    >
                      {subject.label}
                    </span>
                  </div>


                  <div className="topic-card-content">

                    <h2>
                      {topic.title}
                    </h2>


                    <p>
                      {topic.description ||
                        "System Administration learning topic."}
                    </p>


                    <div className="topic-footer">

                      <span className="lesson-count">
                        {topic.subtopic_count ??
                          0}{" "}
                        lessons
                      </span>


                      <button
                        className="primary-button"
                        onClick={() =>
                          openTopic(
                            topic
                          )
                        }
                      >
                        Open Topic →
                      </button>

                    </div>

                  </div>

                </div>
              );
            }
          )

        ) : (

          <div className="empty-state">

            <div className="empty-icon">
              ▤
            </div>

            <h3>
              No topics available
            </h3>

            <p>
              No System Administration
              learning topics have been
              added yet.
            </p>

          </div>

        )}

      </div>

    </div>
  );
}


/* ==========================================================
   LECTURE CONTENT
========================================================== */

function LectureContent({
  content,
}) {
  if (!content) {
    return (
      <div className="empty-state">

        <div className="empty-icon">
          ▤
        </div>

        <h3>
          No lecture content
        </h3>

        <p>
          This lesson does not contain
          lecture content yet.
        </p>

      </div>
    );
  }


  const containsHtml =
    /<[^>]+>/.test(
      String(content)
    );


  if (containsHtml) {
    return (
      <article
        className="lecture-reader"
        dangerouslySetInnerHTML={{
          __html: content,
        }}
      />
    );
  }


  return (
    <article className="lecture-reader">

      {String(content)
        .split("\n")
        .map(
          (
            paragraph,
            index
          ) => {

            const trimmed =
              paragraph.trim();

            if (!trimmed) {
              return (
                <div
                  key={index}
                  style={{
                    height: "10px",
                  }}
                />
              );
            }


            return (
              <p key={index}>
                {trimmed}
              </p>
            );
          }
        )}

    </article>
  );
}

function ActualTopicSlideVisual({ slide, topic, lectureText, selectedBlockId = null }) {
  const sections = lectureText ? parseTopic11Lecture(lectureText) : [];
  const visualTheme = getTopicVisualTheme(topic);
  const inferredKind = slide.kind || (
    normalizeSlideTitle(slide.title) === "welcome" ? "welcome"
      : normalizeSlideTitle(slide.title).includes("people behind") ? "people"
        : normalizeSlideTitle(slide.title).includes("takeaway") ? "takeaways"
          : "section"
  );
  const blockText = (id, fallback) => {
    const value = slide.blocks?.find((block) => block.id === id)?.text;
    return typeof value === "string" ? value : fallback;
  };

  if (inferredKind === "welcome") {
    const welcomeTitle = blockText("welcome-title", topic.title);
    const welcomeDescription = blockText(
      "welcome-description",
      "The complete lesson content supplied in the Word document is shown below.",
    );
    return (
      <section className={`topic-intro-panel topic-slide topic-theme-${visualTheme.key}`}>
        <div className="topic-intro-icon">{String(topic.order_number).padStart(2, "0")}</div>
        <div>
          <span className="section-label">WORD DOCUMENT LESSON</span>
          <h2 className={selectedBlockId === "welcome-title" ? "is-editing-source" : ""}>{welcomeTitle}</h2>
          <p className={selectedBlockId === "welcome-description" ? "is-editing-source" : ""}>{welcomeDescription}</p>
        </div>
      </section>
    );
  }
  if (inferredKind === "people") {
    return (
      <PeopleMentionedGallery
        content={lectureText}
        groupIndex={slide.peopleGroup ?? null}
        titleText={blockText("people-title", slide.title)}
        descriptionText={blockText("people-description", "Portraits appear only when the lesson discusses the person’s contribution.")}
        selectedBlockId={selectedBlockId}
      />
    );
  }
  if (inferredKind === "section") {
    const section = sections.find((item) => normalizeSlideTitle(item.title) === normalizeSlideTitle(slide.title));
    const sectionTitleBlockId = `section-${sections.indexOf(section)}-title`;
    const sectionTitle = blockText(sectionTitleBlockId, section?.title || slide.title);
    const editedText = slide.blocks?.find((block) => /^section-\d+-text$/.test(block.id))?.text;
    const sectionLines = typeof editedText === "string" ? editedText.split("\n") : section?.lines || [];
    return section ? (
      <TopicContentSection
        number={section.number}
        title={sectionTitle}
        titleClassName={selectedBlockId === sectionTitleBlockId ? "is-editing-source" : ""}
        sectionId={`editor-section-${slide.id}`}
        tone={["blue", "cyan", "teal", "indigo", "purple", "slate", "orange"][sections.indexOf(section) % 7]}
      >
        {selectedBlockId === `section-${sections.indexOf(section)}-text` ? null : (
          <Topic11SectionBody
            lines={sectionLines}
            sectionNumber={`${topic.order_number}-${section.number}`}
            topicTitle={topic.title}
            sectionTitle={section.title}
          />
        )}
      </TopicContentSection>
    ) : null;
  }
  if (inferredKind === "takeaways") {
    const takeawaysText = blockText(
      "takeaways-text",
      "Apply this topic in an authorized lab.\n\nMove forward and backward through the lesson using the controls, the section rail, or your keyboard arrow keys.",
    );
    return (
      <section className="topic-takeaways topic-slide">
        <span className="section-label">KEY TAKEAWAYS</span>
        <h2 className={selectedBlockId === "takeaways-text" ? "is-editing-source" : ""}>{takeawaysText.split("\n")[0]}</h2>
        <p className={selectedBlockId === "takeaways-text" ? "is-editing-source" : ""}>{takeawaysText.split("\n").slice(1).join("\n")}</p>
      </section>
    );
  }
  return null;
}

function SlideEditor({ apiFetch, topic, onClose, onSaved }) {
  const [slides, setSlides] = useState([]);
  const [lectureText, setLectureText] = useState("");
  const [activeSlide, setActiveSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(null);
  const [selectedBlockId, setSelectedBlockId] = useState(null);
  const [resizing, setResizing] = useState(null);
  const canvasRef = useRef(null);
  const [initialSlides, setInitialSlides] = useState("");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const updateCanvasHeight = () => {
      const width = canvas.getBoundingClientRect().width;
      if (!width) return;
      const heightScale = Math.max(1, Number(slides[activeSlide]?.heightScale) || 1);
      canvas.style.setProperty(
        "--editor-slide-height",
        `${(width * 9 / 16) * heightScale}px`,
      );
      canvas.style.setProperty("--editor-base-height", `${width * 9 / 16}px`);
    };

    updateCanvasHeight();
    const observer = new ResizeObserver(updateCanvasHeight);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [activeSlide, loading, slides]);

  useEffect(() => {
    let active = true;
    async function loadSlides() {
      try {
        const contentAsset = getTopicContentAsset(topic);
        let loadedLectureText = "";

        if (contentAsset) {
          try {
            const lectureResponse = await fetch(contentAsset);
            if (!lectureResponse.ok) {
              throw new Error(`Unable to load the mapped lecture for ${topic.title}.`);
            }
            loadedLectureText = await lectureResponse.text();
          } catch (lectureError) {
            if (active) {
              setError(lectureError.message || "Unable to load the mapped lecture content.");
            }
          }
        }

        if (active) setLectureText(loadedLectureText);
        const savedResponse = await apiFetch(`${API_URL}/api/topics/${topic.id}/slides`);
        const savedData = savedResponse ? await readJson(savedResponse) : null;
        if (!savedResponse?.ok) {
          throw new Error(savedData?.message || "Unable to load slide layout.");
        }
        if (!Array.isArray(savedData?.slides)) {
          throw new Error("Saved slide layout is invalid.");
        }

        if (savedData.slides.length > 0) {
          if (active) {
            setSlides(savedData.slides);
            setInitialSlides(JSON.stringify(savedData.slides));
          }
          return;
        }

        if (active && contentAsset) {
          setError("No saved slide layout exists. No replacement slides were generated.");
        } else if (active) {
          setError(
            `No lecture file is mapped to topic ID ${topic.id}. No saved slide layout was found; no slides were generated.`,
          );
        }
      } catch (loadError) {
        if (active) setError(loadError.message || "Unable to load slide layout.");
      } finally {
        if (active) setLoading(false);
      }
    }
    loadSlides();
    return () => {
      active = false;
    };
  }, [apiFetch, topic]);

  const updateSlide = (updater) => {
    setSlides((current) => current.map((slide, index) => (
      index === activeSlide ? updater(slide) : slide
    )));
  };

  const updateBlock = (blockId, changes) => {
    updateSlide((slide) => ({
      ...slide,
      blocks: slide.blocks.map((block) =>
        block.id === blockId ? { ...block, ...changes } : block
      ),
    }));
  };

  const handlePointerMove = (event) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    if (dragging) {
      const x = Math.max(0, Math.min(100 - dragging.width, ((event.clientX - rect.left) / rect.width) * 100 - dragging.offsetX));
      const y = Math.max(0, Math.min(100 - dragging.height, ((event.clientY - rect.top) / rect.height) * 100 - dragging.offsetY));
      updateBlock(dragging.blockId, { x, y });
    }
    if (resizing) {
      const width = Math.max(8, Math.min(92, ((event.clientX - rect.left) / rect.width) * 100 - resizing.x));
      const height = Math.max(8, Math.min(92, ((event.clientY - rect.top) / rect.height) * 100 - resizing.y));
      updateBlock(resizing.blockId, { width, height });
    }
  };

  const stopDragging = () => {
    setDragging(null);
    setResizing(null);
  };

  const hasUnsavedChanges = JSON.stringify(slides) !== initialSlides;

  const requestClose = () => {
    if (!hasUnsavedChanges || window.confirm("Cancel editing and discard all unsaved changes?")) {
      onClose();
    }
  };

  const startDragging = (event, block) => {
    if (!canvasRef.current) return;
    event.stopPropagation();
    setSelectedBlockId(block.id);
    if (event.target !== event.currentTarget) return;
    const rect = canvasRef.current.getBoundingClientRect();
    setDragging({
      blockId: block.id,
      width: Number(block.width) || 30,
      height: Number(block.height) || 20,
      offsetX: ((event.clientX - rect.left) / rect.width) * 100 - Number(block.x || 0),
      offsetY: ((event.clientY - rect.top) / rect.height) * 100 - Number(block.y || 0),
    });
  };

  const startResizing = (event, block) => {
    event.stopPropagation();
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    setSelectedBlockId(block.id);
    setResizing({
      blockId: block.id,
      x: Number(block.x) || 0,
      y: Number(block.y) || 0,
      startX: event.clientX,
      startY: event.clientY,
      rectWidth: rect.width,
      rectHeight: rect.height,
    });
  };

  const duplicateSelectedBlock = () => {
    const block = slide?.blocks.find((item) => item.id === selectedBlockId);
    if (!block) return;
    const copy = { ...block, id: createBlockId(block.type), custom: true, x: Math.min(90, Number(block.x || 0) + 4), y: Math.min(90, Number(block.y || 0) + 4) };
    updateSlide((current) => ({ ...current, blocks: [...current.blocks, copy] }));
    setSelectedBlockId(copy.id);
  };

  const addTextBlock = () => {
    updateSlide((slide) => ({
      ...slide,
      blocks: [
        ...slide.blocks,
        {
          id: createBlockId("text"),
          custom: true,
          type: "text",
          text: "New slide text",
          x: 10,
          y: 10,
          width: 40,
          height: 18,
        },
      ],
    }));
  };

  const addImageBlock = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) {
      setError("Slide images must be image files under 5 MB.");
      event.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        const width = 70;
        const imageHeight = width * (image.naturalHeight / image.naturalWidth) * (16 / 9);
        const requiredHeightScale = Math.max(1, Math.min(3, (10 + imageHeight) / 100));
        updateSlide((slide) => ({
          ...slide,
          heightScale: Math.max(Number(slide.heightScale) || 1, requiredHeightScale),
          blocks: [
            ...slide.blocks,
            {
              id: createBlockId("image"),
              custom: true,
              type: "image",
              src: reader.result,
              alt: file.name,
              x: 10,
              y: 10,
              width,
              height: Math.min(85, imageHeight),
            },
          ],
        }));
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const removeBlock = (blockId) => {
    updateSlide((slide) => ({
      ...slide,
      blocks: slide.blocks.filter((block) => block.id !== blockId),
    }));
    setSelectedBlockId(null);
  };

  const removeActiveSlide = () => {
    if (slides.length <= 1) {
      setError("A topic must contain at least one slide.");
      return;
    }
    setSlides((current) => current.filter((_, index) => index !== activeSlide));
    setActiveSlide((current) => Math.max(0, Math.min(current, slides.length - 2)));
  };

  async function saveSlides() {
    try {
      setSaving(true);
      setError("");
      const response = await apiFetch(`${API_URL}/api/topics/${topic.id}/slides`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slides: slides.map((slide) => ({ ...slide, source: "custom" })),
        }),
      });
      const data = response ? await readJson(response) : null;
      if (!response?.ok) throw new Error(data?.message || "Unable to save slide layout.");
      await onSaved();
      onClose();
    } catch (saveError) {
      setError(saveError.message || "Unable to save slide layout.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="page"><LoadingPage /></div>;
  }

  const slide = slides[activeSlide];
  const editorTheme = getTopicVisualTheme(topic);
  return (
    <div className="page slide-editor-page" onPointerMove={handlePointerMove} onPointerUp={stopDragging}>
      <button className="back-button" type="button" onClick={requestClose}>← Back to Topics</button>
      {error && <ErrorState message={error} />}
      <div className="slide-editor">
        {slide && (
          <section className="slide-editor__workspace">
            <div className="slide-editor__toolbar">
              <button type="button" className="secondary-action" onClick={() => setActiveSlide((value) => Math.max(0, value - 1))} disabled={activeSlide === 0}>← Previous</button>
              <span className="slide-editor__counter">Slide {activeSlide + 1} of {slides.length}</span>
              <button type="button" className="secondary-action" onClick={() => setActiveSlide((value) => Math.min(slides.length - 1, value + 1))} disabled={activeSlide === slides.length - 1}>Next →</button>
              <input value={slide.title} onChange={(event) => updateSlide((item) => ({ ...item, title: event.target.value }))} aria-label="Slide title" />
              <button type="button" className="secondary-action" onClick={addTextBlock}>+ Text</button>
              <label className="secondary-action">+ Picture<input type="file" accept="image/*" onChange={addImageBlock} hidden /></label>
              <button type="button" className="secondary-action" onClick={duplicateSelectedBlock} disabled={!selectedBlockId}>Duplicate</button>
              <button
                type="button"
                className="table-delete"
                onClick={() => selectedBlockId && removeBlock(selectedBlockId)}
                disabled={!selectedBlockId}
                title={selectedBlockId ? "Remove the selected text or picture" : "Select a text block or picture first"}
              >
                Remove selected
              </button>
              <button type="button" className="secondary-action" onClick={() => setSlides((current) => [...current, { id: createBlockId("slide"), title: "New slide", heightScale: 1, blocks: [] }])}>+ Add slide</button>
              <button type="button" className="table-delete" onClick={removeActiveSlide}>Remove slide</button>
              <button type="button" className="secondary-action" onClick={requestClose}>Cancel</button>
              <button type="button" className="primary-action" onClick={saveSlides} disabled={saving}>{saving ? "Saving..." : "Save slides"}</button>
            </div>
            <div
              className="slide-editor__canvas topic-learning-scroll topic-slide-deck"
              ref={canvasRef}
              onPointerDown={(event) => {
                if (event.target === event.currentTarget || event.target.closest(".slide-editor__actual-preview")) {
                  setSelectedBlockId(null);
                }
              }}
              style={{
                "--topic-accent": editorTheme.accent,
                "--topic-secondary": editorTheme.secondary,
                "--topic-ink": editorTheme.ink,
                "--topic-surface": editorTheme.surface,
                "--topic-deep": editorTheme.deep,
                "--editor-slide-aspect": `16 / ${9 * (Number(slide.heightScale) || 1)}`,
              }}
            >
              <div className="slide-editor__actual-preview topic-slide-viewport">
                <div className="slide-editor__fixed-content topic-slide-viewport">
                  <ActualTopicSlideVisual slide={slide} topic={topic} lectureText={lectureText} selectedBlockId={selectedBlockId} />
                </div>
              </div>
              {slide.blocks.map((block) => (
                <div
                  key={block.id}
                  className={`slide-editor__block ${selectedBlockId === block.id ? "is-selected" : ""} ${!block.custom ? "is-source-block" : ""}`}
                  style={{ left: `${block.x}%`, top: `${block.y}%`, width: `${block.width}%`, height: `${block.height}%` }}
                  onPointerDown={(event) => startDragging(event, block)}
                >
                  {block.type === "image" ? (
                    <img src={block.src} alt={block.alt || ""} />
                  ) : (
                    <textarea
                      className={`slide-editor__source-textarea ${!block.custom ? "is-source-textarea" : ""} ${block.id}`}
                      data-block-id={block.id}
                      value={block.text || ""}
                      onChange={(event) => updateBlock(block.id, { text: event.target.value })}
                      onFocus={() => setSelectedBlockId(block.id)}
                      onPointerDown={(event) => {
                        event.stopPropagation();
                        setSelectedBlockId(block.id);
                      }}
                    />
                  )}
                  {selectedBlockId === block.id && <button type="button" className="slide-editor__resize-handle" onPointerDown={(event) => startResizing(event, block)} aria-label="Resize selected element" />}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}


const PYTHON_PROGRESS_STORAGE_KEY = "python-course-progress-v1";
const PYTHON_CAPSTONE_STORAGE_KEY = "python-capstone-draft-v1";

function readSessionJson(key, fallback) {
  try {
    const saved = window.sessionStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

function getPythonSpecForLesson(lesson, courseData) {
  if (!lesson || !courseData) return null;
  const titleKey = String(lesson.title || "").toLocaleLowerCase();
  const exact = courseData.PYTHON_LESSON_BY_TITLE[titleKey];
  if (exact) return exact;
  return null;
}

function getPythonGlobalNumber(lesson, level, courseData) {
  const spec = getPythonSpecForLesson(lesson, courseData);
  if (spec) return spec.number;
  const levelInfo = courseData?.PYTHON_LEVELS.find((entry) => entry.title === level?.title);
  return levelInfo ? levelInfo.first + Number(lesson?.order_number || 1) - 1 : 0;
}

function formatPythonNumber(number) {
  return String(number).padStart(2, "0");
}

function usePythonWorker() {
  const workerRef = useRef(null);
  const runtimeReadyRef = useRef(false);
  const runtimeVersionRef = useRef("");
  const timeoutRef = useRef(null);
  const outputRef = useRef("");
  const [execution, setExecution] = useState({ status: "idle", output: "", error: "", version: "", figures: [] });
  const busy = ["loading", "preparing", "running"].includes(execution.status);

  function finishRun(worker, result, terminateWorker = true) {
    if (workerRef.current !== worker) return;
    window.clearTimeout(timeoutRef.current);
    if (terminateWorker) {
      worker.terminate();
      workerRef.current = null;
      runtimeReadyRef.current = false;
      runtimeVersionRef.current = "";
    }
    setExecution(result);
  }

  function run(files, entrypoint, stdin = "", mode = "program", testPaths = []) {
    const totalSize = files.reduce((total, file) => total + String(file.content || "").length, 0);
    if (!files.length || files.length > 25 || totalSize > 256_000 || String(stdin).length > 8_000) {
      setExecution({ status: "failed", output: "", error: "Keep projects under 25 files and 256 KB of source text, with no more than 8 KB of program input.", version: "", figures: [] });
      return;
    }

    if (workerRef.current && runtimeReadyRef.current) {
      const activeWorker = workerRef.current;
      outputRef.current = "";
      setExecution({ status: "preparing", output: "", error: "", version: runtimeVersionRef.current, figures: [] });
      timeoutRef.current = window.setTimeout(() => finishRun(activeWorker, {
        status: "failed", output: outputRef.current, error: "Package preparation timed out. Try again with fewer imports.", version: runtimeVersionRef.current, figures: [],
      }), 90_000);
      activeWorker.postMessage({ type: "run", files, entrypoint, stdin, mode, testPaths });
      return;
    }

    if (workerRef.current) {
      window.clearTimeout(timeoutRef.current);
      workerRef.current.terminate();
      workerRef.current = null;
      runtimeReadyRef.current = false;
      runtimeVersionRef.current = "";
    }

    let worker;
    try {
      worker = new Worker(new URL("./pythonRunner.worker.js", import.meta.url), { type: "module" });
    } catch (error) {
      setExecution({ status: "failed", output: "", error: error?.message || "This browser cannot start the isolated Python worker.", version: "", figures: [] });
      return;
    }

    workerRef.current = worker;
    runtimeReadyRef.current = false;
    runtimeVersionRef.current = "";
    outputRef.current = "";
    setExecution({ status: "loading", output: "", error: "", version: "", figures: [] });
    timeoutRef.current = window.setTimeout(() => finishRun(worker, {
          status: "failed", output: outputRef.current, error: "Python runtime loading timed out. Check the connection to the Pyodide CDN and try again.", version: "", figures: [],
    }), 90_000);

    worker.addEventListener("message", (event) => {
      if (workerRef.current !== worker) return;
      const message = event.data || {};
      if (message.type === "ready") {
        runtimeReadyRef.current = true;
        runtimeVersionRef.current = message.version || "";
        setExecution((current) => ({ ...current, status: "preparing", version: message.version || "" }));
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = window.setTimeout(() => finishRun(worker, {
          status: "failed", output: outputRef.current, error: "Package preparation timed out. Try again with fewer imports.", version: message.version || "", figures: [],
        }), 90_000);
        worker.postMessage({ type: "run", files, entrypoint, stdin, mode, testPaths });
      } else if (message.type === "preparing") {
        setExecution((current) => ({ ...current, status: "preparing" }));
      } else if (message.type === "executing") {
        setExecution((current) => ({ ...current, status: "running" }));
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = window.setTimeout(() => finishRun(worker, {
          status: "failed", output: outputRef.current, error: "Run stopped after 15 seconds so it cannot block the page. Check for an infinite loop or very large calculation.", version: "", figures: [],
        }), 15_000);
      } else if (message.type === "output") {
        outputRef.current = String(message.output || "");
        setExecution((current) => ({ ...current, output: String(message.output || "") }));
      } else if (message.type === "completed") {
        outputRef.current = String(message.output || "");
        finishRun(worker, { status: "completed", output: String(message.output || ""), error: "", version: runtimeVersionRef.current, figures: Array.isArray(message.figures) ? message.figures : [] }, false);
      } else if (message.type === "failed" || message.type === "fatal") {
        outputRef.current = String(message.output || outputRef.current);
        const canKeepRuntime = message.type === "failed" && runtimeReadyRef.current;
        finishRun(worker, { status: "failed", output: String(message.output || ""), error: String(message.error || "Python execution failed."), version: runtimeVersionRef.current, figures: Array.isArray(message.figures) ? message.figures : [] }, !canKeepRuntime);
      }
    });

    worker.addEventListener("error", (event) => finishRun(worker, {
      status: "failed", output: outputRef.current, error: event.message || "The isolated Python worker stopped unexpectedly.", version: "", figures: [],
    }));
    worker.postMessage({ type: "initialize" });
  }

  function cancel() {
    const worker = workerRef.current;
    if (worker) finishRun(worker, { status: "cancelled", output: outputRef.current, error: "Run cancelled.", version: execution.version, figures: [] });
  }

  useEffect(() => () => {
    window.clearTimeout(timeoutRef.current);
    workerRef.current?.terminate();
    workerRef.current = null;
    runtimeReadyRef.current = false;
    runtimeVersionRef.current = "";
  }, []);

  return { execution, busy, run, cancel };
}

function PythonExecutionPanel({ runner, label = "Run output" }) {
  if (runner.execution.status === "idle") return null;
  const statusLabels = {
    loading: "Loading the browser Python runtime…",
    preparing: "Preparing files and Python packages…",
    running: "Program running…",
    completed: "Run complete",
    failed: "Run failed",
    cancelled: "Run cancelled",
  };
  return (
    <section className={`python-spec-run-panel${runner.execution.status === "failed" ? " is-error" : ""}`} aria-label={label}>
      <div className="python-spec-run-panel__header">
        <strong>{statusLabels[runner.execution.status] || label}</strong>
        {runner.execution.status === "running" && <button type="button" className="secondary-action" onClick={runner.cancel}>Stop</button>}
      </div>
      {runner.execution.version && <span className="python-spec-run-panel__version">Python {runner.execution.version} · browser worker</span>}
      <pre aria-live="polite">{runner.execution.output || (runner.execution.status === "completed" ? "Program finished without printing output." : "Output will appear here.")}</pre>
      {runner.execution.figures?.map((figure, index) => <img className="python-spec-run-panel__figure" key={`${index}-${figure.length}`} src={`data:image/png;base64,${figure}`} alt={`Chart produced by the Python run, figure ${index + 1}`} />)}
      {runner.execution.error && <p role="alert">{runner.execution.error}</p>}
    </section>
  );
}

function PythonModule({ apiFetch, isAdmin, studentId }) {
  const [topics, setTopics] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [levelLoading, setLevelLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [manageMode, setManageMode] = useState(false);
  const [editor, setEditor] = useState(null);
  const [topicDraft, setTopicDraft] = useState({ title: "", description: "", order_number: 1 });
  const [lessonDraft, setLessonDraft] = useState({ title: "", content: "", order_number: 1 });
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [specialPage, setSpecialPage] = useState(null);
  const [progress, setProgress] = useState(() => readSessionJson(PYTHON_PROGRESS_STORAGE_KEY, {}));
  const [courseData, setCourseData] = useState(null);
  const [courseDataLoading, setCourseDataLoading] = useState(true);
  const [courseDataError, setCourseDataError] = useState("");

  const moduleUrl = (path) => `${API_URL}${path}${path.includes("?") ? "&" : "?"}module_key=python`;
  const selectedLessonIndex = lessons.findIndex((lesson) => Number(lesson.id) === Number(selectedLesson?.id));
  const selectedSpec = getPythonSpecForLesson(selectedLesson, courseData);
  const selectedNumber = selectedSpec?.number || getPythonGlobalNumber(selectedLesson, selectedLevel, courseData);
  const selectedProgressKey = selectedSpec?.title || selectedLesson?.title;
  const selectedProgress = selectedProgressKey ? progress[selectedProgressKey] : null;
  const courseLessons = courseData?.PYTHON_LESSONS || [];
  const courseLevels = courseData?.PYTHON_LEVELS || [];
  const completedCount = courseLessons.filter((lesson) => progress[lesson.title]?.status === "completed").length;
  const progressPercent = courseLessons.length ? Math.round((completedCount / courseLessons.length) * 100) : 0;

  useEffect(() => {
    let active = true;
    import("./pythonCourseData.js")
      .then((data) => { if (active) setCourseData(data); })
      .catch(() => { if (active) setCourseDataError("Python lesson data could not be loaded. Reload this page to try again."); })
      .finally(() => { if (active) setCourseDataLoading(false); });
    loadTopics();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    try {
      window.sessionStorage.setItem(PYTHON_PROGRESS_STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // Progress is intentionally session-only and is not required for course access.
    }
  }, [progress]);

  async function loadTopics() {
    try {
      setLoading(true);
      setError("");
      const response = await apiFetch(moduleUrl("/api/topics"));
      if (!response) return false;
      const data = await readJson(response);
      if (!response.ok) throw new Error(data?.message || "Unable to load Python levels.");
      setTopics(getArrayData(data, ["topics"]));
      return true;
    } catch (loadError) {
      setError(loadError.message || "Unable to load Python levels.");
      return false;
    } finally {
      setLoading(false);
    }
  }

  function markLessonStarted(lesson) {
    const spec = getPythonSpecForLesson(lesson, courseData);
    const key = spec?.title || lesson.title;
    if (!key) return;
    setProgress((current) => current[key]?.status === "completed" ? current : {
      ...current,
      [key]: { ...current[key], status: "in_progress" },
    });
  }

  function chooseLesson(lesson) {
    setSelectedLesson(lesson);
    setSpecialPage(null);
    setNotice("");
    markLessonStarted(lesson);
  }

  async function openLevel(topic) {
    setSelectedLevel(topic);
    setSelectedLesson(null);
    setLessons([]);
    setSpecialPage(null);
    setLevelLoading(true);
    setError("");
    try {
      const response = await apiFetch(moduleUrl(`/api/topics/${topic.id}/subtopics`));
      if (!response) return;
      const data = await readJson(response);
      if (!response.ok) throw new Error(data?.message || "Unable to load Python lessons.");
      setLessons(getArrayData(data, ["subtopics"]));
    } catch (loadError) {
      setError(loadError.message || "Unable to load Python lessons.");
    } finally {
      setLevelLoading(false);
    }
  }

  async function openCourseLesson(number) {
    const spec = courseLessons.find((lesson) => lesson.number === number);
    if (!spec) return;
    const levelInfo = courseLevels.find((level) => number >= level.first && number <= level.last);
    const topic = topics.find((item) => item.title === levelInfo?.title) || topics[courseLevels.indexOf(levelInfo)];
    if (!topic) {
      setError(`The ${levelInfo?.title || "Python"} level is not available in the course data.`);
      return;
    }
    setLevelLoading(true);
    setError("");
    setSpecialPage(null);
    try {
      const response = await apiFetch(moduleUrl(`/api/topics/${topic.id}/subtopics`));
      if (!response) return;
      const data = await readJson(response);
      if (!response.ok) throw new Error(data?.message || "Unable to load the requested lesson.");
      const items = getArrayData(data, ["subtopics"]);
      const levelOrder = number - levelInfo.first + 1;
      const target = items.find((item) => item.title === spec.title)
        || items.find((item) => Number(item.order_number) === levelOrder);
      if (!target) throw new Error(`${spec.title} is not present in the current Python course data.`);
      setSelectedLevel(topic);
      setLessons(items);
      chooseLesson(target);
    } catch (loadError) {
      setError(loadError.message || "Unable to open the requested lesson.");
    } finally {
      setLevelLoading(false);
    }
  }

  async function moveLesson(direction) {
    const targetIndex = selectedLessonIndex + direction;
    if (targetIndex >= 0 && targetIndex < lessons.length) {
      chooseLesson(lessons[targetIndex]);
      return;
    }
    const levelIndex = topics.findIndex((topic) => Number(topic.id) === Number(selectedLevel?.id));
    const nextLevel = topics[levelIndex + direction];
    if (!nextLevel) return;
    setLevelLoading(true);
    setError("");
    try {
      const response = await apiFetch(moduleUrl(`/api/topics/${nextLevel.id}/subtopics`));
      if (!response) return;
      const data = await readJson(response);
      if (!response.ok) throw new Error(data?.message || "Unable to load the next Python level.");
      const items = getArrayData(data, ["subtopics"]);
      const target = direction > 0 ? items[0] : items[items.length - 1];
      setSelectedLevel(nextLevel);
      setLessons(items);
      if (target) chooseLesson(target);
      else setSelectedLesson(null);
    } catch (loadError) {
      setError(loadError.message || "Unable to load the next Python level.");
    } finally {
      setLevelLoading(false);
    }
  }

  async function continueLearning() {
    const nextLesson = courseLessons.find((lesson) => progress[lesson.title]?.status !== "completed") || courseLessons[0];
    await openCourseLesson(nextLesson.number);
  }

  function beginTopicEdit(topic = null) {
    setEditor({ kind: "topic", item: topic });
    setTopicDraft({
      title: topic?.title || "",
      description: topic?.description || "",
      order_number: topic?.order_number ?? topics.length + 1,
    });
    setError("");
  }

  function beginLessonEdit(lesson = null) {
    setEditor({ kind: "lesson", item: lesson });
    setLessonDraft({
      title: lesson?.title || "",
      content: lesson?.content || "",
      order_number: lesson?.order_number ?? lessons.length + 1,
    });
    setError("");
  }

  async function refreshLevel() {
    await loadTopics();
    if (selectedLevel) {
      setLevelLoading(true);
      try {
        const response = await apiFetch(moduleUrl(`/api/topics/${selectedLevel.id}/subtopics`));
        if (response?.ok) {
          const data = await readJson(response);
          setLessons(getArrayData(data, ["subtopics"]));
        }
      } finally {
        setLevelLoading(false);
      }
    }
  }

  async function saveEditor(event) {
    event.preventDefault();
    if (!isAdmin || saving) return;
    const isTopic = editor?.kind === "topic";
    const draft = isTopic ? topicDraft : lessonDraft;
    if (!draft.title.trim()) {
      setError("A title is required.");
      return;
    }
    const orderNumber = Number(draft.order_number);
    if (!Number.isSafeInteger(orderNumber) || orderNumber < 1) {
      setError("Order must be a positive whole number.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      const item = editor.item;
      const url = isTopic
        ? item ? moduleUrl(`/api/topics/${item.id}`) : moduleUrl("/api/topics")
        : item ? moduleUrl(`/api/subtopics/${item.id}`) : moduleUrl(`/api/topics/${selectedLevel.id}/subtopics`);
      const response = await apiFetch(url, {
        method: item ? "PUT" : "POST",
        body: JSON.stringify({
          ...draft,
          title: draft.title.trim(),
          order_number: orderNumber,
          module_key: "python",
        }),
      });
      const data = response ? await readJson(response) : null;
      if (!response?.ok) throw new Error(data?.message || "Unable to save Python content.");
      setEditor(null);
      setNotice(isTopic ? "Python level saved." : "Python lesson saved.");
      await refreshLevel();
    } catch (saveError) {
      setError(saveError.message || "Unable to save Python content.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteItem(kind, item) {
    if (!isAdmin) return;
    const label = kind === "topic" ? "level and all its lessons" : "lesson";
    if (!window.confirm(`Delete this Python ${label}?`)) return;
    try {
      const path = kind === "topic" ? `/api/topics/${item.id}` : `/api/subtopics/${item.id}`;
      const response = await apiFetch(moduleUrl(path), { method: "DELETE" });
      const data = response ? await readJson(response) : null;
      if (!response?.ok) throw new Error(data?.message || "Unable to delete Python content.");
      setNotice("Python content deleted.");
      if (kind === "topic" && selectedLevel?.id === item.id) {
        setSelectedLevel(null);
        setLessons([]);
      }
      await refreshLevel();
    } catch (deleteError) {
      setError(deleteError.message || "Unable to delete Python content.");
    }
  }

  async function reorder(kind, index, direction) {
    if (!isAdmin) return;
    const rows = kind === "topic" ? topics : lessons;
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= rows.length) return;
    const ordered = rows.map((row) => Number(row.id));
    [ordered[index], ordered[targetIndex]] = [ordered[targetIndex], ordered[index]];
    const expected = rows.map((row) => ({ id: Number(row.id), order_number: Number(row.order_number) }));
    const path = kind === "topic" ? "/api/topics/order" : `/api/topics/${selectedLevel.id}/subtopics/order`;
    try {
      const response = await apiFetch(moduleUrl(path), {
        method: "PUT",
        body: JSON.stringify({ expected, ordered_ids: ordered, module_key: "python" }),
      });
      const data = response ? await readJson(response) : null;
      if (!response?.ok) throw new Error(data?.message || "Unable to reorder Python content.");
      await refreshLevel();
    } catch (reorderError) {
      setError(reorderError.message || "Unable to reorder Python content.");
    }
  }

  function recordQuizResult(lesson, score) {
    const key = lesson.title;
    setProgress((current) => ({
      ...current,
      [key]: {
        ...current[key],
        status: current[key]?.status === "completed" ? "completed" : "in_progress",
        quizScore: score,
        quizPassed: score >= 2,
        quizAttempts: (current[key]?.quizAttempts || 0) + 1,
      },
    }));
  }

  function completeLesson() {
    if (!selectedSpec || !selectedProgress?.quizPassed) return;
    setProgress((current) => ({
      ...current,
      [selectedSpec.title]: {
        ...current[selectedSpec.title],
        status: "completed",
        completedAt: new Date().toISOString(),
      },
    }));
  }

  if (loading || courseDataLoading) return <div className="page python-module-page"><LoadingPage /></div>;
  if (!courseData) return <div className="page python-module-page"><div className="error-message" role="alert">{courseDataError || "Python lesson data is unavailable."}</div></div>;

  if (specialPage === "capstone") {
    return <div className="page python-module-page"><PythonCapstone studentId={studentId} onBack={() => setSpecialPage(null)} /></div>;
  }
  if (specialPage === "frameworks") {
    return <div className="page python-module-page"><PythonFrameworks onBack={() => setSpecialPage(null)} /></div>;
  }

  return (
    <div className="page python-module-page">
      <PageHero
        eyebrow="LEARNING MODULE"
        title="Python"
        description="A 32-lesson path from Python foundations to databases, APIs, testing, and data visualization. The source outline and application-authored teaching notes are identified separately."
        centered
      />

      <div className="python-module-toolbar">
        <p>3 levels · 32 lessons · Python runs in a browser Web Worker</p>
        <div className="python-module-toolbar__actions">
          <span className="python-playground-note">Run lesson examples in your browser or build and download a final project.</span>
          <button className="secondary-action" type="button" onClick={() => setSpecialPage("capstone")}>Final project</button>
          {isAdmin && <button className="secondary-action" type="button" onClick={() => setManageMode((value) => !value)}>{manageMode ? "Done managing" : "Manage Python"}</button>}
        </div>
      </div>

      {error && <div className="error-message" role="alert">{error}</div>}
      {notice && <div className="success-message" role="status">{notice}</div>}

      {manageMode && isAdmin && (
        <div className="python-manage-banner">
          <span>Administrator content management is scoped to the Python module.</span>
          <button className="primary-action" type="button" onClick={() => beginTopicEdit()}>+ Add level</button>
        </div>
      )}

      {editor && isAdmin && (
        <form className="python-editor panel" onSubmit={saveEditor}>
          <div className="python-editor__heading">
            <h2>{editor.item ? "Edit" : "Add"} {editor.kind === "topic" ? "Python level" : "Python lesson"}</h2>
            <button className="text-button" type="button" onClick={() => setEditor(null)}>Cancel</button>
          </div>
          <label>Title<input value={editor.kind === "topic" ? topicDraft.title : lessonDraft.title} onChange={(event) => (editor.kind === "topic" ? setTopicDraft({ ...topicDraft, title: event.target.value }) : setLessonDraft({ ...lessonDraft, title: event.target.value }))} required /></label>
          {editor.kind === "topic" ? (
            <>
              <label>Description<textarea rows="3" value={topicDraft.description} onChange={(event) => setTopicDraft({ ...topicDraft, description: event.target.value })} /></label>
              <label>Order<input type="number" min="1" value={topicDraft.order_number} onChange={(event) => setTopicDraft({ ...topicDraft, order_number: event.target.value })} /></label>
            </>
          ) : (
            <>
              <label>Lesson content<textarea className="python-editor__content" rows="16" value={lessonDraft.content} onChange={(event) => setLessonDraft({ ...lessonDraft, content: event.target.value })} /></label>
              <small>Saved administrator content remains available under each lesson. The PDF lesson manifest supplies the structured walkthrough and formative check.</small>
              <label>Order<input type="number" min="1" value={lessonDraft.order_number} onChange={(event) => setLessonDraft({ ...lessonDraft, order_number: event.target.value })} /></label>
            </>
          )}
          <button className="primary-action" type="submit" disabled={saving}>{saving ? "Saving…" : "Save Python content"}</button>
        </form>
      )}

      {selectedLesson ? (
        <section className="python-learning-section">
          <div className="python-lesson-layout">
            <aside className="python-lesson-outline" aria-label={`Lessons in ${selectedLevel.title}`}>
              <div className="python-lesson-outline__header">
                <span className="section-label">COURSE LEVEL</span>
                <strong>{selectedLevel.title}</strong>
                <button className="back-button" type="button" onClick={() => setSelectedLesson(null)}>← Back to lessons</button>
              </div>
              <nav className="python-lesson-outline__list" aria-label="Course lessons">
                {lessons.map((lesson, index) => {
                  const spec = getPythonSpecForLesson(lesson, courseData);
                  const isComplete = spec && progress[spec.title]?.status === "completed";
                  return (
                    <button
                      className={`python-lesson-outline__item${Number(lesson.id) === Number(selectedLesson.id) ? " is-active" : ""}${isComplete ? " is-complete" : ""}`}
                      type="button"
                      key={lesson.id}
                      aria-current={Number(lesson.id) === Number(selectedLesson.id) ? "page" : undefined}
                      onClick={() => chooseLesson(lesson)}
                    >
                      <span>{formatPythonNumber(spec?.number ?? index + 1)}</span>
                      <strong>{lesson.title}</strong>
                      {isComplete && <span className="python-spec-complete-mark" aria-label="Completed">✓</span>}
                    </button>
                  );
                })}
              </nav>
            </aside>

            <div className="python-lesson-main">
              <div className="python-lesson-position" role="status">
                Lesson {selectedNumber || Math.max(0, selectedLessonIndex) + 1} of 32 <span>·</span> {selectedLevel.title}
              </div>
              {selectedSpec ? (
                <PythonLessonDetail
                  lesson={selectedSpec}
                  courseLessons={courseLessons}
                  sourceLesson={selectedLesson}
                  level={selectedLevel}
                  progress={selectedProgress}
                  onOpenLesson={openCourseLesson}
                  onPrevious={() => moveLesson(-1)}
                  onNext={() => moveLesson(1)}
                  onRecordQuiz={recordQuizResult}
                  onComplete={completeLesson}
                />
              ) : (
                <>
                  <PageHero className="python-lesson-hero" eyebrow={`${selectedLevel.title} / SAVED LESSON`} title={selectedLesson.title} description="This administrator-authored lesson does not have a matching entry in the PDF's 32-lesson manifest. Its saved content is still available below." />
                  <div className="python-lesson-content"><LectureContent content={selectedLesson.content} /></div>
                  <nav className="python-lesson-pager" aria-label="Lesson navigation">
                    <button className="secondary-action" type="button" disabled={selectedLessonIndex <= 0} onClick={() => moveLesson(-1)}>← Previous lesson</button>
                    <button className="primary-action" type="button" disabled={selectedLessonIndex >= lessons.length - 1} onClick={() => moveLesson(1)}>Next lesson →</button>
                  </nav>
                </>
              )}
            </div>
          </div>
        </section>
      ) : selectedLevel ? (
        <section className="python-learning-section">
          <button className="back-button" type="button" onClick={() => { setSelectedLevel(null); setLessons([]); }}>← All Python levels</button>
          <SectionHeading eyebrow="PYTHON COURSE LEVEL" title={selectedLevel.title} description={selectedLevel.description} action={<span className="live-tag">{lessons.length} LESSONS</span>} />
          {manageMode && isAdmin && <div className="python-level-actions"><button className="secondary-action" type="button" onClick={() => beginTopicEdit(selectedLevel)}>Edit level</button><button className="table-delete" type="button" onClick={() => deleteItem("topic", selectedLevel)}>Delete level</button><button className="primary-action" type="button" onClick={() => beginLessonEdit()}>+ Add lesson</button></div>}
          {levelLoading ? <LoadingPage /> : (
            <div className="lecture-list">
              {lessons.map((lesson, index) => {
                const spec = getPythonSpecForLesson(lesson, courseData);
                const isComplete = spec && progress[spec.title]?.status === "completed";
                return (
                  <article className="lecture-card python-lesson-card" key={lesson.id}>
                    <div className="lecture-number">{formatPythonNumber(spec?.number ?? index + 1)}</div>
                    <div className="lecture-content">
                      <h3>{lesson.title}</h3>
                      <p>{spec?.learnerOutcome || getSubtopicPreview(lesson.content)}</p>
                      <div className="python-card-actions">
                        <span className={`python-spec-status${isComplete ? " is-complete" : ""}`}>{isComplete ? "Completed this session" : "Not completed"}</span>
                        <button className="secondary-button" type="button" onClick={() => chooseLesson(lesson, selectedLevel)}>Open lesson →</button>
                        {manageMode && isAdmin && <><button className="text-button" type="button" onClick={() => reorder("lesson", index, -1)} disabled={index === 0}>↑</button><button className="text-button" type="button" onClick={() => reorder("lesson", index, 1)} disabled={index === lessons.length - 1}>↓</button><button className="text-button" type="button" onClick={() => beginLessonEdit(lesson)}>Edit</button><button className="text-button danger" type="button" onClick={() => deleteItem("lesson", lesson)}>Delete</button></>}
                      </div>
                    </div>
                  </article>
                );
              })}
              {lessons.length === 0 && <div className="empty-state"><h3>No lessons in this level</h3><p>{manageMode ? "Add a lesson to get started." : "An administrator has not added lessons here yet."}</p></div>}
            </div>
          )}
        </section>
      ) : (
        <section className="python-learning-section python-course-overview">
          <div className="python-course-progress panel">
            <div className="python-course-progress__copy">
              <span className="section-label">YOUR LEARNING PATH</span>
              <strong>{completedCount} of 32 lessons completed</strong>
              <span>Progress and lesson drafts are stored for this browser tab session only.</span>
            </div>
            <div className="python-course-progress__bar" role="progressbar" aria-label="Python course completion" aria-valuemin="0" aria-valuemax="32" aria-valuenow={completedCount}>
              <span style={{ width: `${progressPercent}%` }} />
            </div>
            <div className="python-course-overview__actions">
              <button className="primary-action" type="button" onClick={continueLearning}>Continue learning</button>
              <button className="secondary-action" type="button" onClick={() => setSpecialPage("capstone")}>Open final project</button>
            </div>
          </div>

          <SectionHeading eyebrow="COURSE STRUCTURE" title="Choose a level" description="Follow the source order from fundamentals to advanced applications. Python frameworks are a separate optional extension; the course remains 32 lessons." />
          <div className="python-level-grid">
            {topics.map((topic, index) => {
              const expected = courseLevels[index];
              const expectedCount = expected?.count ?? topic.subtopic_count ?? 0;
              return (
                <article className={`python-level-card python-level-card--${index + 1}`} key={topic.id}>
                  <div className="python-level-card__number">{String(index + 1).padStart(2, "0")}</div>
                  <h2>{topic.title}</h2>
                  <p>{topic.description}</p>
                  <span className="live-tag">{expectedCount} LESSONS</span>
                  {Number(topic.subtopic_count) !== expectedCount && <span className="python-spec-count-note">The database currently reports {topic.subtopic_count ?? 0} saved lessons in this level.</span>}
                  <div className="python-card-actions">
                    <button className="primary-action" type="button" onClick={() => openLevel(topic)}>Browse lessons →</button>
                    {manageMode && isAdmin && <><button className="text-button" type="button" onClick={() => reorder("topic", index, -1)} disabled={index === 0}>↑</button><button className="text-button" type="button" onClick={() => reorder("topic", index, 1)} disabled={index === topics.length - 1}>↓</button><button className="text-button" type="button" onClick={() => beginTopicEdit(topic)}>Edit</button><button className="text-button danger" type="button" onClick={() => deleteItem("topic", topic)}>Delete</button></>}
                  </div>
                </article>
              );
            })}
            {topics.length === 0 && <div className="empty-state"><h3>Python course content is not available</h3><p>Reload the page or ask an administrator to initialize the course.</p></div>}
          </div>
          <div className="python-course-extras">
            <article className="python-course-extra">
              <div><span className="section-label">OPTIONAL · NOT NUMBERED</span><h3>Python Frameworks</h3><p>Explore Flask and Django as web frameworks. Pandas is a data library, not a web framework.</p></div>
              <button className="secondary-action" type="button" onClick={() => setSpecialPage("frameworks")}>Open extension</button>
            </article>
          </div>
        </section>
      )}
    </div>
  );
}

function PythonLessonDetail({ lesson, courseLessons, sourceLesson, level, progress, onOpenLesson, onPrevious, onNext, onRecordQuiz, onComplete }) {
  const previous = lesson.number > 1 ? courseLessons.find((entry) => entry.number === lesson.number - 1) : null;
  const next = lesson.number < 32 ? courseLessons.find((entry) => entry.number === lesson.number + 1) : null;
  const objectives = [lesson.learnerOutcome, `Complete the guided practice: ${lesson.guidedPractice}`, `Apply the concept in the challenge: ${lesson.applyChallenge}`];
  const legacyAlias = lesson.number === 31 ? "python graphs" : lesson.number === 32 ? "python charts" : "";
  const displayTitle = legacyAlias && sourceLesson.title.toLocaleLowerCase() === legacyAlias ? lesson.title : sourceLesson.title;
  const isComplete = progress?.status === "completed";

  return (
    <article className="python-spec-lesson">
      <nav className="python-spec-breadcrumb" aria-label="Breadcrumb">
        <button type="button" onClick={() => onOpenLesson(lesson.number)}>Python course</button><span aria-hidden="true">/</span>
        <button type="button" onClick={() => onOpenLesson(lesson.number)}>{level.title}</button><span aria-hidden="true">/</span>
        <span aria-current="page">Lesson {formatPythonNumber(lesson.number)}</span>
      </nav>
      <PageHero className="python-lesson-hero" eyebrow={`${level.title.toUpperCase()} · LESSON ${formatPythonNumber(lesson.number)} OF 32`} title={displayTitle} description={lesson.learnerOutcome} />
      <div className="python-spec-status-strip">
        <span className={`python-spec-level-chip python-spec-level-chip--${lesson.number >= 28 ? "advanced" : lesson.number >= 16 ? "intermediate" : "basic"}`}>{level.title}</span>
        <span className={`python-spec-status${isComplete ? " is-complete" : progress?.status === "in_progress" ? " is-progress" : ""}`}>{isComplete ? "Completed this session" : progress?.status === "in_progress" ? "In progress" : "Not started"}</span>
        {typeof progress?.quizScore === "number" && <span className="python-spec-score">Latest check: {progress.quizScore}/3</span>}
      </div>

      <section className="python-spec-section python-spec-before">
        <div className="python-spec-section-heading"><span>01</span><div><p className="section-label">ORIENTATION</p><h3>Before you begin</h3></div></div>
        <p><strong>Prerequisite:</strong> {lesson.prerequisite}</p>
        {previous && <button className="python-spec-prereq-link" type="button" onClick={() => onOpenLesson(previous.number)}>Review Lesson {formatPythonNumber(previous.number)} · {previous.title} →</button>}
        <h4>By the end of this lesson, you can</h4>
        <ul className="python-spec-outcomes">{objectives.map((objective) => <li key={objective}>{objective}</li>)}</ul>
      </section>

      <section className="python-spec-section python-spec-learn">
        <div className="python-spec-section-heading"><span>02</span><div><p className="section-label">LEARN</p><h3>Key ideas</h3></div></div>
        <details className="python-spec-ppt-outline"><summary>Presentation outline</summary><p>{lesson.sourceSummary}</p></details>
        <p className="python-spec-source-label">Discussion points from the PDF implementation brief</p>
        <ol className="python-spec-learning-points">
          {lesson.discussion.map((point, index) => <li key={`${index}-${point}`}><span>{String(index + 1).padStart(2, "0")}</span><p>{point}</p></li>)}
        </ol>
        <aside className="python-spec-explanation"><strong>Teaching note authored for this app</strong><p>{lesson.authoredExplanation}</p></aside>
        {lesson.accuracyNote && <aside className="python-spec-accuracy"><strong>Accuracy note</strong><p>{lesson.accuracyNote}</p></aside>}
      </section>

      <section className="python-spec-section python-spec-walkthrough">
        <div className="python-spec-section-heading"><span>03</span><div><p className="section-label">WALKTHROUGH</p><h3>Worked example</h3></div></div>
        <p className="python-spec-source-label">Example and expected behavior from the lesson brief · reference only</p>
        <pre className="python-spec-code"><code>{lesson.workedCode}</code></pre>
        <p className="python-spec-expected"><strong>What this example demonstrates:</strong> {lesson.expectedBehavior}</p>
        {lesson.number === 31 && <PythonReferenceChart />}
        {lesson.number === 32 && <PythonChartsGuide />}
      </section>

      <PythonInlineLab key={lesson.number} lesson={lesson} />

      {lesson.number === 2 && <PythonSetupGuide />}
      {lesson.number === 27 && <PythonPackageGuide />}
      <PythonVisualAid lesson={lesson} />

      <section className="python-spec-section python-spec-apply">
        <div className="python-spec-section-heading"><span>04</span><div><p className="section-label">APPLY</p><h3>Independent challenge</h3></div></div>
        <p>{lesson.applyChallenge}</p>
        <div className="python-spec-validation"><strong>Self-check criteria</strong><ul><li>Meet the stated requirements and use the lesson concept.</li><li>Try one normal case and one boundary or error case where relevant.</li><li>Compare your local result with the expected behavior; this product does not auto-grade code.</li></ul></div>
      </section>

      <PythonKnowledgeCheck key={lesson.number} lesson={lesson} onResult={onRecordQuiz} />

      <section className="python-spec-section python-spec-wrap">
        <div className="python-spec-section-heading"><span>06</span><div><p className="section-label">WRAP UP</p><h3>Takeaways</h3></div></div>
        <ul className="python-spec-takeaways">{lesson.discussion.slice(0, 3).map((point) => <li key={point}>{point}</li>)}</ul>
        <p className="python-spec-common-mistake"><strong>Common mistake to avoid:</strong> {lesson.commonMistake}</p>
        <div className="python-spec-completion">
          <div><strong>Completion policy</strong><p>Pass at least 2 of 3 formative questions, then mark this lesson complete. Completion and the quiz score are stored for this browser-tab session only.</p></div>
          <button className="primary-action" type="button" onClick={onComplete} disabled={isComplete || !progress?.quizPassed}>{isComplete ? "Lesson complete" : progress?.quizPassed ? "Mark lesson complete" : "Pass the knowledge check to complete"}</button>
        </div>
      </section>

      <details className="python-spec-saved-content">
        <summary>View saved lesson content and administrator notes</summary>
        <div className="python-lesson-content"><LectureContent content={sourceLesson.content} /></div>
      </details>

      <nav className="python-lesson-pager" aria-label="Lesson navigation">
        <button className="secondary-action" type="button" onClick={onPrevious} disabled={!previous}>← Previous lesson</button>
        <span>Lesson {formatPythonNumber(lesson.number)} of 32</span>
        <button className="primary-action" type="button" onClick={onNext} disabled={!next}>Next lesson →</button>
      </nav>
    </article>
  );
}

function PythonInlineLab({ lesson }) {
  const runner = usePythonWorker();
  const storageKey = `python-lesson-draft-v1:${lesson.number}`;
  const [code, setCode] = useState(() => {
    try { return window.sessionStorage.getItem(storageKey) ?? lesson.workedCode; } catch { return lesson.workedCode; }
  });
  const [feedback, setFeedback] = useState("");
  const [stdin, setStdin] = useState(() => lesson.sampleInput || "");
  const lineNumberRef = useRef(null);
  const textareaRef = useRef(null);
  const changed = code !== lesson.workedCode;
  const canReferenceOutput = Boolean(lesson.referenceOutput);
  const downloadFileName = `lesson-${formatPythonNumber(lesson.number)}-${lesson.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}.py`;

  useEffect(() => {
    try { window.sessionStorage.setItem(storageKey, code); } catch { /* Draft remains editable for this view. */ }
  }, [code, storageKey]);

  function resetCode() {
    if (changed && !window.confirm("Reset this lesson draft to the original example? Your session draft will be replaced.")) return;
    setCode(lesson.workedCode);
    setFeedback("Draft reset to the original lesson example.");
  }

  async function copyCode() {
    try {
      await window.navigator.clipboard.writeText(code);
      setFeedback("Code copied.");
    } catch {
      textareaRef.current?.focus();
      textareaRef.current?.select();
      setFeedback("Clipboard access is unavailable. The code is selected so you can copy it with your keyboard.");
    }
  }

  function downloadCode() {
    const blob = new Blob([code], { type: "text/x-python;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = downloadFileName;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    setFeedback("Python file downloaded. Run it with the local command shown below.");
  }

  function runDraft() {
    runner.run([{ path: "main.py", content: code }], "main.py", stdin);
  }

  return (
    <section className="python-spec-section python-spec-practice">
      <div className="python-spec-section-heading"><span>03b</span><div><p className="section-label">PRACTICE IN THIS LESSON</p><h3>Try the idea</h3></div></div>
      <p>{lesson.guidedPractice}</p>
      <div className="python-spec-runtime-note" role="status"><strong>Runs in your browser</strong><span>Python runs in a separate Web Worker, not on the Flask server. The first run loads the browser runtime; each execution has a 15-second limit and network access is disabled during your code.</span></div>
      <div className="python-spec-editor-toolbar">
        <span>{lesson.runtimeMode.replace(/-/g, " ")} · editable session draft · {code.split("\n").length} lines</span>
        <div>
          <button type="button" className="secondary-action" onClick={copyCode}>Copy</button>
          <button type="button" className="secondary-action" onClick={downloadCode}>Download .py</button>
          <button type="button" className="secondary-action" onClick={resetCode} disabled={!changed}>Reset</button>
          <button type="button" className="primary-action" onClick={runDraft} disabled={runner.busy}>{runner.execution.status === "loading" ? "Loading Python…" : runner.execution.status === "preparing" ? "Preparing…" : "Run"}</button>
          {runner.busy && <button type="button" className="secondary-action" onClick={runner.cancel}>Cancel</button>}
        </div>
      </div>
      <div className="python-spec-editor">
        <pre className="python-spec-line-numbers" aria-hidden="true" ref={lineNumberRef}>{code.split("\n").map((_, index) => index + 1).join("\n")}</pre>
        <textarea
          ref={textareaRef}
          aria-label={`Editable Python draft for lesson ${formatPythonNumber(lesson.number)}`}
          spellCheck="false"
          autoCapitalize="off"
          autoCorrect="off"
          rows={Math.min(Math.max(code.split("\n").length, 7), 18)}
          value={code}
          onChange={(event) => { setCode(event.target.value); setFeedback(""); }}
          onScroll={(event) => { if (lineNumberRef.current) lineNumberRef.current.scrollTop = event.currentTarget.scrollTop; }}
        />
      </div>
      <label className="python-spec-stdin">Program input <span>Optional · enter one value per line for each input() call.</span><textarea rows="2" value={stdin} maxLength={8000} onChange={(event) => setStdin(event.target.value)} placeholder="For example: Madera&#10;20" /></label>
      <PythonExecutionPanel runner={runner} label={`Run output for lesson ${formatPythonNumber(lesson.number)}`} />
      <p className="python-spec-run-command"><strong>Run locally:</strong> you can still download the file and run <code>python {downloadFileName}</code> (or <code>python3</code>) on your computer.</p>
      {lesson.number === 7 && <div className="python-spec-sample-input"><strong>Example input values</strong><pre>{lesson.sampleInput}</pre><span>Paste these lines into Program input before running. Invalid numeric input produces the real Python conversion error.</span></div>}
      <div className={`python-spec-output${changed ? " is-reference-stale" : ""}`}>
        <strong>{canReferenceOutput ? "Expected example output · static reference" : "Expected behavior · static reference"}</strong>
        {canReferenceOutput ? <pre>{lesson.referenceOutput}</pre> : <p>{lesson.expectedBehavior}</p>}
        {lesson.referenceOutputNote && <p>{lesson.referenceOutputNote}</p>}
        {changed && <span>This reference belongs to the original example and does not reflect the edited draft.</span>}
      </div>
      <details className="python-spec-hint"><summary>Hint and next step</summary><p>{lesson.handsOnInteraction}</p><p>Change one value or statement, run the draft, and compare its real output with the static reference above.</p></details>
      {feedback && <p className="python-spec-feedback" role="status">{feedback}</p>}
    </section>
  );
}

function buildPythonQuizChoices(lesson, index) {
  const current = lesson.knowledgeChecks[index];
  const distinctAnswers = [...new Set(lesson.knowledgeChecks.map((item) => item.answer).filter((answer) => answer !== current.answer))];
  const generalDistractors = [
    "Yes, the opposite behavior is guaranteed.",
    "The interpreter chooses automatically based on the operating system.",
    "It changes only when the program is restarted.",
    "It is always stored as a string.",
    "It runs only once and cannot be repeated.",
    "It depends on which code editor is installed.",
  ];
  const distractors = [...distinctAnswers, ...generalDistractors].filter((answer, position, all) => answer !== current.answer && all.indexOf(answer) === position).slice(0, 2);
  while (distractors.length < 2) distractors.push(`A different behavior than: ${current.answer}`);
  const choices = [current.answer, ...distractors];
  const rotateBy = (lesson.number + index) % choices.length;
  return choices.slice(rotateBy).concat(choices.slice(0, rotateBy));
}

function PythonKnowledgeCheck({ lesson, onResult }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [notice, setNotice] = useState("");

  function submitQuiz(event) {
    event.preventDefault();
    if (Object.keys(answers).length !== lesson.knowledgeChecks.length) {
      setNotice("Choose an answer for each question before submitting.");
      return;
    }
    const score = lesson.knowledgeChecks.reduce((total, question, index) => total + (answers[index] === question.answer ? 1 : 0), 0);
    setResult(score);
    setSubmitted(true);
    setNotice("");
    onResult(lesson, score);
  }

  function retryQuiz() {
    setAnswers({});
    setSubmitted(false);
    setResult(null);
    setNotice("Try again. You can change any answer before you submit.");
  }

  return (
    <section className="python-spec-section python-spec-quiz">
      <div className="python-spec-section-heading"><span>05</span><div><p className="section-label">CHECK UNDERSTANDING</p><h3>Knowledge check</h3></div></div>
      <p>Choose one answer for each question. This is a formative check, not a graded submission.</p>
      <form onSubmit={submitQuiz}>
        <div className="python-spec-question-list">
          {lesson.knowledgeChecks.map((question, index) => {
            const choices = buildPythonQuizChoices(lesson, index);
            const isCorrect = submitted && answers[index] === question.answer;
            return (
              <fieldset className={`python-spec-question${submitted ? (isCorrect ? " is-correct" : " is-incorrect") : ""}`} key={`${lesson.number}-quiz-${index}`}>
                <legend><span>Question {index + 1}</span>{question.question}</legend>
                {choices.map((choice, choiceIndex) => (
                  <label className="python-spec-choice" key={`${choice}-${choiceIndex}`}>
                    <input type="radio" name={`python-${lesson.number}-question-${index}`} value={choice} checked={answers[index] === choice} disabled={submitted} onChange={() => setAnswers((current) => ({ ...current, [index]: choice }))} />
                    <span>{choice}</span>
                  </label>
                ))}
                {submitted && <p className="python-spec-answer-explanation"><strong>{isCorrect ? "Correct." : "Review this idea."}</strong> {question.answer}. The related discussion point is: {lesson.discussion[Math.min(index, lesson.discussion.length - 1)]}</p>}
              </fieldset>
            );
          })}
        </div>
        {notice && <p className="python-spec-feedback" role="status">{notice}</p>}
        {submitted ? (
          <div className={`python-spec-quiz-result${result >= 2 ? " is-passed" : " is-retry"}`} role="status">
            <div><strong>{result}/3 correct</strong><span>{result >= 2 ? "Knowledge check passed. You may mark this lesson complete." : "You need 2 correct answers to pass. Review the explanations and try once more."}</span></div>
            <button type="button" className="secondary-action" onClick={retryQuiz}>Retry knowledge check</button>
          </div>
        ) : <button className="primary-action" type="submit">Check answers</button>}
      </form>
    </section>
  );
}

function PythonSetupGuide() {
  const [platform, setPlatform] = useState("windows");
  const [checks, setChecks] = useState({});
  const commands = {
    windows: ["py --version", "py hello.py"],
    macos: ["python3 --version", "python3 hello.py"],
    linux: ["python3 --version", "python3 hello.py"],
  };
  return (
    <section className="python-spec-section python-spec-guide">
      <div className="python-spec-section-heading"><span>GUIDE</span><div><p className="section-label">LESSON 02 · SETUP CHECKLIST</p><h3>Verify a local Python setup</h3></div></div>
      <p>These are real shell commands, not code for the Python editor. The command name depends on the operating system and installation.</p>
      <div className="python-spec-tabs" role="tablist" aria-label="Operating system commands">
        {[['windows', 'Windows'], ['macos', 'macOS'], ['linux', 'Linux']].map(([value, label]) => <button type="button" role="tab" aria-selected={platform === value} className={platform === value ? "is-active" : ""} key={value} onClick={() => setPlatform(value)}>{label}</button>)}
      </div>
      <ol className="python-spec-checklist">
        <li>Install Python from the official Python website, or use the version supplied by your operating system.</li>
        <li>Open a terminal and check whether the interpreter is available.</li>
        <li>Save the example as <code>hello.py</code>, then run it from the same folder.</li>
      </ol>
      <pre className="python-spec-code"><code>{commands[platform].join("\n")}</code></pre>
      <label className="python-spec-check-row"><input type="checkbox" checked={Boolean(checks[platform])} onChange={(event) => setChecks((current) => ({ ...current, [platform]: event.target.checked }))} /><span>I verified the interpreter and ran a saved <code>.py</code> file on {platform === "macos" ? "macOS" : platform} (or recorded what blocked me).</span></label>
    </section>
  );
}

function PythonPackageGuide() {
  const commands = [
    "python -m venv .venv",
    "# Windows PowerShell",
    ".venv\\Scripts\\Activate.ps1",
    "# macOS / Linux",
    "source .venv/bin/activate",
    "python -m pip install matplotlib",
    "python -m pip freeze > requirements.txt",
  ];
  return (
    <section className="python-spec-section python-spec-guide">
      <div className="python-spec-section-heading"><span>GUIDE</span><div><p className="section-label">LESSON 27 · TERMINAL WORKFLOW</p><h3>Manage packages locally</h3></div></div>
      <p>Run these commands in your project terminal, one at a time. They are not sent to a shell by this page, and package installation does not happen in the browser.</p>
      <pre className="python-spec-code"><code>{commands.join("\n")}</code></pre>
      <div className="python-spec-validation"><strong>Reproducibility checklist</strong><ul><li>Activate the environment before installing packages.</li><li>Record project dependencies in <code>requirements.txt</code>.</li><li>Review package source and version constraints before trusting a dependency.</li></ul></div>
    </section>
  );
}

function PythonVisualAid({ lesson }) {
  const number = lesson.number;
  let title = lesson.pageUiNeed;
  let content = null;
  if (number === 1) content = <div className="python-spec-flow"><span>Source code</span><b aria-hidden="true">→</b><span>Python interpreter</span><b aria-hidden="true">→</b><span>Program output</span></div>;
  if (number === 3) content = <div className="python-spec-indentation"><span>if condition:</span><pre>    indented block</pre><p>The block begins after the colon and is identified by consistent indentation.</p></div>;
  if (number === 4) content = <table><caption>Variable trace for the worked example</caption><thead><tr><th scope="col">Name</th><th scope="col">Value</th><th scope="col">Role</th></tr></thead><tbody><tr><td>price</td><td>120</td><td>Input value</td></tr><tr><td>quantity</td><td>2</td><td>Input value</td></tr><tr><td>subtotal</td><td>240</td><td>price × quantity</td></tr><tr><td>TOTAL_TAX_RATE</td><td>0.12</td><td>Conventional constant</td></tr></tbody></table>;
  if (number === 5) content = <div className="python-spec-type-grid">{[["int", "20"], ["float", "1.72"], ["str", '"20"'], ["bool", "True"]].map(([type, example]) => <div key={type}><strong>{type}</strong><code>{example}</code></div>)}</div>;
  if (number === 6) content = <div className="python-spec-operator-grid">{[["/", "true division"], ["//", "floor division"], ["%", "remainder"], ["**", "power"]].map(([operator, meaning]) => <div key={operator}><code>{operator}</code><span>{meaning}</span></div>)}</div>;
  if (number === 8) content = <div className="python-spec-flow"><span>score = 78</span><b aria-hidden="true">→</b><span>score ≥ 90? no</span><b aria-hidden="true">→</b><span>score ≥ 75? yes</span><b aria-hidden="true">→</b><strong>Passed</strong></div>;
  if (number === 9) content = <table><caption>Iteration trace for range(1, 6) with continue at 3</caption><thead><tr><th scope="col">number</th><th scope="col">Action</th><th scope="col">Printed?</th></tr></thead><tbody>{[1,2,3,4,5].map((item) => <tr key={item}><td>{item}</td><td>{item === 3 ? "continue" : "print"}</td><td>{item === 3 ? "No" : "Yes"}</td></tr>)}</tbody></table>;
  if (number === 10) content = <div className="python-spec-flow"><span>width = 4<br />height = 3</span><b aria-hidden="true">→</b><span>rectangle_area(4, 3)</span><b aria-hidden="true">→</b><strong>return 12</strong></div>;
  if (number === 12) content = <div className="python-spec-flow"><span>[mango, banana]</span><b aria-hidden="true">append</b><span>[mango, banana, apple]</span><b aria-hidden="true">replace index 0</b><strong>[papaya, banana, apple]</strong></div>;
  if (number === 13) content = <div className="python-spec-set-diagram" role="img" aria-label="Venn diagram: the two sets overlap at data; intersection is data; union is python, data, web"><div><span>python</span><span>data</span><span>web</span></div><p>Intersection: data · Union: python, data, web</p></div>;
  if (number === 14) content = <table><caption>Dictionary record after the example updates</caption><thead><tr><th scope="col">Key</th><th scope="col">Value</th></tr></thead><tbody><tr><td>name</td><td>Ana</td></tr><tr><td>grade</td><td>91</td></tr><tr><td>section</td><td>A</td></tr></tbody></table>;
  if (number === 15) content = <div className="python-spec-tree"><strong>students</strong><span>└─ [0] → name: Ana · grades: [90, 95]</span><span>└─ [1] → name: Ben · grades: [80, 85]</span><span>└─ student[0][&quot;grades&quot;][0] → 90</span></div>;
  if (number === 16) content = <div className="python-spec-tree"><strong>calculator/</strong><span>├─ main.py → imports helper</span><span>└─ helpers.py → reusable function</span></div>;
  if (number === 19) content = <details className="python-spec-stack"><summary>Show the factorial(4) call and return sequence</summary><ol><li>factorial(4) waits for 4 × factorial(3)</li><li>factorial(3) waits for 3 × factorial(2)</li><li>factorial(2) waits for 2 × factorial(1)</li><li>factorial(1) hits the base case and returns 1</li><li>Return values unwind: 2, then 6, then 24</li></ol></details>;
  if (number === 20) content = <table><caption>Linear search trace for target 7</caption><thead><tr><th scope="col">Index</th><th scope="col">Value</th><th scope="col">Comparison</th></tr></thead><tbody><tr><td>0</td><td>3</td><td>not equal</td></tr><tr><td>1</td><td>7</td><td>match; return 1</td></tr></tbody></table>;
  if (number === 21) content = <div className="python-spec-flow"><span>Dog class</span><b aria-hidden="true">creates</b><strong>dog instance</strong><b aria-hidden="true">calls</b><span>bark() → Woof!</span></div>;
  if (number === 22) content = <div className="python-spec-flow"><span>Student(&quot;Ana&quot;, 92)</span><b aria-hidden="true">creates instance</b><span>__init__ sets attributes</span><b aria-hidden="true">then</b><strong>name = Ana · grade = 92</strong></div>;
  if (number === 23) content = <div className="python-spec-tree"><strong>Animal.speak()</strong><span>└─ Cat.speak() overrides the inherited method</span><span>└─ Cat().speak() returns “Meow”</span></div>;
  if (number === 24) content = <div className="python-spec-flow"><span>yield 3</span><b aria-hidden="true">resume</b><span>yield 2</span><b aria-hidden="true">resume</b><strong>yield 1 → stop</strong></div>;
  if (number === 25) content = <div className="python-spec-flow"><span>[1, 2, 3, 4]</span><b aria-hidden="true">square</b><span>[1, 4, 9, 16]</span><b aria-hidden="true">filter even</b><strong>[2, 4]</strong></div>;
  if (number === 28) content = <table><caption>In-memory SQLite table after the example insert</caption><thead><tr><th scope="col">id</th><th scope="col">name</th></tr></thead><tbody><tr><td>1</td><td>Notebook</td></tr></tbody></table>;
  if (number === 29) content = <div className="python-spec-flow"><span>Mock JSON response</span><b aria-hidden="true">json.loads</b><span>Python dictionary</span><b aria-hidden="true">read keys</b><strong>Manila · 29°C</strong></div>;
  if (number === 30) content = <div className="python-spec-test-result"><span>test_add(2, 3)</span><strong>PASS</strong><span>Expected: 5 · Actual: 5</span></div>;
  if (!content) return null;
  return <section className="python-spec-section python-spec-aid"><div className="python-spec-section-heading"><span>VISUAL</span><div><p className="section-label">LESSON AID</p><h3>{title}</h3></div></div>{content}</section>;
}

function PythonReferenceChart() {
  const [kind, setKind] = useState("line");
  const points = [[72, 136], [148, 88], [224, 104], [300, 48]];
  const linePoints = points.map(([x, y]) => `${x},${y}`).join(" ");
  return (
    <div className="python-spec-chart-reference">
      <div className="python-spec-chart-controls" role="group" aria-label="Static reference chart type">
        <button type="button" className={kind === "line" ? "is-active" : ""} aria-pressed={kind === "line"} onClick={() => setKind("line")}>Line</button>
        <button type="button" className={kind === "scatter" ? "is-active" : ""} aria-pressed={kind === "scatter"} onClick={() => setKind("scatter")}>Scatter</button>
      </div>
      <svg viewBox="0 0 360 200" role="img" aria-label={`${kind === "line" ? "Static line chart" : "Static scatter plot"} of weekly tasks completed: 2, 5, 4, 7`}>
        <title>Static reference chart: Weekly progress</title><desc>Tasks completed at weeks one through four are 2, 5, 4, and 7. This diagram was not generated by running Matplotlib.</desc>
        <line x1="45" y1="155" x2="325" y2="155" /><line x1="45" y1="28" x2="45" y2="155" />
        {[72,148,224,300].map((x,index)=><text key={x} x={x} y="176" textAnchor="middle">{index+1}</text>)}
        {kind === "line" && <polyline points={linePoints} fill="none" />}
        {points.map(([x,y],index)=><g key={x}><circle cx={x} cy={y} r="5" /><text x={x+8} y={y-8}>{[2,5,4,7][index]}</text></g>)}
        <text x="180" y="194" textAnchor="middle">Week</text><text transform="translate(15 102) rotate(-90)" textAnchor="middle">Tasks completed</text>
      </svg>
      <p><strong>Static reference preview.</strong> This sample uses the lesson data and labels; it is not a live Matplotlib result.</p>
    </div>
  );
}

function PythonChartsGuide() {
  const [library, setLibrary] = useState("Pandas");
  const examples = {
    Pandas: 'sales = pd.DataFrame({"item": ["A", "B", "C"], "count": [8, 12, 5]})\nsales.plot.bar(x="item", y="count", legend=False)',
    Seaborn: 'sns.histplot(data=values, bins=5)\nplt.xlabel("Value")\nplt.ylabel("Count")',
    Plotly: 'fig = px.bar(sales, x="item", y="count")\nfig.update_layout(xaxis_title="Item", yaxis_title="Units sold")',
  };
  return (
    <div className="python-spec-chart-library">
      <div className="python-spec-tabs" role="tablist" aria-label="Chart library examples">
        {Object.keys(examples).map((name) => <button type="button" role="tab" aria-selected={library === name} className={library === name ? "is-active" : ""} key={name} onClick={() => setLibrary(name)}>{name}</button>)}
      </div>
      <pre className="python-spec-code"><code>{examples[library]}</code></pre>
      <p>{library} is shown as a reference example. This deployment does not include a Python plotting runtime or these third-party packages, so the sample cannot be run here.</p>
      {library === "Pandas" && <div className="python-spec-bars" role="img" aria-label="Static bar chart reference: item A has 8 units, B has 12, C has 5"><span style={{ height: "55%" }}><b>8</b><small>A</small></span><span style={{ height: "82%" }}><b>12</b><small>B</small></span><span style={{ height: "36%" }}><b>5</b><small>C</small></span></div>}
    </div>
  );
}

function getPythonCapstoneStorageKey(studentId) {
  const safeStudentId = String(studentId ?? "student").replace(/[^a-zA-Z0-9_-]/g, "_");
  return `python-capstone-project-v1:${safeStudentId}`;
}

function createPythonCapstoneDraft() {
  return {
    idea: "Inventory manager", problem: "", targetUser: "", inputs: "", outputs: "", dataModel: "", pseudocode: "", requirements: {}, milestones: {}, tests: [
      { scenario: "Typical", input: "", expected: "", actual: "", result: "Not run", fix: "" },
      { scenario: "Boundary", input: "", expected: "", actual: "", result: "Not run", fix: "" },
      { scenario: "Error case", input: "", expected: "", actual: "", result: "Not run", fix: "" },
    ],
  };
}

function createPythonCapstoneFiles(idea = "Inventory manager") {
  return [
    { path: "main.py", content: "\"\"\"A small command-line task manager you can extend.\"\"\"\n\nfrom task_manager import TaskManager\n\n\ndef main():\n    tasks = TaskManager()\n    print(\"Task Manager\")\n\n    while True:\n        print(\"\\n1. Add task  2. List tasks  3. Complete task  4. Remove task  0. Quit\")\n        choice = input(\"Choose an option: \").strip()\n\n        if choice == \"1\":\n            title = input(\"Task title: \").strip()\n            try:\n                task = tasks.add(title)\n                print(f\"Added task #{task['id']}: {task['title']}\")\n            except ValueError as error:\n                print(error)\n        elif choice == \"2\":\n            current_tasks = tasks.list_all()\n            for task in current_tasks:\n                mark = \"x\" if task[\"done\"] else \" \"\n                print(f\"[{mark}] {task['id']}: {task['title']}\")\n            if not current_tasks:\n                print(\"No tasks yet.\")\n        elif choice == \"3\":\n            try:\n                task_id = int(input(\"Task number: \"))\n                print(\"Task completed.\" if tasks.complete(task_id) else \"Task not found.\")\n            except ValueError:\n                print(\"Enter a whole number.\")\n        elif choice == \"4\":\n            try:\n                task_id = int(input(\"Task number: \"))\n                print(\"Task removed.\" if tasks.remove(task_id) else \"Task not found.\")\n            except ValueError:\n                print(\"Enter a whole number.\")\n        elif choice == \"0\":\n            print(\"Goodbye.\")\n            break\n        else:\n            print(\"Choose one of the listed options.\")\n\n\nif __name__ == \"__main__\":\n    main()\n" },
    { path: "task_manager.py", content: "\"\"\"Task operations with JSON-file storage.\"\"\"\n\nimport json\nfrom pathlib import Path\n\n\nclass TaskManager:\n    def __init__(self, data_file=\"tasks.json\"):\n        self.data_file = Path(data_file)\n        self.tasks = self._load()\n\n    def _load(self):\n        try:\n            return json.loads(self.data_file.read_text(encoding=\"utf-8\"))\n        except FileNotFoundError:\n            return []\n        except (json.JSONDecodeError, OSError):\n            return []\n\n    def _save(self):\n        self.data_file.write_text(json.dumps(self.tasks, indent=2), encoding=\"utf-8\")\n\n    def add(self, title):\n        title = title.strip()\n        if not title:\n            raise ValueError(\"A task title cannot be empty.\")\n        next_id = max((task[\"id\"] for task in self.tasks), default=0) + 1\n        task = {\"id\": next_id, \"title\": title, \"done\": False}\n        self.tasks.append(task)\n        self._save()\n        return task\n\n    def list_all(self):\n        return list(self.tasks)\n\n    def complete(self, task_id):\n        for task in self.tasks:\n            if task[\"id\"] == task_id:\n                task[\"done\"] = True\n                self._save()\n                return True\n        return False\n\n    def remove(self, task_id):\n        original_count = len(self.tasks)\n        self.tasks = [task for task in self.tasks if task[\"id\"] != task_id]\n        if len(self.tasks) == original_count:\n            return False\n        self._save()\n        return True\n" },
    { path: "tests/test_task_manager.py", content: "\"\"\"Repeatable tests for the task manager.\"\"\"\n\nimport tempfile\nimport unittest\nfrom pathlib import Path\n\nfrom task_manager import TaskManager\n\n\nclass TaskManagerTests(unittest.TestCase):\n    def setUp(self):\n        self.temp_dir = tempfile.TemporaryDirectory()\n        self.manager = TaskManager(Path(self.temp_dir.name) / \"tasks.json\")\n\n    def tearDown(self):\n        self.temp_dir.cleanup()\n\n    def test_add_and_reload_task(self):\n        self.manager.add(\"Write the project\")\n        reloaded = TaskManager(self.manager.data_file)\n        self.assertEqual(reloaded.list_all()[0][\"title\"], \"Write the project\")\n\n    def test_empty_title_is_rejected(self):\n        with self.assertRaises(ValueError):\n            self.manager.add(\"   \")\n\n    def test_complete_and_remove(self):\n        task = self.manager.add(\"Check the result\")\n        self.assertTrue(self.manager.complete(task[\"id\"]))\n        self.assertTrue(self.manager.list_all()[0][\"done\"])\n        self.assertTrue(self.manager.remove(task[\"id\"]))\n        self.assertEqual(self.manager.list_all(), [])\n\n\nif __name__ == \"__main__\":\n    unittest.main(verbosity=2, exit=False)\n" },
    { path: "README.md", content: "# " + idea + "\n\nA small command-line application with separate program logic, JSON data storage, and automated tests.\n\n## Run it\n\n    python main.py\n\nTasks save to tasks.json beside the program. Choose option 0 to exit.\n\n## Run tests\n\n    python -m unittest discover -s tests -v\n\n## Project files\n\n- main.py runs the interactive menu.\n- task_manager.py contains the application logic and file persistence.\n- tests/test_task_manager.py checks adding, saving, completing, and removing tasks.\n" },
  ];
}

function normalizePythonProjectPath(value) {
  const path = String(value || "").trim().replace(/\\/g, "/");
  if (!path || path.startsWith("/") || path.length > 120) return "";
  const segments = path.split("/");
  if (segments.some((segment) => !segment || segment === "." || segment === ".." || !/^[a-zA-Z0-9_. -]+$/.test(segment))) return "";
  return path;
}

function readPythonCapstoneState(storageKey) {
  try {
    const saved = window.localStorage.getItem(storageKey);
    if (!saved) return null;
    const state = JSON.parse(saved);
    if (!state || typeof state !== "object") return null;
    return state;
  } catch {
    return null;
  }
}

function pythonProjectCrc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function createPythonProjectZip(files) {
  const encoder = new TextEncoder();
  const localParts = [];
  const centralParts = [];
  let localOffset = 0;
  let centralSize = 0;

  files.forEach((file) => {
    const name = encoder.encode(normalizePythonProjectPath(file.path));
    const content = encoder.encode(file.content);
    const checksum = pythonProjectCrc32(content);
    const localHeader = new Uint8Array(30 + name.length);
    const localView = new DataView(localHeader.buffer);
    localView.setUint32(0, 0x04034b50, true);
    localView.setUint16(4, 20, true);
    localView.setUint16(6, 0x0800, true);
    localView.setUint16(8, 0, true);
    localView.setUint16(10, 0, true);
    localView.setUint16(12, 0x0021, true);
    localView.setUint32(14, checksum, true);
    localView.setUint32(18, content.length, true);
    localView.setUint32(22, content.length, true);
    localView.setUint16(26, name.length, true);
    localView.setUint16(28, 0, true);
    localHeader.set(name, 30);
    localParts.push(localHeader, content);

    const centralHeader = new Uint8Array(46 + name.length);
    const centralView = new DataView(centralHeader.buffer);
    centralView.setUint32(0, 0x02014b50, true);
    centralView.setUint16(4, 20, true);
    centralView.setUint16(6, 20, true);
    centralView.setUint16(8, 0x0800, true);
    centralView.setUint16(10, 0, true);
    centralView.setUint16(12, 0, true);
    centralView.setUint16(14, 0x0021, true);
    centralView.setUint32(16, checksum, true);
    centralView.setUint32(20, content.length, true);
    centralView.setUint32(24, content.length, true);
    centralView.setUint16(28, name.length, true);
    centralView.setUint16(30, 0, true);
    centralView.setUint16(32, 0, true);
    centralView.setUint16(34, 0, true);
    centralView.setUint16(36, 0, true);
    centralView.setUint32(38, 0, true);
    centralView.setUint32(42, localOffset, true);
    centralHeader.set(name, 46);
    centralParts.push(centralHeader);
    localOffset += localHeader.length + content.length;
    centralSize += centralHeader.length;
  });

  const endRecord = new Uint8Array(22);
  const endView = new DataView(endRecord.buffer);
  endView.setUint32(0, 0x06054b50, true);
  endView.setUint16(4, 0, true);
  endView.setUint16(6, 0, true);
  endView.setUint16(8, files.length, true);
  endView.setUint16(10, files.length, true);
  endView.setUint32(12, centralSize, true);
  endView.setUint32(16, localOffset, true);
  endView.setUint16(20, 0, true);

  return new Blob([...localParts, ...centralParts, endRecord], { type: "application/zip" });
}

function PythonCapstone({ onBack, studentId }) {
  const runner = usePythonWorker();
  const projectFileInputRef = useRef(null);
  const projectFolderInputRef = useRef(null);
  const storageKey = getPythonCapstoneStorageKey(studentId);
  const [savedState] = useState(() => readPythonCapstoneState(storageKey));
  const [draft, setDraft] = useState(() => savedState?.draft || readSessionJson(PYTHON_CAPSTONE_STORAGE_KEY, createPythonCapstoneDraft()));
  const [files, setFiles] = useState(() => {
    const savedFiles = Array.isArray(savedState?.files)
      ? savedState.files.filter((file) => normalizePythonProjectPath(file?.path) && typeof file?.content === "string")
      : [];
    return savedFiles.length ? savedFiles : createPythonCapstoneFiles(savedState?.draft?.idea || draft.idea);
  });
  const [activeFilePath, setActiveFilePath] = useState(() => {
    const savedPath = normalizePythonProjectPath(savedState?.activeFilePath);
    const savedFiles = Array.isArray(savedState?.files)
      ? savedState.files.filter((file) => normalizePythonProjectPath(file?.path) && typeof file?.content === "string")
      : [];
    return savedFiles.some((file) => file.path === savedPath) ? savedPath : savedFiles[0]?.path || "main.py";
  });
  const [entrypointPath, setEntrypointPath] = useState(() => {
    const savedPath = normalizePythonProjectPath(savedState?.entrypointPath);
    const savedFiles = Array.isArray(savedState?.files) ? savedState.files : [];
    return savedFiles.some((file) => file?.path === savedPath && savedPath.toLowerCase().endsWith(".py")) ? savedPath : "main.py";
  });
  const [workspaceMessage, setWorkspaceMessage] = useState("");
  const [saveMessage, setSaveMessage] = useState("Your project saves in this browser for your signed-in account.");
  const [stdin, setStdin] = useState(() => savedState?.stdin ?? "2\n0\n");
  const activeFile = files.find((file) => file.path === activeFilePath) || files[0];
  const pythonFiles = files.filter((file) => file.path.toLowerCase().endsWith(".py"));
  const testFiles = pythonFiles.filter((file) => /(^|\/)(test_[^/]+|[^/]+_test)\.py$/i.test(file.path));

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify({ draft, files, activeFilePath, entrypointPath, stdin }));
    } catch {
      // The download action remains available when browser storage is full or disabled.
    }
  }, [activeFilePath, draft, entrypointPath, files, stdin, storageKey]);

  function persistNow(nextDraft = draft, nextFiles = files, nextActiveFilePath = activeFilePath, nextEntrypointPath = entrypointPath, nextStdin = stdin) {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify({ draft: nextDraft, files: nextFiles, activeFilePath: nextActiveFilePath, entrypointPath: nextEntrypointPath, stdin: nextStdin }));
      setSaveMessage("Saved in this browser for your signed-in account.");
    } catch {
      setSaveMessage("Browser storage is unavailable. Download the project ZIP to keep your work.");
    }
  }

  function update(field, value) {
    const nextDraft = { ...draft, [field]: value };
    setDraft(nextDraft);
    persistNow(nextDraft);
  }

  function updateTest(index, field, value) {
    const nextDraft = { ...draft, tests: draft.tests.map((test, row) => row === index ? { ...test, [field]: value } : test) };
    setDraft(nextDraft);
    persistNow(nextDraft);
  }

  function updateActiveFile(content) {
    if (!activeFile) return;
    const nextFiles = files.map((file) => file.path === activeFile.path ? { ...file, content } : file);
    setFiles(nextFiles);
    persistNow(draft, nextFiles, activeFilePath, entrypointPath);
  }

  function addProjectFile() {
    const requestedPath = window.prompt("New project file path (for example: helpers.py or tests/test_main.py):", "helpers.py");
    if (requestedPath === null) return;
    const path = normalizePythonProjectPath(requestedPath);
    if (!path) {
      setWorkspaceMessage("Use a relative file path with letters, numbers, spaces, dots, underscores, or hyphens. Parent-directory paths are not allowed.");
      return;
    }
    if (files.some((file) => file.path === path)) {
      setWorkspaceMessage("A file with that path already exists.");
      return;
    }
    if (files.length >= 25) {
      setWorkspaceMessage("A project can contain up to 25 files in the browser runner.");
      return;
    }
    const file = { path, content: path.endsWith(".py") ? '"""Add your project code here."""\n\n' : "" };
    const nextFiles = [...files, file];
    setFiles(nextFiles);
    setActiveFilePath(path);
    setWorkspaceMessage(`${path} added to your project.`);
    persistNow(draft, nextFiles, path, entrypointPath);
  }

  function removeActiveFile() {
    if (!activeFile || files.length <= 1) {
      setWorkspaceMessage("A project must keep at least one file.");
      return;
    }
    if (!window.confirm(`Remove ${activeFile.path} from this project?`)) return;
    const nextFiles = files.filter((file) => file.path !== activeFile.path);
    const nextActivePath = nextFiles[0].path;
    const nextPythonFile = nextFiles.find((file) => file.path.toLowerCase().endsWith(".py"));
    const nextEntrypointPath = entrypointPath === activeFile.path ? nextPythonFile?.path || "" : entrypointPath;
    setFiles(nextFiles);
    setActiveFilePath(nextActivePath);
    setEntrypointPath(nextEntrypointPath);
    setWorkspaceMessage(`${activeFile.path} removed.`);
    persistNow(draft, nextFiles, nextActivePath, nextEntrypointPath);
  }

  async function importProjectFiles(event) {
    const selectedFiles = Array.from(event.currentTarget.files || []);
    event.currentTarget.value = "";
    if (!selectedFiles.length) return;
    const supportedTextFile = /\.(py|pyw|md|txt|json|csv|tsv|toml|ini|cfg|yaml|yml|html|css|js|sql|xml|sh)$/i;
    const importedFiles = [];
    const skipped = [];
    for (const file of selectedFiles) {
      const path = normalizePythonProjectPath(file.webkitRelativePath || file.name);
      if (!path || !supportedTextFile.test(path) || file.size > 256_000) {
        skipped.push(file.name);
        continue;
      }
      importedFiles.push({ path, content: await file.text() });
    }
    if (!importedFiles.length) {
      setWorkspaceMessage("No supported text files were imported. Select Python, text, JSON, CSV, HTML, CSS, or project configuration files under 256 KB each.");
      return;
    }
    const duplicatePaths = importedFiles.filter((file) => files.some((current) => current.path === file.path));
    if (duplicatePaths.length && !window.confirm(`Replace ${duplicatePaths.length} existing project file(s) with the selected copies?`)) {
      setWorkspaceMessage("Import cancelled; your project files were kept.");
      return;
    }
    const nextByPath = new Map(files.map((file) => [file.path, file]));
    importedFiles.forEach((file) => nextByPath.set(file.path, file));
    const nextFiles = Array.from(nextByPath.values());
    const totalSize = nextFiles.reduce((total, file) => total + file.content.length, 0);
    if (nextFiles.length > 25 || totalSize > 256_000) {
      setWorkspaceMessage("The browser runner supports up to 25 files and 256 KB of source text. Import a smaller project folder.");
      return;
    }
    const nextActivePath = importedFiles[0].path;
    const nextPythonFile = importedFiles.find((file) => file.path.toLowerCase().endsWith(".py"));
    const nextEntrypointPath = nextFiles.some((file) => file.path === entrypointPath) ? entrypointPath : nextPythonFile?.path || "";
    setFiles(nextFiles);
    setActiveFilePath(nextActivePath);
    setEntrypointPath(nextEntrypointPath);
    const skippedNote = skipped.length ? ` ${skipped.length} unsupported or oversized file(s) were skipped.` : "";
    setWorkspaceMessage(`${importedFiles.length} file(s) added to the project.${skippedNote}`);
    persistNow(draft, nextFiles, nextActivePath, nextEntrypointPath);
  }

  function loadWorkingStarter() {
    if (!window.confirm("Replace the current project files with the working task-manager starter? Download a ZIP first if you want to keep a copy.")) return;
    const nextFiles = createPythonCapstoneFiles(draft.idea);
    setFiles(nextFiles);
    setActiveFilePath("main.py");
    setEntrypointPath("main.py");
    setWorkspaceMessage("Working task-manager starter loaded. Run it, then try the tests file.");
    persistNow(draft, nextFiles, "main.py", "main.py");
  }

  function downloadProjectFile() {
    if (!activeFile) return;
    const blob = new Blob([activeFile.content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = activeFile.path.split("/").at(-1);
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function downloadProjectZip() {
    const blob = createPythonProjectZip(files);
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "python-capstone-project.zip";
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setWorkspaceMessage("Project ZIP downloaded. Extract it to run and test the files on your computer.");
  }

  function runProject() {
    if (!pythonFiles.some((file) => file.path === entrypointPath)) {
      setWorkspaceMessage("Choose a Python entry file before running the project.");
      return;
    }
    runner.run(files, entrypointPath, stdin);
  }

  function runProjectTests() {
    if (!testFiles.length) {
      setWorkspaceMessage("Add a Python test file such as tests/test_app.py, then run it here.");
      return;
    }
    runner.run(files, "", "", "tests", testFiles.map((file) => file.path));
    setWorkspaceMessage(`Running ${testFiles.length} unittest file(s).`);
  }

  const requirementItems = ["State the problem and intended user", "Define inputs and expected outputs", "Use meaningful functions and a suitable data structure", "Handle at least one expected error case", "Record repeatable test evidence", "Use at least one Intermediate concept", "Use one Advanced concept supported by the chosen local environment"];
  const milestones = ["Plan the data and program steps", "Build the main workflow", "Add error handling and persistence or another Intermediate feature", "Run tests and record results", "Write run instructions and prepare a walkthrough"];
  return (
    <div className="python-spec-special-page python-spec-capstone">
      <button className="back-button" type="button" onClick={onBack}>← Back to Python course</button>
      <PageHero eyebrow="PYTHON COURSE · CAPSTONE" title="Final project" description="Plan and build a small Python application in this workspace. Create files here, save your draft, and download the project when you are ready." />
      <div className="python-spec-runtime-note"><strong>Build and run your project here</strong><span>Your Python code runs in an isolated browser Web Worker and is never sent to Flask. Your plan and files autosave in this browser under your signed-in account. Project submission and teacher review are not available.</span></div>
      <section className="python-spec-section"><div className="python-spec-section-heading"><span>01</span><div><p className="section-label">CHOOSE A FEASIBLE IDEA</p><h3>What will you build?</h3></div></div>
        <label className="python-spec-field">Example idea<select value={draft.idea} onChange={(event) => update("idea", event.target.value)}>{["Inventory manager", "Grade tracker", "Personal task organizer", "Data-analysis report", "My own idea"].map((idea) => <option key={idea}>{idea}</option>)}</select></label>
        <p>Choose a small workflow with clear input and output. Use a Basic concept, at least one Intermediate concept (such as files, modules, OOP, or exceptions), and an Advanced feature that your local setup supports (such as in-memory SQLite, mock JSON, tests, or a labeled chart).</p>
      </section>
      <section className="python-spec-section"><div className="python-spec-section-heading"><span>02</span><div><p className="section-label">REQUIREMENTS</p><h3>Project checklist</h3></div></div>
        <div className="python-spec-checklist-grid">{requirementItems.map((item) => <label key={item}><input type="checkbox" checked={Boolean(draft.requirements[item])} onChange={(event) => update("requirements", { ...draft.requirements, [item]: event.target.checked })} /><span>{item}</span></label>)}</div>
      </section>
      <section className="python-spec-section"><div className="python-spec-section-heading"><span>03</span><div><p className="section-label">PLAN</p><h3>Planning worksheet</h3></div></div>
        {[['problem','Problem to solve'],['targetUser','Target user'],['inputs','Inputs'],['outputs','Outputs'],['dataModel','Data model'],['pseudocode','Pseudocode / step plan']].map(([field,label]) => <label className="python-spec-field" key={field}>{label}<textarea rows={field === 'pseudocode' ? 5 : 2} value={draft[field]} onChange={(event) => update(field,event.target.value)} /></label>)}
        <h4>Milestones</h4><div className="python-spec-checklist-grid">{milestones.map((item) => <label key={item}><input type="checkbox" checked={Boolean(draft.milestones[item])} onChange={(event) => update("milestones", { ...draft.milestones, [item]: event.target.checked })} /><span>{item}</span></label>)}</div>
      </section>
      <section className="python-spec-section python-capstone-builder" aria-labelledby="python-capstone-builder-title">
        <div className="python-spec-section-heading"><span>04</span><div><p className="section-label">BUILD IN THIS APP</p><h3 id="python-capstone-builder-title">Project workspace</h3></div></div>
        <p className="python-capstone-builder__intro">Create multiple source files, switch between them, and keep building without leaving the course. The app saves your files locally for this signed-in account.</p>
        <div className="python-capstone-builder__toolbar">
          <span className="python-capstone-builder__save" role="status">{saveMessage}</span>
          <div>
            <label className="python-capstone-builder__entrypoint">Run file
              <select value={entrypointPath} onChange={(event) => { setEntrypointPath(event.target.value); persistNow(draft, files, activeFilePath, event.target.value); }}>
                {!pythonFiles.some((file) => file.path === entrypointPath) && <option value="">Choose a Python file</option>}
                {pythonFiles.map((file) => <option key={file.path} value={file.path}>{file.path}</option>)}
              </select>
            </label>
            <button type="button" className="secondary-action" onClick={addProjectFile}>+ Add file</button>
            <button type="button" className="secondary-action" onClick={() => projectFileInputRef.current?.click()}>Import files</button>
            <button type="button" className="secondary-action" onClick={() => projectFolderInputRef.current?.click()}>Import folder</button>
            <button type="button" className="secondary-action" onClick={loadWorkingStarter}>Load working starter</button>
            <button type="button" className="primary-action" onClick={runProject} disabled={runner.busy || !pythonFiles.length}>{runner.execution.status === "loading" ? "Loading Python…" : runner.execution.status === "preparing" ? "Preparing…" : "Run project"}</button>
            <button type="button" className="secondary-action" onClick={runProjectTests} disabled={runner.busy || !testFiles.length}>Run tests ({testFiles.length})</button>
            {runner.busy && <button type="button" className="secondary-action" onClick={runner.cancel}>Cancel</button>}
            <button type="button" className="primary-action" onClick={downloadProjectZip}>Download project ZIP</button>
          </div>
          <input ref={projectFileInputRef} type="file" multiple accept=".py,.pyw,.md,.txt,.json,.csv,.tsv,.toml,.ini,.cfg,.yaml,.yml,.html,.css,.js,.sql,.xml,.sh" onChange={importProjectFiles} hidden aria-label="Import project files" />
          <input ref={projectFolderInputRef} type="file" multiple webkitdirectory="" directory="" accept=".py,.pyw,.md,.txt,.json,.csv,.tsv,.toml,.ini,.cfg,.yaml,.yml,.html,.css,.js,.sql,.xml,.sh" onChange={importProjectFiles} hidden aria-label="Import a project folder" />
        </div>
        <div className="python-capstone-builder__grid">
          <aside className="python-capstone-builder__files" aria-label="Project files">
            <strong>Files</strong>
            {files.map((file) => <button type="button" key={file.path} className={file.path === activeFile?.path ? "is-active" : ""} aria-current={file.path === activeFile?.path ? "page" : undefined} onClick={() => setActiveFilePath(file.path)}>{file.path}</button>)}
          </aside>
          <div className="python-capstone-builder__editor">
            <div className="python-capstone-builder__filebar"><strong>{activeFile?.path}</strong><div>
              <button type="button" className="secondary-action" onClick={downloadProjectFile}>Download this file</button>
              <button type="button" className="text-button danger" onClick={removeActiveFile} disabled={files.length <= 1}>Remove file</button>
            </div></div>
            <textarea aria-label={`Edit project file ${activeFile?.path || ""}`} spellCheck="false" autoCapitalize="off" autoCorrect="off" value={activeFile?.content || ""} onChange={(event) => updateActiveFile(event.target.value)} />
          </div>
        </div>
        <label className="python-spec-stdin">Program input <span>Optional · enter one value per line for each input() call.</span><textarea rows="2" value={stdin} maxLength={8000} onChange={(event) => setStdin(event.target.value)} placeholder="Enter sample input, one value per line" /></label>
        <PythonExecutionPanel runner={runner} label="Final project run output" />
        {workspaceMessage && <p className="python-capstone-builder__message" role="status">{workspaceMessage}</p>}
        <p className="python-capstone-builder__note">Your code saves in this browser. The runner supports standard-library code and packages available in Pyodide, with a 15-second limit; code is not sent to Flask. Runtime data files last while this workspace is open. Download the ZIP and run it locally to keep data between app sessions.</p>
      </section>
      <section className="python-spec-section"><div className="python-spec-section-heading"><span>05</span><div><p className="section-label">TEST PLAN</p><h3>Record test evidence</h3></div></div>
        <div className="python-spec-table-wrap"><table className="python-spec-test-table"><thead><tr><th>Scenario</th><th>Input</th><th>Expected output</th><th>Actual result</th><th>Status</th><th>Fix note</th></tr></thead><tbody>{draft.tests.map((test,index)=><tr key={`${index}-${test.scenario}`}><th scope="row"><input aria-label={`Test ${index+1} scenario`} value={test.scenario} onChange={(event)=>updateTest(index,'scenario',event.target.value)} /></th><td><input aria-label={`Test ${index+1} input`} value={test.input} onChange={(event)=>updateTest(index,'input',event.target.value)} /></td><td><input aria-label={`Test ${index+1} expected output`} value={test.expected} onChange={(event)=>updateTest(index,'expected',event.target.value)} /></td><td><input aria-label={`Test ${index+1} actual result`} value={test.actual} onChange={(event)=>updateTest(index,'actual',event.target.value)} /></td><td><select aria-label={`Test ${index+1} status`} value={test.result} onChange={(event)=>updateTest(index,'result',event.target.value)}>{['Not run','Pass','Fail'].map((value)=><option key={value}>{value}</option>)}</select></td><td><input aria-label={`Test ${index+1} fix note`} value={test.fix} onChange={(event)=>updateTest(index,'fix',event.target.value)} /></td></tr>)}</tbody></table></div>
      </section>
      <section className="python-spec-section"><div className="python-spec-section-heading"><span>06</span><div><p className="section-label">PRESENT</p><h3>Walkthrough prompts</h3></div></div><ul><li>What problem did you choose, and who benefits?</li><li>How did you organize the data and functions?</li><li>Which edge case did you test and what changed after a failure?</li><li>What limitations remain, and what would you improve next?</li></ul>
        <h4>Manual self-review rubric · 100 points</h4><div className="python-spec-rubric">{[[30,'Functional correctness','Core workflow handles realistic and edge-case inputs.'],[25,'Python concept use','Basic, Intermediate, and supported Advanced concepts are used and explained.'],[15,'Code quality','Names, functions, structure, and comments are readable.'],[15,'Testing and error handling','Tests cover meaningful boundaries and expected failures.'],[15,'Documentation and demo','README, run instructions, and walkthrough are clear.']].map(([points,label,description])=><div key={label}><strong>{points} points</strong><span><b>{label}</b>{description}</span></div>)}</div>
        <div className="python-spec-submit-state" role="status"><strong>Self-review only · not submitted</strong><span>The rubric helps students review their own work. This application does not upload projects or grades for teacher review.</span></div>
      </section>
    </div>
  );
}

function PythonFrameworks({ onBack }) {
  return (
    <div className="python-spec-special-page python-spec-frameworks">
      <button className="back-button" type="button" onClick={onBack}>← Back to Python course</button>
      <PageHero eyebrow="OPTIONAL EXTENSION · NOT LESSON 33" title="Python Frameworks" description="A short supporting guide to Flask and Django. It does not change the 32-lesson course count." />
      <section className="python-spec-section"><div className="python-spec-section-heading"><span>01</span><div><p className="section-label">REQUEST FLOW</p><h3>What a web framework provides</h3></div></div>
        <p>Frameworks provide conventions and reusable tools for routing, request handling, responses, templates, and project structure. A browser request reaches a route; the route returns a response.</p>
        <div className="python-spec-flow"><span>HTTP request</span><b aria-hidden="true">→</b><span>Flask / Django route</span><b aria-hidden="true">→</b><strong>HTTP response</strong></div>
      </section>
      <section className="python-spec-section"><div className="python-spec-section-heading"><span>02</span><div><p className="section-label">COMPARE</p><h3>Flask, Django, and Pandas</h3></div></div>
        <div className="python-spec-compare"><article><h4>Flask</h4><p>A lightweight web framework often used for small services and explicit routes.</p></article><article><h4>Django</h4><p>A fuller web framework with a broader set of built-in project features.</p></article><article><h4>Pandas</h4><p>A data analysis library with plotting integrations. It is not a web framework.</p></article></div>
      </section>
      <section className="python-spec-section"><div className="python-spec-section-heading"><span>03</span><div><p className="section-label">PROJECT SHAPE</p><h3>Example project tree</h3></div></div>
        <pre className="python-spec-code"><code>sample_app/\n├── app.py\n├── templates/\n│   └── home.html\n└── static/\n    └── styles.css</code></pre>
      </section>
      <section className="python-spec-section"><div className="python-spec-section-heading"><span>04</span><div><p className="section-label">LOCAL EXAMPLE</p><h3>One route and an exercise</h3></div></div>
        <pre className="python-spec-code"><code>{'from flask import Flask\n\napp = Flask(__name__)\n\n@app.get("/")\ndef home():\n    return "Hello from Flask"'}</code></pre>
        <p>This is an instructional snippet, not a server running inside this application. Install Flask locally, use the approved local development command, and add an <code>/about</code> route as the exercise.</p>
        <aside className="python-spec-accuracy"><strong>Security</strong><p>Do not expose a debug server publicly or commit secrets. This course does not start learner web servers.</p></aside>
      </section>
    </div>
  );
}


/* ==========================================================
   MANAGE TOPICS + SUBTOPICS
========================================================== */

function ManageTopics({
  apiFetch,
}) {
  const [topics, setTopics] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [reordering, setReordering] =
    useState(false);

  const reorderingRef = useRef(false);

  const [error, setError] =
    useState("");

  const [showTopicForm, setShowTopicForm] =
    useState(false);

  const [showSlideEditor, setShowSlideEditor] =
    useState(false);

  const [slideEditorTopic, setSlideEditorTopic] =
    useState(null);

  const [editingTopic, setEditingTopic] =
    useState(null);

  const [selectedTopic, setSelectedTopic] =
    useState(null);

  const [subtopics, setSubtopics] =
    useState([]);

  const [subtopicsLoading, setSubtopicsLoading] =
    useState(false);

  const [showSubtopicForm, setShowSubtopicForm] =
    useState(false);

  const [editingSubtopic, setEditingSubtopic] =
    useState(null);


  const [topicForm, setTopicForm] =
    useState({
      title: "",
      description: "",
      order_number: 1,
      file: null,
      image: null,
    });


  const [subtopicForm, setSubtopicForm] =
    useState({
      title: "",
      content: "",
      order_number: 1,
      image: null,
    });


  /* ========================================================
     LOAD TOPICS
  ======================================================== */

  useEffect(() => {
    loadTopics();
  }, []);


  async function loadTopics() {
    try {
      setLoading(true);
      setError("");

      const response =
        await apiFetch(
          `${API_URL}/api/topics`
        );

      if (!response) {
        return false;
      }

      if (!response.ok) {
        throw new Error(
          await getResponseError(
            response,
            "Failed to load topics."
          )
        );
      }

      const data =
        await readJson(response);

      setTopics(
        getArrayData(
          data,
          ["topics"]
        )
      );
      return true;

    } catch (error) {
      console.error(
        "Load topics error:",
        error
      );

      setError(
        error.message ||
        "Unable to load topics."
      );
      return false;

    } finally {
      setLoading(false);
    }
  }


  async function submitReorder(url, expected, orderedIds, reload, conflictMessage) {
    if (reorderingRef.current) {
      return;
    }

    reorderingRef.current = true;
    try {
      setReordering(true);
      setError("");
      const response = await apiFetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expected, ordered_ids: orderedIds }),
      });

      if (!response) {
        return;
      }

      const data = await readJson(response);
      if (response.status === 409) {
        const refreshed = await reload();
        setError(
          refreshed
            ? conflictMessage
            : `${conflictMessage} Refresh failed; reload the list to see the current order.`,
        );
        return;
      }
      if (!response.ok) {
        throw new Error(data?.message || "Unable to update order.");
      }

      const refreshed = await reload();
      if (!refreshed) {
        setError(
          "Order was saved, but the list could not be refreshed. Reload to confirm the current order.",
        );
      }
    } catch (error) {
      console.error("Reorder error:", error);
      setError(error.message || "Unable to update order.");
    } finally {
      reorderingRef.current = false;
      setReordering(false);
    }
  }


  function moveTopic(index, offset) {
    const targetIndex = index + offset;
    if (targetIndex < 0 || targetIndex >= topics.length) {
      return;
    }

    const orderedIds = topics.map((topic) => Number(topic.id));
    [orderedIds[index], orderedIds[targetIndex]] = [
      orderedIds[targetIndex],
      orderedIds[index],
    ];
    const expected = topics.map((topic) => ({
      id: Number(topic.id),
      order_number: Number(topic.order_number),
    }));

    return submitReorder(
      `${API_URL}/api/topics/order`,
      expected,
      orderedIds,
      loadTopics,
      "Topics changed while you were reordering. The list was refreshed; try again.",
    );
  }


  function moveSubtopic(index, offset) {
    const targetIndex = index + offset;
    if (!selectedTopic || targetIndex < 0 || targetIndex >= subtopics.length) {
      return;
    }

    const orderedIds = subtopics.map((subtopic) => Number(subtopic.id));
    [orderedIds[index], orderedIds[targetIndex]] = [
      orderedIds[targetIndex],
      orderedIds[index],
    ];
    const expected = subtopics.map((subtopic) => ({
      id: Number(subtopic.id),
      order_number: Number(subtopic.order_number),
    }));
    const reload = async () => {
      const topicsRefreshed = await loadTopics();
      const subtopicsRefreshed = await openSubtopics(selectedTopic);
      return topicsRefreshed && subtopicsRefreshed;
    };

    return submitReorder(
      `${API_URL}/api/topics/${selectedTopic.id}/subtopics/order`,
      expected,
      orderedIds,
      reload,
      "Lessons changed while you were reordering. The list was refreshed; try again.",
    );
  }


  /* ========================================================
     TOPIC FORM
  ======================================================== */

  function openAddTopic() {
    setEditingTopic(null);

    setTopicForm({
      title: "",
      description: "",
      order_number:
        topics.length + 1,
      file: null,
      image: null,
    });

    setShowTopicForm(true);
    setError("");
  }


  function openEditTopic(topic) {
    setEditingTopic(topic);
    setTopicForm({
      title: topic.title || "",
      description: topic.description || "",
      order_number: topic.order_number ?? 1,
      file: null,
      image: null,
    });
    setShowTopicForm(true);
    setError("");
  }

  function closeSlideEditor() {
    setShowSlideEditor(false);
    setSlideEditorTopic(null);
  }


  function closeTopicForm() {
    setShowTopicForm(false);
    setEditingTopic(null);

    setTopicForm({
      title: "",
      description: "",
      order_number: 1,
      file: null,
      image: null,
    });
  }


  function handleTopicChange(event) {
    setTopicForm({
      ...topicForm,
      [event.target.name]:
        event.target.value,
    });
  }


  function handleTopicFileChange(event) {
    const file = event.target.files?.[0] || null;

    if (
      file &&
      !file.name.toLowerCase().endsWith(".pdf") &&
      !file.name.toLowerCase().endsWith(".pptx")
    ) {
      setError("Only PDF and PPTX files are allowed.");
      event.target.value = "";
      return;
    }

    if (file && file.size > 15 * 1024 * 1024) {
      setError("Topic files must be smaller than 15 MB.");
      event.target.value = "";
      return;
    }

    setTopicForm({
      ...topicForm,
      file,
    });
    setError("");
  }

  function handleTopicImageChange(event) {
    const image = event.target.files?.[0] || null;
    if (image && !image.type.startsWith("image/")) {
      setError("Topic image must be a valid image file.");
      event.target.value = "";
      return;
    }
    if (image && image.size > 5 * 1024 * 1024) {
      setError("Topic images must be smaller than 5 MB.");
      event.target.value = "";
      return;
    }
    setTopicForm({ ...topicForm, image });
    setError("");
  }


  /* ========================================================
     CREATE / UPDATE TOPIC
  ======================================================== */

  async function saveTopic(event) {
    event.preventDefault();

    if (saving) {
      return;
    }

    if (!topicForm.title.trim()) {
      setError(
        "Topic title is required."
      );

      return;
    }

    const orderNumber = Number(topicForm.order_number);
    if (!Number.isSafeInteger(orderNumber) || orderNumber < 1 || orderNumber > MAX_ORDER_NUMBER) {
      setError(`Topic order must be a whole number between 1 and ${MAX_ORDER_NUMBER}.`);
      return;
    }

    try {
      setSaving(true);
      setError("");

      const url =
        editingTopic
          ? `${API_URL}/api/topics/${editingTopic.id}`
          : `${API_URL}/api/topics`;

      const method =
        editingTopic
          ? "PUT"
          : "POST";


      const formData = new FormData();
      formData.append("title", topicForm.title.trim());
      formData.append(
        "description",
        topicForm.description.trim()
      );
      formData.append(
        "order_number",
        String(orderNumber)
      );

      if (topicForm.file) {
        formData.append("file", topicForm.file);
      }
      if (topicForm.image) {
        formData.append("image", topicForm.image);
      }

      const response =
        await apiFetch(
          url,
          {
            method,

            body: formData,
          }
        );


      if (!response) {
        return;
      }


      const data =
        await readJson(response);


      if (!response.ok) {
        throw new Error(
          data?.message ||
          "Unable to save topic."
        );
      }


      closeTopicForm();

      await loadTopics();

    } catch (error) {
      console.error(
        "Save topic error:",
        error
      );

      setError(
        error.message ||
        "Unable to save topic."
      );

    } finally {
      setSaving(false);
    }
  }


  /* ========================================================
     DELETE TOPIC
  ======================================================== */

  async function deleteTopic(topic) {
    const confirmed =
      window.confirm(
        `Delete "${topic.title}"?\n\nThis will also delete all subtopics under this topic.`
      );

    if (!confirmed) {
      return;
    }


    try {
      setError("");

      const response =
        await apiFetch(
          `${API_URL}/api/topics/${topic.id}`,
          {
            method: "DELETE",
          }
        );


      if (!response) {
        return;
      }


      const data =
        await readJson(response);


      if (!response.ok) {
        throw new Error(
          data?.message ||
          "Unable to delete topic."
        );
      }


      if (
        selectedTopic?.id ===
        topic.id
      ) {
        closeSubtopics();
      }


      await loadTopics();

    } catch (error) {
      console.error(
        "Delete topic error:",
        error
      );

      setError(
        error.message ||
        "Unable to delete topic."
      );
    }
  }


  /* ========================================================
     LOAD SUBTOPICS
  ======================================================== */

  async function openSubtopics(topic) {
    try {
      setSelectedTopic(topic);
      setSubtopicsLoading(true);
      setError("");

      const response =
        await apiFetch(
          `${API_URL}/api/topics/${topic.id}/subtopics`
        );


      if (!response) {
        return false;
      }


      if (!response.ok) {
        throw new Error(
          await getResponseError(
            response,
            "Failed to load subtopics."
          )
        );
      }


      const data =
        await readJson(response);


      setSubtopics(
        getArrayData(
          data,
          ["subtopics"]
        )
      );
      return true;

    } catch (error) {
      console.error(
        "Load subtopics error:",
        error
      );

      setError(
        error.message ||
        "Unable to load subtopics."
      );
      return false;

    } finally {
      setSubtopicsLoading(false);
    }
  }


  function closeSubtopics() {
    setSelectedTopic(null);
    setSubtopics([]);
    setShowSubtopicForm(false);
    setEditingSubtopic(null);
  }


  /* ========================================================
     SUBTOPIC FORM
  ======================================================== */

  function openAddSubtopic() {
    setEditingSubtopic(null);

    setSubtopicForm({
      title: "",
      content: "",
      order_number:
        subtopics.length + 1,
      image: null,
    });

    setShowSubtopicForm(true);
    setError("");
  }


  function openEditSubtopic(subtopic) {
    setEditingSubtopic(subtopic);

    setSubtopicForm({
      title:
        subtopic.title || "",

      content:
        subtopic.content || "",

      order_number:
        subtopic.order_number ??
        1,
      image: null,
    });

    setShowSubtopicForm(true);
    setError("");
  }


  function closeSubtopicForm() {
    setShowSubtopicForm(false);
    setEditingSubtopic(null);

    setSubtopicForm({
      title: "",
      content: "",
      order_number: 1,
      image: null,
    });
  }


  function handleSubtopicChange(
    event
  ) {
    setSubtopicForm({
      ...subtopicForm,
      [event.target.name]:
        event.target.value,
    });
  }

  function handleSubtopicImageChange(event) {
    const image = event.target.files?.[0] || null;
    if (image && !image.type.startsWith("image/")) {
      setError("Subtopic image must be a valid image file.");
      event.target.value = "";
      return;
    }
    if (image && image.size > 5 * 1024 * 1024) {
      setError("Subtopic images must be smaller than 5 MB.");
      event.target.value = "";
      return;
    }
    setSubtopicForm({ ...subtopicForm, image });
    setError("");
  }


  /* ========================================================
     CREATE / UPDATE SUBTOPIC
  ======================================================== */

  async function saveSubtopic(event) {
    event.preventDefault();

    if (!selectedTopic) {
      setError(
        "No topic selected."
      );

      return;
    }


    if (!subtopicForm.title.trim()) {
      setError(
        "Subtopic title is required."
      );

      return;
    }

    const orderNumber = Number(subtopicForm.order_number);
    if (!Number.isSafeInteger(orderNumber) || orderNumber < 1 || orderNumber > MAX_ORDER_NUMBER) {
      setError(`Lesson order must be a whole number between 1 and ${MAX_ORDER_NUMBER}.`);
      return;
    }


    try {
      setSaving(true);
      setError("");

      const url =
        editingSubtopic
          ? `${API_URL}/api/subtopics/${editingSubtopic.id}`
          : `${API_URL}/api/topics/${selectedTopic.id}/subtopics`;

      const method =
        editingSubtopic
          ? "PUT"
          : "POST";


      const body = new FormData();
      body.append("title", subtopicForm.title.trim());
      body.append("content", subtopicForm.content);
      body.append("order_number", String(orderNumber));
      if (subtopicForm.image) body.append("image", subtopicForm.image);


      const response =
        await apiFetch(
          url,
          {
            method,
            body,
          }
        );


      if (!response) {
        return;
      }


      const data =
        await readJson(response);


      if (!response.ok) {
        throw new Error(
          data?.message ||
          "Unable to save subtopic."
        );
      }


      closeSubtopicForm();

      await openSubtopics(
        selectedTopic
      );

      await loadTopics();

    } catch (error) {
      console.error(
        "Save subtopic error:",
        error
      );

      setError(
        error.message ||
        "Unable to save subtopic."
      );

    } finally {
      setSaving(false);
    }
  }


  /* ========================================================
     DELETE SUBTOPIC
  ======================================================== */

  async function deleteSubtopic(
    subtopic
  ) {
    const confirmed =
      window.confirm(
        `Delete "${subtopic.title}"?`
      );

    if (!confirmed) {
      return;
    }


    try {
      setError("");

      const response =
        await apiFetch(
          `${API_URL}/api/subtopics/${subtopic.id}`,
          {
            method: "DELETE",
          }
        );


      if (!response) {
        return;
      }


      const data =
        await readJson(response);


      if (!response.ok) {
        throw new Error(
          data?.message ||
          "Unable to delete subtopic."
        );
      }


      await openSubtopics(
        selectedTopic
      );

      await loadTopics();

    } catch (error) {
      console.error(
        "Delete subtopic error:",
        error
      );

      setError(
        error.message ||
        "Unable to delete subtopic."
      );
    }
  }


  /* ========================================================
     LOADING
  ======================================================== */

  if (loading) {
    return (
      <div className="page">
        <LoadingPage />
      </div>
    );
  }

  if (showSlideEditor && slideEditorTopic) {
    return (
      <SlideEditor
        apiFetch={apiFetch}
        topic={slideEditorTopic}
        onClose={closeSlideEditor}
        onSaved={loadTopics}
      />
    );
  }


  /* ========================================================
     MANAGE SUBTOPICS PAGE
  ======================================================== */

  if (selectedTopic) {
    return (
      <div className="page topic-management-page">

        <button
          className="back-button"
          onClick={
            closeSubtopics
          }
        >
          ← Back to Topics
        </button>


        <PageHero
          eyebrow="ADMINISTRATION"
          title={
            selectedTopic.title
          }
          description={
            selectedTopic.description ||
            "Manage the lessons under this System Administration topic."
          }
        />


        {error && (
          <div className="error-message">
            {error}
          </div>
        )}


        <div className="panel">

          <PanelHeader
            eyebrow="SUBTOPIC MANAGEMENT"
            title="System Administration Lessons"
            description="Create, edit, organize, and delete lessons for this topic."
            action={
              <button
                className="primary-action"
                onClick={
                  openAddSubtopic
                }
              >
                + Add Subtopic
              </button>
            }
          />


          {showSubtopicForm && (
            <div className="user-form-panel">

              <div className="form-panel-header">

                <div>

                  <span className="section-label">
                    LESSON CONFIGURATION
                  </span>

                  <h3>
                    {editingSubtopic
                      ? "Edit Subtopic"
                      : "Create New Subtopic"}
                  </h3>

                </div>


                <button
                  className="close-button"
                  onClick={
                    closeSubtopicForm
                  }
                >
                  ×
                </button>

              </div>


              <form
                onSubmit={
                  saveSubtopic
                }
              >

                <div className="form-grid">

                  <div className="form-group">

                    <label>
                      Subtopic Title
                    </label>

                    <input
                      type="text"
                      name="title"
                      value={
                        subtopicForm.title
                      }
                      onChange={
                        handleSubtopicChange
                      }
                      placeholder="Fundamentals & History"
                      required
                    />

                  </div>


                  <div className="form-group">

                    <label>
                      Order Number
                    </label>

                    <input
                      type="number"
                      name="order_number"
                      value={
                        subtopicForm.order_number
                      }
                      onChange={
                        handleSubtopicChange
                      }
                      min="1"
                      max={MAX_ORDER_NUMBER}
                      step="1"
                    />

                  </div>


                  <div
                    className="form-group"
                    style={{
                      gridColumn:
                        "1 / -1",
                    }}
                  >

                    <label>
                      Lecture Content
                    </label>

                    <textarea
                      name="content"
                      value={
                        subtopicForm.content
                      }
                      onChange={
                        handleSubtopicChange
                      }
                      placeholder="Enter the complete lecture content for this lesson..."
                      rows="14"
                    />

                    <small
                      style={{
                        display:
                          "block",
                        marginTop:
                          "8px",
                        color:
                          "#64748b",
                      }}
                    >
                      You can enter plain text or HTML
                      content. HTML content will be
                      rendered in the lesson reader.
                    </small>

                  </div>

                  <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                    <label>Subtopic Visual (optional)</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleSubtopicImageChange}
                    />
                    <small className="file-help">
                      {subtopicForm.image?.name ||
                        (editingSubtopic?.image_name
                          ? `Current image: ${editingSubtopic.image_name}`
                          : "Add an illustration for this lesson (up to 5 MB).")}
                    </small>
                  </div>

                </div>


                <div className="form-actions">

                  <button
                    type="button"
                    className="secondary-action"
                    onClick={
                      closeSubtopicForm
                    }
                  >
                    Cancel
                  </button>


                  <button
                    type="submit"
                    className="primary-action"
                    disabled={
                      saving
                    }
                  >
                    {saving
                      ? "Saving..."
                      : editingSubtopic
                      ? "Save Changes"
                      : "Create Subtopic"}
                  </button>

                </div>

              </form>

            </div>
          )}


          {subtopicsLoading ? (

            <LoadingPage />

          ) : (

            <div className="topic-management-list">

              {subtopics.length > 0 ? (

                subtopics.map(
                  (
                    subtopic,
                    index
                  ) => (

                    <div
                      className="lecture-card"
                      key={
                        subtopic.id
                      }
                    >

                      <div className="lecture-number">
                        {String(
                          index + 1
                        ).padStart(
                          2,
                          "0"
                        )}
                      </div>


                      <div className="lecture-content">

                        <h3>
                          {
                            subtopic.title
                          }
                        </h3>


                        <p>
                          {getSubtopicPreview(
                            subtopic.content
                          )}
                        </p>


                        <div
                          className="topic-management-inline-actions"
                        >

                          <span className="lesson-count">
                            Lesson{" "}
                            {subtopic.order_number ??
                              index + 1}
                          </span>

                          <button
                            type="button"
                            className="secondary-button"
                            onClick={() => moveSubtopic(index, -1)}
                            disabled={reordering || index === 0}
                            aria-label={`Move ${subtopic.title} up`}
                            title="Move lesson up"
                          >
                            ↑
                          </button>

                          <button
                            type="button"
                            className="secondary-button"
                            onClick={() => moveSubtopic(index, 1)}
                            disabled={reordering || index === subtopics.length - 1}
                            aria-label={`Move ${subtopic.title} down`}
                            title="Move lesson down"
                          >
                            ↓
                          </button>


                          <button
                            className="secondary-button"
                            onClick={() =>
                              openEditSubtopic(
                                subtopic
                              )
                            }
                          >
                            Edit Lesson
                          </button>


                          <button
                            className="table-delete"
                            onClick={() =>
                              deleteSubtopic(
                                subtopic
                              )
                            }
                          >
                            Delete
                          </button>

                        </div>

                      </div>

                    </div>

                  )
                )

              ) : (

                <div className="empty-state">

                  <div className="empty-icon">
                    ▤
                  </div>

                  <h3>
                    No subtopics found
                  </h3>

                  <p>
                    Add the first lesson to
                    this topic.
                  </p>

                  <button
                    className="primary-action"
                    onClick={
                      openAddSubtopic
                    }
                  >
                    + Add Subtopic
                  </button>

                </div>

              )}

            </div>

          )}

        </div>

      </div>
    );
  }


  /* ========================================================
     MANAGE TOPICS PAGE
  ======================================================== */

  return (
    <div className="page topic-management-page">

      <PageHero
        eyebrow="ADMINISTRATION"
        title="Manage Topics"
        description="Create, organize, and manage Linux system administration topics and lessons."
      />


      {error && (
        <div className="error-message">
          {error}
        </div>
      )}


      <div className="panel topic-management-panel">

        <PanelHeader
          eyebrow="LEARNING CONTENT"
          title="System Administration Topics"
          description="Manage the topics displayed in the learning module."
          action={
            <button
              className="primary-action"
              onClick={
                openAddTopic
              }
            >
              + Add Topic
            </button>
          }
        />


        {/* ==================================================
            ADD / EDIT TOPIC FORM
        ================================================== */}

        {showTopicForm && (
          <div className="user-form-panel">

            <div className="form-panel-header">

              <div>

                <span className="section-label">
                  TOPIC CONFIGURATION
                </span>

                <h3>
                  {editingTopic
                    ? "Edit Topic"
                    : "Create New Topic"}
                </h3>

              </div>


              <button
                className="close-button"
                onClick={
                  closeTopicForm
                }
              >
                ×
              </button>

            </div>


            <form
              onSubmit={
                saveTopic
              }
            >

              <div className="form-grid">

                <div className="form-group">

                  <label>
                    Topic Title
                  </label>

                  <input
                    type="text"
                    name="title"
                    value={
                      topicForm.title
                    }
                    onChange={
                      handleTopicChange
                    }
                    placeholder="Linux System Administration"
                    required
                  />

                </div>


                <div className="form-group">

                  <label>
                    Order Number
                  </label>

                  <input
                    type="number"
                    name="order_number"
                    value={
                      topicForm.order_number
                    }
                    onChange={
                      handleTopicChange
                    }
                    min="1"
                    max={MAX_ORDER_NUMBER}
                    step="1"
                  />

                </div>


                <div
                  className="form-group"
                  style={{
                    gridColumn:
                      "1 / -1",
                  }}
                >

                  <label>
                    Description
                  </label>

                  <textarea
                    name="description"
                    value={
                      topicForm.description
                    }
                    onChange={
                      handleTopicChange
                    }
                    placeholder="Describe what students will learn in this topic."
                    rows="5"
                  />

                </div>


                <div
                  className="form-group"
                  style={{
                    gridColumn: "1 / -1",
                  }}
                >

                  <label>
                    Topic Resource (PDF or PPTX)
                  </label>

                  <input
                    type="file"
                    accept=".pdf,.pptx,application/pdf,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                    onChange={
                      handleTopicFileChange
                    }
                  />

                  <small className="file-help">
                    {topicForm.file?.name ||
                      (editingTopic?.file_name
                        ? `Current file: ${editingTopic.file_name}`
                        : "Optional learning material for users.")}
                  </small>

                </div>

                <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                  <label>Topic Visual (optional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleTopicImageChange}
                  />
                  <small className="file-help">
                    {topicForm.image?.name ||
                      (editingTopic?.image_name
                        ? `Current image: ${editingTopic.image_name}`
                        : "Add a subject image for this topic (up to 5 MB).")}
                  </small>
                </div>

              </div>


              <div className="form-actions">

                <button
                  type="button"
                  className="secondary-action"
                  onClick={
                    closeTopicForm
                  }
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  className="primary-action"
                  disabled={
                    saving
                  }
                >
                  {saving
                    ? "Saving..."
                    : editingTopic
                    ? "Save Changes"
                    : "Create Topic"}
                </button>

              </div>

            </form>

          </div>
        )}


        {/* ==================================================
            TOPIC LIST
        ================================================== */}

        <div className="topic-management-list">

          {topics.length > 0 ? (

            topics.map(
              (
                topic,
                index
              ) => (

                <article
                  className="topic-management-card"
                  key={
                    topic.id
                  }
                >

                  <div className="topic-management-card__visual">
                    {topic.image_name ? (
                      <VisualAsset
                        apiFetch={apiFetch}
                        url={`${API_URL}/api/topics/${topic.id}/image`}
                        alt={topic.title}
                        className="topic-management-card__image"
                      />
                    ) : (
                      <div className="topic-management-card__placeholder">
                        <span>{getSubjectIcon(topic.title)}</span>
                      </div>
                    )}
                  </div>


                  <div className="topic-management-card__content">

                    <div className="topic-management-card__meta">
                      <span className="topic-management-card__number">
                        Topic {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="topic-management-card__count">
                        {topic.subtopic_count ?? 0} lessons
                      </span>
                    </div>

                    <h3>
                      {
                        topic.title
                      }
                    </h3>


                    <p>
                      {topic.description ||
                        "No description available."}
                    </p>

                    <div className="topic-management-card__details">
                      <span>Order {topic.order_number ?? index + 1}</span>
                      {topic.file_name && <span>{topic.file_name}</span>}
                    </div>


                    <div className="topic-management-card__actions">

                      <button
                        className="secondary-button"
                        onClick={() =>
                          openSubtopics(topic)
                        }
                      >
                        Manage lessons
                      </button>

                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() => moveTopic(index, -1)}
                        disabled={reordering || index === 0}
                        aria-label={`Move ${topic.title} up`}
                        title="Move topic up"
                      >
                        ↑
                      </button>

                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() => moveTopic(index, 1)}
                        disabled={reordering || index === topics.length - 1}
                        aria-label={`Move ${topic.title} down`}
                        title="Move topic down"
                      >
                        ↓
                      </button>

                      <button
                        className="secondary-button"
                        onClick={() =>
                          openEditTopic(topic)
                        }
                      >
                        Edit Topic
                      </button>

                      <button
                        className="secondary-button"
                        onClick={() =>
                          openEditTopic(topic)
                        }
                        aria-label={`Edit slides for ${topic.title}`}
                      >
                        Edit Slides
                      </button>


                      <button
                        className="table-delete"
                        onClick={() =>
                          deleteTopic(topic)
                        }
                        aria-label={`Delete ${topic.title}`}
                      >
                        Delete
                      </button>

                    </div>

                  </div>

                </article>

              )
            )

          ) : (

            <div className="empty-state">

              <div className="empty-icon">
                ▤
              </div>

              <h3>
                No topics found
              </h3>

              <p>
                Create your first System
                Administration learning topic.
              </p>

              <button
                className="primary-action"
                onClick={
                  openAddTopic
                }
              >
                + Add Topic
              </button>

            </div>

          )}

        </div>

      </div>

    </div>
  );
}
/* ==========================================================
   DASHBOARD
========================================================== */

function Dashboard({
  system,
  status,
  services,
  users,
  isAdmin,
  user,
}) {
  const runningServices =
    services.filter(
      (service) =>
        service.status ===
        "Running"
    ).length;

  const totalServices =
    services.length;

  const serverOnline =
    status?.status ===
      "Online" ||
    status?.status ===
      "Running";

  const serverStatusTone =
    !status?.status
      ? "unavailable"
      : serverOnline
        ? "healthy"
        : String(status.status).toLowerCase().includes("warning")
          ? "warning"
          : "error";

    const dashboardLoading = status == null;


  return (
    <div className="page dashboard-page">
      <PageHero
        className="dashboard-page-header"
        eyebrow="SYSTEM OVERVIEW"
        title="Dashboard"
        description={`Good day, ${user.name.split(" ")[0]}. Overview of your system resources, services, and server activity.`}
      />

      <section className="dashboard-hero dashboard-health-panel" aria-label="Server status">
        <div className="dashboard-health-panel__copy">
          <span className="section-label">SERVER STATUS</span>
          <h2>Application status</h2>
          <p>
            {status?.status
              ? `The existing status endpoint reports ${status.status}. It does not report database or Docker health.`
              : "Waiting for a response from the existing status endpoint."}
          </p>
          {status?.uptime && (
            <span className="dashboard-health-panel__uptime">
              Reported uptime: {status.uptime}
            </span>
          )}
        </div>
          <StatusBadge
            status={status?.status || (dashboardLoading ? "Loading" : "Unavailable")}
            tone={dashboardLoading ? "loading" : serverStatusTone}
          />
      </section>


      <div className="dashboard-metric-grid">
        <MetricCard
          icon="◉"
          label="Server Status"
          value={status?.status || (dashboardLoading ? "Loading" : "Unavailable")}
          description={status?.uptime ? `Uptime ${status.uptime}` : dashboardLoading ? "Waiting for status data" : "Uptime not reported"}
          tone={dashboardLoading ? "unavailable" : serverStatusTone}
        />

        <MetricCard
          icon="⚙"
          label="Running Services"
          value={totalServices > 0 ? `${runningServices}/${totalServices}` : dashboardLoading ? "Loading" : "Unavailable"}
          description={totalServices > 0 ? "Docker containers" : dashboardLoading ? "Waiting for service data" : "Service data unavailable"}
          tone={totalServices ? "neutral" : "unavailable"}
        />

        <MetricCard
          icon="♙"
          label="System Users"
          value={isAdmin ? users.length > 0 ? users.length : dashboardLoading ? "Loading" : "Unavailable" : "—"}
          description={isAdmin ? users.length > 0 ? "Registered accounts" : dashboardLoading ? "Waiting for account data" : "User data unavailable" : "Administrator only"}
          tone="neutral"
        />

        <MetricCard
          icon="◷"
          label="Monitoring"
          value="Monitoring"
          description="Updates every 5 seconds"
          tone="neutral"
        />
      </div>


      <SectionHeading
        eyebrow="RESOURCE MONITORING"
        title="Server Performance"
        description="Latest reported utilization of critical system resources."
      />


      <div className="resource-grid">

        <ResourceCard
          title="CPU Utilization"
          value={
            system?.cpu_usage ||
            0
          }
          detail={
            system
              ? `${system.cpu_count} CPU cores`
              : "Loading..."
          }
          icon="CPU"
          loading={!system}
        />


        <ResourceCard
          title="Memory Utilization"
          value={
            system?.memory_usage ||
            0
          }
          detail={
            system
              ? `${system.memory_used_gb} GB of ${system.memory_total_gb} GB used`
              : "Loading..."
          }
          icon="RAM"
          loading={!system}
        />


        <ResourceCard
          title="Storage Utilization"
          value={
            system?.disk_usage ||
            0
          }
          detail={
            system
              ? `${system.disk_used_gb} GB used of ${system.disk_total_gb} GB · ${system.disk_free_gb} GB available`
              : "Loading..."
          }
          icon="DSK"
          loading={!system}
        />

      </div>


      <div className="dashboard-two-column">

        <div className="panel">

          <PanelHeader
            eyebrow="HOST INFORMATION"
            title="Server Details"
            description="Current operating environment."
          />

          {system ? (

            <div className="detail-list">

              <DetailRow
                label="Hostname"
                value={
                  system.hostname
                }
              />

              <DetailRow
                label="Operating System"
                value={
                  system.operating_system
                }
              />

              <DetailRow
                label="OS Version"
                value={
                  system.os_version
                }
              />

              <DetailRow
                label="Architecture"
                value={
                  system.architecture
                }
              />

              <DetailRow
                label="Python Version"
                value={
                  system.python_version
                }
              />

              <DetailRow
                label="Processor"
                value={
                  system.processor ||
                  "Not available"
                }
              />

              <DetailRow label="CPU Cores" value={system.cpu_count} />
              <DetailRow label="Memory Total" value={`${system.memory_total_gb} GB`} />
              <DetailRow label="Memory Available" value={`${system.memory_free_gb} GB`} />
              <DetailRow label="Storage Total" value={`${system.disk_total_gb} GB`} />
              <DetailRow label="Storage Available" value={`${system.disk_free_gb} GB`} />

            </div>

          ) : (
            <LoadingText message="Loading host information..." />
          )}

        </div>


        <div className="panel">

          <PanelHeader
            eyebrow="DOCKER"
            title="Service Health"
            description="Current container status."
          />

          <div className="mini-service-list">

            {services.length > 0 ? (

              services.map(
                (service) => {

                  const running =
                    service.status ===
                    "Running";

                  const serviceStatus =
                    service.status || "Unavailable";

                  const serviceStatusTone =
                    running
                      ? "healthy"
                      : serviceStatus === "Stopped"
                        ? "error"
                        : "unavailable";

                  return (
                    <div
                      className="mini-service"
                      key={
                        service.service
                      }
                    >

                      <div className="mini-service-name">

                        <span className="service-indicator">
                          {getServiceIcon(
                            service
                          )}
                        </span>

                        <div>

                          <strong>
                            {service.service}
                          </strong>

                          <span>
                            {
                              service.container
                            }
                          </span>

                        </div>

                      </div>


                      <StatusBadge status={serviceStatus} tone={serviceStatusTone} />

                    </div>
                  );
                }
              )

            ) : (
              dashboardLoading ? (
                <LoadingText message="Loading service information..." />
              ) : (
                <EmptyState
                  icon="⚙"
                  title="Service data unavailable"
                  description="No container data is currently available from the existing service endpoint."
                />
              )
            )}

          </div>

        </div>

      </div>

    </div>
  );
}


/* ==========================================================
   STAT CARD
========================================================== */

function MetricCard({ icon, label, value, description, tone = "neutral" }) {
  return (
    <article className={`dashboard-metric-card dashboard-metric-card--${tone}`}>
      <span className="dashboard-metric-card__icon" aria-hidden="true">
        {icon}
      </span>
      <div className="dashboard-metric-card__content">
        <span className="dashboard-metric-card__label">{label}</span>
        <strong>{value}</strong>
        <p>{description}</p>
      </div>
    </article>
  );
}

function StatCard({
  icon,
  label,
  value,
  meta,
  tone,
}) {
  return (
    <div className="stat-card-new">

      <div
        className={`stat-icon-new ${tone}`}
      >
        {icon}
      </div>

      <div className="stat-content">

        <span>
          {label}
        </span>

        <strong>
          {value}
        </strong>

        <small>
          {meta}
        </small>

      </div>

    </div>
  );
}


/* ==========================================================
   RESOURCE CARD
========================================================== */

function ResourceCard({
  title,
  value,
  detail,
  icon,
  loading = false,
}) {
  const percentage =
    Math.min(
      100,
      Math.max(
        0,
        Number(value) || 0
      )
    );

  const level =
    percentage >= 80
      ? "danger"
      : percentage >= 60
      ? "warning"
      : "normal";


  return (
    <div className={`resource-card${loading ? " is-loading" : ""}`}>

      <div className="resource-card-header">

        <div>

          <span className="resource-label">
            {icon}
          </span>

          <h3>
            {title}
          </h3>

        </div>

        <strong
          className={`resource-percentage ${loading ? "loading" : level}`}
        >
          {loading ? "Loading" : `${percentage.toFixed(1)}%`}
        </strong>

      </div>


      {loading ? (
        <div className="resource-card__loading" role="status">
          <span className="resource-card__skeleton" aria-hidden="true"></span>
          <span>Loading {title.toLowerCase()} data...</span>
        </div>
      ) : (
        <>
          <div
            className="resource-track"
            role="progressbar"
            aria-label={title}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percentage}
            aria-valuetext={`${percentage.toFixed(1)} percent`}
          >
            <div
              className={`resource-fill ${level}`}
              style={{ width: `${percentage}%` }}
            />
          </div>

          <div className="resource-bottom">
            <span>{detail}</span>
            <strong>
              {level === "normal" ? "Normal" : level === "warning" ? "Elevated" : "Critical"}
            </strong>
          </div>
        </>
      )}

    </div>
  );
}


/* ==========================================================
   SYSTEM INFORMATION
========================================================== */

function SystemInfo({
  system,
  status,
  services,
}) {
  if (!system) {
    return (
      <LoadingPage />
    );
  }


  const runningServices =
    services.filter(
      (service) =>
        service.status ===
        "Running"
    ).length;


  return (
    <div className="page">

      <PageHero
        eyebrow="INFRASTRUCTURE"
        title="System Monitoring"
        description="Monitor hardware resources, operating system information, and server health."
      />


      <div className="resource-grid">

        <ResourceCard
          title="CPU Utilization"
          value={
            system.cpu_usage
          }
          detail={`${system.cpu_count} CPU cores`}
          icon="CPU"
        />

        <ResourceCard
          title="Memory Utilization"
          value={
            system.memory_usage
          }
          detail={`${system.memory_used_gb} GB used of ${system.memory_total_gb} GB`}
          icon="RAM"
        />

        <ResourceCard
          title="Storage Utilization"
          value={
            system.disk_usage
          }
          detail={`${system.disk_free_gb} GB available`}
          icon="DSK"
        />

      </div>


      <SectionHeading
        eyebrow="SERVER HEALTH"
        title="Infrastructure Status"
        description="Current availability of core server components."
      />


      <div className="health-grid">

        <HealthCard
          title="Application Server"
          subtitle="Flask API"
          status="Running"
          icon="API"
          active
        />

        <HealthCard
          title="Database"
          subtitle="MySQL"
          status={
            status?.database ===
            "running"
              ? "Running"
              : "Checking"
          }
          icon="DB"
          active={
            status?.database ===
            "running"
          }
        />

        <HealthCard
          title="Container Engine"
          subtitle="Docker"
          status={
            status?.docker ===
            "running"
              ? "Running"
              : "Checking"
          }
          icon="DKR"
          active={
            status?.docker ===
            "running"
          }
        />

        <HealthCard
          title="Docker Services"
          subtitle="Application containers"
          status={`${runningServices}/${services.length} Running`}
          icon="SRV"
          active={
            runningServices > 0
          }
        />

      </div>


      <div className="panel">

        <PanelHeader
          eyebrow="HOST INFORMATION"
          title="System Configuration"
          description="Operating system and hardware information reported by the server."
        />

        <div className="system-detail-grid">

          <SystemDetail
            label="Hostname"
            value={
              system.hostname
            }
          />

          <SystemDetail
            label="Operating System"
            value={
              system.operating_system
            }
          />

          <SystemDetail
            label="OS Version"
            value={
              system.os_version
            }
          />

          <SystemDetail
            label="Architecture"
            value={
              system.architecture
            }
          />

          <SystemDetail
            label="Processor"
            value={
              system.processor ||
              "Not available"
            }
          />

          <SystemDetail
            label="Python Version"
            value={
              system.python_version
            }
          />

          <SystemDetail
            label="CPU Cores"
            value={
              system.cpu_count
            }
          />

          <SystemDetail
            label="Memory Total"
            value={`${system.memory_total_gb} GB`}
          />

          <SystemDetail
            label="Memory Used"
            value={`${system.memory_used_gb} GB`}
          />

          <SystemDetail
            label="Memory Available"
            value={`${system.memory_free_gb} GB`}
          />

          <SystemDetail
            label="Disk Total"
            value={`${system.disk_total_gb} GB`}
          />

          <SystemDetail
            label="Disk Free"
            value={`${system.disk_free_gb} GB`}
          />

        </div>

      </div>


      <div className="information-banner">

        <div className="information-icon">
          i
        </div>

        <div>

          <strong>
            Live monitoring enabled
          </strong>

          <p>
            System resource information is
            automatically refreshed every
            5 seconds.
          </p>

        </div>

      </div>

    </div>
  );
}


/* ==========================================================
   SERVICES
========================================================== */

function Services({
  services,
  isAdmin,
  refreshServices,
}) {
  const [
    loadingService,
    setLoadingService,
  ] = useState(null);

  const [
    actionMessage,
    setActionMessage,
  ] = useState("");

  const [
    actionType,
    setActionType,
  ] = useState("");


  async function controlService(
    container,
    action
  ) {
    if (!isAdmin) {
      setActionType(
        "error"
      );

      setActionMessage(
        "Only administrators can control Docker services."
      );

      return;
    }


    if (
      container ===
      "flask_backend"
    ) {
      setActionType(
        "error"
      );

      setActionMessage(
        "The Flask Backend cannot be stopped or restarted from the web interface because it provides the API connection for this dashboard."
      );

      return;
    }


    const confirmed =
      window.confirm(
        `Are you sure you want to ${action} ${container}?`
      );

    if (!confirmed) {
      return;
    }


    setLoadingService(
      `${container}-${action}`
    );

    setActionMessage("");
    setActionType("");


    try {
      const response =
        await apiFetch(
          `${API_URL}/api/services/${container}/${action}`,
          {
            method: "POST",
          }
        );


      if (!response) {
        return;
      }


      const data =
        await readJson(
          response
        );


      if (!response.ok) {
        setActionType(
          "error"
        );

        setActionMessage(
          data?.message ||
            `Unable to ${action} service.`
        );

        return;
      }


      setActionType(
        "success"
      );

      setActionMessage(
        data?.message ||
          `Service ${action} successful.`
      );


      setTimeout(
        async () => {
          await refreshServices();
        },
        1000
      );

    } catch (error) {
      console.error(
        "Service control error:",
        error
      );

      setActionType(
        "error"
      );

      setActionMessage(
        "Unable to connect to the backend."
      );

    } finally {
      setLoadingService(
        null
      );
    }
  }


  const running =
    services.filter(
      (service) =>
        service.status ===
        "Running"
    ).length;

  const stopped =
    services.length -
    running;


  return (
    <div className="page">

      <PageHero
        eyebrow="CONTAINER MANAGEMENT"
        title="Docker Services"
        description="Monitor the application's containerized services and perform administrative actions."
      />


      <div className="stat-grid">

        <StatCard
          icon="⚙"
          label="Total Services"
          value={
            services.length
          }
          meta="Docker containers"
          tone="blue"
        />

        <StatCard
          icon="●"
          label="Running"
          value={running}
          meta="Active containers"
          tone="success"
        />

        <StatCard
          icon="○"
          label="Stopped"
          value={stopped}
          meta="Inactive containers"
          tone="danger"
        />

        <StatCard
          icon="♙"
          label="Access Level"
          value={
            isAdmin
              ? "ADMIN"
              : "VIEW"
          }
          meta={
            isAdmin
              ? "Full service controls"
              : "Monitoring only"
          }
          tone="purple"
        />

      </div>


      <div className="panel">

        <PanelHeader
          eyebrow="DOCKER ENGINE"
          title="Container Services"
          description="Current state of services deployed on the server."
        />


        {actionMessage && (
          <div
            className={`action-message ${actionType}`}
          >

            <span>
              {actionType ===
              "success"
                ? "✓"
                : "!"}
            </span>

            <p>
              {actionMessage}
            </p>

            <button
              onClick={() => {
                setActionMessage(
                  ""
                );

                setActionType(
                  ""
                );
              }}
            >
              ×
            </button>

          </div>
        )}


        <div className="service-list-new">

          {services.length > 0 ? (

            services.map(
              (service) => {

                const isRunning =
                  service.status ===
                  "Running";

                const container =
                  service.container ||
                  service.container_name ||
                  service.service;

                const isFlask =
                  container ===
                  "flask_backend";

                const isLoading =
                  loadingService !==
                  null;


                return (
                  <div
                    className="service-card-new"
                    key={
                      service.service
                    }
                  >

                    <div className="service-card-left">

                      <div className="service-large-icon">
                        {getServiceIcon(
                          service
                        )}
                      </div>

                      <div className="service-card-info">

                        <div className="service-name-row">

                          <h3>
                            {
                              service.service
                            }
                          </h3>

                          <HealthBadge
                            active={
                              isRunning
                            }
                            text={
                              isRunning
                                ? "Running"
                                : "Stopped"
                            }
                          />

                        </div>


                        <div className="service-meta">

                          <span>
                            Container:
                            <strong>
                              {
                                container
                              }
                            </strong>
                          </span>

                          <span>
                            Status:
                            <strong>
                              {service.docker_status ||
                                service.status ||
                                "Unknown"}
                            </strong>
                          </span>

                        </div>


                        {isFlask && (
                          <div className="service-note">

                            <span>
                              !
                            </span>

                            <p>
                              The Flask Backend is
                              protected because it
                              provides the API used
                              by this management console.
                            </p>

                          </div>
                        )}

                      </div>

                    </div>


                    {isAdmin ? (

                      <div className="service-actions-new">

                        <button
                          className="service-btn start"
                          disabled={
                            isLoading ||
                            isRunning ||
                            isFlask
                          }
                          onClick={() =>
                            controlService(
                              container,
                              "start"
                            )
                          }
                        >
                          {loadingService ===
                          `${container}-start`
                            ? "Starting..."
                            : "Start"}
                        </button>


                        <button
                          className="service-btn stop"
                          disabled={
                            isLoading ||
                            !isRunning ||
                            isFlask
                          }
                          onClick={() =>
                            controlService(
                              container,
                              "stop"
                            )
                          }
                        >
                          {loadingService ===
                          `${container}-stop`
                            ? "Stopping..."
                            : "Stop"}
                        </button>


                        <button
                          className="service-btn restart"
                          disabled={
                            isLoading ||
                            isFlask
                          }
                          onClick={() =>
                            controlService(
                              container,
                              "restart"
                            )
                          }
                        >
                          {loadingService ===
                          `${container}-restart`
                            ? "Restarting..."
                            : "Restart"}
                        </button>

                      </div>

                    ) : (

                      <span className="view-only">
                        View Only
                      </span>

                    )}

                  </div>
                );
              }
            )

          ) : (

            <EmptyState
              icon="⚙"
              title="No Docker services found"
              description="The server did not return any Docker container information."
            />

          )}

        </div>


        <div className="administration-note">

          <div>
            !
          </div>

          <section>

            <strong>
              Administrator service controls
            </strong>

            <p>
              Administrators can manage supported
              Docker containers directly from this
              console. The Flask Backend is protected
              to prevent the current management API
              connection from being terminated.
            </p>

          </section>

        </div>

      </div>

    </div>
  );
}


/* ==========================================================
   PROFILE
========================================================== */

function Profile({
  user,
  apiFetch,
  onProfileUpdate,
}) {
  const [form, setForm] = useState({
    name: user.name || "",
    email: user.email || "",
    password: "",
    profile_picture: user.profile_picture || "",
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function handleChange(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  }

  function handlePictureChange(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("Profile picture must be smaller than 2 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();

      image.onload = () => {
        const maxDimension = 640;
        const scale = Math.min(
          1,
          maxDimension / Math.max(image.width, image.height)
        );
        const canvas = document.createElement("canvas");

        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));

        const context = canvas.getContext("2d");

        if (!context) {
          setError("Unable to process the selected image.");
          return;
        }

        context.drawImage(
          image,
          0,
          0,
          canvas.width,
          canvas.height
        );

        const compressedImage = canvas.toDataURL(
          "image/jpeg",
          0.8
        );

        if (compressedImage.length > 1500000) {
          setError("Please choose a smaller image.");
          return;
        }

        setForm((current) => ({
          ...current,
          profile_picture: compressedImage,
        }));
        setError("");
      };

      image.onerror = () => {
        setError("Unable to process the selected image.");
      };

      image.src = String(reader.result);
    };
    reader.onerror = () => {
      setError("Unable to read the selected image.");
    };
    reader.readAsDataURL(file);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setError("");
    setSaving(true);

    try {
      const response = await apiFetch(
        `${API_URL}/api/me`,
        {
          method: "PUT",
          body: JSON.stringify({
            name: form.name.trim(),
            email: form.email.trim(),
            password: form.password,
            profile_picture: form.profile_picture,
          }),
        }
      );

      if (!response) {
        return;
      }

      const data = await readJson(response);

      if (!response.ok) {
        throw new Error(
          data?.message || "Unable to update profile."
        );
      }

      onProfileUpdate(data.user, data.token);
      setForm({
        name: data.user.name,
        email: data.user.email,
        password: "",
        profile_picture: data.user.profile_picture || "",
      });
      setMessage("Your profile was updated successfully.");
    } catch (submitError) {
      console.error("Update profile error:", submitError);
      setError(
        submitError.message || "Unable to update profile."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page">
      <PageHero
        eyebrow="ACCOUNT"
        title="My Profile"
        description="Update your personal details and keep your account credentials current."
      />

      <div className="profile-layout">
        <div className="profile-summary">
          <div className="profile-avatar">
            {form.profile_picture ? (
              <img
                src={form.profile_picture}
                alt="Profile"
              />
            ) : (
              (form.name || "U").charAt(0).toUpperCase()
            )}
          </div>
          <span className="section-label">SIGNED IN AS</span>
          <h2>{form.name || "User"}</h2>
          <p>{form.email}</p>
          <span className="profile-role">{user.role}</span>
        </div>

        <div className="panel">
          <PanelHeader
            eyebrow="PROFILE SETTINGS"
            title="Personal information"
            description="These details are used throughout the administration console."
          />

          {message && (
            <div className="action-message success">
              <p>{message}</p>
            </div>
          )}

          {error && (
            <div className="action-message error">
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="profile-picture-field">
              <div>
                <label htmlFor="profile-picture">
                  Profile Picture
                </label>
                <p>JPG, PNG, GIF, or WebP up to 2 MB.</p>
              </div>
              <label
                className="secondary-action profile-upload-button"
                htmlFor="profile-picture"
              >
                Choose Image
              </label>
              <input
                id="profile-picture"
                type="file"
                accept="image/*"
                onChange={handlePictureChange}
                hidden
              />
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="profile-name">Full Name</label>
                <input
                  id="profile-name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="profile-email">Email Address</label>
                <input
                  id="profile-email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="profile-password">
                New Password
              </label>
              <input
                id="profile-password"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Leave blank to keep your current password"
                minLength="8"
              />
            </div>

            <div className="form-actions">
              <button
                className="primary-action"
                type="submit"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Profile"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}


/* ==========================================================
   USERS
========================================================== */

function Users({
  users,
  refreshUsers,
}) {
  const [showForm, setShowForm] =
    useState(false);

  const [
    editingUser,
    setEditingUser,
  ] = useState(null);

  const [
    searchTerm,
    setSearchTerm,
  ] = useState("");

  const [
    roleFilter,
    setRoleFilter,
  ] = useState("All");

  const [form, setForm] =
    useState({
      name: "",
      email: "",
      role: "User",
      password: "",
    });


  const filteredUsers =
    users.filter((user) => {

      const search =
        searchTerm.toLowerCase();

      const name =
        String(
          user.name || ""
        ).toLowerCase();

      const email =
        String(
          user.email || ""
        ).toLowerCase();

      return (
        (
          name.includes(
            search
          ) ||
          email.includes(
            search
          )
        ) &&
        (
          roleFilter ===
            "All" ||
          user.role ===
            roleFilter
        )
      );
    });


  function openAddForm() {
    setEditingUser(
      null
    );

    setForm({
      name: "",
      email: "",
      role: "User",
      password: "",
    });

    setShowForm(true);
  }


  function openEditForm(
    user
  ) {
    setEditingUser(
      user
    );

    setForm({
      name:
        user.name || "",

      email:
        user.email || "",

      role:
        user.role || "User",

      password: "",
    });

    setShowForm(true);
  }


  function closeForm() {
    setShowForm(false);

    setEditingUser(
      null
    );

    setForm({
      name: "",
      email: "",
      role: "User",
      password: "",
    });
  }


  function handleChange(
    event
  ) {
    setForm({
      ...form,
      [event.target.name]:
        event.target.value,
    });
  }


  async function handleSubmit(
    event
  ) {
    event.preventDefault();

    try {
      const url =
        editingUser
          ? `${API_URL}/api/users/${editingUser.id}`
          : `${API_URL}/api/users`;

      const method =
        editingUser
          ? "PUT"
          : "POST";


      const body =
        editingUser &&
        !form.password
          ? {
              name:
                form.name,

              email:
                form.email,

              role:
                form.role,
            }
          : form;


      const response =
        await apiFetch(
          url,
          {
            method,
            body: JSON.stringify(
              body
            ),
          }
        );


      if (!response) {
        return;
      }


      const data =
        await readJson(
          response
        );


      if (!response.ok) {
        alert(
          data?.message ||
            "Operation failed."
        );

        return;
      }


      alert(
        editingUser
          ? "User updated successfully."
          : "User created successfully."
      );


      closeForm();

      await refreshUsers();

    } catch (error) {
      console.error(
        error
      );

      alert(
        "Unable to connect to the backend."
      );
    }
  }


  async function deleteUser(
    id
  ) {
    if (
      !window.confirm(
        "Are you sure you want to delete this user?"
      )
    ) {
      return;
    }


    try {
      const response =
        await apiFetch(
          `${API_URL}/api/users/${id}`,
          {
            method: "DELETE",
          }
        );


      if (!response) {
        return;
      }


      const data =
        await readJson(
          response
        );


      if (!response.ok) {
        alert(
          data?.message ||
            "Delete failed."
        );

        return;
      }


      alert(
        "User deleted successfully."
      );

      await refreshUsers();

    } catch (error) {
      console.error(
        error
      );

      alert(
        "Unable to connect to the backend."
      );
    }
  }


  const administratorCount =
    users.filter(
      (user) =>
        user.role ===
        "Administrator"
    ).length;


  const regularUserCount =
    users.filter(
      (user) =>
        user.role ===
        "User"
    ).length;


  return (
    <div className="page">

      <PageHero
        eyebrow="ACCESS CONTROL"
        title="User Management"
        description="Manage system accounts, roles, and administrative access."
      />


      <div className="stat-grid">

        <StatCard
          icon="♙"
          label="Total Accounts"
          value={
            users.length
          }
          meta="Registered users"
          tone="blue"
        />

        <StatCard
          icon="A"
          label="Administrators"
          value={
            administratorCount
          }
          meta="Privileged accounts"
          tone="purple"
        />

        <StatCard
          icon="U"
          label="Standard Users"
          value={
            regularUserCount
          }
          meta="Regular accounts"
          tone="cyan"
        />

      </div>


      <div className="panel">

        <PanelHeader
          eyebrow="ACCOUNT DIRECTORY"
          title="System Users"
          description="Create, update, and manage authorized accounts."
          action={
            <button
              className="primary-action"
              onClick={
                openAddForm
              }
            >
              + Add User
            </button>
          }
        />


        <div className="user-toolbar">

          <div className="search-input">

            <span>
              ⌕
            </span>

            <input
              type="text"
              placeholder="Search users by name or email..."
              value={
                searchTerm
              }
              onChange={(event) =>
                setSearchTerm(
                  event.target.value
                )
              }
            />

          </div>


          <select
            className="filter-select"
            value={
              roleFilter
            }
            onChange={(event) =>
              setRoleFilter(
                event.target.value
              )
            }
          >

            <option value="All">
              All Roles
            </option>

            <option value="Administrator">
              Administrator
            </option>

            <option value="User">
              User
            </option>

          </select>

        </div>


        {showForm && (

          <div className="user-form-panel">

            <div className="form-panel-header">

              <div>

                <span className="section-label">
                  ACCOUNT CONFIGURATION
                </span>

                <h3>
                  {editingUser
                    ? "Edit User"
                    : "Create New User"}
                </h3>

              </div>

              <button
                className="close-button"
                onClick={
                  closeForm
                }
              >
                ×
              </button>

            </div>


            <form
              onSubmit={
                handleSubmit
              }
            >

              <div className="form-grid">

                <div className="form-group">

                  <label>
                    Full Name
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={
                      form.name
                    }
                    onChange={
                      handleChange
                    }
                    required
                  />

                </div>


                <div className="form-group">

                  <label>
                    Email Address
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={
                      form.email
                    }
                    onChange={
                      handleChange
                    }
                    required
                  />

                </div>


                <div className="form-group">

                  <label>
                    Role
                  </label>

                  <select
                    name="role"
                    value={
                      form.role
                    }
                    onChange={
                      handleChange
                    }
                  >

                    <option value="User">
                      User
                    </option>

                    <option value="Administrator">
                      Administrator
                    </option>

                  </select>

                </div>


                <div className="form-group">

                  <label>
                    {editingUser
                      ? "New Password"
                      : "Password"}
                  </label>

                  <input
                    type="password"
                    name="password"
                    value={
                      form.password
                    }
                    onChange={
                      handleChange
                    }
                    placeholder={
                      editingUser
                        ? "Leave blank to keep current password"
                        : "Enter password"
                    }
                    required={
                      !editingUser
                    }
                  />

                </div>

              </div>


              <div className="form-actions">

                <button
                  type="button"
                  className="secondary-action"
                  onClick={
                    closeForm
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-action"
                >
                  {editingUser
                    ? "Save Changes"
                    : "Create Account"}
                </button>

              </div>

            </form>

          </div>
        )}


        <div className="table-wrapper">

          <table className="admin-table">

            <thead>

              <tr>
                <th>ID</th>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>

            </thead>

            <tbody>

              {filteredUsers.length > 0 ? (

                filteredUsers.map(
                  (user) => (

                    <tr
                      key={
                        user.id
                      }
                    >

                      <td className="table-id">
                        #{user.id}
                      </td>

                      <td>

                        <div className="table-user">

                          <div className="table-avatar">
                            {user.name
                              ?.charAt(
                                0
                              )
                              ?.toUpperCase()}
                          </div>

                          <strong>
                            {
                              user.name
                            }
                          </strong>

                        </div>

                      </td>

                      <td>
                        {
                          user.email
                        }
                      </td>

                      <td>

                        <span
                          className={
                            user.role ===
                            "Administrator"
                              ? "role-badge administrator"
                              : "role-badge standard"
                          }
                        >
                          {
                            user.role
                          }
                        </span>

                      </td>

                      <td>
                        {
                          user.created_at ||
                          "—"
                        }
                      </td>

                      <td>

                        <div className="table-actions">

                          <button
                            className="table-edit"
                            onClick={() =>
                              openEditForm(
                                user
                              )
                            }
                          >
                            Edit
                          </button>

                          <button
                            className="table-delete"
                            onClick={() =>
                              deleteUser(
                                user.id
                              )
                            }
                          >
                            Delete
                          </button>

                        </div>

                      </td>

                    </tr>

                  )
                )

              ) : (

                <tr>

                  <td
                    colSpan="6"
                    className="table-empty"
                  >
                    No users found.
                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>


        <div className="table-footer">

          Showing{" "}
          <strong>
            {
              filteredUsers.length
            }
          </strong>{" "}
          of{" "}
          <strong>
            {users.length}
          </strong>{" "}
          accounts

        </div>

      </div>

    </div>
  );
}


/* ==========================================================
   DATABASE MANAGEMENT
========================================================== */

function DatabaseManagement({
  apiFetch,
}) {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [tableData, setTableData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [error, setError] = useState("");
  const [databaseModuleKey, setDatabaseModuleKey] = useState("system_administration");

  useEffect(() => {
    loadTables();
  }, []);

  async function loadTables() {
    try {
      setLoading(true);
      setError("");
      const response = await apiFetch(`${API_URL}/api/database/tables`);
      if (!response) return;
      const data = await readJson(response);
      if (!response.ok) {
        throw new Error(data?.message || "Unable to load database tables.");
      }
      setTables(getArrayData(data, ["tables"]));
    } catch (loadError) {
      console.error("Database tables error:", loadError);
      setError(loadError.message || "Unable to load database tables.");
    } finally {
      setLoading(false);
    }
  }

  async function openTable(tableName, moduleKey = databaseModuleKey) {
    try {
      setSelectedTable(tableName);
      setTableLoading(true);
      setError("");
      const moduleQuery = ["topics", "subtopics"].includes(tableName)
        ? `?module_key=${encodeURIComponent(moduleKey)}`
        : "";
      const response = await apiFetch(
        `${API_URL}/api/database/tables/${encodeURIComponent(tableName)}${moduleQuery}`
      );
      const data = await readJson(response);
      if (!response.ok) {
        throw new Error(data?.message || "Unable to load database table.");
      }
      setTableData(data);
    } catch (loadError) {
      console.error("Database table error:", loadError);
      setError(loadError.message || "Unable to load database table.");
    } finally {
      setTableLoading(false);
    }
  }

  async function deleteRow(row) {
    if (!tableData?.primary_key) {
      setError("This table cannot be edited safely because it has no primary key.");
      return;
    }

    const value = row[tableData.primary_key];
    if (!window.confirm(`Delete the row with ${tableData.primary_key} = ${value}?`)) {
      return;
    }

    try {
      const response = await apiFetch(
        `${API_URL}/api/database/tables/${encodeURIComponent(selectedTable)}/rows/${encodeURIComponent(String(value))}${["topics", "subtopics"].includes(selectedTable) ? `?module_key=${encodeURIComponent(databaseModuleKey)}` : ""}`,
        { method: "DELETE" }
      );
      const data = await readJson(response);
      if (!response.ok) {
        throw new Error(data?.message || "Unable to delete database row.");
      }
      await openTable(selectedTable, databaseModuleKey);
      await loadTables();
    } catch (deleteError) {
      console.error("Database row delete error:", deleteError);
      setError(deleteError.message || "Unable to delete database row.");
    }
  }

  return (
    <div className="page">
      <PageHero
        eyebrow="ADMIN MONITORING"
        title="Database Management"
        description="Inspect MySQL tables and safely remove individual records. Direct SQL execution and destructive schema changes are intentionally disabled."
      />

      {error && <div className="error-message">{error}</div>}

      <div className="database-layout">
        <div className="panel database-table-panel">
          <PanelHeader
            eyebrow="MYSQL DATABASE"
            title="Tables"
            description="Select a table to inspect its columns and recent rows."
            action={
              <button className="secondary-action" onClick={loadTables}>
                Refresh
              </button>
            }
          />
          {loading ? (
            <LoadingPage />
          ) : (
            <div className="database-table-list">
              {tables.map((table) => (
                <button
                  className={
                    selectedTable === table.name
                      ? "database-table-item active"
                      : "database-table-item"
                  }
                  key={table.name}
                  onClick={() => openTable(table.name)}
                >
                  <span>
                    <strong>{table.name}</strong>
                    <small>{table.engine || "MySQL table"}</small>
                  </span>
                  <b>{table.row_count ?? 0}</b>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="panel database-rows-panel">
          {!selectedTable ? (
            <EmptyState
              icon="▥"
              title="Select a table"
              description="Choose a MySQL table to view its schema and rows."
            />
          ) : tableLoading ? (
            <LoadingPage />
          ) : (
            <>
              <PanelHeader
                eyebrow="TABLE INSPECTOR"
                title={selectedTable}
                description={`${tableData?.rows?.length || 0} rows shown, up to 100 at a time.`}
                action={
                  <div className="database-module-controls">
                    {["topics", "subtopics"].includes(selectedTable) && (
                      <label>
                        Course module
                        <select
                          value={databaseModuleKey}
                          onChange={(event) => {
                            const moduleKey = event.target.value;
                            setDatabaseModuleKey(moduleKey);
                            openTable(selectedTable, moduleKey);
                          }}
                        >
                          <option value="system_administration">System Administration</option>
                          <option value="python">Python</option>
                        </select>
                      </label>
                    )}
                    <span className="live-tag">
                      {tableData?.primary_key ? `PRIMARY KEY: ${tableData.primary_key}` : "READ ONLY"}
                    </span>
                  </div>
                }
              />
              <div className="database-schema">
                {(tableData?.columns || []).map((column) => (
                  <span key={column.name}>
                    <strong>{column.name}</strong>
                    <small>{column.data_type}{column.nullable === "YES" ? " · nullable" : ""}</small>
                  </span>
                ))}
              </div>
              <div className="table-wrapper">
                <table className="admin-table database-data-table">
                  <thead>
                    <tr>
                      {(tableData?.columns || []).map((column) => (
                        <th key={column.name}>{column.name}</th>
                      ))}
                      {tableData?.primary_key && <th>Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {tableData?.rows?.length ? tableData.rows.map((row, index) => (
                      <tr key={`${selectedTable}-${index}`}>
                        {(tableData.columns || []).map((column) => (
                          <td key={column.name}>{String(row[column.name] ?? "NULL")}</td>
                        ))}
                        {tableData.primary_key && (
                          <td>
                            <button className="table-delete" onClick={() => deleteRow(row)}>
                              Delete
                            </button>
                          </td>
                        )}
                      </tr>
                    )) : (
                      <tr>
                        <td className="table-empty" colSpan={(tableData?.columns?.length || 1) + 1}>
                          No rows found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}


/* ==========================================================
   LOGS
========================================================== */

function Logs({
  logs,
}) {
  return (
    <div className="page">

      <PageHero
        eyebrow="AUDIT & MONITORING"
        title="System Logs"
        description="Review recent system activity and application events."
      />


      <div className="panel">

        <PanelHeader
          eyebrow="EVENT STREAM"
          title="Recent Activity"
          description="Latest events reported by the system."
          action={
            <span className="live-tag">
              <span></span>
              LIVE
            </span>
          }
        />


        {logs.length > 0 ? (

          <div className="log-list">

            {logs.map(
              (
                log,
                index
              ) => (

                <div
                  className="log-entry"
                  key={index}
                >

                  <div className="log-marker">
                    <span></span>
                  </div>

                  <div className="log-time">
                    {
                      log.time ||
                      log.timestamp ||
                      "—"
                    }
                  </div>

                  <div className="log-level">
                    <span>
                      {
                        log.level ||
                        "INFO"
                      }
                    </span>
                  </div>

                  <div className="log-message">
                    {
                      log.message ||
                      "System event"
                    }
                  </div>

                </div>

              )
            )}

          </div>

        ) : (

          <EmptyState
            icon="≡"
            title="No logs available"
            description="No system events have been reported yet."
          />

        )}

      </div>

    </div>
  );
}


function LinuxTutorChat() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hello! I’m your Linux system administration tutor. Ask me about commands, services, permissions, networking, troubleshooting, or security.",
    },
  ]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [provider, setProvider] = useState("");
  const [providerReady, setProviderReady] = useState(false);

  useEffect(() => {
    apiFetch(`${API_URL}/api/chat/status`)
      .then((response) => response ? readJson(response) : {})
      .then((data) => {
        setProvider(data.provider || "local");
        setProviderReady(Boolean(data.intelligent));
      })
      .catch(() => {
        setProvider("local");
        setProviderReady(false);
      });
  }, []);

  const suggestions = [
    "What is GNU?",
    "How do I troubleshoot a Linux service?",
    "How do I manage users and permissions?",
    "How do I check disk and memory problems?",
    "How do I secure an SSH server?",
  ];

  async function sendMessage(event) {
    event?.preventDefault();
    const message = draft.trim();
    if (!message || sending) return;

    setMessages((current) => [...current, { role: "user", text: message }]);
    setDraft("");
    setSending(true);

    try {
      const response = await apiFetch(`${API_URL}/api/chat`, {
        method: "POST",
        body: JSON.stringify({
          message,
          history: messages.map(({ role, text }) => ({ role, content: text })),
        }),
      });
      const data = response ? await readJson(response) : {};
      if (!response?.ok) {
        throw new Error(data.message || "The tutor could not answer right now.");
      }
      setProvider(data.provider || "");
      setMessages((current) => [...current, { role: "assistant", text: data.reply }]);
    } catch (error) {
      setMessages((current) => [...current, { role: "assistant", text: `I couldn’t answer that: ${error.message}` }]);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="page linux-tutor-page">
      <PageHero
        eyebrow="SYSTEM ADMINISTRATION & MAINTENANCE"
        title="Linux Tutor"
        description="A practical study assistant for Linux concepts, commands, troubleshooting, and secure administration."
      />
      <section className="linux-tutor-shell">
        <div className="linux-tutor-intro">
          <span className="linux-tutor-orb">🐧</span>
          <div>
            <span className="section-label">COURSE ASSISTANT</span>
            <h3>Learn the administrator’s reasoning</h3>
            <p>Ask what a command does, what its output means, and how to use it safely in an authorized lab.</p>
            <small className="linux-tutor-provider">
              {providerReady
                ? `Connected to ${provider === "openai" ? "ChatGPT" : "Gemini"}`
                : "Local tutor mode — configure OpenAI or Gemini for intelligent answers"}
            </small>
          </div>
        </div>
        <div className="linux-tutor-messages" aria-live="polite">
          {messages.map((message, index) => (
            <div className={`linux-tutor-message ${message.role}`} key={`${message.role}-${index}`}>
              <span>{message.role === "assistant" ? "TUTOR" : "YOU"}</span>
              <p>{message.text}</p>
            </div>
          ))}
          {sending && <div className="linux-tutor-message assistant"><span>TUTOR</span><p>Thinking through the administration workflow…</p></div>}
        </div>
        <div className="linux-tutor-suggestions">
          {suggestions.map((suggestion) => (
            <button type="button" key={suggestion} onClick={() => setDraft(suggestion)}>{suggestion}</button>
          ))}
        </div>
        <form className="linux-tutor-form" onSubmit={sendMessage}>
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Ask a Linux administration question…"
            rows="2"
            maxLength="2000"
          />
          <button type="submit" disabled={sending || !draft.trim()}>{sending ? "Sending…" : "Ask tutor →"}</button>
        </form>
        <small className="linux-tutor-safety">Educational guidance only. Use commands on systems and labs you are authorized to administer.</small>
      </section>
    </div>
  );
}

/* ==========================================================
   PAGE HERO
========================================================== */

function PageHero({
  eyebrow,
  title,
  description,
  centered = false,
  className = "",
}) {
  return (
    <section
      className={`page-hero ui-page-header rounded-xl border border-app-border bg-app-surface p-5 md:p-6 ${className}${centered ? " page-hero--centered" : ""}`}
    >

      <div>

        <span className="section-label">
          {eyebrow}
        </span>

        <h2>
          {title}
        </h2>

        <p>
          {description}
        </p>

      </div>

    </section>
  );
}


/* ==========================================================
   SECTION HEADING
========================================================== */

function SectionHeading({
  eyebrow,
  title,
  description,
  action,
}) {
  return (
    <div className="section-heading">

      <div>

        <span className="section-label">
          {eyebrow}
        </span>

        <h2>
          {title}
        </h2>

        <p>
          {description}
        </p>

      </div>

      {action && (
        <span className="section-action">
          {action}
        </span>
      )}

    </div>
  );
}


/* ==========================================================
   PANEL HEADER
========================================================== */

function PanelHeader({
  eyebrow,
  title,
  description,
  action,
}) {
  return (
    <div className="panel-header-new ui-panel-header">

      <div>

        <span className="section-label">
          {eyebrow}
        </span>

        <h3>
          {title}
        </h3>

        <p>
          {description}
        </p>

      </div>

      {action && (
        <div>
          {action}
        </div>
      )}

    </div>
  );
}


/* ==========================================================
   DETAIL ROW
========================================================== */

function DetailRow({
  label,
  value,
}) {
  return (
    <div className="detail-row">

      <span>
        {label}
      </span>

      <strong>
        {value ||
          "Not available"}
      </strong>

    </div>
  );
}


/* ==========================================================
   SYSTEM DETAIL
========================================================== */

function SystemDetail({
  label,
  value,
}) {
  return (
    <div className="system-detail-card">

      <span>
        {label}
      </span>

      <strong>
        {value ||
          "Not available"}
      </strong>

    </div>
  );
}


/* ==========================================================
   HEALTH CARD
========================================================== */

function HealthCard({
  title,
  subtitle,
  status,
  icon,
  active,
}) {
  return (
    <div className="health-card">

      <div className="health-card-icon">
        {icon}
      </div>

      <div className="health-card-content">

        <span>
          {subtitle}
        </span>

        <strong>
          {title}
        </strong>

        <StatusBadge
          status={status}
          tone={active ? "healthy" : status === "Checking" ? "loading" : "unavailable"}
        />

      </div>

    </div>
  );
}


/* ==========================================================
   HEALTH BADGE
========================================================== */

function StatusBadge({ status, tone }) {
  const label = String(status || "Unavailable");
  const normalized = label.toLowerCase();
  const resolvedTone = tone || (
    ["online", "healthy", "running", "operational", "normal"].includes(normalized)
      ? "healthy"
      : ["warning", "elevated"].includes(normalized)
        ? "warning"
        : ["offline", "error", "stopped", "critical"].includes(normalized)
          ? "error"
          : ["loading", "checking"].includes(normalized)
            ? "loading"
            : "unavailable"
  );

  return (
    <span className={`status-badge status-badge--${resolvedTone} inline-flex items-center gap-2 rounded-lg border border-app-border bg-app-surface-raised px-3 py-2 text-sm font-medium`}>
      <span className="status-badge__indicator" aria-hidden="true"></span>
      <span>{label}</span>
    </span>
  );
}

function HealthBadge({
  active,
  text,
}) {
  return (
    <StatusBadge
      status={text}
      tone={active ? "healthy" : text === "Stopped" ? "error" : "unavailable"}
    />
  );
}


/* ==========================================================
   ACCESS DENIED
========================================================== */

function AccessDenied({
  title,
  message,
}) {
  return (
    <div className="access-denied-page">

      <div className="access-denied-icon">
        !
      </div>

      <span className="section-label">
        ACCESS CONTROL
      </span>

      <h2>
        {title}
      </h2>

      <p>
        {message}
      </p>

    </div>
  );
}


/* ==========================================================
   LOADING TEXT
========================================================== */

function LoadingText({ message = "Loading monitoring data..." }) {
  return (
    <div className="loading-text" role="status" aria-live="polite">

      <span className="button-spinner dark" aria-hidden="true"></span>

      {message}

    </div>
  );
}


/* ==========================================================
   LOADING PAGE
========================================================== */

function LoadingPage() {
  return (
    <div className="loading-page" role="status" aria-live="polite">

      <span className="large-spinner" aria-hidden="true"></span>

      <h3>
        Loading system information
      </h3>

      <p>
        Connecting to the server...
      </p>

    </div>
  );
}

function EmptyState({ icon, title, description, action }) {
  return (
    <div className="empty-state ui-empty-state flex flex-col items-center gap-2 rounded-xl border border-app-border bg-app-surface p-6 text-center" role="group" aria-label={title}>
      {icon && <div className="empty-icon" aria-hidden="true">{icon}</div>}
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {action && <div className="empty-state__action">{action}</div>}
    </div>
  );
}

function ErrorState({ message, action }) {
  if (!message) return null;

  return (
    <div className="error-message ui-error-state flex items-start gap-3 rounded-lg border px-4 py-3 text-sm" role="alert">
      <span className="error-state__icon" aria-hidden="true">!</span>
      <p>{message}</p>
      {action && <div className="error-state__action">{action}</div>}
    </div>
  );
}


/* ==========================================================
   SERVICE ICON
========================================================== */

function getServiceIcon(
  service
) {
  const name =
    String(
      service.service ||
        ""
    ).toLowerCase();


  if (
    name.includes("mysql") ||
    name.includes("database")
  ) {
    return "DB";
  }


  if (
    name.includes("flask") ||
    name.includes("backend")
  ) {
    return "API";
  }


  if (
    name.includes("react") ||
    name.includes("frontend")
  ) {
    return "UI";
  }


  return "SRV";
}


/* ==========================================================
   EXPORT
========================================================== */

export default App;
