import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Award, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import {
  SPIRIT_CATEGORIES,
  SPIRIT_SCALE,
  initializeSpiritScore,
  calculateSpiritTotal,
  getSpiritRating,
  formatSpiritScoreForSubmission,
  hasSpiritScoreBeenSubmitted,
} from "@/lib/spiritHelpers";

export default function SpiritScoreForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [match, setMatch] = useState(null);
  const [userTeam, setUserTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [scores, setScores] = useState(initializeSpiritScore());
  const [comments, setComments] = useState("");

  useEffect(() => {
    fetchData();
  }, [id, user]);

  const fetchData = async () => {
    try {
      const { data: matchData, error: matchError } = await supabase
        .from("matches")
        .select(
          `
          *,
          team1:teams!matches_team1_id_fkey(id, name),
          team2:teams!matches_team2_id_fkey(id, name),
          tournament:tournaments(id, name)
        `
        )
        .eq("id", id)
        .single();

      if (matchError) throw matchError;
      setMatch(matchData);

      // Determine which team the user manages
      const { data: teamsData, error: teamsError } = await supabase
        .from("teams")
        .select("id, name")
        .eq("manager_id", user.id)
        .in("id", [matchData.team1_id, matchData.team2_id])
        .single();

      if (teamsError) {
        toast.error("You don't manage a team in this match");
        navigate(-1);
        return;
      }

      setUserTeam(teamsData);

      // Check if already submitted
      const { data: existingScores } = await supabase
        .from("spirit_scores")
        .select("id")
        .eq("match_id", id)
        .eq("scoring_team_id", teamsData.id)
        .single();

      if (existingScores) {
        setAlreadySubmitted(true);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load match data");
    } finally {
      setLoading(false);
    }
  };

  const handleScoreChange = (category, value) => {
    setScores((prev) => ({
      ...prev,
      [category]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userTeam) {
      toast.error("Unable to determine your team");
      return;
    }

    const opponentTeamId =
      match.team1_id === userTeam.id ? match.team2_id : match.team1_id;

    setSubmitting(true);

    try {
      const spiritData = formatSpiritScoreForSubmission(
        scores,
        id,
        userTeam.id,
        opponentTeamId,
        user.id,
        comments
      );

      // Add total_score
      spiritData.total_score = calculateSpiritTotal(scores);

      const { error } = await supabase.from("spirit_scores").insert(spiritData);

      if (error) throw error;

      toast.success("Spirit score submitted successfully!");
      navigate(`/tournaments/${match.tournament_id}/spirit-leaderboard`);
    } catch (error) {
      console.error("Error submitting spirit score:", error);
      toast.error("Failed to submit spirit score: " + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!match || !userTeam) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-xl mb-4">
              Match not found or you don't have access
            </p>
            <Button onClick={() => navigate(-1)}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const opponentTeam =
    match.team1_id === userTeam.id ? match.team2 : match.team1;
  const totalScore = calculateSpiritTotal(scores);
  const rating = getSpiritRating(totalScore);

  if (alreadySubmitted) {
    return (
      <div className="container mx-auto p-6 max-w-3xl">
        <Button
          variant="ghost"
          onClick={() =>
            navigate(`/tournaments/${match.tournament_id}/spirit-leaderboard`)
          }
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Spirit Leaderboard
        </Button>
        <Card>
          <CardContent className="py-12 text-center">
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
            <p className="text-xl font-semibold mb-2">
              Spirit Score Already Submitted
            </p>
            <p className="text-muted-foreground mb-4">
              You have already submitted a spirit score for this match.
            </p>
            <Button
              onClick={() =>
                navigate(
                  `/tournaments/${match.tournament_id}/spirit-leaderboard`
                )
              }
            >
              View Spirit Leaderboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (match.status !== "completed") {
    return (
      <div className="container mx-auto p-6 max-w-3xl">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Card>
          <CardContent className="py-12 text-center">
            <Award className="w-16 h-16 mx-auto mb-4 text-yellow-500 opacity-50" />
            <p className="text-xl font-semibold mb-2">Match Not Completed</p>
            <p className="text-muted-foreground">
              Spirit scores can only be submitted after the match is completed.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Award className="h-6 w-6" />
            Submit Spirit Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Your Team</p>
              <p className="text-lg font-semibold">{userTeam.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Rating</p>
              <p className="text-lg font-semibold">{opponentTeam.name}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Spirit of the Game Categories</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Rate your opponent's spirit on a scale of 0 (poor) to 4
              (excellent) for each category
            </p>
          </CardHeader>
          <CardContent className="space-y-8">
            {SPIRIT_CATEGORIES.map((category) => (
              <div key={category.key} className="space-y-3">
                <div>
                  <Label className="text-base font-semibold">
                    {category.label}
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {category.description}
                  </p>
                  <p className="text-xs text-muted-foreground italic mt-1">
                    {category.helpText}
                  </p>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {SPIRIT_SCALE.map((scale) => {
                    const isSelected = scores[category.key] === scale.value;
                    return (
                      <button
                        key={scale.value}
                        type="button"
                        onClick={() =>
                          handleScoreChange(category.key, scale.value)
                        }
                        className={`p-3 rounded-lg border-2 transition-all text-center ${
                          isSelected
                            ? `${scale.color} border-transparent`
                            : "border-gray-300 hover:border-gray-400 bg-white"
                        }`}
                      >
                        <div className="text-2xl font-bold mb-1">
                          {scale.value}
                        </div>
                        <div className="text-xs font-medium">
                          {scale.label.split(" - ")[1]}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Comments (Optional)</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Any additional comments about the spirit of the game..."
              rows={4}
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-lg font-semibold">Total Spirit Score</p>
                <p className="text-sm text-muted-foreground">
                  Out of 20 points
                </p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold mb-1">{totalScore}</div>
                <div className={`text-sm font-medium ${rating.color}`}>
                  {rating.label}
                </div>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
              <div
                className={`h-3 rounded-full transition-all ${rating.bgColor}`}
                style={{ width: `${(totalScore / 20) * 100}%` }}
              ></div>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              {rating.description}
            </p>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button type="submit" disabled={submitting} className="flex-1">
            {submitting ? "Submitting..." : "Submit Spirit Score"}
          </Button>
        </div>
      </form>
    </div>
  );
}
