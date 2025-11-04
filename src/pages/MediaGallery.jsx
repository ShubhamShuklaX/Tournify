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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Image,
  Video,
  Plus,
  Trash2,
  ArrowLeft,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

export default function MediaGallery() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [media, setMedia] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({
    media_type: "photo",
    url: "",
    thumbnail_url: "",
    caption: "",
    match_id: "",
  });

  useEffect(() => {
    fetchMedia();
    fetchMatches();
  }, [id]);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("tournament_media")
        .select(
          `
          *,
          uploader:profiles!tournament_media_uploaded_by_fkey(name),
          match:matches(
            id,
            round,
            team1:teams!matches_team1_id_fkey(name),
            team2:teams!matches_team2_id_fkey(name)
          )
        `
        )
        .eq("tournament_id", id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMedia(data || []);
    } catch (error) {
      console.error("Error fetching media:", error);
      toast.error("Failed to load media");
    } finally {
      setLoading(false);
    }
  };

  const fetchMatches = async () => {
    try {
      const { data, error } = await supabase
        .from("matches")
        .select(
          `
          id,
          round,
          team1:teams!matches_team1_id_fkey(name),
          team2:teams!matches_team2_id_fkey(name)
        `
        )
        .eq("tournament_id", id)
        .order("scheduled_time", { ascending: false });

      if (error) throw error;
      setMatches(data || []);
    } catch (error) {
      console.error("Error fetching matches:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.url) {
      toast.error("Please provide a media URL");
      return;
    }

    try {
      const { error } = await supabase.from("tournament_media").insert({
        tournament_id: id,
        media_type: formData.media_type,
        url: formData.url,
        thumbnail_url: formData.thumbnail_url || null,
        caption: formData.caption || null,
        match_id: formData.match_id || null,
        uploaded_by: user.id,
      });

      if (error) throw error;

      toast.success("Media uploaded successfully");
      setShowDialog(false);
      setFormData({
        media_type: "photo",
        url: "",
        thumbnail_url: "",
        caption: "",
        match_id: "",
      });
      fetchMedia();
    } catch (error) {
      console.error("Error uploading media:", error);
      toast.error("Failed to upload media");
    }
  };

  const handleDelete = async (mediaId) => {
    if (!confirm("Are you sure you want to delete this media?")) return;

    try {
      const { error } = await supabase
        .from("tournament_media")
        .delete()
        .eq("id", mediaId);

      if (error) throw error;
      toast.success("Media deleted successfully");
      fetchMedia();
    } catch (error) {
      console.error("Error deleting media:", error);
      toast.error("Failed to delete media");
    }
  };

  const photos = media.filter((m) => m.media_type === "photo");
  const videos = media.filter((m) => m.media_type === "video");
  const highlights = media.filter((m) => m.media_type === "highlight");

  const MediaCard = ({ item }) => (
    <Card className="overflow-hidden">
      <div className="relative">
        {item.media_type === "photo" ? (
          <img
            src={item.url}
            alt={item.caption || "Tournament photo"}
            className="w-full h-48 object-cover"
            onError={(e) => {
              e.target.src =
                "https://via.placeholder.com/400x300?text=Image+Not+Found";
            }}
          />
        ) : (
          <div className="w-full h-48 bg-muted flex items-center justify-center">
            <Video className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
        <Badge className="absolute top-2 right-2">{item.media_type}</Badge>
      </div>
      <CardContent className="p-4">
        {item.caption && <p className="text-sm mb-2">{item.caption}</p>}
        {item.match && (
          <p className="text-xs text-muted-foreground mb-2">
            {item.match.round}: {item.match.team1?.name} vs{" "}
            {item.match.team2?.name}
          </p>
        )}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>By {item.uploader?.name}</span>
          <span>{new Date(item.created_at).toLocaleDateString()}</span>
        </div>
        <div className="flex gap-2 mt-3">
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={() => window.open(item.url, "_blank")}
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            View
          </Button>
          {(profile?.role === "tournament_director" ||
            item.uploaded_by === user.id) && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleDelete(item.id)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading media...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
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
          <h1 className="text-3xl font-bold mb-2">Media Gallery</h1>
          <p className="text-muted-foreground">
            Tournament photos, videos, and highlights
          </p>
        </div>
        {profile?.is_approved && (
          <Button onClick={() => setShowDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Upload Media
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Image className="h-4 w-4" />
              Photos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{photos.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Video className="h-4 w-4" />
              Videos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{videos.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Video className="h-4 w-4 text-yellow-500" />
              Highlights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{highlights.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All ({media.length})</TabsTrigger>
          <TabsTrigger value="photos">Photos ({photos.length})</TabsTrigger>
          <TabsTrigger value="videos">Videos ({videos.length})</TabsTrigger>
          <TabsTrigger value="highlights">
            Highlights ({highlights.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          {media.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Image className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground mb-4">
                  No media uploaded yet
                </p>
                {profile?.is_approved && (
                  <Button onClick={() => setShowDialog(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Upload First Media
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {media.map((item) => (
                <MediaCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="photos">
          {photos.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Image className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">No photos uploaded yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {photos.map((item) => (
                <MediaCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="videos">
          {videos.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Video className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">No videos uploaded yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {videos.map((item) => (
                <MediaCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="highlights">
          {highlights.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Video className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">
                  No highlights uploaded yet
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {highlights.map((item) => (
                <MediaCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Upload Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Upload Media</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="media_type">Media Type *</Label>
                <Select
                  value={formData.media_type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, media_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="photo">Photo</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="highlight">Highlight</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="url">Media URL *</Label>
                <Input
                  id="url"
                  type="url"
                  value={formData.url}
                  onChange={(e) =>
                    setFormData({ ...formData, url: e.target.value })
                  }
                  placeholder="https://example.com/image.jpg or YouTube link"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Direct link to image or video (YouTube, Vimeo, etc.)
                </p>
              </div>

              {formData.media_type !== "photo" && (
                <div>
                  <Label htmlFor="thumbnail_url">Thumbnail URL</Label>
                  <Input
                    id="thumbnail_url"
                    type="url"
                    value={formData.thumbnail_url}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        thumbnail_url: e.target.value,
                      })
                    }
                    placeholder="https://example.com/thumbnail.jpg"
                  />
                </div>
              )}

              <div>
                <Label htmlFor="match_id">Associated Match (Optional)</Label>
                <Select
                  value={formData.match_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, match_id: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a match" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No specific match</SelectItem>
                    {matches.map((match) => (
                      <SelectItem key={match.id} value={match.id}>
                        {match.round}: {match.team1?.name} vs{" "}
                        {match.team2?.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="caption">Caption</Label>
                <Textarea
                  id="caption"
                  value={formData.caption}
                  onChange={(e) =>
                    setFormData({ ...formData, caption: e.target.value })
                  }
                  rows={3}
                  placeholder="Add a caption or description..."
                />
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
              <Button type="submit">Upload Media</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
