export const TOURNAMENT_STATUS = {
  DRAFT: "draft",
  REGISTRATION_OPEN: "registration_open",
  REGISTRATION_CLOSED: "registration_closed",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

export const TOURNAMENT_FORMATS = {
  ROUND_ROBIN: "round_robin",
  ELIMINATION: "elimination",
  POOL_PLAY: "pool_play",
  SWISS: "swiss",
};

export const AGE_DIVISIONS = [
  "U10",
  "U12",
  "U14",
  "U17",
  "U20",
  "Open",
  "Mixed",
  "Women",
  "Masters",
];

export const getStatusColor = (status) => {
  const colors = {
    draft: "bg-gray-500 hover:bg-gray-600",
    registration_open: "bg-green-500 hover:bg-green-600",
    registration_closed: "bg-yellow-500 hover:bg-yellow-600",
    in_progress: "bg-blue-500 hover:bg-blue-600",
    completed: "bg-purple-500 hover:bg-purple-600",
    cancelled: "bg-red-500 hover:bg-red-600",
  };
  return colors[status] || "bg-gray-500";
};

export const getStatusTextColor = (status) => {
  const colors = {
    draft: "text-gray-600",
    registration_open: "text-green-600",
    registration_closed: "text-yellow-600",
    in_progress: "text-blue-600",
    completed: "text-purple-600",
    cancelled: "text-red-600",
  };
  return colors[status] || "text-gray-600";
};

export const getStatusLabel = (status) => {
  if (!status) return "Unknown";
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export const canRegisterForTournament = (tournament) => {
  if (!tournament) return false;
  if (tournament.status !== "registration_open") return false;

  if (tournament.registration_deadline) {
    const deadline = new Date(tournament.registration_deadline);
    const now = new Date();
    if (deadline < now) return false;
  }

  return true;
};

export const isRegistrationOpen = (tournament) => {
  if (!tournament) return false;
  return (
    tournament.status === "registration_open" &&
    (!tournament.registration_deadline ||
      new Date(tournament.registration_deadline) > new Date())
  );
};

export const formatDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) return "TBD";

  const start = new Date(startDate);
  const end = new Date(endDate);

  const options = { month: "short", day: "numeric", year: "numeric" };

  if (start.toDateString() === end.toDateString()) {
    return start.toLocaleDateString("en-US", options);
  }

  // Same month and year
  if (
    start.getMonth() === end.getMonth() &&
    start.getFullYear() === end.getFullYear()
  ) {
    return `${start.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })} - ${end.getDate()}, ${end.getFullYear()}`;
  }

  return `${start.toLocaleDateString(
    "en-US",
    options
  )} - ${end.toLocaleDateString("en-US", options)}`;
};

export const formatDate = (date) => {
  if (!date) return "TBD";
  return new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

export const formatTime = (time) => {
  if (!time) return "TBD";
  return new Date(time).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

export const getDaysUntil = (date) => {
  if (!date) return null;
  const target = new Date(date);
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 3600 * 24));
};

export const getTournamentProgress = (tournament) => {
  if (!tournament) return { label: "Unknown", progress: 0 };

  const now = new Date();
  const start = new Date(tournament.start_date);
  const end = new Date(tournament.end_date);

  if (now < start) {
    const total = start.getTime() - new Date(tournament.created_at).getTime();
    const elapsed = now.getTime() - new Date(tournament.created_at).getTime();
    const progress = Math.min(Math.max((elapsed / total) * 100, 0), 100);
    return { label: "Upcoming", progress: Math.round(progress) };
  }

  if (now > end) {
    return { label: "Completed", progress: 100 };
  }

  const total = end.getTime() - start.getTime();
  const elapsed = now.getTime() - start.getTime();
  const progress = (elapsed / total) * 100;
  return { label: "In Progress", progress: Math.round(progress) };
};

export const getRegistrationStatusLabel = (status) => {
  const labels = {
    pending: {
      text: "Pending Approval",
      color: "text-yellow-600",
      bg: "bg-yellow-100",
    },
    approved: { text: "Approved", color: "text-green-600", bg: "bg-green-100" },
    rejected: { text: "Rejected", color: "text-red-600", bg: "bg-red-100" },
    withdrawn: { text: "Withdrawn", color: "text-gray-600", bg: "bg-gray-100" },
  };
  return labels[status] || labels.pending;
};

export const validateTournamentData = (data) => {
  const errors = {};

  if (!data.name || data.name.trim().length < 3) {
    errors.name = "Tournament name must be at least 3 characters";
  }

  if (!data.location || data.location.trim().length < 3) {
    errors.location = "Location is required";
  }

  if (!data.start_date) {
    errors.start_date = "Start date is required";
  }

  if (!data.end_date) {
    errors.end_date = "End date is required";
  }

  if (data.start_date && data.end_date) {
    if (new Date(data.end_date) < new Date(data.start_date)) {
      errors.end_date = "End date must be after start date";
    }
  }

  if (data.registration_deadline && data.start_date) {
    if (new Date(data.registration_deadline) >= new Date(data.start_date)) {
      errors.registration_deadline =
        "Registration deadline must be before start date";
    }
  }

  if (data.max_teams && data.max_teams < 2) {
    errors.max_teams = "Tournament must allow at least 2 teams";
  }

  if (!data.age_divisions || data.age_divisions.length === 0) {
    errors.age_divisions = "At least one age division is required";
  }

  return Object.keys(errors).length > 0 ? errors : null;
};
