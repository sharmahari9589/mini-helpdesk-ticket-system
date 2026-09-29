import { useState } from "react";
import {
  LifeBuoy,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Plus,
  MessageSquareText,
  Activity,
  Inbox,
  Clock3,
  Check,
  CircleHelp,
  TicketCheck,
  ArrowLeft,
  CheckCircle2,
  Search,
  Trash2,
  Send,
  X,
} from "lucide-react";
import { request } from "./api/client.js";
import { Priority, Status } from "./components/TicketBadges.jsx";
import {
  formatDate as fmtDate,
  getInitials as initials,
} from "./utils/formatters.js";

export function AuthScreen({ mode, setMode, onSubmit, error }) {
  return (
    <div className="auth-layout">
      <div className="auth-brand">
        <div className="brand-icon">
          <LifeBuoy size={21} />
        </div>
        <span>
          relay<span className="brand-dot">.</span>
        </span>
      </div>
      <div className="auth-left">
        <div className="auth-copy">
          <div className="eyebrow">
            <span /> SUPPORT, MADE SIMPLE
          </div>
          <h1>
            Good help
            <br />
            should feel <em>effortless.</em>
          </h1>
          <p>
            A calmer way to get the answers you need. Raise a ticket and we’ll
            take it from here.
          </p>
          <div className="auth-proof">
            <div className="proof-avatars">
              <i>JM</i>
              <i>AK</i>
              <i>RL</i>
              <i>+</i>
            </div>
            <span>Trusted by teams who care</span>
          </div>
        </div>
        <div className="auth-footer">
          © 2025 Relay Support <span>•</span> Built for better conversations
        </div>
      </div>
      <div className="auth-right">
        <form className="auth-form" onSubmit={onSubmit}>
          <div className="form-icon">
            <ShieldCheck size={20} />
          </div>
          <h2>{mode === "login" ? "Welcome back" : "Create your account"}</h2>
          <p className="auth-sub">
            {mode === "login"
              ? "Sign in to manage your support requests."
              : "Get started with your support workspace."}
          </p>
          {error && <div className="inline-error">{error}</div>}
          {mode === "register" && (
            <label>
              Full name
              <input
                name="name"
                placeholder="e.g. Alex Morgan"
                minLength="2"
                required
              />
            </label>
          )}
          <label>
            Email address
            <input
              name="email"
              type="email"
              placeholder="you@company.com"
              required
            />
          </label>
          <label>
            Password
            <input
              name="password"
              type="password"
              placeholder="At least 8 characters"
              minLength="8"
              required
            />
          </label>
          {mode === "login" && (
            <div className="forgot-row">
              <span>Protected by secure sign in</span>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  alert("Ask your workspace admin to reset your password.");
                }}
              >
                Forgot password?
              </a>
            </div>
          )}
          <button className="primary-btn auth-submit">
            {mode === "login" ? "Sign in" : "Create account"}
            <ArrowRight size={16} />
          </button>
          <div className="auth-switch">
            {mode === "login"
              ? "Don't have an account?"
              : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => setMode(mode === "login" ? "register" : "login")}
            >
              {mode === "login" ? "Create one" : "Sign in"}
            </button>
          </div>
          {mode === "login" && (
            <div className="demo-note">
              <Sparkles size={14} />
              <span>
                Demo admin: <b>admin@helpdesk.local</b> / <b>Admin123!</b>
              </span>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export function HomeView({
  tickets,
  user,
  loading,
  error,
  openTicket,
  ticketFilter,
  setTicketFilter,
  onCreate,
  onRefresh,
}) {
  const open = tickets.filter((ticket) => ticket.status === "Open").length;
  const active = tickets.filter(
    (ticket) => ticket.status !== "Resolved",
  ).length;
  const resolved = tickets.length - active;
  const visibleTickets = tickets.filter(
    (ticket) =>
      ticketFilter === "All" ||
      (ticketFilter === "Open" && ticket.status === "Open") ||
      ticket.status === ticketFilter,
  );
  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  return (
    <>
      <div className="welcome-row">
        <div>
          <div className="page-kicker">{today.toUpperCase()}</div>
          <h1>
            Good afternoon, {user.name.split(" ")[0]}{" "}
            <span className="wave">✳</span>
          </h1>
          <p>Here’s what’s happening with your support requests.</p>
        </div>
        <button className="primary-btn" onClick={onCreate}>
          <Plus size={17} /> New ticket
        </button>
      </div>
      <div className="welcome-banner">
        <div className="banner-icon">
          <MessageSquareText size={21} />
        </div>
        <div className="banner-text">
          <b>We’re here to help.</b>
          <span>
            Tell us what’s going on and our team will get back to you shortly.
          </span>
        </div>
        <div className="banner-art">
          <div className="art-bubble bubble-one">
            <span>Hey! 👋</span>
          </div>
          <div className="art-bubble bubble-two">
            <span>How can we help?</span>
          </div>
          <div className="art-orb">
            <LifeBuoy size={22} />
          </div>
        </div>
      </div>
      <div className="section-heading">
        <div>
          <h2>
            Your tickets <span className="small-pill">{tickets.length}</span>
          </h2>
          <p>Keep track of your conversations with our team.</p>
        </div>
        <button className="text-btn" onClick={onRefresh}>
          <Activity size={15} /> Refresh
        </button>
      </div>
      <div className="ticket-summary">
        <div className="summary-item">
          <div className="summary-icon purple">
            <Inbox size={16} />
          </div>
          <div>
            <b>{tickets.length}</b>
            <small>Total requests</small>
          </div>
        </div>
        <div className="summary-divider" />
        <div className="summary-item">
          <div className="summary-icon amber">
            <Clock3 size={16} />
          </div>
          <div>
            <b>{active}</b>
            <small>Awaiting resolution</small>
          </div>
        </div>
        <div className="summary-divider" />
        <div className="summary-item">
          <div className="summary-icon green">
            <Check size={16} />
          </div>
          <div>
            <b>{resolved}</b>
            <small>Resolved</small>
          </div>
        </div>
      </div>
      <div className="list-toolbar">
        <div className="tabs">
          <button
            className={`tab ${ticketFilter === "All" ? "active" : ""}`}
            onClick={() => setTicketFilter("All")}
          >
            All tickets <span>{tickets.length}</span>
          </button>
          <button
            className={`tab ${ticketFilter === "Open" ? "active" : ""}`}
            onClick={() => setTicketFilter("Open")}
          >
            Open <span>{open}</span>
          </button>
          <button
            className={`tab ${ticketFilter === "Resolved" ? "active" : ""}`}
            onClick={() => setTicketFilter("Resolved")}
          >
            Resolved <span>{resolved}</span>
          </button>
        </div>
      </div>
      {loading ? (
        <div className="loading">
          <span className="spinner" />
          Loading your tickets…
        </div>
      ) : error ? (
        <div className="empty-state">
          <CircleHelp size={26} />
          <b>Couldn’t load tickets</b>
          <span>{error}</span>
          <button className="text-btn" onClick={onRefresh}>
            Try again
          </button>
        </div>
      ) : visibleTickets.length ? (
        <div className="ticket-table">
          <div className="table-head">
            <span>SUBJECT</span>
            <span>STATUS</span>
            <span>PRIORITY</span>
            <span>LAST UPDATED</span>
            <span />
          </div>
          {visibleTickets.map((t) => (
            <button
              className="ticket-row"
              key={t.id}
              onClick={() => openTicket(t)}
            >
              <div className="ticket-subject">
                <div
                  className={`ticket-icon ${t.status === "Resolved" ? "resolved" : ""}`}
                >
                  <TicketCheck size={17} />
                </div>
                <div>
                  <b>{t.title}</b>
                  <small>
                    {t.category} <span>·</span> #{String(t.id).padStart(4, "0")}
                  </small>
                </div>
              </div>
              <div>
                <Status status={t.status} />
              </div>
              <div>
                <Priority priority={t.priority} />
              </div>
              <span className="updated-date">{fmtDate(t.updated_at)}</span>
              <ArrowRight className="row-arrow" size={16} />
            </button>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-art">
            <Inbox size={25} />
          </div>
          <b>{tickets.length ? "No tickets in this view" : "No tickets yet"}</b>
          <span>
            {tickets.length
              ? "Try another status to find the ticket you need."
              : "When you need a hand, your requests will show up here."}
          </span>
          {tickets.length ? (
            <button className="text-btn" onClick={() => setTicketFilter("All")}>
              Show all tickets
            </button>
          ) : (
            <button className="primary-btn" onClick={onCreate}>
              <Plus size={16} /> Create your first ticket
            </button>
          )}
        </div>
      )}
      <div className="page-foot">
        <span>
          Showing <b>{visibleTickets.length}</b> of <b>{tickets.length}</b>{" "}
          tickets
        </span>
        <div>
          <button disabled>
            <ArrowLeft size={14} />
          </button>
          <button className="page-number">1</button>
          <button disabled>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </>
  );
}

export function AdminView({
  tickets,
  stats,
  loading,
  error,
  filters,
  setFilters,
  openTicket,
  onStatus,
  onRefresh,
}) {
  const filtered = tickets.filter(
    (t) =>
      (!filters.status || t.status === filters.status) &&
      (!filters.priority || t.priority === filters.priority) &&
      (!filters.search ||
        t.title.toLowerCase().includes(filters.search.toLowerCase())),
  );
  return (
    <>
      <div className="welcome-row admin-welcome">
        <div>
          <div className="page-kicker">WORKSPACE OVERVIEW</div>
          <h1>
            Admin dashboard <span className="wave">✦</span>
          </h1>
          <p>Monitor incoming requests and keep your team moving.</p>
        </div>
        <button className="outline-btn" onClick={onRefresh}>
          <Activity size={15} /> Refresh data
        </button>
      </div>
      <div className="stats-grid">
        <StatCard
          label="Total tickets"
          value={stats.total}
          icon={<TicketCheck size={18} />}
          tone="violet"
          trend="All time"
        />
        <StatCard
          label="Open"
          value={stats.open}
          icon={<Inbox size={18} />}
          tone="blue"
          trend="Needs attention"
        />
        <StatCard
          label="In progress"
          value={stats.inProgress}
          icon={<Clock3 size={18} />}
          tone="amber"
          trend="Being worked on"
        />
        <StatCard
          label="Resolved"
          value={stats.resolved}
          icon={<CheckCircle2 size={18} />}
          tone="green"
          trend="Successfully closed"
        />
      </div>
      <div className="admin-lower">
        <div className="admin-list-card">
          <div className="admin-card-head">
            <div>
              <h2>All tickets</h2>
              <p>Review and manage every support request.</p>
            </div>
            <span className="live-badge">
              <i /> Live queue
            </span>
          </div>
          <div className="admin-filters">
            <div className="search-field">
              <Search size={15} />
              <input
                placeholder="Search by title…"
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
              />
            </div>
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
            >
              <option value="">All statuses</option>
              <option>Open</option>
              <option>In Progress</option>
              <option>Resolved</option>
            </select>
            <select
              value={filters.priority}
              onChange={(e) =>
                setFilters({ ...filters, priority: e.target.value })
              }
            >
              <option value="">All priorities</option>
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>
          {loading ? (
            <div className="loading">
              <span className="spinner" />
              Loading tickets…
            </div>
          ) : error ? (
            <div className="empty-state">{error}</div>
          ) : (
            <div className="admin-table">
              <div className="admin-table-head">
                <span>REQUEST</span>
                <span>REQUESTER</span>
                <span>PRIORITY</span>
                <span>STATUS</span>
              </div>
              {filtered.map((t) => (
                <div className="admin-row" key={t.id}>
                  <button
                    className="admin-ticket-link"
                    onClick={() => openTicket(t)}
                  >
                    <b>{t.title}</b>
                    <small>
                      {t.category} · #{String(t.id).padStart(4, "0")}
                    </small>
                  </button>
                  <div className="requester">
                    <span className="mini-avatar">{initials(t.requester)}</span>
                    <span>{t.requester}</span>
                  </div>
                  <Priority priority={t.priority} />
                  <select
                    className={`status-select select-${t.status.toLowerCase().replace(" ", "-")}`}
                    value={t.status}
                    onChange={(e) => onStatus(t.id, e.target.value)}
                  >
                    <option>Open</option>
                    <option>In Progress</option>
                    <option>Resolved</option>
                  </select>
                </div>
              ))}
              {!filtered.length && (
                <div className="empty-filter">
                  No tickets match these filters.
                </div>
              )}
            </div>
          )}
          <div className="card-foot">
            Showing {filtered.length} of {tickets.length} requests{" "}
            <button
              onClick={() =>
                setFilters({ status: "", priority: "", search: "" })
              }
            >
              Clear filters
            </button>
          </div>
        </div>
        <div className="right-rail">
          <div className="health-card">
            <div className="health-heading">
              <span className="health-icon">
                <Activity size={17} />
              </span>
              <span>
                <b>Queue health</b>
                <small>Right now</small>
              </span>
              <span className="health-dot" />
            </div>
            <div className="health-score">
              <b>
                {stats.open === 0
                  ? "Clear"
                  : stats.open < 5
                    ? "Looking good"
                    : "Needs focus"}
              </b>
              <span>
                Based on {stats.open} open request{stats.open === 1 ? "" : "s"}
              </span>
            </div>
            <div className="health-bar">
              <i
                style={{
                  width: `${Math.max(8, 100 - Math.min(stats.open * 12, 80))}%`,
                }}
              />
            </div>
            <div className="health-foot">
              <span>Queue capacity</span>
              <b>{Math.max(20, 100 - Math.min(stats.open * 12, 80))}%</b>
            </div>
          </div>
          <div className="tips-card">
            <div className="tips-icon">
              <Sparkles size={17} />
            </div>
            <b>Small things matter</b>
            <p>
              Quick, thoughtful replies make all the difference. Keep your queue
              moving!
            </p>
            <div className="tips-bottom">
              <span>TEAM TIP</span>
              <ArrowRight size={15} />
            </div>
          </div>
          <div className="admin-note">
            <ShieldCheck size={16} />
            <span>
              You’re viewing the admin workspace. Changes to status are visible
              to the requester.
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

export function StatCard({ label, value, icon, tone, trend }) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <span className={`stat-icon ${tone}`}>{icon}</span>
        <span className="stat-menu">···</span>
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      <div className="stat-trend">
        <span className={`trend-dot ${tone}`} />
        {trend}
      </div>
    </div>
  );
}

export function TicketDetail({ ticket, user, onBack, onStatus, onDelete }) {
  return (
    <>
      <button className="back-link" onClick={onBack}>
        <ArrowLeft size={16} /> Back to tickets
      </button>
      <div className="detail-layout">
        <div className="detail-main">
          <div className="detail-title-row">
            <div>
              <div className="page-kicker">
                TICKET #{String(ticket.id).padStart(4, "0")} <span>·</span>{" "}
                {ticket.category.toUpperCase()}
              </div>
              <h1>{ticket.title}</h1>
              <p>
                Created {fmtDate(ticket.created_at)} by{" "}
                {ticket.requester || user.name}
              </p>
            </div>
            <button
              className="more-btn"
              onClick={() => onDelete(ticket.id)}
              title="Delete ticket"
            >
              <Trash2 size={17} />
            </button>
          </div>
          <div className="detail-card">
            <div className="conversation-head">
              <div className="conversation-icon">
                <MessageSquareText size={17} />
              </div>
              <div>
                <b>Conversation</b>
                <small>Ticket #{String(ticket.id).padStart(4, "0")}</small>
              </div>
              <span className="conversation-count">1 message</span>
            </div>
            <div className="message">
              <div className="avatar message-avatar">
                {initials(ticket.requester || user.name)}
              </div>
              <div className="message-content">
                <div className="message-meta">
                  <b>{ticket.requester || user.name}</b>
                  <span>{fmtDate(ticket.created_at)}</span>
                  <em>{ticket.requester ? "Requester" : "You"}</em>
                </div>
                <div className="message-body">{ticket.description}</div>
              </div>
            </div>
            <div className="reply-box">
              <textarea placeholder="Write a reply… (coming soon)" disabled />
              <button className="primary-btn" disabled>
                <Send size={15} /> Reply
              </button>
            </div>
          </div>
          <div className="detail-note">
            <Sparkles size={17} />
            <div>
              <b>We’ve got this.</b>
              <span>
                Your team has been notified and will follow up as soon as
                possible.
              </span>
            </div>
          </div>
        </div>
        <aside className="detail-side">
          <div className="side-card">
            <h3>Ticket details</h3>
            <div className="detail-property">
              <span>Status</span>
              {user.role === "admin" ? (
                <select
                  className={`status-select select-${ticket.status.toLowerCase().replace(" ", "-")}`}
                  value={ticket.status}
                  onChange={(e) => onStatus(ticket.id, e.target.value)}
                >
                  <option>Open</option>
                  <option>In Progress</option>
                  <option>Resolved</option>
                </select>
              ) : (
                <Status status={ticket.status} />
              )}
            </div>
            <div className="detail-property">
              <span>Priority</span>
              <Priority priority={ticket.priority} />
            </div>
            <div className="detail-property">
              <span>Category</span>
              <b>{ticket.category}</b>
            </div>
            <div className="detail-property">
              <span>Created</span>
              <b>{fmtDate(ticket.created_at)}</b>
            </div>
            <div className="detail-property">
              <span>Updated</span>
              <b>{fmtDate(ticket.updated_at)}</b>
            </div>
          </div>
          <div className="side-card requester-card">
            <h3>Requester</h3>
            <div className="requester-profile">
              <div className="avatar">
                {initials(ticket.requester || user.name)}
              </div>
              <div>
                <b>{ticket.requester || user.name}</b>
                <small>{ticket.requester_email || user.email}</small>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}

export function CreateModal({ onClose, onCreated }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    const f = new FormData(e.currentTarget);
    const data = Object.fromEntries(f);
    try {
      await request("/tickets", { method: "POST", body: JSON.stringify(data) });
      onCreated();
    } catch (e) {
      setError(e.message);
      setBusy(false);
    }
  };
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <form className="modal" onSubmit={submit}>
        <div className="modal-head">
          <div>
            <div className="form-icon">
              <Plus size={19} />
            </div>
            <h2>Raise a ticket</h2>
            <p>Tell us what you need help with.</p>
          </div>
          <button type="button" className="icon-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        {error && <div className="inline-error">{error}</div>}
        <label>
          Subject
          <input
            name="title"
            placeholder="What can we help with?"
            minLength="4"
            maxLength="120"
            required
          />
        </label>
        <label>
          Category
          <select name="category" required>
            <option value="">Choose a category</option>
            <option>Account & access</option>
            <option>Billing</option>
            <option>Technical issue</option>
            <option>Feature request</option>
            <option>Other</option>
          </select>
        </label>
        <label>
          Priority
          <select name="priority" defaultValue="Medium">
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
        </label>
        <label>
          Description
          <textarea
            name="description"
            placeholder="Share a few details so we can help faster…"
            minLength="10"
            maxLength="5000"
            required
          />
        </label>
        <div className="modal-actions">
          <button className="outline-btn" type="button" onClick={onClose}>
            Cancel
          </button>
          <button className="primary-btn" disabled={busy}>
            {busy ? (
              <>
                <span className="spinner small" /> Sending…
              </>
            ) : (
              <>
                Submit ticket <ArrowRight size={15} />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
