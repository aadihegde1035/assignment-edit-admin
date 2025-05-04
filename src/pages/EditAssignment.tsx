
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ReactQuill from "react-quill";
import 'react-quill/dist/quill.snow.css';

interface Assignment {
  id: string;
  user_name: string | null;
  content: string | null;
  submitted_at: string | null;
  status: string;
  score: number | null;
  user_id: string | null;
  assignment_id: string | null;
}

const EditAssignment = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [content, setContent] = useState<string>("");
  const [score, setScore] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Check if admin is logged in
  useEffect(() => {
    const adminUser = localStorage.getItem('admin_user');
    if (!adminUser) {
      navigate("/login");
    }
  }, [navigate]);

  // Fetch assignment data
  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        const { data, error } = await supabase
          .from('user_assignments')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        
        setAssignment(data);
        setContent(data.content || "");
        setScore(data.score ? data.score.toString() : "");
      } catch (error) {
        console.error("Error fetching assignment:", error);
        toast({
          title: "Error",
          description: "Failed to load assignment details",
          variant: "destructive",
        });
        navigate("/dashboard");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchAssignment();
    }
  }, [id, navigate, toast]);

  const handleSave = async () => {
    if (!assignment) return;
    
    try {
      setIsSaving(true);
      
      const scoreValue = score ? parseInt(score, 10) : null;
      const newStatus = scoreValue !== null ? "scored" : "pending";
      
      const { error } = await supabase
        .from('user_assignments')
        .update({
          content,
          score: scoreValue,
          status: newStatus
        })
        .eq('id', assignment.id);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Assignment updated successfully",
      });
      
      navigate("/dashboard");
    } catch (error) {
      console.error("Error updating assignment:", error);
      toast({
        title: "Error",
        description: "Failed to update assignment",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  if (isLoading) {
    return (
      <AdminLayout title="Loading...">
        <div className="flex justify-center items-center py-10">
          <p>Loading assignment details...</p>
        </div>
      </AdminLayout>
    );
  }

  if (!assignment) {
    return (
      <AdminLayout title="Assignment Not Found">
        <Card>
          <CardContent className="py-10">
            <p className="text-center">Assignment not found</p>
            <div className="flex justify-center mt-6">
              <Button onClick={() => navigate("/dashboard")}>
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Edit Assignment">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Assignment Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Student Name</p>
              <p className="font-medium">{assignment.user_name || "Unknown"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Assignment ID</p>
              <p className="font-medium">{assignment.assignment_id || "Unknown"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Submission Date</p>
              <p className="font-medium">{formatDate(assignment.submitted_at)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Status</p>
              <p className="font-medium">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${
                      assignment.status === "pending"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-green-100 text-green-800"
                    }`}
                >
                  {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                </span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Assignment Content</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="min-h-[300px]">
            <ReactQuill 
              theme="snow" 
              value={content} 
              onChange={setContent}
              className="min-h-[250px]"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Score Assignment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <div className="flex items-end space-x-4">
              <div className="grid w-full max-w-sm gap-1.5">
                <Label htmlFor="score">Score (0-100)</Label>
                <Input
                  id="score"
                  type="number"
                  min="0"
                  max="100"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  placeholder="Enter score..."
                />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Leave empty to keep the assignment in "pending" status
                </p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-4">
              <Button
                variant="outline"
                onClick={() => navigate("/dashboard")}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default EditAssignment;
