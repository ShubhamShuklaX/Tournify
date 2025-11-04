import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { HandHeart, Plus, Pencil, Trash2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function SponsorManagement() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [sponsors, setSponsors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingSponsor, setEditingSponsor] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    logo_url: "",
    website_url: "",
    tier: "bronze",
    description: "",
    display_order: 0,
  });

  useEffect(() => {
    fetchSponsors();
  }, [id]);

  const fetchSponsors = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("sponsors")
        .select("*")
        .eq("tournament_id", id)
        .order("display_order", { ascending: true });

      if (error) throw error;
      setSponsors(data || []);
    } catch (error) {
      console.error("Error fetching sponsors:", error);
      toast.error("Failed to load sponsors");
    } finally {
      setLoading(false);
    }
  };

  const openDialog = (sponsor = null) => {
    if (sponsor) {
      setEditingSponsor(sponsor);
      setFormData({
        name: sponsor.name,
        logo_url: sponsor.logo_url || "",
        website_url: sponsor.website_url || "",
        tier: sponsor.tier || "bronze",
        description: sponsor.description || "",
        display_order: sponsor.display_order || 0,
      });
    } else {
      setEditingSponsor(null);
      setFormData({
        name: "",
        logo_url: "",
        website_url: "",
        tier: "bronze",
        description: "",
        display_order: sponsors.length,
      });
    }
    setShowDialog(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingSponsor) {
        const { error } = await supabase
          .from("sponsors")
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingSponsor.id);

        if (error) throw error;
        toast.success("Sponsor updated successfully");
      } else {
        const { error } = await supabase.from("sponsors").insert({
          ...formData,
          tournament_id: id,
        });

        if (error) throw error;
        toast.success("Sponsor added successfully");
      }

      setShowDialog(false);
      fetchSponsors();
    } catch (error) {
      console.error("Error saving sponsor:", error);
      toast.error("Failed to save sponsor");
    }
  };

  const handleDelete = async (sponsorId) => {
    if (!confirm("Are you sure you want to delete this sponsor?")) return;

    try {
      const { error } = await supabase
        .from("sponsors")
        .delete()
        .eq("id", sponsorId);

      if (error) throw error;
      toast.success("Sponsor deleted successfully");
      fetchSponsors();
    } catch (error) {
      console.error("Error deleting sponsor:", error);
      toast.error("Failed to delete sponsor");
    }
  };

  const getTierColor = (tier) => {
    const colors = {
      title: "bg-purple-500",
      platinum: "bg-gray-300",
      gold: "bg-yellow-500",
      silver: "bg-gray-400",
      bronze: "bg-orange-600",
    };
    return colors[tier] || "bg-gray-500";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading sponsors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <Button
        variant="ghost"
        onClick={() => navigate(`/tournaments/${id}`)}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Tournament
      </Button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Manage Sponsors</h1>
          <p className="text-muted-foreground">
            Add and manage tournament sponsors
          </p>
        </div>
        <Button onClick={() => openDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Add Sponsor
        </Button>
      </div>

      {sponsors.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <HandHeart className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground mb-4">No sponsors added yet</p>
            <Button onClick={() => openDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Sponsor
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sponsors.map((sponsor) => (
            <Card key={sponsor.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {sponsor.logo_url ? (
                      <img
                        src={sponsor.logo_url}
                        alt={sponsor.name}
                        className="h-20 w-20 object-contain mb-3"
                      />
                    ) : (
                      <div className="h-20 w-20 bg-muted rounded flex items-center justify-center mb-3">
                        <span className="text-3xl font-bold text-muted-foreground">
                          {sponsor.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <CardTitle className="text-lg">{sponsor.name}</CardTitle>
                    <div
                      className={`inline-block mt-2 px-2 py-1 rounded text-xs font-medium text-white ${getTierColor(
                        sponsor.tier
                      )}`}
                    >
                      {sponsor.tier?.toUpperCase()}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {sponsor.description && (
                  <p className="text-sm text-muted-foreground mb-3">
                    {sponsor.description}
                  </p>
                )}
                {sponsor.website_url && (
                  <a
                    href={sponsor.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline block mb-3"
                  >
                    Visit Website →
                  </a>
                )}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openDialog(sponsor)}
                    className="flex-1"
                  >
                    <Pencil className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(sponsor.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingSponsor ? "Edit Sponsor" : "Add Sponsor"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="name">Sponsor Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="tier">Sponsorship Tier *</Label>
                <Select
                  value={formData.tier}
                  onValueChange={(value) =>
                    setFormData({ ...formData, tier: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="title">Title Sponsor</SelectItem>
                    <SelectItem value="platinum">Platinum</SelectItem>
                    <SelectItem value="gold">Gold</SelectItem>
                    <SelectItem value="silver">Silver</SelectItem>
                    <SelectItem value="bronze">Bronze</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="logo_url">Logo URL</Label>
                <Input
                  id="logo_url"
                  type="url"
                  value={formData.logo_url}
                  onChange={(e) =>
                    setFormData({ ...formData, logo_url: e.target.value })
                  }
                  placeholder="https://example.com/logo.png"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Direct link to sponsor logo image
                </p>
              </div>

              <div>
                <Label htmlFor="website_url">Website URL</Label>
                <Input
                  id="website_url"
                  type="url"
                  value={formData.website_url}
                  onChange={(e) =>
                    setFormData({ ...formData, website_url: e.target.value })
                  }
                  placeholder="https://example.com"
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
                  rows={3}
                  placeholder="Brief description of the sponsor..."
                />
              </div>

              <div>
                <Label htmlFor="display_order">Display Order</Label>
                <Input
                  id="display_order"
                  type="number"
                  value={formData.display_order}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      display_order: parseInt(e.target.value) || 0,
                    })
                  }
                  min="0"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Lower numbers appear first
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDialog(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingSponsor ? "Update" : "Add"} Sponsor
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
