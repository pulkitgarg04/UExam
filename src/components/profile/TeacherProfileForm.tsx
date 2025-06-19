"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { User, Save, CheckCircle, X, GraduationCap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DEPARTMENTS, STUDENT_YEARS, DEGREES } from "@/constants/data";
import type { User as UserData } from "@/types";

interface TeacherProfileFormProps {
  user: UserData;
  onComplete: () => void;
  onProgressUpdate: (progress: number) => void;
}

interface FormData {
  designation: string;
  department: string[];
  degreesTeaching: string[];
  studentYears: string[];
  employeeId: string;
  gender: string;
  dateOfBirth: string;
  phoneNumber: string;
}

export function TeacherProfileForm({
  user,
  onComplete,
  onProgressUpdate,
}: TeacherProfileFormProps) {
  const [formData, setFormData] = useState<FormData>({
    designation: "",
    department: [],
    degreesTeaching: [],
    studentYears: [],
    employeeId: "",
    gender: "",
    dateOfBirth: "",
    phoneNumber: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const calculateProgress = () => {
    const requiredFields: (keyof FormData)[] = [
      "designation",
      "department",
      "employeeId",
      "gender",
      "dateOfBirth",
      "phoneNumber",
    ];

    const filledFields = requiredFields.filter(
      (field) => formData[field] && formData[field].length > 0
    );
    const progress = Math.round(
      (filledFields.length / requiredFields.length) * 100
    );
    onProgressUpdate(progress);
    return progress;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    calculateProgress();
  };

  const handleAddItem = (field: keyof FormData, value: string) => {
    setFormData((prev) => {
      const existingValues = prev[field] as string[];
      if (!existingValues.includes(value)) {
        return { ...prev, [field]: [...existingValues, value] };
      }
      return prev;
    });
    calculateProgress();
  };

  const handleRemoveItem = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((item) => item !== value),
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.designation)
      newErrors.designation = "Designation is required";
    if (!formData.department.length)
      newErrors.department = "Department is required";
    if (!formData.degreesTeaching.length)
      newErrors.degreesTeaching = "Degrees are required";
    if (!formData.studentYears.length)
      newErrors.studentYears = "Student years are required";
    if (!formData.employeeId) newErrors.employeeId = "Employee ID is required";
    if (!formData.gender) newErrors.gender = "Gender is required";
    if (!formData.dateOfBirth)
      newErrors.dateOfBirth = "Date of birth is required";
    if (!formData.phoneNumber)
      newErrors.phoneNumber = "Phone number is required";
    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/profile/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          role: user.role,
          profileData: formData,
        }),
      });

      if (response.ok) {
        const updatedUser = { ...user, profileCompleted: true };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        onComplete();
      } else {
        const error = await response.json();
        console.error("Profile completion failed:", error);
      }
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = calculateProgress();

  return (
    <div className="space-y-6">
      <Alert
        className={`border-2 ${
          progress >= 70
            ? "border-green-200 bg-green-50"
            : "border-orange-200 bg-orange-50"
        }`}
      >
        <CheckCircle
          className={`h-4 w-4 ${
            progress >= 70 ? "text-green-600" : "text-orange-600"
          }`}
        />
        <AlertDescription
          className={progress >= 70 ? "text-green-800" : "text-orange-800"}
        >
          <strong>Profile Progress: {progress}%</strong>
          {progress >= 70 ? (
            <span> - Ready to submit! All required fields are completed.</span>
          ) : (
            <span> - Please complete the required fields marked with *</span>
          )}
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Basic Information
          </CardTitle>
          <CardDescription>
            Provide your basic personal and professional details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="designation">Designation *</Label>
              <Select
                value={formData.designation}
                onValueChange={(value) =>
                  handleInputChange("designation", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select designation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Assistant Professor">
                    Assistant Professor
                  </SelectItem>
                  <SelectItem value="Associate Professor">
                    Associate Professor
                  </SelectItem>
                  <SelectItem value="Professor">Professor</SelectItem>
                  <SelectItem value="Head of Department">
                    Head of Department
                  </SelectItem>
                  <SelectItem value="Dean">Dean</SelectItem>
                  <SelectItem value="Lecturer">Lecturer</SelectItem>
                  <SelectItem value="Senior Lecturer">
                    Senior Lecturer
                  </SelectItem>
                </SelectContent>
              </Select>
              {errors.designation && (
                <p className="text-sm text-red-600">{errors.designation}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department *</Label>
              <Select
                value=""
                onValueChange={(value) => handleAddItem("department", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex flex-wrap gap-2">
                {formData.department.map((dept, index) => (
                  <Badge key={index} className="flex items-center gap-1">
                    {dept}
                    <X onClick={() => handleRemoveItem("department", dept)} />
                  </Badge>
                ))}
              </div>
              {errors.department && (
                <p className="text-sm text-red-600">{errors.department}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="employeeId">Employee ID *</Label>
              <Input
                id="employeeId"
                value={formData.employeeId}
                onChange={(e) =>
                  handleInputChange("employeeId", e.target.value)
                }
                placeholder="Enter employee ID"
              />
              {errors.employeeId && (
                <p className="text-sm text-red-600">{errors.employeeId}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender *</Label>
              <Select
                value={formData.gender}
                onValueChange={(value) => handleInputChange("gender", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MALE">Male</SelectItem>
                  <SelectItem value="FEMALE">Female</SelectItem>
                </SelectContent>
              </Select>
              {errors.gender && (
                <p className="text-sm text-red-600">{errors.gender}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth *</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) =>
                  handleInputChange("dateOfBirth", e.target.value)
                }
              />
              {errors.dateOfBirth && (
                <p className="text-sm text-red-600">{errors.dateOfBirth}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number *</Label>
              <Input
                id="phoneNumber"
                value={formData.phoneNumber}
                onChange={(e) =>
                  handleInputChange("phoneNumber", e.target.value)
                }
                placeholder="Enter phone number"
              />
              {errors.phoneNumber && (
                <p className="text-sm text-red-600">{errors.phoneNumber}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5" />
            Teaching Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Label>Degrees Teaching</Label>
            <Select
              value=""
              onValueChange={(value) => handleAddItem("degreesTeaching", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select degree" />
              </SelectTrigger>
              <SelectContent>
                {DEGREES.map((degree) => (
                  <SelectItem key={degree} value={degree}>
                    {degree}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex flex-wrap gap-2">
              {formData.degreesTeaching.map((degree, index) => (
                <Badge key={index} className="flex items-center gap-1">
                  {degree}
                  <X
                    className="cursor-pointer hover:text-red-600"
                    onClick={() => handleRemoveItem("degreesTeaching", degree)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          <Separator className="my-2" />

          <div className="space-y-4">
            <Label>Student Years</Label>
            <Select
              value=""
              onValueChange={(value) => handleAddItem("studentYears", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {STUDENT_YEARS.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex flex-wrap gap-2">
              {formData.studentYears.map((year, index) => (
                <Badge key={index} className="flex items-center gap-1">
                  {year}
                  <X
                    className="cursor-pointer hover:text-red-600"
                    onClick={() => handleRemoveItem("studentYears", year)}
                  />
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-4 pt-6 border-t">
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || progress < 70}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          {isSubmitting ? (
            <>
              <Save className="w-4 h-4 mr-2 animate-spin" />
              Completing Profile...
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Complete Profile
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
