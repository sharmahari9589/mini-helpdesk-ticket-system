export function Status({ status }) {
  const modifier = status.toLowerCase().replace(" ", "-");

  return (
    <span className={`status status-${modifier}`}>
      <i />
      {status}
    </span>
  );
}

export function Priority({ priority }) {
  return (
    <span className={`priority priority-${priority.toLowerCase()}`}>
      <i />
      {priority}
    </span>
  );
}
