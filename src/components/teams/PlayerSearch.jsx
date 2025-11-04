import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, UserPlus, X, Users, AlertCircle } from "lucide-react";

export default function PlayerSearch({ teamId, onPlayerAdded, onCancel }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [manualEntry, setManualEntry] = useState(false);
  const [manualPlayer, setManualPlayer] = useState({
    player_name: "",
    jersey_number: "",
    position: "",
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Search for registered players (excluding those already in ANY team)
  const searchPlayers = async (term) => {
    if (term.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    setErrorMessage("");

    try {
      // First, get all players matching the search
      const { data: allPlayers, error: searchError } = await supabase
        .from("profiles")
        .select("id, name, email")
        .eq("role", "player")
        .ilike("name", `%${term}%`)
        .limit(20);

      if (searchError) throw searchError;

      if (!allPlayers || allPlayers.length === 0) {
        setSearchResults([]);
        setSearching(false);
        return;
      }

      // Get all players who are already in ANY team
      const { data: assignedPlayers, error: teamError } = await supabase
        .from("team_players")
        .select("player_id")
        .not("player_id", "is", null);

      if (teamError) throw teamError;

      // Create a Set of assigned player IDs for O(1) lookup
      const assignedPlayerIds = new Set(
        assignedPlayers?.map((tp) => tp.player_id) || []
      );

      // Filter out players who are already in any team
      const availablePlayers = allPlayers.filter(
        (player) => !assignedPlayerIds.has(player.id)
      );

      setSearchResults(availablePlayers || []);
    } catch (error) {
      console.error("Error searching players:", error);
      setErrorMessage("Failed to search players. Please try again.");
    } finally {
      setSearching(false);
    }
  };

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm) {
        searchPlayers(searchTerm);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Add registered player
  const addRegisteredPlayer = async (player) => {
    setLoading(true);
    setErrorMessage("");

    try {
      const { error } = await supabase.from("team_players").insert({
        team_id: teamId,
        player_id: player.id,
        player_name: player.name,
        is_registered_user: true,
      });

      if (error) {
        if (error.code === "23505") {
          setErrorMessage(`${player.name} is already on this team!`);
        } else {
          throw error;
        }
      } else {
        // Clear search and notify parent
        setSearchTerm("");
        setSearchResults([]);
        onPlayerAdded();
      }
    } catch (error) {
      console.error("Error adding player:", error);
      setErrorMessage("Failed to add player. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Add manual player (not registered)
  const addManualPlayer = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!manualPlayer.player_name.trim()) {
      setErrorMessage("Player name is required");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("team_players").insert({
        team_id: teamId,
        player_name: manualPlayer.player_name.trim(),
        jersey_number: manualPlayer.jersey_number || null,
        position: manualPlayer.position || null,
        is_registered_user: false,
      });

      if (error) throw error;

      setManualPlayer({ player_name: "", jersey_number: "", position: "" });
      setManualEntry(false);
      onPlayerAdded();
    } catch (error) {
      console.error("Error adding manual player:", error);
      setErrorMessage("Failed to add player. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-6 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Add Player</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="hover:bg-white"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{errorMessage}</p>
        </div>
      )}

      {!manualEntry ? (
        <>
          {/* Search for registered players */}
          <div className="mb-4">
            <Label className="text-gray-700 mb-2">
              Search Available Players
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                className="pl-10 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                placeholder="Type player name (minimum 2 characters)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Only shows players not assigned to any team
            </p>
          </div>

          {/* Search Results */}
          {searching && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-gray-500 mt-2">
                Searching available players...
              </p>
            </div>
          )}

          {searchResults.length > 0 && (
            <div className="space-y-2 mb-4 max-h-80 overflow-y-auto">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Found {searchResults.length} available player
                {searchResults.length !== 1 ? "s" : ""}
              </p>
              {searchResults.map((player) => (
                <div
                  key={player.id}
                  className="flex justify-between items-center p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-400 hover:shadow-md transition-all duration-200"
                >
                  <div>
                    <p className="font-medium text-gray-900">{player.name}</p>
                    <p className="text-sm text-gray-500">{player.email}</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => addRegisteredPlayer(player)}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <UserPlus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
              ))}
            </div>
          )}

          {searchTerm.length >= 2 &&
            !searching &&
            searchResults.length === 0 && (
              <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-600 font-medium">
                  No available players found
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  All matching players are already assigned to teams
                </p>
              </div>
            )}

          {searchTerm.length > 0 && searchTerm.length < 2 && (
            <div className="text-center py-6 text-gray-500 text-sm">
              Type at least 2 characters to search
            </div>
          )}

          {/* Manual Entry Option */}
          <div className="text-center pt-4 border-t border-gray-200 mt-4">
            <p className="text-sm text-gray-600 mb-3">
              Player not registered on the platform?
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setManualEntry(true);
                setErrorMessage("");
              }}
              className="border-blue-300 text-blue-700 hover:bg-blue-50"
            >
              Add Player Manually
            </Button>
          </div>
        </>
      ) : (
        <>
          {/* Manual Player Entry Form */}
          <div className="space-y-4 bg-white p-4 rounded-lg">
            <div>
              <Label htmlFor="manual_player_name" className="text-gray-700">
                Player Name *
              </Label>
              <Input
                id="manual_player_name"
                value={manualPlayer.player_name}
                onChange={(e) => {
                  setManualPlayer({
                    ...manualPlayer,
                    player_name: e.target.value,
                  });
                  setErrorMessage("");
                }}
                placeholder="Enter player name"
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="manual_jersey" className="text-gray-700">
                  Jersey #
                </Label>
                <Input
                  id="manual_jersey"
                  type="number"
                  value={manualPlayer.jersey_number}
                  onChange={(e) =>
                    setManualPlayer({
                      ...manualPlayer,
                      jersey_number: e.target.value,
                    })
                  }
                  placeholder="Optional"
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <Label htmlFor="manual_position" className="text-gray-700">
                  Position
                </Label>
                <Input
                  id="manual_position"
                  value={manualPlayer.position}
                  onChange={(e) =>
                    setManualPlayer({
                      ...manualPlayer,
                      position: e.target.value,
                    })
                  }
                  placeholder="e.g., Handler"
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                onClick={(e) => addManualPlayer(e)}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? "Adding..." : "Add Player"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setManualEntry(false);
                  setErrorMessage("");
                }}
              >
                Back to Search
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
