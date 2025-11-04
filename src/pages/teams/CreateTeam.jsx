import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function CreateTeam() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    age_division: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate that age_division is selected
    if (!formData.age_division) {
      alert("Please select an age division");
      return;
    }

    if (!formData.name.trim()) {
      alert("Please enter a team name");
      return;
    }

    setLoading(true);

    console.log("Creating team with data:", {
      name: formData.name,
      age_division: formData.age_division,
      manager_id: user.id,
    });

    try {
      const { data, error } = await supabase
        .from("teams")
        .insert({
          name: formData.name,
          age_division: formData.age_division,
          manager_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      console.log("Team created successfully:", data);
      navigate(`/teams/${data.id}`);
    } catch (error) {
      console.error("Error creating team:", error);
      alert("Failed to create team: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate("/teams")}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Teams
        </Button>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Create New Team
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="name">Team Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter team name"
                required
              />
            </div>

            <div>
              <Label htmlFor="age_division">Age Division *</Label>
              <Select
                value={formData.age_division}
                onValueChange={(value) => {
                  console.log("Age division selected:", value);
                  setFormData({ ...formData, age_division: value });
                }}
                required
              >
                <SelectTrigger id="age_division">
                  <SelectValue placeholder="Select age division" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="U10">U10 (Under 10)</SelectItem>
                  <SelectItem value="U12">U12 (Under 12)</SelectItem>
                  <SelectItem value="U14">U14 (Under 14)</SelectItem>
                  <SelectItem value="U17">U17 (Under 17)</SelectItem>
                  <SelectItem value="U20">U20 (Under 20)</SelectItem>
                  <SelectItem value="Open">Open</SelectItem>
                  <SelectItem value="Mixed">Mixed</SelectItem>
                </SelectContent>
              </Select>
              {formData.age_division && (
                <p className="text-sm text-gray-600 mt-2">
                  Selected: {formData.age_division}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating..." : "Create Team"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
