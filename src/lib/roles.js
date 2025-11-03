// Coaching Module Roles
export const COACHING_ROLES = {
  PROGRAMME_DIRECTOR: "programme_director",
  PROGRAMME_MANAGER: "programme_manager",
  COACH: "coach",
  DATA_TEAM: "data_team",
  SITE_COORDINATOR: "site_coordinator",
};

// Tournament Module Roles
export const TOURNAMENT_ROLES = {
  TOURNAMENT_DIRECTOR: "tournament_director",
  TEAM_MANAGER: "team_manager",
  PLAYER: "player",
  VOLUNTEER: "volunteer",
  SCORING_TEAM: "scoring_team",
  SPONSOR: "sponsor",
  SPECTATOR: "spectator",
};

export const getRoleLabel = (role) => {
  const labels = {
    programme_director: "Programme Director",
    programme_manager: "Programme Manager",
    coach: "Coach",
    data_team: "Data Team",
    site_coordinator: "Site Coordinator",
    tournament_director: "Tournament Director",
    team_manager: "Team Manager",
    player: "Player",
    volunteer: "Volunteer",
    scoring_team: "Scoring Team",
    sponsor: "Sponsor",
    spectator: "Spectator",
  };
  return labels[role] || role;
};

export const getModuleForRole = (role) => {
  if (Object.values(COACHING_ROLES).includes(role)) return "coaching";
  if (Object.values(TOURNAMENT_ROLES).includes(role)) return "tournament";
  return null;
};
