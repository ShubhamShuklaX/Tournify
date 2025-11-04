import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  UserCheck,
  UserX,
  Search,
  Mail,
  Phone,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

export default function UserApprovals() {
  const { user, profile } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  useEffect(() => {
    if (profile?.role === "tournament_director") {
      fetchUsers();
    }
  }, [profile]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .neq("role", "player")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          is_approved: true,
          approval_status: "approved",
          approved_by: user.id,
          approved_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (error) throw error;

      // Update approval request
      await supabase
        .from("approval_requests")
        .update({
          status: "approved",
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq("user_id", userId)
        .eq("status", "pending");

      toast.success("User approved successfully");
      fetchUsers();
    } catch (error) {
      console.error("Error approving user:", error);
      toast.error("Failed to approve user");
    }
  };

  const openRejectDialog = (user) => {
    setSelectedUser(user);
    setRejectReason("");
    setShowRejectDialog(true);
  };

  const handleReject = async () => {
    if (!selectedUser) return;

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          is_approved: false,
          approval_status: "rejected",
          approved_by: user.id,
          rejection_reason: rejectReason,
        })
        .eq("id", selectedUser.id);

      if (error) throw error;

      // Update approval request
      await supabase
        .from("approval_requests")
        .update({
          status: "rejected",
          reason: rejectReason,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq("user_id", selectedUser.id)
        .eq("status", "pending");

      toast.success("User application rejected");
      setShowRejectDialog(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      console.error("Error rejecting user:", error);
      toast.error("Failed to reject user");
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.role?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingUsers = filteredUsers.filter(
    (u) => u.approval_status === "pending"
  );
  const approvedUsers = filteredUsers.filter(
    (u) => u.approval_status === "approved"
  );
  const rejectedUsers = filteredUsers.filter(
    (u) => u.approval_status === "rejected"
  );

  const UserCard = ({ user: cardUser, showActions = true }) => (
    <Card className="mb-3">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-lg font-bold text-primary">
                  {cardUser.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-lg">{cardUser.name}</h3>
                <Badge variant="outline" className="mt-1">
                  {cardUser.role?.replace("_", " ")}
                </Badge>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>{cardUser.email}</span>
              </div>
              {cardUser.phone && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{cardUser.phone}</span>
                </div>
              )}
              {cardUser.location && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{cardUser.location}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>
                  Applied: {new Date(cardUser.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>

            {cardUser.approval_status === "approved" &&
              cardUser.approved_at && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs text-muted-foreground">
                    Approved on{" "}
                    {new Date(cardUser.approved_at).toLocaleDateString()}
                  </p>
                </div>
              )}

            {cardUser.approval_status === "rejected" &&
              cardUser.rejection_reason && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs text-red-600 font-medium">
                    Rejection Reason:
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {cardUser.rejection_reason}
                  </p>
                </div>
              )}
          </div>

          {showActions && cardUser.approval_status === "pending" && (
            <div className="flex gap-2 ml-4">
              <Button
                size="sm"
                variant="outline"
                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                onClick={() => handleApprove(cardUser.id)}
              >
                <UserCheck className="h-4 w-4 mr-1" />
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => openRejectDialog(cardUser)}
              >
                <UserX className="h-4 w-4 mr-1" />
                Reject
              </Button>
            </div>
          )}

          {cardUser.approval_status === "approved" && (
            <Badge className="bg-green-500">
              <CheckCircle className="h-3 w-3 mr-1" />
              Approved
            </Badge>
          )}

          {cardUser.approval_status === "rejected" && (
            <Badge variant="destructive">
              <XCircle className="h-3 w-3 mr-1" />
              Rejected
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (profile?.role !== "tournament_director") {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-xl">Access Denied</p>
            <p className="text-muted-foreground mt-2">
              Only tournament directors can access this page.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">User Approvals</h1>
        <p className="text-muted-foreground">
          Review and approve user registrations for team managers and tournament
          directors
        </p>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-500" />
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingUsers.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Approved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedUsers.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500" />
              Rejected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rejectedUsers.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">
            Pending ({pendingUsers.length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved ({approvedUsers.length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected ({rejectedUsers.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          {loading ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading...</p>
            </div>
          ) : pendingUsers.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">No pending approvals</p>
              </CardContent>
            </Card>
          ) : (
            <div>
              {pendingUsers.map((u) => (
                <UserCard key={u.id} user={u} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="approved">
          {approvedUsers.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">No approved users</p>
              </CardContent>
            </Card>
          ) : (
            <div>
              {approvedUsers.map((u) => (
                <UserCard key={u.id} user={u} showActions={false} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="rejected">
          {rejectedUsers.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <XCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">No rejected users</p>
              </CardContent>
            </Card>
          ) : (
            <div>
              {rejectedUsers.map((u) => (
                <UserCard key={u.id} user={u} showActions={false} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject User Application</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting {selectedUser?.name}'s
              application. This will be visible to the user.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Enter rejection reason..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRejectDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectReason.trim()}
            >
              Reject Application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
