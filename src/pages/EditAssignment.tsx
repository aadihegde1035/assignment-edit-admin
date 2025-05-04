
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

// This is a placeholder that will be replaced with actual data fetching from Supabase
const getAssignmentById = (id: string) => {
  return {
    id: parseInt(id),
    user_name: "John Doe",
    title: "Math Assignment 1",
    content: "Solutions to algebra problems...",
    submitted_at: "2023-05-10T14:30:00",
    status: "pending",
    score: null,
  };
};

const EditAssignment = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // In a real app, this would fetch the assignment data from Supabase
  const assignmentData = id ? getAssignmentById(id) : null;
  
  const [content, setContent] = useState(assignmentData?.content || "");
  const [score, setScore] = useState<number | null>(assignmentData?.score || null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!assignmentData) {
    return (
      <AdminLayout title="Assignment Not Found">
        <div className="flex flex-col items-center justify-center h-full">
          <h2 className="text-2xl font-bold mb-4">Assignment not found</h2>
          <Button onClick={() => navigate("/dashboard")}>Return to Dashboard</Button>
        </div>
      </AdminLayout>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // This would be replaced with actual Supabase update logic
      console.log("Updating assignment:", {
        id,
        content,
        score,
        status: score !== null ? "scored" : "pending",
      });

      // Simulating API call
      setTimeout(() => {
        toast({
          title: "Please connect Supabase",
          description: "Database operations require Supabase integration",
        });
        setIsSubmitting(false);
      }, 1000);
    } catch (error) {
      console.error("Error updating assignment:", error);
      toast({
        title: "Update failed",
        description: "There was an error updating the assignment",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout title={`Edit Assignment: ${assignmentData.title}`}>
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
                  <Input value={assignmentData.user_name} disabled />
                </div>
                <div>
                  <Label>Submission Date</Label>
                  <Input 
                    value={new Date(assignmentData.submitted_at).toLocaleString()} 
                    disabled 
                  />
                </div>
              </div>
              
              <div>
                <Label>Title</Label>
                <Input value={assignmentData.title} disabled />
              </div>

              <div>
                <Label htmlFor="content">Content</Label>
                <div className="border rounded-md p-4 min-h-[200px] bg-white">
                  <Textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="min-h-[200px] border-none p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    placeholder="This will be replaced with a rich text editor"
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  A rich text editor like Quill will be integrated here
                </p>
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
