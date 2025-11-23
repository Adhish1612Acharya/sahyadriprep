"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, GraduationCap, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  completeStudentProfile,
  completeAdminProfile,
} from "@/actions/auth.actions";

interface College {
  id: string;
  name: string;
}

export default function CompleteProfilePage() {
  const router = useRouter();

  const redirecct_url = useSearchParams().get("redirect") || undefined;

  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState<"student" | "college_admin" | null>(null);
  const [colleges, setColleges] = useState<College[]>([]);
  const [userEmail, setUserEmail] = useState("");

  const [studentForm, setStudentForm] = useState({
    full_name: "",
    phone: "",
    college_id: "",
    usn: "",
    batch: "",
    branch: "",
    current_semester: "",
    current_cgpa: "",
  });

  const [adminForm, setAdminForm] = useState({
    full_name: "",
    phone: "",
    college_id: "",
    designation: "",
    department: "",
    employee_id: "",
  });

  useEffect(() => {
    const initialize = async () => {
      const supabase = createClient();

      // Get user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth/login");
        return;
      }

      setUserEmail(user.email || "");

      // Get user role
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (!profile) {
        router.push("/auth/sign-up");
        return;
      }

      setRole(profile.role);

      // Fetch colleges
      const { data: collegesData } = await supabase
        .from("colleges")
        .select("id, name")
        .order("name");

      setColleges(collegesData || []);

      // Pre-fill name from Google OAuth
      if (user.user_metadata?.full_name) {
        if (profile.role === "student") {
          setStudentForm((prev) => ({
            ...prev,
            full_name: user.user_metadata.full_name,
          }));
        } else {
          setAdminForm((prev) => ({
            ...prev,
            full_name: user.user_metadata.full_name,
          }));
        }
      }

      setDataLoading(false);
    };

    initialize();
  }, [router]);

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await completeStudentProfile(
        {
          full_name: studentForm.full_name,
          phone: studentForm.phone || undefined,
          college_id: studentForm.college_id,
          usn: studentForm.usn,
          batch: studentForm.batch,
          branch: studentForm.branch,
          current_semester: studentForm.current_semester
            ? parseInt(studentForm.current_semester)
            : undefined,
          current_cgpa: studentForm.current_cgpa
            ? parseFloat(studentForm.current_cgpa)
            : undefined,
        },
        redirecct_url || "/interview-experiences"
      );

      if (result.error) {
        setError(result.error);
        return;
      }

      if (role === "student") {
        router.push("/interview-experiences");
      } else {
        router.push("/admin/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await completeAdminProfile(
        {
          full_name: adminForm.full_name,
          phone: adminForm.phone || undefined,
          college_id: adminForm.college_id,
          designation: adminForm.designation,
          department: adminForm.department || undefined,
          employee_id: adminForm.employee_id || undefined,
        },
        redirecct_url || "/admin/dashboard"
      );

      if (result.error) {
        setError(result.error);
        return;
      }

      router.push("/college");
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary/5 via-background to-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="h-12 w-12 rounded-lg bg-primary flex items-center justify-center">
              <GraduationCap className="h-7 w-7 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">
            Complete Your Profile
          </CardTitle>
          <CardDescription className="text-center">
            {role === "student"
              ? "Tell us about yourself to get personalized recommendations"
              : "Provide your details to manage your college placement activities"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {role === "student" ? (
            <form onSubmit={handleStudentSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">
                    Full Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="full_name"
                    placeholder="John Doe"
                    value={studentForm.full_name}
                    onChange={(e) =>
                      setStudentForm({
                        ...studentForm,
                        full_name: e.target.value,
                      })
                    }
                    required
                    disabled={loading}
                  />
                </div>

                {/* <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+91 98765 43210(optional)"
                    value={studentForm.phone}
                    onChange={(e) =>
                      setStudentForm({ ...studentForm, phone: e.target.value })
                    }
                    disabled={loading}
                  />
                </div> */}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={userEmail} disabled />
              </div>

              <div className="space-y-2">
                <Label htmlFor="college">
                  College <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={studentForm.college_id}
                  onValueChange={(value) =>
                    setStudentForm({ ...studentForm, college_id: value })
                  }
                  required
                  disabled={loading}
                >
                  <SelectTrigger id="college">
                    <SelectValue placeholder="Select your college" />
                  </SelectTrigger>
                  <SelectContent>
                    {colleges.map((college) => (
                      <SelectItem key={college.id} value={college.id}>
                        {college.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="usn">
                    USN <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="usn"
                    placeholder="1MS21CS001"
                    value={studentForm.usn}
                    onChange={(e) =>
                      setStudentForm({
                        ...studentForm,
                        usn: e.target.value.toUpperCase(),
                      })
                    }
                    required
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="batch">
                    Batch <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="batch"
                    placeholder="2021-2025"
                    value={studentForm.batch}
                    onChange={(e) =>
                      setStudentForm({ ...studentForm, batch: e.target.value })
                    }
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="branch">
                  Branch <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={studentForm.branch}
                  onValueChange={(value) =>
                    setStudentForm({ ...studentForm, branch: value })
                  }
                  required
                  disabled={loading}
                >
                  <SelectTrigger id="branch">
                    <SelectValue placeholder="Select your branch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Computer Science and Engineering">
                      Computer Science and Engineering
                    </SelectItem>
                    <SelectItem value="Information Science and Engineering">
                      Information Science and Engineering
                    </SelectItem>
                    <SelectItem value="Artificial Intelligence and Machine Learning">
                      Artificial Intelligence and Machine Learning
                    </SelectItem>
                    <SelectItem value="Electronics and Communication Engineering">
                      Electronics and Communication Engineering
                    </SelectItem>
                    <SelectItem value="Mechanical Engineering">
                      Mechanical Engineering
                    </SelectItem>
                    <SelectItem value="Civil Engineering">
                      Civil Engineering
                    </SelectItem>
                    <SelectItem value="Electrical Engineering">
                      Electrical Engineering
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="current_semester">Current Semester</Label>
                  <Select
                    value={studentForm.current_semester}
                    onValueChange={(value) =>
                      setStudentForm({
                        ...studentForm,
                        current_semester: value,
                      })
                    }
                    disabled={loading}
                  >
                    <SelectTrigger id="current_semester">
                      <SelectValue placeholder="Select semester" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                        <SelectItem key={sem} value={sem.toString()}>
                          Semester {sem}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="current_cgpa">Current CGPA</Label>
                  <Input
                    id="current_cgpa"
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    placeholder="8.50"
                    value={studentForm.current_cgpa}
                    onChange={(e) =>
                      setStudentForm({
                        ...studentForm,
                        current_cgpa: e.target.value,
                      })
                    }
                    disabled={loading}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Complete Profile"
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleAdminSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">
                    Full Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="full_name"
                    placeholder="Dr. John Doe"
                    value={adminForm.full_name}
                    onChange={(e) =>
                      setAdminForm({ ...adminForm, full_name: e.target.value })
                    }
                    required
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+91 9876543210(optional)"
                    value={adminForm.phone}
                    onChange={(e) =>
                      setAdminForm({ ...adminForm, phone: e.target.value })
                    }
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={userEmail} disabled />
              </div>

              <div className="space-y-2">
                <Label htmlFor="college">
                  College <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={adminForm.college_id}
                  onValueChange={(value) =>
                    setAdminForm({ ...adminForm, college_id: value })
                  }
                  required
                  disabled={loading}
                >
                  <SelectTrigger id="college">
                    <SelectValue placeholder="Select your college" />
                  </SelectTrigger>
                  <SelectContent>
                    {colleges.map((college) => (
                      <SelectItem key={college.id} value={college.id}>
                        {college.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="designation">
                    Designation <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="designation"
                    placeholder="Placement Officer"
                    value={adminForm.designation}
                    onChange={(e) =>
                      setAdminForm({
                        ...adminForm,
                        designation: e.target.value,
                      })
                    }
                    required
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    placeholder="Training & Placement"
                    value={adminForm.department}
                    onChange={(e) =>
                      setAdminForm({ ...adminForm, department: e.target.value })
                    }
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="employee_id">Employee ID</Label>
                <Input
                  id="employee_id"
                  placeholder="EMP12345"
                  value={adminForm.employee_id}
                  onChange={(e) =>
                    setAdminForm({ ...adminForm, employee_id: e.target.value })
                  }
                  disabled={loading}
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Complete Profile"
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
