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

const customStyles = {
  control: (provided:any) => ({
    ...provided,
    minHeight: '40px',
  }),
  menu: (provided:any) => ({
    ...provided,
    backgroundColor: '#f0f0f0', // Change to your desired background color
    zIndex: 9999, // Ensure the menu is displayed above other elements
  }),
  menuList: (provided:any) => ({
    ...provided,
    backgroundColor: '#f0f0f0', // Change to your desired background color
  }),
  valueContainer: (provided:any) => ({
    ...provided,
    minHeight: '40px',
  }),
  input: (provided:any) => ({
    ...provided,
    minHeight: '40px',
  }),
};

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
        const data = new FormData();

        Object.entries(formData).forEach(([key, value]) => {
          if (value !== null) {
            formDataToSend.append(key, value);
          }
        });

        const response = await fetch(process.env.NEXT_PUBLIC_BASE_URL + "/api/upload-file", {
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

        data.append('to', formData.email);
        data.append('subject', 'Your CV is subbmited to Senkadagala PLC');
        data.append('text', `Dear ${formData.firstName} ${formData.lastName}, \n\nThank you for applying for the ${positions.find((option) => option.value === formData.position)?.label} position here at Senkadagala Finance PLC. Our Recruitment Manager has received your application, and if you will be contacted later for with further information. \n\nThank you,\nRecruitments @ Senkadagala Finance PLC.`);
        data.append('html', '');

        console.log(data.get('text'));

        try {
          const response = await fetch(process.env.NEXT_PUBLIC_BASE_URL + '/api/send-email', {
            method: 'POST',
            body: data,
          });

          if (response.ok) {
            toast({
              description: "You will receive an Email shortly!",
              variant: "default",
            });
          } else {
            console.error('Error sending email:');
          }
        } catch (error) {
          console.error('Error sending email:', error);
        }

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
        const response = await fetch(process.env.NEXT_PUBLIC_BASE_URL + `/api/position`);
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
    <div className="min-h-[95vh]">
      <div className="flex justify-center">
        <Card className="px-2 md:mx-72 pb-5 mb-10 sm:mx-20 mt-10 border-green-400 border-2">
          <div className="px-10 text-center">
            <div className="text-3xl font-semibold mt-5">Submit Your CV</div>
          </div>
          <form className=" mt-6 px-10" onSubmit={handleSubmit}>
            <div className="grid gap-1">
              <div className="flex gap-2">
                <div className="mb-1 w-1/2">
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
                <div className="mb-1 w-1/2">
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
              </div>
              <div className="flex gap-2">
                <div className="mb-1 w-1/2">
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
                <div className="mb-1 w-1/2">
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
              </div>
              <div className="mb-1">
                <Select
                   styles={customStyles}
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
                 styles={customStyles}
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
              <div className="mb-1 ms-3">
                <label className="block text-sm font-medium text-gray-400">Resume (PDF)</label>
                <input
                  type="file"
                  name="file"
                  accept=".pdf"
                  onChange={handleChange}
                  className={`mt-1 block w-full border-green-300 bg-gray-50 text-gray-400 ${formErrors.file ? "border-red-500" : ""
                    }`}
                />
                {formErrors.file && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.file}</p>
                )}
              </div>
            </div>
            <div className="flex justify-center m-4">
              <Button type="submit" variant="bordered" color="success" className="my-2 me-2 text-green-500 hover:bg-green-500 hover:text-white ">
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
    </div>
  );
};

export default ApplyVacancy;
