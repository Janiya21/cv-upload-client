"use client";
import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Divider,
  Image,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Input,
  Select,
  SelectItem,
  useDisclosure,
} from "@nextui-org/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { useToast } from "@/components/ui/use-toast";
import { Spinner } from "@nextui-org/react";
import { useRouter } from "next/navigation";

interface Vacancy {
  title: string;
  location: string[];
  positionDetails: any;
  status: string;
  createDate: string;
  endDate: string;
  description: string;
}

const DetailPage = (context: any) => {
  const { data: vacancyId } = context.searchParams;
  const { toast } = useToast();
  const [vacancyData, setVacancyData] = useState<Vacancy | null>(null);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    vacancy: vacancyId,
    firstName: "",
    lastName: "",
    phoneNo: "",
    email: "",
    noticePeriod: "",
    location: "",
    file: null,
  });

  const [formErrors, setFormErrors] = useState({
    firstName: "",
    lastName: "",
    phoneNo: "",
    email: "",
    noticePeriod: "",
    location: "",
    file: "",
  });

  useEffect(() => {
    const fetchVacancy = async () => {
      if (vacancyId) {
        try {
          const response = await fetch(process.env.NEXT_PUBLIC_BASE_URL+`/api/vacancy/${vacancyId}?id=${vacancyId}`);
          if (!response.ok) {
            toast({
              description: "Failed to fetch Vacancy Data!",
              variant: "destructive",
            });
            throw new Error("Failed to fetch vacancy details");
          }
          const data = await response.json();
          setVacancyData(data);
        } catch (error) {
          toast({
            description: "Failed to fetch Vacancy Data!",
            variant: "destructive",
          });
          console.error("Error fetching vacancy details", error);
        }
      }
    };

    fetchVacancy();
  }, [vacancyId]);

  const validate = () => {
    const errors: any = {};
    if (!formData.firstName) errors.firstName = "First name is required";
    if (!formData.lastName) errors.lastName = "Last name is required";
    if (!formData.phoneNo || !/^\d{10}$/.test(formData.phoneNo)) errors.phoneNo = "Phone number must be exactly 10 digits";
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = "Valid email is required";
    if (!formData.noticePeriod) errors.noticePeriod = "Notice period is required";
    if (!formData.location) errors.location = "Location is required";
    if (!formData.file) errors.file = "File is required";
    return errors;
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length === 0) {
      console.log(formData);
      setIsSubmitting(true);
      try {
        const formDataToSend = new FormData();
        const data = new FormData();

        Object.entries(formData).forEach(([key, value]) => {
          if (value !== null) {
            formDataToSend.append(key, value);
          }
        });

        const response = await fetch(process.env.NEXT_PUBLIC_BASE_URL+"/api/applicant", {
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
        // router.push('/');
        onOpenChange();
        toast({
          description: "Successfully Submitted!",
          variant: "default",
        });
        console.log("Application submitted successfully");

        data.append('to', formData.email);
        data.append('subject', 'Your CV is subbmited to Senkadagala PLC');
        data.append('text', `Dear ${formData.firstName} ${formData.lastName}, \n\nThank you for applying for the ${vacancyData?.title} position here at Senkadagala Finance PLC. Our Recruitment Manager has received your application, and if you will be contacted later for with further information. \n\nThank you,\nRecruitments @ Senkadagala Finance PLC.`);
        data.append('html', '');

        console.log(data.get('text'));

        try {
          const response = await fetch(process.env.NEXT_PUBLIC_BASE_URL+'/api/send-email', {
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
        setIsSubmitting(false); // Reset isSubmitting after submission attempt
      }
    } else {
      setFormErrors(errors);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> | any) => {
    const { name, value, files } = e.target;
    if (name === 'file' && files) {
      console.log('File selected:', files[0]); // Log the selected file
    }
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  const handleSelectChange = (value: string) => {
    setFormData({ ...formData, location: value });
  };

  if (!vacancyData) {
    return (
      <div className="absolute top-1/2 left-1/2">
        <Spinner size="lg" label="Loading..." color="success" labelColor="success" />
      </div>
    );
  }

  return (
    <div className="min-h-[95vh]">
      <Card className="px-10 mx-10 mt-10">
        <CardHeader className="flex gap-3">
          <Image
            alt="nextui logo"
            height={40}
            radius="sm"
            src="https://static.thenounproject.com/png/2043816-200.png"
            width={40}
          />
          <div className="grid grid-cols-2 gap-44 ms-5">
            <div className="flex flex-col">
              <p className="text-md"> {vacancyData.title}</p>
              <p className="text-small text-default-500">
                {vacancyData.location.map((loc: any, index: any) => (
                  <span key={index}>
                    {loc}
                    {index < vacancyData.location.length - 1 && ", "}
                  </span>
                ))}
              </p>
            </div>
            <div className="flex flex-col">
              <p className="text-md text-green-400"> {vacancyData.status}</p>
              <p className="text-small text-default-500">
                {vacancyData.createDate} - {vacancyData.endDate}
              </p>
            </div>
          </div>
        </CardHeader>
        <Divider />
        <CardBody className="mt-5">
          <div className="font-semibold text-2xl mb-2">
            {vacancyData.positionDetails.name}
          </div>
          <div dangerouslySetInnerHTML={{ __html: vacancyData.description }} />
        </CardBody>
        <Divider />
        <CardFooter className="flex justify-end">
          <div>
            <Button className=" text-white bg-green-600 border-2" onPress={onOpen}>
              Apply Now <FontAwesomeIcon icon={faArrowRight} />
            </Button>
            <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="top-center" className="min-w-[40vw] h-max">
              <ModalContent>
                {(onClose) => (
                  <>
                    <ModalHeader className="flex flex-col gap-1 text-center">{vacancyData.title}</ModalHeader>
                    <ModalBody>
                      <Card>
                        <form onSubmit={handleSubmit}>
                          <div className="grid gap-1">
                            <Input
                              label="First Name"
                              // placeholder=""
                              name="firstName"
                              value={formData.firstName}
                              onChange={handleChange}
                              isInvalid={!!formErrors.firstName}
                            />
                            {formErrors.firstName && <p className="text-red-500 text-xs">{formErrors.firstName}</p>}
                            <Input
                              label="Last Name"
                              // placeholder="Last Name"
                              name="lastName"
                              value={formData.lastName}
                              onChange={handleChange}
                              isInvalid={!!formErrors.lastName}
                            />
                            {formErrors.lastName && <p className="text-red-500  text-xs">{formErrors.lastName}</p>}
                            <Input
                              label="Phone Number"
                              // placeholder="Phone Number"
                              name="phoneNo"
                              type="number"
                              value={formData.phoneNo}
                              onChange={handleChange}
                              isInvalid={!!formErrors.phoneNo}
                            />
                            {formErrors.phoneNo && <p className="text-red-500  text-xs">{formErrors.phoneNo}</p>}
                            <Input
                              label="Email"
                              // placeholder="Email"
                              name="email"
                              value={formData.email}
                              onChange={handleChange}
                              isInvalid={!!formErrors.email}
                            />
                            {formErrors.email && <p className="text-red-500  text-xs">{formErrors.email}</p>}
                            <Input
                              label="Notice Period"
                              type="number"
                              // placeholder="Notice Period"
                              name="noticePeriod"
                              value={formData.noticePeriod}
                              onChange={handleChange}
                              isInvalid={!!formErrors.noticePeriod}
                            />
                            {formErrors.noticePeriod && <p className="text-red-500  text-xs">{formErrors.noticePeriod}</p>}
                            {vacancyData.location.length > 0 ? (
                              <Select
                                label="Select a location"
                                className="min-w-full"
                                onChange={(e) => handleSelectChange(e.target.value)}
                                isInvalid={!!formErrors.location}
                              >
                                {vacancyData.location.map((data: any) => (
                                  <SelectItem key={data} value={data}>
                                    {data}
                                  </SelectItem>
                                ))}
                              </Select>
                            ) : (
                              <Input
                                label="Location"
                                isInvalid={!!formErrors.location}
                                // placeholder="Location"
                                name="location"
                                value={formData.location}
                                readOnly
                              />
                            )}
                            {formErrors.location && <p className="text-red-500 text-xs">{formErrors.location}</p>}
                            <label className="block text-sm font-medium text-gray-400 mt-2 ms-2">Resume (PDF)</label>
                            <input
                                type="file"
                                name="file"
                                onChange={handleChange}
                                className={`mt-1 ms-2 block w-full bg-gray-100 text-gray-400 ${
                                  formErrors.file ? "border-red-500 ms-2" : "ms-2"
                                }`}
                              />
                            {formErrors.file && <p className="text-red-500  text-xs">{formErrors.file}</p>}
                          </div>
                          <div className="flex justify-end">
                            <Button variant="ghost" color="success" className="my-2 me-2 text-green-500 " type="submit" isDisabled={isSubmitting}>
                              {isSubmitting ? (
                                <>
                                  <Spinner size="sm" className="mr-2" />
                                  Submitting...
                                </>
                              ) : (
                                "Submit"
                              )}
                            </Button>
                          </div>
                        </form>
                      </Card>
                    </ModalBody>
                  </>
                )}
              </ModalContent>
            </Modal>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default DetailPage;
