"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { User, Save, CheckCircle } from "lucide-react";
import { DEPARTMENTS, STUDENT_YEARS, DEGREES } from "@/constants/data";

interface StudentProfileFormProps {
  user: any;
  onComplete: () => void;
  onProgressUpdate: (progress: number) => void;
}

export function StudentProfileForm({
  user,
  onComplete,
  onProgressUpdate,
}: StudentProfileFormProps) {
  const [formData, setFormData] = useState({
    rollNumber: "",
    department: "",
    yearOfStudy: "",
    courseName: "",
    dateOfBirth: "",
    gender: "",
    bloodGroup: "",
    phoneNumber: "",
    permanentAddress: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const calculateProgress = () => {
    const requiredFields = [
      "rollNumber",
      "department",
      "yearOfStudy",
      "courseName",
      "dateOfBirth",
      "gender",
      "phoneNumber",
      "permanentAddress",
    ];

    const filledRequired = requiredFields.filter((field) => {
      const value = formData[field as keyof typeof formData];
      return value && value !== "";
    }).length;

    const progress = (filledRequired / requiredFields.length) * 100;

    onProgressUpdate(Math.round(progress));
    return Math.round(progress);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    calculateProgress();
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.rollNumber) newErrors.rollNumber = "Roll number is required";
    if (!formData.department) newErrors.department = "Department is required";
    if (!formData.yearOfStudy)
      newErrors.yearOfStudy = "Year of study is required";
    if (!formData.courseName) newErrors.courseName = "Course name is required";
    if (!formData.dateOfBirth)
      newErrors.dateOfBirth = "Date of birth is required";
    if (!formData.gender) newErrors.gender = "Gender is required";
    if (!formData.phoneNumber)
      newErrors.phoneNumber = "Phone number is required";
    if (!formData.permanentAddress)
      newErrors.permanentAddress = "Permanent address is required";

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
          profileData: {
            ...formData,
            yearOfStudy: Number.parseInt(formData.yearOfStudy),
          },
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
            Provide your basic personal and academic details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rollNumber">Roll Number *</Label>
              <Input
                id="rollNumber"
                value={formData.rollNumber}
                onChange={(e) =>
                  handleInputChange("rollNumber", e.target.value)
                }
                placeholder="Enter roll number"
              />
              {errors.rollNumber && (
                <p className="text-sm text-red-600">{errors.rollNumber}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department *</Label>
              <Select
                value={formData.department}
                onValueChange={(value) =>
                  handleInputChange("department", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((department) => (
                    <SelectItem key={department} value={department}>
                      {department}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.department && (
                <p className="text-sm text-red-600">{errors.department}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="courseName">Course Name *</Label>
              <Select
                value={formData.courseName}
                onValueChange={(value) =>
                  handleInputChange("courseName", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  {DEGREES.map((degree) => (
                    <SelectItem key={degree} value={degree}>
                      {degree}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.courseName && (
                <p className="text-sm text-red-600">{errors.courseName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="yearOfStudy">Year of Study *</Label>
              <Select
                value={formData.yearOfStudy}
                onValueChange={(value) =>
                  handleInputChange("yearOfStudy", value)
                }
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
              {errors.yearOfStudy && (
                <p className="text-sm text-red-600">{errors.yearOfStudy}</p>
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
              <Label htmlFor="bloodGroup">Blood Group</Label>
              <Select
                value={formData.bloodGroup}
                onValueChange={(value) =>
                  handleInputChange("bloodGroup", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select blood group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A+">A+</SelectItem>
                  <SelectItem value="A-">A-</SelectItem>
                  <SelectItem value="B+">B+</SelectItem>
                  <SelectItem value="B-">B-</SelectItem>
                  <SelectItem value="AB+">AB+</SelectItem>
                  <SelectItem value="AB-">AB-</SelectItem>
                  <SelectItem value="O+">O+</SelectItem>
                  <SelectItem value="O-">O-</SelectItem>
                </SelectContent>
              </Select>
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

          <div className="space-y-2">
            <Label htmlFor="permanentAddress">Permanent Address *</Label>
            <Textarea
              id="permanentAddress"
              value={formData.permanentAddress}
              onChange={(e) =>
                handleInputChange("permanentAddress", e.target.value)
              }
              placeholder="Enter your permanent address"
              rows={3}
            />
            {errors.permanentAddress && (
              <p className="text-sm text-red-600">{errors.permanentAddress}</p>
            )}
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
