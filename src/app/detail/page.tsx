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

const DetailPage = (context: any) => {
  const { data } = context.searchParams;
  const [vacancyData, setVacancyData] = useState(JSON.parse(data));
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [formData, setFormData] = useState({
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

  const validate = () => {
    const errors: any = {};
    if (!formData.firstName) errors.firstName = "First name is required";
    if (!formData.lastName) errors.lastName = "Last name is required";
    if (!formData.phoneNo) errors.phoneNo = "Phone number is required";
    if (!formData.email) errors.email = "Email is required";
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
      // Handle form submission
      try {
        const formDataToSend = new FormData();
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
          throw new Error("Failed to submit application");
        }
  
        console.log("Application submitted successfully");
      } catch (error) {
        console.error("Error submitting application", error);
      }
    } else {
      setFormErrors(errors);
    }
  };

  const handleChange = (e: any) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  useEffect(() => {
    let detail = JSON.parse(data);
    console.log(detail);
    if (detail.location.length === 1) {
      setFormData((prevData) => ({ ...prevData, location: detail.location[0] }));
    }
  }, [data]);

  const handleSelectChange = (value: any) => {
    setFormData({ ...formData, location: value });
  };

  return (
    <div>
      <span>
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
                <p className="text-md text-green-300"> {vacancyData.status}</p>
                <p className="text-small text-default-500">
                  {vacancyData.createDate} - {vacancyData.endDate}
                </p>
              </div>
            </div>
          </CardHeader>
          <Divider />
          <CardBody className="mt-10">
            <div dangerouslySetInnerHTML={{ __html: vacancyData.description }} />
          </CardBody>
          <Divider />
          <CardFooter className="flex justify-end">
            <div>
              <Button className="bg-transparent text-white bg-green-600 border-2" onPress={onOpen}>
                Apply Now <FontAwesomeIcon icon={faArrowRight} />
              </Button>
              <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="top-center" className="min-w-[40vw] max-h-[90vh]">
                <ModalContent>
                  {(onClose) => (
                    <>
                      <ModalHeader className="flex flex-col gap-1 my-2 text-center">{vacancyData.title}</ModalHeader>
                      <ModalBody>
                        <Card>
                          <form onSubmit={handleSubmit}>
                            <div className="grid gap-1">
                              <Input
                                label="First Name"
                                placeholder="First Name"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                isInvalid={!!formErrors.firstName}
                              />
                              <Input
                                label="Last Name"
                                placeholder="Last Name"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                isInvalid={!!formErrors.lastName}
                              />
                              <Input
                                label="Phone Number"
                                placeholder="Phone Number"
                                name="phoneNo"
                                value={formData.phoneNo}
                                onChange={handleChange}
                                isInvalid={!!formErrors.phoneNo}
                              />
                              <Input
                                label="Email"
                                placeholder="Email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                isInvalid={!!formErrors.email}
                              />
                              <Input
                                label="Notice Period"
                                placeholder="Notice Period"
                                name="noticePeriod"
                                value={formData.noticePeriod}
                                onChange={handleChange}
                                isInvalid={!!formErrors.noticePeriod}
                              />
                              {vacancyData.location.length > 1 ? (
                                <Select 
                                  label="Select a location" 
                                  className="min-w-full" 
                                  onChange={(e) => handleSelectChange(e.target.value)}
                                  // defaultValue={formData.location}
                                >
                                  {vacancyData.location.map((data:any) => (
                                    <SelectItem key={data} value={data}>
                                      {data}
                                    </SelectItem>
                                  ))}
                                </Select>
                              ) : (
                                <Input
                                  label="Location"
                                  placeholder="Location"
                                  name="location"
                                  value={formData.location}
                                  readOnly
                                />
                              )}
                              <Input
                                type="file"
                                name="file"
                                onChange={handleChange}
                                isInvalid={!!formErrors.file}
                              />
                            </div>
                            <div className="flex justify-end m-4">
                              <Button type="submit" className="bg-green-600 text-white">
                                Submit
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
      </span>
    </div>
  );
};

export default DetailPage;
