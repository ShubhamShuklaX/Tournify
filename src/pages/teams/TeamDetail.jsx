import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Trash2, UserCheck } from "lucide-react";
import PlayerSearch from "@/components/teams/PlayerSearch";
import DeleteTeamButton from "@/components/layout/DeleteTeamButton";

export default function TeamDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddPlayer, setShowAddPlayer] = useState(false);

  useEffect(() => {
    fetchTeamData();
  }, [id]);

  const fetchTeamData = async () => {
    try {
      // Fetch team
      const { data: teamData, error: teamError } = await supabase
        .from("teams")
        .select("*")
        .eq("id", id)
        .single();

      if (teamError) throw teamError;
      setTeam(teamData);

      // Fetch players
      const { data: playersData, error: playersError } = await supabase
        .from("team_players")
        .select("*")
        .eq("team_id", id)
        .order("jersey_number", { ascending: true });

      if (playersError) throw playersError;
      setPlayers(playersData || []);
    } catch (error) {
      console.error("Error fetching team:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayerAdded = () => {
    setShowAddPlayer(false);
    fetchTeamData();
  };

  const handleDeletePlayer = async (playerId) => {
    if (!confirm("Remove this player from the team?")) return;

    try {
      const { error } = await supabase
        .from("team_players")
        .delete()
        .eq("id", playerId);

      if (error) throw error;
      fetchTeamData();
    } catch (error) {
      console.error("Error deleting player:", error);
      alert("Failed to remove player: " + error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-lg">Team not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate("/teams")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Teams
        </Button>

        {/* Team Header with Delete Button */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {team.name}
              </h1>
              <p className="text-gray-600">
                Age Division: {team.age_division || "Not specified"}
              </p>
            </div>
            <DeleteTeamButton teamId={team.id} teamName={team.name} />
          </div>
        </div>

        {/* Roster Section */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">
              Roster ({players.length}{" "}
              {players.length === 1 ? "player" : "players"})
            </h2>
            {!showAddPlayer && (
              <Button onClick={() => setShowAddPlayer(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Player
              </Button>
            )}
          </div>

          {showAddPlayer && (
            <div className="mb-6">
              <PlayerSearch
                teamId={id}
                onPlayerAdded={handlePlayerAdded}
                onCancel={() => setShowAddPlayer(false)}
              />
            </div>
          )}

          {players.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                No players yet. Add your first player!
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {players.map((player) => (
                <div
                  key={player.id}
                  className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    {player.jersey_number && (
                      <span className="font-bold text-xl w-10 text-blue-600">
                        #{player.jersey_number}
                      </span>
                    )}
                    <div className="flex items-center gap-2">
                      <div>
                        <p className="font-medium text-lg">
                          {player.player_name}
                        </p>
                        {player.position && (
                          <p className="text-sm text-gray-500">
                            {player.position}
                          </p>
                        )}
                      </div>
                      {player.is_registered_user && (
                        <UserCheck
                          className="h-5 w-5 text-green-600"
                          title="Registered User"
                        />
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeletePlayer(player.id)}
                    className="hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
