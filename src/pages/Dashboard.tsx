
import { useState } from "react";
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

// This is placeholder data to be replaced with actual data from Supabase
const placeholderAssignments = [
  {
    id: 1,
    user_name: "John Doe",
    title: "Math Assignment 1",
    content: "Solutions to algebra problems...",
    submitted_at: "2023-05-10T14:30:00",
    status: "pending",
    score: null,
  },
  {
    id: 2,
    user_name: "Jane Smith",
    title: "Physics Lab Report",
    content: "Experimental results and analysis...",
    submitted_at: "2023-05-09T09:15:00",
    status: "scored",
    score: 85,
  },
  {
    id: 3,
    user_name: "Alex Johnson",
    title: "History Essay",
    content: "Analysis of World War II causes...",
    submitted_at: "2023-05-08T16:45:00",
    status: "scored",
    score: 92,
  },
  {
    id: 4,
    user_name: "Sarah Williams",
    title: "Chemistry Report",
    content: "Chemical reactions documentation...",
    submitted_at: "2023-05-11T11:20:00",
    status: "pending",
    score: null,
  },
];

const Dashboard = () => {
  const [assignments, setAssignments] = useState(placeholderAssignments);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("submitted_at");
  const [sortDirection, setSortDirection] = useState("desc");
  const [statusFilter, setStatusFilter] = useState("all");

  // Format date string to a readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  // Filter and sort assignments
  const filteredAssignments = assignments
    .filter((assignment) => {
      const matchesSearch =
        assignment.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assignment.title.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (statusFilter === "all") return matchesSearch;
      return matchesSearch && assignment.status === statusFilter;
    })
    .sort((a, b) => {
      if (sortField === "user_name") {
        return sortDirection === "asc"
          ? a.user_name.localeCompare(b.user_name)
          : b.user_name.localeCompare(a.user_name);
      }
      if (sortField === "submitted_at") {
        return sortDirection === "asc"
          ? new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime()
          : new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime();
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
                        onClick={() => console.log(`Edit assignment ${assignment.id}`)}
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
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
