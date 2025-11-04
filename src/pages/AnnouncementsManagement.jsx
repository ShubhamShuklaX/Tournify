import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import { Bell, Plus, Trash2, Pin, ArrowLeft, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function AnnouncementsManagement() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "general",
    is_pinned: false,
  });

  useEffect(() => {
    fetchAnnouncements();
  }, [id]);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("announcements")
        .select(
          `
          *,
          creator:profiles!announcements_created_by_fkey(name)
        `
        )
        .eq("tournament_id", id)
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAnnouncements(data || []);
    } catch (error) {
      console.error("Error fetching announcements:", error);
      toast.error("Failed to load announcements");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const { error } = await supabase.from("announcements").insert({
        ...formData,
        tournament_id: id,
        created_by: user.id,
      });

      if (error) throw error;

      toast.success("Announcement posted successfully");
      setShowDialog(false);
      setFormData({
        title: "",
        message: "",
        type: "general",
        is_pinned: false,
      });
      fetchAnnouncements();
    } catch (error) {
      console.error("Error posting announcement:", error);
      toast.error("Failed to post announcement");
    }
  };

  const handleDelete = async (announcementId) => {
    if (!confirm("Are you sure you want to delete this announcement?")) return;

    try {
      const { error } = await supabase
        .from("announcements")
        .delete()
        .eq("id", announcementId);

      if (error) throw error;
      toast.success("Announcement deleted successfully");
      fetchAnnouncements();
    } catch (error) {
      console.error("Error deleting announcement:", error);
      toast.error("Failed to delete announcement");
    }
  };

  const togglePin = async (announcementId, currentPinned) => {
    try {
      const { error } = await supabase
        .from("announcements")
        .update({ is_pinned: !currentPinned })
        .eq("id", announcementId);

      if (error) throw error;
      toast.success(
        currentPinned ? "Announcement unpinned" : "Announcement pinned"
      );
      fetchAnnouncements();
    } catch (error) {
      console.error("Error toggling pin:", error);
      toast.error("Failed to update announcement");
    }
  };

  const getTypeColor = (type) => {
    const colors = {
      general: "bg-blue-500",
      schedule_change: "bg-yellow-500",
      score_update: "bg-green-500",
      emergency: "bg-red-500",
      celebration: "bg-purple-500",
    };
    return colors[type] || "bg-gray-500";
  };

  const getTypeIcon = (type) => {
    if (type === "emergency") return <AlertCircle className="h-4 w-4" />;
    return <Bell className="h-4 w-4" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading announcements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
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
          <h1 className="text-3xl font-bold mb-2">Announcements</h1>
          <p className="text-muted-foreground">
            Post updates and alerts for tournament participants
          </p>
        </div>
        <Button onClick={() => setShowDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Announcement
        </Button>
      </div>

      {announcements.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground mb-4">
              No announcements posted yet
            </p>
            <Button onClick={() => setShowDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Post Your First Announcement
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <Card
              key={announcement.id}
              className={`${
                announcement.type === "emergency"
                  ? "border-red-500"
                  : announcement.is_pinned
                  ? "border-primary"
                  : ""
              }`}
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {announcement.is_pinned && (
                        <Pin className="h-4 w-4 text-primary" />
                      )}
                      <Badge
                        className={`${getTypeColor(
                          announcement.type
                        )} text-white`}
                      >
                        {getTypeIcon(announcement.type)}
                        <span className="ml-1">
                          {announcement.type.replace("_", " ")}
                        </span>
                      </Badge>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">
                      {announcement.title}
                    </h3>
                    <p className="text-muted-foreground mb-3">
                      {announcement.message}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Posted by {announcement.creator?.name}</span>
                      <span>
                        {new Date(announcement.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        togglePin(announcement.id, announcement.is_pinned)
                      }
                    >
                      <Pin
                        className={`h-4 w-4 ${
                          announcement.is_pinned ? "fill-current" : ""
                        }`}
                      />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(announcement.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Announcement Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Post New Announcement</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="e.g., Schedule Update for Field 2"
                  required
                />
              </div>

              <div>
                <Label htmlFor="type">Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="schedule_change">
                      Schedule Change
                    </SelectItem>
                    <SelectItem value="score_update">Score Update</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                    <SelectItem value="celebration">Celebration</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  rows={4}
                  placeholder="Enter your announcement message..."
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_pinned"
                  checked={formData.is_pinned}
                  onChange={(e) =>
                    setFormData({ ...formData, is_pinned: e.target.checked })
                  }
                  className="rounded"
                />
                <Label htmlFor="is_pinned" className="cursor-pointer">
                  Pin this announcement to the top
                </Label>
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
              <Button type="submit">Post Announcement</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
