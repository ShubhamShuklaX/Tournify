import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Trophy, Plus, X } from "lucide-react";
import { toast } from "sonner";

const AGE_DIVISIONS = [
  "U10 (Under 10)",
  "U12 (Under 12)",
  "U14 (Under 14)",
  "U17 (Under 17)",
  "U20 (Under 20)",
  "Open (18+)",
  "Masters (35+)",
  "Grand Masters (45+)",
  "Mixed",
  "Women's",
  "Men's",
];

export default function CreateTournament() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
    start_date: "",
    end_date: "",
    registration_deadline: "",
    max_teams: "",
    format: "round_robin",
    age_divisions: [],
    rules: "",
    banner_url: "",
    live_stream_url: "",
    is_public: true,
    status: "draft",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (
      !formData.name ||
      !formData.location ||
      !formData.start_date ||
      !formData.end_date
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (new Date(formData.start_date) > new Date(formData.end_date)) {
      toast.error("End date must be after start date");
      return;
    }

    if (
      formData.registration_deadline &&
      new Date(formData.registration_deadline) > new Date(formData.start_date)
    ) {
      toast.error("Registration deadline must be before start date");
      return;
    }

    try {
      setLoading(true);

      const tournamentData = {
        name: formData.name,
        description: formData.description || null,
        location: formData.location,
        start_date: formData.start_date,
        end_date: formData.end_date,
        registration_deadline: formData.registration_deadline || null,
        max_teams: formData.max_teams ? parseInt(formData.max_teams) : null,
        format: formData.format,
        age_divisions: formData.age_divisions,
        rules: formData.rules || null,
        banner_url: formData.banner_url || null,
        live_stream_url: formData.live_stream_url || null,
        is_public: formData.is_public,
        status: formData.status,
        created_by: user.id,
      };

      const { data, error } = await supabase
        .from("tournaments")
        .insert(tournamentData)
        .select()
        .single();

      if (error) throw error;

      toast.success("Tournament created successfully!");
      navigate(`/tournaments/${data.id}`);
    } catch (error) {
      console.error("Error creating tournament:", error);
      toast.error(error.message || "Failed to create tournament");
    } finally {
      setLoading(false);
    }
  };

  const toggleAgeDivision = (division) => {
    setFormData((prev) => ({
      ...prev,
      age_divisions: prev.age_divisions.includes(division)
        ? prev.age_divisions.filter((d) => d !== division)
        : [...prev.age_divisions, division],
    }));
  };

  if (!profile?.is_approved || profile?.role !== "tournament_director") {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-xl">Access Denied</p>
            <p className="text-muted-foreground mt-2">
              Only approved tournament directors can create tournaments.
            </p>
            <Button onClick={() => navigate("/tournaments")} className="mt-4">
              View Tournaments
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Button
        variant="ghost"
        onClick={() => navigate("/tournaments")}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Tournaments
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-6 w-6" />
            Create New Tournament
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>

              <div>
                <Label htmlFor="name">Tournament Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Asia Oceanic Championship 2025"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Brief description of the tournament..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  placeholder="e.g., Delhi, India"
                  required
                />
              </div>
            </div>

            {/* Dates */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Dates</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_date">Start Date *</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) =>
                      setFormData({ ...formData, start_date: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="end_date">End Date *</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) =>
                      setFormData({ ...formData, end_date: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="registration_deadline">
                  Registration Deadline
                </Label>
                <Input
                  id="registration_deadline"
                  type="date"
                  value={formData.registration_deadline}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      registration_deadline: e.target.value,
                    })
                  }
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Optional: When team registration closes
                </p>
              </div>
            </div>

            {/* Tournament Configuration */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                Tournament Configuration
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="format">Tournament Format *</Label>
                  <Select
                    value={formData.format}
                    onValueChange={(value) =>
                      setFormData({ ...formData, format: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="round_robin">Round Robin</SelectItem>
                      <SelectItem value="single_elimination">
                        Single Elimination
                      </SelectItem>
                      <SelectItem value="double_elimination">
                        Double Elimination
                      </SelectItem>
                      <SelectItem value="swiss">Swiss System</SelectItem>
                      <SelectItem value="pool_play">Pool Play</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="max_teams">Maximum Teams</Label>
                  <Input
                    id="max_teams"
                    type="number"
                    min="2"
                    value={formData.max_teams}
                    onChange={(e) =>
                      setFormData({ ...formData, max_teams: e.target.value })
                    }
                    placeholder="e.g., 16"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Optional: Leave blank for unlimited
                  </p>
                </div>
              </div>

              <div>
                <Label htmlFor="status">Initial Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft (Not visible)</SelectItem>
                    <SelectItem value="registration_open">
                      Registration Open
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Age Divisions */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Age Divisions</h3>
              <p className="text-sm text-muted-foreground">
                Select all age divisions that apply to this tournament
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {AGE_DIVISIONS.map((division) => (
                  <div key={division} className="flex items-center space-x-2">
                    <Checkbox
                      id={division}
                      checked={formData.age_divisions.includes(division)}
                      onCheckedChange={() => toggleAgeDivision(division)}
                    />
                    <Label
                      htmlFor={division}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {division}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Rules and Additional Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Rules & Additional Info</h3>

              <div>
                <Label htmlFor="rules">Tournament Rules</Label>
                <Textarea
                  id="rules"
                  value={formData.rules}
                  onChange={(e) =>
                    setFormData({ ...formData, rules: e.target.value })
                  }
                  placeholder="Specific rules for this tournament (e.g., WFDF 2021 rules, time limits, etc.)"
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="banner_url">Banner Image URL</Label>
                <Input
                  id="banner_url"
                  type="url"
                  value={formData.banner_url}
                  onChange={(e) =>
                    setFormData({ ...formData, banner_url: e.target.value })
                  }
                  placeholder="https://example.com/banner.jpg"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Direct link to tournament banner image
                </p>
              </div>

              <div>
                <Label htmlFor="live_stream_url">Live Stream URL</Label>
                <Input
                  id="live_stream_url"
                  type="url"
                  value={formData.live_stream_url}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      live_stream_url: e.target.value,
                    })
                  }
                  placeholder="https://youtube.com/live/..."
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Optional: Link to YouTube or other streaming platform
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_public"
                  checked={formData.is_public}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_public: checked })
                  }
                />
                <Label htmlFor="is_public" className="cursor-pointer">
                  Make this tournament publicly visible
                </Label>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/tournaments")}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Tournament
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
