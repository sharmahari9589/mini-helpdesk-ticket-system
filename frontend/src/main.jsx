import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { request } from "./api/client.js";
import { getInitials as initials } from "./utils/formatters.js";
import {
  AdminView,
  AuthScreen,
  CreateModal,
  HomeView,
  TicketDetail,
} from "./views.jsx";

import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Bell,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  Clock3,
  Inbox,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Menu,
  MessageSquareText,
  Plus,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  TicketCheck,
  Trash2,
  X,
} from "lucide-react";
import "./style.css";

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("relay-user") || "null");
  } catch {
    localStorage.removeItem("relay-user");
    localStorage.removeItem("relay-token");
    return null;
  }
}

function App() {
  const [user, setUser] = useState(getStoredUser);
  const [token, setToken] = useState(() => localStorage.getItem("relay-token"));
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
  });
  const [page, setPage] = useState("home");
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [authMode, setAuthMode] = useState("login");
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    search: "",
  });
  const [ticketFilter, setTicketFilter] = useState("All");
  const [showCreate, setShowCreate] = useState(false);
  const [toast, setToast] = useState("");
  const [mobileNav, setMobileNav] = useState(false);
  const notify = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2800);
  };
  const load = async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const [ticketData, ...adminData] = await Promise.all([
        request(
          user?.role === "admin"
            ? "/admin/tickets"
            : "/tickets" + (page === "admin" ? "" : ""),
        ).catch((e) => {
          throw e;
        }),
        ...(user?.role === "admin" ? [request("/admin/stats")] : []),
      ]);
      setTickets(ticketData.tickets || []);
      if (adminData[0]) setStats(adminData[0].stats);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, [token, page, user?.role]);
  const login = async (e) => {
    e.preventDefault();
    setError("");
    const f = new FormData(e.currentTarget);
    try {
      const data = await request(
        authMode === "login" ? "/auth/login" : "/auth/register",
        { method: "POST", body: JSON.stringify(Object.fromEntries(f)) },
      );
      localStorage.setItem("relay-token", data.token);
      localStorage.setItem("relay-user", JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
    } catch (e) {
      setError(e.message);
    }
  };
  const logout = () => {
    localStorage.removeItem("relay-token");
    localStorage.removeItem("relay-user");
    setToken(null);
    setUser(null);
    setPage("home");
    setSelected(null);
  };
  const updateStatus = async (id, status) => {
    try {
      const data = await request(`/tickets/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setTickets((prev) => prev.map((t) => (t.id === id ? data.ticket : t)));
      setSelected(data.ticket);
      notify("Ticket status updated");
    } catch (e) {
      notify(e.message);
    }
  };
  const deleteTicket = async (id) => {
    if (!confirm("Delete this ticket? This cannot be undone.")) return;
    try {
      await request(`/tickets/${id}`, { method: "DELETE" });
      setSelected(null);
      await load();
      notify("Ticket deleted");
    } catch (e) {
      notify(e.message);
    }
  };
  const openTicket = (ticket) => {
    setSelected(ticket);
    setPage("ticket");
  };
  if (!token || !user)
    return (
      <AuthScreen
        mode={authMode}
        setMode={setAuthMode}
        onSubmit={login}
        error={error}
      />
    );
  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNav ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-icon">
            <LifeBuoy size={21} />
          </div>
          <span>
            relay<span className="brand-dot">.</span>
          </span>
          <button
            className="mobile-close icon-btn"
            onClick={() => setMobileNav(false)}
          >
            <X size={17} />
          </button>
        </div>
        <div className="workspace-label">WORKSPACE</div>
        <div className="workspace-select">
          <div className="workspace-mark">N</div>
          <div>
            <b>Northstar Studio</b>
            <small>Free plan</small>
          </div>
          <ChevronDown size={15} />
        </div>
        <div className="nav-section">
          <span className="nav-caption">SUPPORT</span>
          <button
            className={`nav-item ${page === "home" ? "active" : ""}`}
            onClick={() => {
              setPage("home");
              setSelected(null);
              setMobileNav(false);
            }}
          >
            <Inbox size={17} />
            My tickets<span className="nav-count">{tickets.length}</span>
          </button>
          {user.role === "admin" && (
            <button
              className={`nav-item ${page === "admin" ? "active" : ""}`}
              onClick={() => {
                setPage("admin");
                setSelected(null);
                setMobileNav(false);
              }}
            >
              <LayoutDashboard size={17} />
              Admin overview
            </button>
          )}
        </div>
        <div className="sidebar-spacer" />
        <div className="help-card">
          <div className="help-spark">
            <Sparkles size={16} />
          </div>
          <strong>Need a hand?</strong>
          <p>Our support team is always happy to help.</p>
          <button onClick={() => notify("You are already in your helpdesk!")}>
            Contact support <ArrowRight size={14} />
          </button>
        </div>
        <div className="sidebar-bottom">
          <button
            className="nav-item"
            onClick={() => notify("You’re all caught up")}
          >
            <CircleHelp size={17} />
            Help center
          </button>
          <div className="profile">
            <div className="avatar">{initials(user.name)}</div>
            <div className="profile-info">
              <b>{user.name}</b>
              <small>
                {user.role === "admin" ? "Administrator" : "Member"}
              </small>
            </div>
            <button
              className="icon-btn logout-btn"
              title="Sign out"
              onClick={logout}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
      {mobileNav && (
        <div className="scrim" onClick={() => setMobileNav(false)} />
      )}
      <main className="main-area">
        <header className="topbar">
          <button
            className="mobile-menu icon-btn"
            onClick={() => setMobileNav(true)}
          >
            <Menu size={19} />
          </button>
          <div className="crumb">
            <span>Support</span>
            <span className="slash">/</span>
            <b>
              {page === "admin"
                ? "Overview"
                : page === "ticket"
                  ? "Ticket details"
                  : "My tickets"}
            </b>
          </div>
          <div className="top-actions">
            <div className="top-search">
              <Search size={15} />
              <span>Search anything...</span>
              <kbd>⌘ K</kbd>
            </div>
            <button
              className="icon-btn notification"
              onClick={() => notify("You’re all caught up")}
            >
              <Bell size={17} />
              <i />
            </button>
            <div className="top-avatar">{initials(user.name)}</div>
          </div>
        </header>
        <div className="content">
          {page === "ticket" && selected ? (
            <TicketDetail
              ticket={selected}
              user={user}
              onBack={() => setPage("home")}
              onStatus={updateStatus}
              onDelete={deleteTicket}
            />
          ) : page === "admin" ? (
            <AdminView
              tickets={tickets}
              stats={stats}
              loading={loading}
              error={error}
              filters={filters}
              setFilters={setFilters}
              openTicket={openTicket}
              onStatus={updateStatus}
              onRefresh={load}
            />
          ) : (
            <HomeView
              tickets={tickets}
              user={user}
              loading={loading}
              error={error}
              openTicket={openTicket}
              ticketFilter={ticketFilter}
              setTicketFilter={setTicketFilter}
              onCreate={() => setShowCreate(true)}
              onRefresh={load}
            />
          )}
        </div>
      </main>
      {showCreate && (
        <CreateModal
          onClose={() => setShowCreate(false)}
          onCreated={async () => {
            setShowCreate(false);
            await load();
            notify("Your ticket is in the queue");
          }}
        />
      )}
      {toast && (
        <div className="toast">
          <CheckCircle2 size={17} />
          {toast}
        </div>
      )}
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
