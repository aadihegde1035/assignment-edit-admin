
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

// Define types for our data
interface Assignment {
  id: string;
  user_name: string;
  title: string;
  content: string | null;
  submitted_at: string | null;
  status: string;
  score: number | null;
  user_id: string | null;
}

const Dashboard = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("submitted_at");
  const [sortDirection, setSortDirection] = useState("desc");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if admin is logged in
  useEffect(() => {
    const adminUser = localStorage.getItem('admin_user');
    if (!adminUser) {
      navigate("/login");
    }
  }, [navigate]);

  // Fetch assignments from Supabase
  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const { data, error } = await supabase
          .from('user_assignments')
          .select('*');

        if (error) throw error;

        // Transform data if needed
        const formattedAssignments = data.map(item => ({
          id: item.id,
          user_name: item.user_name || 'Unknown',
          title: item.title || `Assignment ID: ${item.assignment_id}`,
          content: item.content,
          submitted_at: item.submitted_at,
          status: item.status,
          score: item.score,
          user_id: item.user_id
        }));

        setAssignments(formattedAssignments);
      } catch (error) {
        console.error("Error fetching assignments:", error);
        toast({
          title: "Error",
          description: "Failed to load assignments",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssignments();
  }, [toast]);

  // Format date string to a readable format
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  // Filter and sort assignments
  const filteredAssignments = assignments
    .filter((assignment) => {
      const matchesSearch =
        (assignment.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
        assignment.title.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (statusFilter === "all") return matchesSearch;
      return matchesSearch && assignment.status === statusFilter;
    })
    .sort((a, b) => {
      if (sortField === "user_name") {
        return sortDirection === "asc"
          ? (a.user_name || '').localeCompare(b.user_name || '')
          : (b.user_name || '').localeCompare(a.user_name || '');
      }
      if (sortField === "submitted_at") {
        const dateA = a.submitted_at ? new Date(a.submitted_at).getTime() : 0;
        const dateB = b.submitted_at ? new Date(b.submitted_at).getTime() : 0;
        return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
      }
      if (sortField === "status") {
        return sortDirection === "asc"
          ? a.status.localeCompare(b.status)
          : b.status.localeCompare(a.status);
      }
      if (sortField === "score") {
        const scoreA = a.score === null ? -1 : a.score;
        const scoreB = b.score === null ? -1 : b.score;
        return sortDirection === "asc" ? scoreA - scoreB : scoreB - scoreA;
      }
      return 0;
    });

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleEditClick = (id: string) => {
    navigate(`/edit-assignment/${id}`);
  };

  return (
    <AdminLayout title="Assignments Dashboard">
      <div className="space-y-6">
        {/* Filters and search */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 gap-4">
            <Input
              placeholder="Search by name or title"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="scored">Scored</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="text-right text-sm text-muted-foreground">
            {filteredAssignments.length} assignments found
          </div>
        </div>

        {/* Assignments table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center items-center py-10">
                <p>Loading assignments...</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSort("user_name")}
                    >
                      Student Name {sortField === "user_name" && (sortDirection === "asc" ? "↑" : "↓")}
                    </TableHead>
                    <TableHead>Assignment Title</TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSort("submitted_at")}
                    >
                      Submission Date {sortField === "submitted_at" && (sortDirection === "asc" ? "↑" : "↓")}
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSort("status")}
                    >
                      Status {sortField === "status" && (sortDirection === "asc" ? "↑" : "↓")}
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer text-right"
                      onClick={() => handleSort("score")}
                    >
                      Score {sortField === "score" && (sortDirection === "asc" ? "↑" : "↓")}
                    </TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAssignments.map((assignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell className="font-medium">{assignment.user_name}</TableCell>
                      <TableCell>{assignment.title}</TableCell>
                      <TableCell>{formatDate(assignment.submitted_at)}</TableCell>
                      <TableCell>
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
                      </TableCell>
                      <TableCell className="text-right">
                        {assignment.score !== null ? assignment.score : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditClick(assignment.id)}
                        >
                          ✏️ Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredAssignments.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                        No assignments found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
