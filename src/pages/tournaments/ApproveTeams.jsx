import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, CheckCircle, XCircle, Clock, Users } from "lucide-react";
import { toast } from "sonner";

export default function ApproveTeams() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tournament, setTournament] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionDialog, setActionDialog] = useState(null);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const { data: tournamentData, error: tournamentError } = await supabase
        .from("tournaments")
        .select("*")
        .eq("id", id)
        .single();

      if (tournamentError) throw tournamentError;
      setTournament(tournamentData);

      const { data: registrationsData, error: registrationsError } =
        await supabase
          .from("tournament_registrations")
          .select(
            `
          *,
          team:teams(*),
          registered_by_profile:profiles!tournament_registrations_registered_by_fkey(name, email)
        `
          )
          .eq("tournament_id", id)
          .order("created_at", { ascending: true });

      if (registrationsError) throw registrationsError;
      setRegistrations(registrationsData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load registration data");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (registrationId, action) => {
    try {
      const { error } = await supabase
        .from("tournament_registrations")
        .update({ status: action })
        .eq("id", registrationId);

      if (error) throw error;

      toast.success(
        `Team ${action === "approved" ? "approved" : "rejected"} successfully`
      );
      fetchData();
      setActionDialog(null);
    } catch (error) {
      console.error("Error updating registration:", error);
      toast.error("Failed to update registration status");
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

  const pendingRegistrations = registrations.filter(
    (r) => r.status === "pending"
  );
  const approvedRegistrations = registrations.filter(
    (r) => r.status === "approved"
  );
  const rejectedRegistrations = registrations.filter(
    (r) => r.status === "rejected"
  );

  const canApproveMore =
    !tournament.max_teams ||
    approvedRegistrations.length < tournament.max_teams;

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

      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Team Approvals</h1>
        <p className="text-muted-foreground">{tournament?.name}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-3xl font-bold">
                  {pendingRegistrations.length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-3xl font-bold">
                  {approvedRegistrations.length}
                  {tournament.max_teams && ` / ${tournament.max_teams}`}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Rejected</p>
                <p className="text-3xl font-bold">
                  {rejectedRegistrations.length}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Approvals */}
      {pendingRegistrations.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              Pending Approvals ({pendingRegistrations.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!canApproveMore && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-yellow-800">
                  ⚠️ Maximum team capacity reached. Reject some teams to approve
                  new ones.
                </p>
              </div>
            )}
            <div className="space-y-3">
              {pendingRegistrations.map((registration) => (
                <div
                  key={registration.id}
                  className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors gap-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <p className="font-medium text-lg">
                        {registration.team?.name}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Age Division: {registration.team?.age_division}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Registered by: {registration.registered_by_profile?.name}{" "}
                      ({registration.registered_by_profile?.email})
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Submitted:{" "}
                      {new Date(registration.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() =>
                        setActionDialog({ registration, action: "approved" })
                      }
                      disabled={!canApproveMore}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="mr-1 h-4 w-4" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() =>
                        setActionDialog({ registration, action: "rejected" })
                      }
                    >
                      <XCircle className="mr-1 h-4 w-4" />
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Approved Teams */}
      {approvedRegistrations.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Approved Teams ({approvedRegistrations.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {approvedRegistrations.map((registration) => (
                <div
                  key={registration.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{registration.team?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {registration.team?.age_division}
                    </p>
                  </div>
                  <Badge className="bg-green-500 hover:bg-green-600">
                    Approved
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rejected Teams */}
      {rejectedRegistrations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              Rejected Teams ({rejectedRegistrations.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {rejectedRegistrations.map((registration) => (
                <div
                  key={registration.id}
                  className="flex items-center justify-between p-3 border rounded-lg opacity-75"
                >
                  <div>
                    <p className="font-medium">{registration.team?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {registration.team?.age_division}
                    </p>
                  </div>
                  <Badge variant="destructive">Rejected</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {registrations.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-lg font-medium">No registrations yet</p>
            <p className="text-muted-foreground">
              Teams will appear here when they register for the tournament
            </p>
          </CardContent>
        </Card>
      )}

      {/* Confirmation Dialog */}
      {actionDialog && (
        <AlertDialog
          open={!!actionDialog}
          onOpenChange={() => setActionDialog(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {actionDialog.action === "approved"
                  ? "Approve Team?"
                  : "Reject Team?"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to{" "}
                {actionDialog.action === "approved" ? "approve" : "reject"}{" "}
                <strong>{actionDialog.registration?.team?.name}</strong> for
                this tournament?
                {actionDialog.action === "rejected" &&
                  " This action can be reversed later."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() =>
                  handleAction(
                    actionDialog.registration.id,
                    actionDialog.action
                  )
                }
                className={
                  actionDialog.action === "approved"
                    ? "bg-green-600 hover:bg-green-700"
                    : ""
                }
              >
                Confirm
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
