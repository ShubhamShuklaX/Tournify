export const SPIRIT_CATEGORIES = [
  {
    key: "rules_knowledge",
    label: "Rules Knowledge & Use",
    description: "Did the opposing team know & apply the rules properly?",
    helpText:
      "Consider: Did they know the rules? Were calls and contests correct?",
  },
  {
    key: "fouls_body_contact",
    label: "Fouls & Body Contact",
    description:
      "Did the team avoid fouls, play safely, and resolve contact fairly?",
    helpText:
      "Consider: Did they avoid dangerous plays? How did they handle contact situations?",
  },
  {
    key: "fair_mindedness",
    label: "Fair-Mindedness",
    description:
      "Did the team show respect and fair attitude in contentious situations?",
    helpText:
      "Consider: Were they open to opposing perspectives? Did they show good faith?",
  },
  {
    key: "positive_attitude",
    label: "Positive Attitude & Self-Control",
    description:
      "Did players stay respectful regardless of scoreline or intensity?",
    helpText:
      "Consider: Did they maintain composure? Was their attitude constructive?",
  },
  {
    key: "communication",
    label: "Communication",
    description:
      "Did the team communicate clearly and effectively, especially in resolving disputes?",
    helpText:
      "Consider: Were they clear and concise? Did they listen actively?",
  },
];

// Spirit scoring scale (0-4 for each category)
export const SPIRIT_SCALE = [
  {
    value: 0,
    label: "0 - Very Poor",
    description: "Serious recurring issues",
    color: "bg-red-600 hover:bg-red-700 text-white",
    textColor: "text-red-600",
    borderColor: "border-red-600",
  },
  {
    value: 1,
    label: "1 - Poor",
    description: "Issues in this category",
    color: "bg-orange-500 hover:bg-orange-600 text-white",
    textColor: "text-orange-600",
    borderColor: "border-orange-500",
  },
  {
    value: 2,
    label: "2 - Good (Standard)",
    description: "Normal expected behavior",
    color: "bg-yellow-500 hover:bg-yellow-600 text-white",
    textColor: "text-yellow-600",
    borderColor: "border-yellow-500",
  },
  {
    value: 3,
    label: "3 - Very Good",
    description: "Exceeded expectations",
    color: "bg-blue-500 hover:bg-blue-600 text-white",
    textColor: "text-blue-600",
    borderColor: "border-blue-500",
  },
  {
    value: 4,
    label: "4 - Excellent",
    description: "Exceptional spirit beyond normal",
    color: "bg-green-600 hover:bg-green-700 text-white",
    textColor: "text-green-600",
    borderColor: "border-green-600",
  },
];

// Default spirit value (2 = "Good")
export const DEFAULT_SPIRIT_VALUE = 2;

// Calculate total spirit score (sum of all 5 categories)
export const calculateSpiritTotal = (scores) => {
  if (!scores) return 0;

  const total =
    (scores.rules_knowledge || 0) +
    (scores.fouls_body_contact || 0) +
    (scores.fair_mindedness || 0) +
    (scores.positive_attitude || 0) +
    (scores.communication || 0);

  return total;
};

// Get spirit rating based on total score (0-20)
export const getSpiritRating = (total) => {
  if (total >= 18) {
    return {
      label: "Exceptional",
      color: "text-green-600",
      bgColor: "bg-green-100",
      borderColor: "border-green-600",
      description: "Outstanding Spirit of the Game",
    };
  }
  if (total >= 15) {
    return {
      label: "Very Good",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      borderColor: "border-blue-600",
      description: "Excellent Spirit of the Game",
    };
  }
  if (total >= 10) {
    return {
      label: "Good",
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
      borderColor: "border-yellow-500",
      description: "Acceptable Spirit of the Game",
    };
  }
  if (total >= 6) {
    return {
      label: "Below Average",
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      borderColor: "border-orange-500",
      description: "Needs Improvement",
    };
  }
  return {
    label: "Poor",
    color: "text-red-600",
    bgColor: "bg-red-100",
    borderColor: "border-red-600",
    description: "Significant Spirit Concerns",
  };
};

// Calculate average spirit score for a team across all their matches
export const calculateAverageSpiritScore = (spiritScores) => {
  if (!spiritScores || spiritScores.length === 0) return 0;

  const total = spiritScores.reduce((sum, score) => {
    return sum + (score.total_score || 0);
  }, 0);

  return (total / spiritScores.length).toFixed(1);
};

// Validate spirit score submission
export const validateSpiritScore = (scores) => {
  const errors = {};

  SPIRIT_CATEGORIES.forEach((category) => {
    const value = scores[category.key];

    if (value === undefined || value === null) {
      errors[category.key] = `${category.label} is required`;
    } else if (value < 0 || value > 4) {
      errors[category.key] = "Value must be between 0 and 4";
    }
  });

  return Object.keys(errors).length > 0 ? errors : null;
};

// Initialize spirit score form with default values
export const initializeSpiritScore = () => {
  const scores = {};
  SPIRIT_CATEGORIES.forEach((category) => {
    scores[category.key] = DEFAULT_SPIRIT_VALUE;
  });
  return scores;
};

// Check if spirit score has been submitted for a match
export const hasSpiritScoreBeenSubmitted = (spiritScores, matchId, teamId) => {
  if (!spiritScores || !matchId || !teamId) return false;

  return spiritScores.some(
    (score) => score.match_id === matchId && score.scoring_team_id === teamId
  );
};

// Get spirit score details for display
export const getSpiritScoreDetails = (spiritScore) => {
  if (!spiritScore) return null;

  const total = spiritScore.total_score || calculateSpiritTotal(spiritScore);
  const rating = getSpiritRating(total);

  return {
    total,
    rating,
    categories: SPIRIT_CATEGORIES.map((cat) => ({
      ...cat,
      value: spiritScore[cat.key] || 0,
      scale: SPIRIT_SCALE.find((s) => s.value === spiritScore[cat.key]),
    })),
    comments: spiritScore.comments,
    submitted_at: spiritScore.submitted_at || spiritScore.created_at,
  };
};

// Format spirit score for submission
export const formatSpiritScoreForSubmission = (
  scores,
  matchId,
  scoringTeamId,
  opponentTeamId,
  submittedBy,
  comments
) => {
  return {
    match_id: matchId,
    scoring_team_id: scoringTeamId,
    opponent_team_id: opponentTeamId,
    rules_knowledge: scores.rules_knowledge,
    fouls_body_contact: scores.fouls_body_contact,
    fair_mindedness: scores.fair_mindedness,
    positive_attitude: scores.positive_attitude,
    communication: scores.communication,
    submitted_by: submittedBy,
    comments: comments || null,
    submitted_at: new Date().toISOString(),
  };
};

// Get spirit score summary for a tournament
export const getSpiritScoreSummary = (spiritScores) => {
  if (!spiritScores || spiritScores.length === 0) {
    return {
      average: 0,
      count: 0,
      distribution: {},
    };
  }

  const totals = spiritScores.map((s) => s.total_score || 0);
  const average = totals.reduce((a, b) => a + b, 0) / totals.length;

  const distribution = {
    exceptional: totals.filter((t) => t >= 18).length,
    veryGood: totals.filter((t) => t >= 15 && t < 18).length,
    good: totals.filter((t) => t >= 10 && t < 15).length,
    belowAverage: totals.filter((t) => t >= 6 && t < 10).length,
    poor: totals.filter((t) => t < 6).length,
  };

  return {
    average: average.toFixed(1),
    count: spiritScores.length,
    distribution,
  };
};

// Get color for spirit score value (0-20)
export const getSpiritScoreColor = (score) => {
  if (score >= 18) return "text-green-600 bg-green-100";
  if (score >= 15) return "text-blue-600 bg-blue-100";
  if (score >= 10) return "text-yellow-600 bg-yellow-100";
  if (score >= 6) return "text-orange-600 bg-orange-100";
  return "text-red-600 bg-red-100";
};

// Minimum/Maximum possible scores
export const MIN_SPIRIT_SCORE = 0;
export const MAX_SPIRIT_SCORE = 20;
export const CATEGORIES_COUNT = 5;

// Get progress percentage
export const getSpiritScoreProgress = (score) => {
  return ((score / MAX_SPIRIT_SCORE) * 100).toFixed(0);
};
