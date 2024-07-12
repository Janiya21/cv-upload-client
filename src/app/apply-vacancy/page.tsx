"use client";
import React, { useEffect, useState } from "react";
import { Card, Button, Input, Spinner } from "@nextui-org/react";
import Select from "react-select";
import geoData from "../../../public/cities-by-district.json";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from 'next/navigation';

interface Option {
  value: string;
  label: string;
}

interface FormData {
  firstName: string;
  lastName: string;
  phoneNo: string;
  email: string;
  noticePeriod: string;
  location: string;
  position: string;
  file: File | null; // Specify file type
}

const ApplyVacancy = () => {
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    phoneNo: "",
    email: "",
    noticePeriod: "",
    location: "",
    position: "",
    file: null,
  });

  const [formErrors, setFormErrors] = useState({
    firstName: "",
    lastName: "",
    phoneNo: "",
    email: "",
    noticePeriod: "",
    location: "",
    position: "",
    file: "",
  });

  const [positions, setPositions] = useState<Option[]>([]);
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const locationsData: Option[] = Object.values(geoData).flatMap((district: { cities: string[] }) =>
    district.cities.map((city) => ({ value: city, label: city }))
  );

  const validate = () => {
    const errors: any = {};

    if (!formData.firstName) errors.firstName = "First name is required";
    if (!formData.lastName) errors.lastName = "Last name is required";
    if (!formData.phoneNo) {
      errors.phoneNo = "Phone number is required";
    } else {
      const phoneRegex = /^[0-9]{10}$/; // Adjust the regex based on your requirements
      if (!phoneRegex.test(formData.phoneNo)) {
        errors.phoneNo = "Invalid phone number format";
      }
    }

    if (!formData.email) {
      errors.email = "Email is required";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        errors.email = "Invalid email format";
      }
    }

    if (!formData.noticePeriod) {
      errors.noticePeriod = "Notice period is required";
    } else if (!/^\d+$/.test(formData.noticePeriod)) {
      errors.noticePeriod = "Notice period must be a digit";
    }

    if (!formData.location) errors.location = "Location is required";
    if (!formData.position) errors.position = "Position is required";

    if (!formData.file) {
      errors.file = "File is required";
    } else if (formData.file.size && formData.file.size > 3 * 1024 * 1024) { // Check file size
      errors.file = "File size must be less than 3MB";
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length === 0) {
      setIsSubmitting(true);

      try {
        const formDataToSend = new FormData();

        Object.entries(formData).forEach(([key, value]) => {
          if (value !== null) {
            formDataToSend.append(key, value);
          }
        });

        const response = await fetch(process.env.NEXT_PUBLIC_BASE_URL+"/api/applicant-alt", {
          method: "POST",
          body: formDataToSend,
        });

        if (!response.ok) {
          toast({
            description: "Error Submitting Application!",
            variant: "destructive",
          });
          throw new Error("Failed to submit application");
        }
        console.log("Application submitted successfully");
        router.push('/');
        toast({
          description: "Successfully Submitted!",
          variant: "default",
        });
      } catch (error) {
        console.error("Error submitting application", error);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setFormErrors(errors);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (e.target instanceof HTMLInputElement) {
      if (e.target.type === "file") {
        const file = e.target.files ? e.target.files[0] : null;
        setFormData({
          ...formData,
          [name]: file,
        });
      } else {
        setFormData({
          ...formData,
          [name]: value,
        });
      }
    }
  };

  const handleSelectChange = (selectedOption: Option | null, name: string) => {
    setFormData({ ...formData, [name]: selectedOption ? selectedOption.value : "" });
  };

  useEffect(() => {
    const fetchPositions = async () => {
      try {
        const response = await fetch(process.env.NEXT_PUBLIC_BASE_URL+`/api/position`);
        const data = await response.json();
        const activePositions = data.filter((position: { status: string }) => position.status === 'active');
        const positionOptions = activePositions.map((position: { _id: string; name: string }) => ({
          value: position._id,
          label: position.name,
        }));
        setPositions(positionOptions);
      } catch (error) {
        console.error("Error fetching positions:", error);
      }
    };

    fetchPositions();
  }, []);

  return (
    <div className="mx-20">
      <Card className="px-20 mx-72 mt-10 border-green-400 border-2">
        <div className="px-10 text-center">
          <div className="text-3xl font-semibold mt-5">CV SUBMISSION</div>
        </div>
        <form className=" mt-6 px-10" onSubmit={handleSubmit}>
          <div className="grid gap-1">
            <div className="mb-1">
              <Input
                name="firstName"
                label="First Name"
                // placeholder="First Name"
                value={formData.firstName}
                onChange={handleChange}
                isInvalid={!!formErrors.firstName}
              />
              {formErrors.firstName && (
                <p className="mt-1 text-sm text-red-500">{formErrors.firstName}</p>
              )}
            </div>
            <div className="mb-1">
              <Input
                name="lastName"
                label="Last Name"
                value={formData.lastName}
                onChange={handleChange}
                isInvalid={!!formErrors.lastName}
              />
              {formErrors.lastName && (
                <p className="mt-1 text-sm text-red-500">{formErrors.lastName}</p>
              )}
            </div>
            <div className="mb-1">
              <Select
                options={positions}
                className="z-40"
                placeholder="Select a Position"
                onChange={(option) => handleSelectChange(option, "position")}
                value={positions.find((option) => option.value === formData.position)}
              />
              {formErrors.position && (
                <p className="mt-1 text-sm text-red-500">{formErrors.position}</p>
              )}
            </div>
            <div className="mb-1">
              <Select
                className="z-30"
                options={locationsData}
                placeholder="Select a Location"
                onChange={(option) => handleSelectChange(option, "location")}
                value={locationsData.find((option) => option.value === formData.location)}
              />
              {formErrors.location && (
                <p className="mt-1 text-sm text-red-500">{formErrors.location}</p>
              )}
            </div>
            <div className="mb-1">
              <Input
                name="phoneNo"
                label="Phone Number"
                type="number"
                value={formData.phoneNo}
                onChange={handleChange}
                isInvalid={!!formErrors.phoneNo}
              />
              {formErrors.phoneNo && (
                <p className="mt-1 text-sm text-red-500">{formErrors.phoneNo}</p>
              )}
            </div>
            <div className="mb-1">
              <Input
                label="Email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                isInvalid={!!formErrors.email}
              />
              {formErrors.email && (
                <p className="mt-1 text-sm text-red-500">{formErrors.email}</p>
              )}
            </div>
            <div className="mb-1">
              <Input
                name="noticePeriod"
                type="number"
                value={formData.noticePeriod}
                onChange={handleChange}
                label="Notice Period (months)"
                isInvalid={!!formErrors.noticePeriod}
              />
              {formErrors.noticePeriod && (
                <p className="mt-1 text-sm text-red-500">{formErrors.noticePeriod}</p>
              )}
            </div>
            <div className="mb-1">
              <label className="block text-sm font-medium text-gray-700">Resume (PDF)</label>
              <input
                type="file"
                name="file"
                accept=".pdf"
                onChange={handleChange}
                className={`mt-1 block w-full ${formErrors.file ? "border-red-500" : ""
                  }`}
              />
              {formErrors.file && (
                <p className="mt-1 text-sm text-red-500">{formErrors.file}</p>
              )}
            </div>
          </div>
          <div className="flex justify-center m-4">
            <Button type="submit" className="bg-green-600 text-md text-white">
              Submit Application
            </Button>
          </div>
        </form>
        {isSubmitting && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
            <Spinner size="lg" label="Loading..." color="success" labelColor="success" />
          </div>
        )}
      </Card>
    </div>
  );
};

export default ApplyVacancy;
