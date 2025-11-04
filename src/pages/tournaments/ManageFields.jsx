import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { ArrowLeft, Plus, Trash2, MapPin } from "lucide-react";
import { toast } from "sonner";

export default function ManageFields() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tournament, setTournament] = useState(null);
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddField, setShowAddField] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(null);
  const [fieldData, setFieldData] = useState({
    field_number: "",
    field_name: "",
  });

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

      const { data: fieldsData, error: fieldsError } = await supabase
        .from("tournament_fields")
        .select("*")
        .eq("tournament_id", id)
        .order("field_number", { ascending: true });

      if (fieldsError) throw fieldsError;
      setFields(fieldsData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load field data");
    } finally {
      setLoading(false);
    }
  };

  const handleAddField = async (e) => {
    e.preventDefault();

    if (!fieldData.field_number) {
      toast.error("Field number is required");
      return;
    }

    // Check for duplicate field number
    if (
      fields.some((f) => f.field_number === parseInt(fieldData.field_number))
    ) {
      toast.error("Field number already exists");
      return;
    }

    try {
      const { error } = await supabase.from("tournament_fields").insert({
        tournament_id: id,
        field_number: parseInt(fieldData.field_number),
        field_name: fieldData.field_name || null,
      });

      if (error) throw error;

      toast.success("Field added successfully");
      setFieldData({ field_number: "", field_name: "" });
      setShowAddField(false);
      fetchData();
    } catch (error) {
      console.error("Error adding field:", error);
      toast.error("Failed to add field: " + error.message);
    }
  };

  const handleDeleteField = async (fieldId) => {
    try {
      // Check if field has matches
      const { data: matches, error: matchError } = await supabase
        .from("matches")
        .select("id")
        .eq("tournament_id", id)
        .eq("field_id", fieldId)
        .limit(1);

      if (matchError) throw matchError;

      if (matches && matches.length > 0) {
        toast.error("Cannot delete field with scheduled matches");
        setDeleteDialog(null);
        return;
      }

      const { error } = await supabase
        .from("tournament_fields")
        .delete()
        .eq("id", fieldId);

      if (error) throw error;

      toast.success("Field deleted successfully");
      setDeleteDialog(null);
      fetchData();
    } catch (error) {
      console.error("Error deleting field:", error);
      toast.error("Failed to delete field: " + error.message);
    }
  };

  const generateFields = async (count) => {
    if (!count || count < 1 || count > 20) {
      toast.error("Please enter a number between 1 and 20");
      return;
    }

    try {
      const newFields = [];
      for (let i = 1; i <= count; i++) {
        // Skip if field number already exists
        if (!fields.some((f) => f.field_number === i)) {
          newFields.push({
            tournament_id: id,
            field_number: i,
            field_name: `Field ${i}`,
          });
        }
      }

      if (newFields.length === 0) {
        toast.info("All fields already exist");
        return;
      }

      const { error } = await supabase
        .from("tournament_fields")
        .insert(newFields);

      if (error) throw error;

      toast.success(`Generated ${newFields.length} fields`);
      fetchData();
    } catch (error) {
      console.error("Error generating fields:", error);
      toast.error("Failed to generate fields: " + error.message);
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

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <Button
        variant="ghost"
        onClick={() => navigate(`/tournaments/${id}`)}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Tournament
      </Button>

      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Manage Fields</h1>
        <p className="text-muted-foreground">{tournament?.name}</p>
      </div>

      {/* Quick Generate */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Quick Generate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1 max-w-xs">
              <Label htmlFor="count">Number of Fields</Label>
              <Input
                id="count"
                type="number"
                min="1"
                max="20"
                placeholder="e.g., 4"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    generateFields(parseInt(e.target.value));
                    e.target.value = "";
                  }
                }}
              />
            </div>
            <Button
              onClick={(e) => {
                const input = e.target
                  .closest("div")
                  .parentElement.querySelector("input");
                generateFields(parseInt(input.value));
                input.value = "";
              }}
            >
              Generate Fields
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Quickly create numbered fields (Field 1, Field 2, etc.)
          </p>
        </CardContent>
      </Card>

      {/* Add Field Form */}
      {showAddField && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Add New Field</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddField} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="field_number">Field Number *</Label>
                  <Input
                    id="field_number"
                    type="number"
                    min="1"
                    value={fieldData.field_number}
                    onChange={(e) =>
                      setFieldData({
                        ...fieldData,
                        field_number: e.target.value,
                      })
                    }
                    placeholder="e.g., 1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="field_name">Field Name (Optional)</Label>
                  <Input
                    id="field_name"
                    value={fieldData.field_name}
                    onChange={(e) =>
                      setFieldData({ ...fieldData, field_name: e.target.value })
                    }
                    placeholder="e.g., Main Field"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit">Add Field</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddField(false);
                    setFieldData({ field_number: "", field_name: "" });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Fields List */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Tournament Fields ({fields.length})
            </CardTitle>
            {!showAddField && (
              <Button onClick={() => setShowAddField(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Field
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {fields.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <MapPin className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No fields configured</p>
              <p className="text-sm">
                Add fields to organize your tournament schedule
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {fields.map((field) => (
                <div
                  key={field.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary font-bold text-lg">
                      {field.field_number}
                    </div>
                    <div>
                      <p className="font-medium">
                        {field.field_name || `Field ${field.field_number}`}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Field #{field.field_number}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteDialog(field)}
                    className="hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      {deleteDialog && (
        <AlertDialog
          open={!!deleteDialog}
          onOpenChange={() => setDeleteDialog(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Field?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete{" "}
                <strong>
                  {deleteDialog.field_name ||
                    `Field ${deleteDialog.field_number}`}
                </strong>
                ?
                <br />
                <br />
                This action cannot be undone and will fail if matches are
                scheduled on this field.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => handleDeleteField(deleteDialog.id)}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
