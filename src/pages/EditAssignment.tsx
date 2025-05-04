
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface Assignment {
  id: string;
  user_name: string | null;
  title?: string;
  content: string | null;
  submitted_at: string | null;
  status: string;
  score: number | null;
}

const EditAssignment = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [content, setContent] = useState("");
  const [score, setScore] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      if (!id) return;
      
      try {
        const { data, error } = await supabase
          .from('user_assignments')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) throw error;
        
        setAssignment(data);
        setContent(data.content || "");
        setScore(data.score);
      } catch (error) {
        console.error("Error fetching assignment:", error);
        toast({
          title: "Error",
          description: "Failed to load assignment data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssignment();
  }, [id, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!id || !assignment) return;
    
    setIsSubmitting(true);

    try {
      // Update both content and score status
      const { error } = await supabase
        .from('user_assignments')
        .update({
          content,
          score,
          status: score !== null ? "scored" : "pending",
          score_status: score !== null ? "scored" : "pending"
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Assignment updated successfully",
      });
      
      // Navigate back to dashboard after successful update
      navigate("/dashboard");
    } catch (error) {
      console.error("Error updating assignment:", error);
      toast({
        title: "Update failed",
        description: "There was an error updating the assignment",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout title="Loading...">
        <div className="flex justify-center items-center h-64">
          <p>Loading assignment data...</p>
        </div>
      </AdminLayout>
    );
  }

  if (!assignment) {
    return (
      <AdminLayout title="Assignment Not Found">
        <div className="flex flex-col items-center justify-center h-full">
          <h2 className="text-2xl font-bold mb-4">Assignment not found</h2>
          <Button onClick={() => navigate("/dashboard")}>Return to Dashboard</Button>
        </div>
      </AdminLayout>
    );
  }

  const assignmentTitle = assignment.title || `Assignment ID: ${id}`;

  return (
    <AdminLayout title={`Edit Assignment: ${assignmentTitle}`}>
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Assignment Details</CardTitle>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Student</Label>
                  <Input value={assignment.user_name || "Unknown"} disabled />
                </div>
                <div>
                  <Label>Submission Date</Label>
                  <Input 
                    value={assignment.submitted_at ? new Date(assignment.submitted_at).toLocaleString() : "Not submitted"} 
                    disabled 
                  />
                </div>
              </div>
              
              <div>
                <Label>Title</Label>
                <Input value={assignmentTitle} disabled />
              </div>

              <div>
                <Label htmlFor="content">Content</Label>
                <div className="border rounded-md bg-white">
                  <ReactQuill
                    theme="snow"
                    value={content}
                    onChange={setContent}
                    className="min-h-[200px]"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="score">Score (0-100)</Label>
                <Input
                  id="score"
                  type="number"
                  min="0"
                  max="100"
                  value={score === null ? "" : score}
                  onChange={(e) => {
                    const value = e.target.value === "" ? null : parseInt(e.target.value);
                    setScore(value);
                  }}
                  className="max-w-[100px]"
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/dashboard")}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isSubmitting}
                className="bg-admin-primary hover:bg-admin-secondary"
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default EditAssignment;
