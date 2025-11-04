export const MATCH_STATUS = {
  SCHEDULED: "scheduled",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

export const BRACKET_TYPES = {
  ROUND_ROBIN: "round_robin",
  ELIMINATION: "elimination",
  POOL: "pool",
  PLACEMENT: "placement",
};

export const getMatchStatusColor = (status) => {
  const colors = {
    scheduled: "bg-gray-500 hover:bg-gray-600",
    in_progress: "bg-blue-500 hover:bg-blue-600",
    completed: "bg-green-500 hover:bg-green-600",
    cancelled: "bg-red-500 hover:bg-red-600",
  };
  return colors[status] || "bg-gray-500";
};

export const getMatchStatusTextColor = (status) => {
  const colors = {
    scheduled: "text-gray-600",
    in_progress: "text-blue-600",
    completed: "text-green-600",
    cancelled: "text-red-600",
  };
  return colors[status] || "text-gray-600";
};

export const getMatchStatusLabel = (status) => {
  const labels = {
    scheduled: "Scheduled",
    in_progress: "Live",
    completed: "Final",
    cancelled: "Cancelled",
  };
  return labels[status] || status;
};

export const formatMatchTime = (scheduledTime) => {
  if (!scheduledTime) return "TBD";
  return new Date(scheduledTime).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

export const formatMatchDate = (scheduledTime) => {
  if (!scheduledTime) return "TBD";
  return new Date(scheduledTime).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};

export const formatMatchDateTime = (scheduledTime) => {
  if (!scheduledTime) return "TBD";
  const date = new Date(scheduledTime);
  return `${date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })} at ${date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })}`;
};

export const getMatchResult = (match, teamId) => {
  if (!match || match.status !== "completed") return null;

  if (match.winner_id === teamId) return "win";
  if (match.winner_id && match.winner_id !== teamId) return "loss";
  return "tie";
};

export const getTeamScore = (match, teamId) => {
  if (!match) return 0;
  if (match.team1_id === teamId) return match.team1_score || 0;
  if (match.team2_id === teamId) return match.team2_score || 0;
  return 0;
};

export const getOpponentScore = (match, teamId) => {
  if (!match) return 0;
  if (match.team1_id === teamId) return match.team2_score || 0;
  if (match.team2_id === teamId) return match.team1_score || 0;
  return 0;
};

export const isMatchLive = (match) => {
  return match?.status === "in_progress";
};

export const isMatchUpcoming = (match) => {
  if (!match || !match.scheduled_time) return false;
  return (
    match.status === "scheduled" && new Date(match.scheduled_time) > new Date()
  );
};

export const isMatchCompleted = (match) => {
  return match?.status === "completed";
};

// Generate Round Robin Schedule
export const generateRoundRobinSchedule = (teams, fieldsCount = 1) => {
  if (!teams || teams.length < 2) return [];

  const matches = [];
  const n = teams.length;
  const rounds = n % 2 === 0 ? n - 1 : n;

  let teamList = [...teams];

  // Add bye if odd number of teams
  if (n % 2 !== 0) {
    teamList.push(null);
  }

  const totalTeams = teamList.length;

  for (let round = 0; round < rounds; round++) {
    const roundMatches = [];

    for (let i = 0; i < totalTeams / 2; i++) {
      const home = teamList[i];
      const away = teamList[totalTeams - 1 - i];

      if (home && away) {
        roundMatches.push({
          round_number: round + 1,
          round_name: `Round ${round + 1}`,
          team1_id: home.id,
          team2_id: away.id,
          match_number: roundMatches.length + 1,
          bracket_type: "round_robin",
        });
      }
    }

    matches.push(...roundMatches);

    // Rotate teams (keep first team fixed, rotate others)
    teamList = [
      teamList[0],
      teamList[totalTeams - 1],
      ...teamList.slice(1, totalTeams - 1),
    ];
  }

  // Assign fields
  matches.forEach((match, index) => {
    match.field_number = (index % fieldsCount) + 1;
  });

  return matches;
};

// Generate Single Elimination Bracket
export const generateEliminationBracket = (teams) => {
  if (!teams || teams.length < 2) return [];

  const matches = [];
  const teamCount = teams.length;

  // Find next power of 2
  const bracketSize = Math.pow(2, Math.ceil(Math.log2(teamCount)));
  const byeCount = bracketSize - teamCount;

  // Add byes
  const bracketTeams = [...teams];
  for (let i = 0; i < byeCount; i++) {
    bracketTeams.push(null);
  }

  // Generate first round
  let roundNumber = 1;
  let currentRound = [];

  for (let i = 0; i < bracketTeams.length; i += 2) {
    if (bracketTeams[i] && bracketTeams[i + 1]) {
      currentRound.push({
        round_number: roundNumber,
        round_name: getRoundName(roundNumber, bracketSize),
        team1_id: bracketTeams[i].id,
        team2_id: bracketTeams[i + 1].id,
        match_number: currentRound.length + 1,
        bracket_type: "elimination",
      });
    } else if (bracketTeams[i]) {
      // Team gets a bye, advance to next round
      currentRound.push({
        round_number: roundNumber,
        round_name: getRoundName(roundNumber, bracketSize),
        team1_id: bracketTeams[i].id,
        team2_id: null,
        winner_id: bracketTeams[i].id,
        match_number: currentRound.length + 1,
        bracket_type: "elimination",
        status: "completed",
      });
    }
  }

  matches.push(...currentRound);

  // Generate subsequent rounds (placeholders)
  while (currentRound.length > 1) {
    roundNumber++;
    const nextRound = [];

    for (let i = 0; i < currentRound.length; i += 2) {
      nextRound.push({
        round_number: roundNumber,
        round_name: getRoundName(roundNumber, bracketSize),
        team1_id: null,
        team2_id: null,
        match_number: nextRound.length + 1,
        bracket_type: "elimination",
        is_final: nextRound.length === 0 && currentRound.length === 2,
      });
    }

    matches.push(...nextRound);
    currentRound = nextRound;
  }

  return matches;
};

const getRoundName = (roundNumber, bracketSize) => {
  const totalRounds = Math.log2(bracketSize);
  const roundsFromEnd = totalRounds - roundNumber + 1;

  if (roundsFromEnd === 1) return "Final";
  if (roundsFromEnd === 2) return "Semifinals";
  if (roundsFromEnd === 3) return "Quarterfinals";

  return `Round ${roundNumber}`;
};

// Calculate team statistics
export const calculateTeamStats = (matches, teamId) => {
  if (!matches || !teamId) {
    return {
      played: 0,
      wins: 0,
      losses: 0,
      ties: 0,
      pointsFor: 0,
      pointsAgainst: 0,
      pointDiff: 0,
      winRate: 0,
    };
  }

  const teamMatches = matches.filter(
    (m) =>
      m.status === "completed" &&
      (m.team1_id === teamId || m.team2_id === teamId)
  );

  let wins = 0;
  let losses = 0;
  let ties = 0;
  let pointsFor = 0;
  let pointsAgainst = 0;

  teamMatches.forEach((match) => {
    const isTeam1 = match.team1_id === teamId;
    const teamScore = isTeam1 ? match.team1_score || 0 : match.team2_score || 0;
    const oppScore = isTeam1 ? match.team2_score || 0 : match.team1_score || 0;

    pointsFor += teamScore;
    pointsAgainst += oppScore;

    if (match.winner_id === teamId) {
      wins++;
    } else if (match.winner_id && match.winner_id !== teamId) {
      losses++;
    } else {
      ties++;
    }
  });

  const played = teamMatches.length;
  const winRate = played > 0 ? (wins / played) * 100 : 0;

  return {
    played,
    wins,
    losses,
    ties,
    pointsFor,
    pointsAgainst,
    pointDiff: pointsFor - pointsAgainst,
    winRate: Math.round(winRate),
  };
};

// Distribute matches across time slots
export const distributeMatchesAcrossTime = (
  matches,
  startTime,
  matchDuration = 90,
  breakDuration = 10
) => {
  if (!matches || matches.length === 0) return matches;

  const scheduledMatches = [...matches];
  let currentTime = new Date(startTime);

  scheduledMatches.forEach((match) => {
    match.scheduled_time = new Date(currentTime);
    currentTime = new Date(
      currentTime.getTime() + (matchDuration + breakDuration) * 60000
    );
  });

  return scheduledMatches;
};
