import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, Plus } from "lucide-react";
import { toast } from "sonner";

export default function TournamentList() {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, profile } = useAuth();

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    try {
      const { data, error } = await supabase
        .from("tournaments")
        .select(
          `
          *,
          creator:profiles!tournaments_created_by_fkey(name)
        `
        )
        .order("start_date", { ascending: false });

      if (error) throw error;
      setTournaments(data || []);
    } catch (error) {
      console.error("Error fetching tournaments:", error);
      toast.error("Failed to load tournaments");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: "bg-gray-500",
      registration_open: "bg-green-500",
      registration_closed: "bg-yellow-500",
      in_progress: "bg-blue-500",
      completed: "bg-purple-500",
      cancelled: "bg-red-500",
    };
    return colors[status] || "bg-gray-500";
  };

  const getStatusLabel = (status) => {
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading tournaments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Tournaments</h1>
          <p className="text-muted-foreground mt-1">
            Manage and participate in Ultimate Frisbee tournaments
          </p>
        </div>

        {profile?.role === "tournament_director" && (
          <Link to="/tournaments/create">
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Create Tournament
            </Button>
          </Link>
        )}
      </div>

      {/* Tournaments Grid */}
      {tournaments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No tournaments yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              {profile?.role === "tournament_director"
                ? "Create your first tournament to get started"
                : "Check back soon for upcoming tournaments"}
            </p>
            {profile?.role === "tournament_director" && (
              <Link to="/tournaments/create">
                <Button>Create Tournament</Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tournaments.map((tournament) => (
            <Link
              key={tournament.id}
              to={`/tournaments/${tournament.id}`}
              className="group"
            >
              <Card className="h-full transition-all hover:shadow-lg hover:scale-[1.02]">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">
                      {tournament.name}
                    </CardTitle>
                    <Badge className={getStatusColor(tournament.status)}>
                      {getStatusLabel(tournament.status)}
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {tournament.description || "No description provided"}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {new Date(tournament.start_date).toLocaleDateString()} -{" "}
                      {new Date(tournament.end_date).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{tournament.location}</span>
                  </div>

                  {tournament.max_teams && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>Max {tournament.max_teams} teams</span>
                    </div>
                  )}

                  {tournament.age_divisions &&
                    tournament.age_divisions.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {tournament.age_divisions.map((division, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs"
                          >
                            {division}
                          </Badge>
                        ))}
                      </div>
                    )}

                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground">
                      Created by {tournament.creator?.name || "Unknown"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
