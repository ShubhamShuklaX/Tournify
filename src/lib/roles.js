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

// Role Descriptions
export const ROLE_INFO = {
  // Coaching
  programme_director: {
    label: "Programme Director",
    description: "Assigns schools and batches to programme managers",
    module: "coaching",
    level: "admin",
  },
  programme_manager: {
    label: "Programme Manager",
    description: "Manages child profiles, sessions, and generates reports",
    module: "coaching",
    level: "manager",
  },
  coach: {
    label: "Coach / Session Facilitator",
    description: "Records attendance, home visits, and assessments",
    module: "coaching",
    level: "coach",
  },
  data_team: {
    label: "Reporting / Data Team",
    description: "Validates data and generates reports",
    module: "coaching",
    level: "sub_admin",
  },
  site_coordinator: {
    label: "Site Coordinator",
    description: "Monitors site attendance and supports coaches",
    module: "coaching",
    level: "site",
  },

  // Tournament
  tournament_director: {
    label: "Tournament Director",
    description: "Full control over tournaments and operations",
    module: "tournament",
    level: "admin",
  },
  team_manager: {
    label: "Team Manager / Captain",
    description: "Manages team registration and roster",
    module: "tournament",
    level: "team",
  },
  player: {
    label: "Player",
    description: "Views schedules and results",
    module: "tournament",
    level: "read",
  },
  volunteer: {
    label: "Volunteer / Field Official",
    description: "Inputs live scores and marks attendance",
    module: "tournament",
    level: "field",
  },
  scoring_team: {
    label: "Scoring / Tech Team",
    description: "Validates data and ensures accuracy",
    module: "tournament",
    level: "sub_admin",
  },
  sponsor: {
    label: "Sponsor / Partner",
    description: "Accesses branded dashboards",
    module: "tournament",
    level: "read",
  },
  spectator: {
    label: "Spectator / Fan",
    description: "Follows teams and checks live scores",
    module: "tournament",
    level: "public",
  },
};

// Helper functions
export const hasCoachingAccess = (role) => {
  return [
    COACHING_ROLES.PROGRAMME_DIRECTOR,
    COACHING_ROLES.PROGRAMME_MANAGER,
    COACHING_ROLES.COACH,
    COACHING_ROLES.DATA_TEAM,
    COACHING_ROLES.SITE_COORDINATOR,
  ].includes(role);
};

export const hasTournamentAccess = (role) => {
  return [
    TOURNAMENT_ROLES.TOURNAMENT_DIRECTOR,
    TOURNAMENT_ROLES.TEAM_MANAGER,
    TOURNAMENT_ROLES.PLAYER,
    TOURNAMENT_ROLES.VOLUNTEER,
    TOURNAMENT_ROLES.SCORING_TEAM,
    TOURNAMENT_ROLES.SPONSOR,
    TOURNAMENT_ROLES.SPECTATOR,
  ].includes(role);
};

export const getModuleForRole = (role) => {
  if (hasCoachingAccess(role)) return "coaching";
  if (hasTournamentAccess(role)) return "tournament";
  return null;
};

export const getRoleLabel = (role) => {
  return ROLE_INFO[role]?.label || role;
};
