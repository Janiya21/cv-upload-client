
"use client";
import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faCoffee } from "@fortawesome/free-solid-svg-icons";
import { Spinner } from "@nextui-org/react";
import Link from "next/link";

export default function Home() {

  const [rows, setRows] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const handleEdit = (key: any) => {

  };

  const fetchData = async () => {
    setIsSubmitting(true);
    try {
      const vacancyRes = await fetch(process.env.NEXT_PUBLIC_BASE_URL + "api/vacancy");
      if (!vacancyRes.ok) {
        throw new Error(`HTTP error! status: ${vacancyRes.status}`);
      }
      const vacancyData = await vacancyRes.json();
      console.log("Vacancy data:", vacancyData);

      const formattedRows = vacancyData.map((vacancy: any) => ({
        key: vacancy._id,
        title: vacancy.title,
        applicants: vacancy.applicants,
        endDate: vacancy.endDate,
        status: vacancy.status,
        createDate: vacancy.createDate,
        position: vacancy.position.name,
        location: vacancy.location,
        description: vacancy.description,
      }));

      setRows(formattedRows);
    } catch (error) {
      console.error("Error fetching Vacancy:", error);
    } finally {
      setIsSubmitting(false); // Reset isSubmitting after submission attempt
    }
  };

  return (
    <main className="min-h-screen flex justify-center bg-gray-50">
      <div className="px-10 py-5 text-center">
        <div className="text-4xl font-semibold mt-5">Available Vacancies</div>
        <div className="vacancies w-[80vw] mt-10">
          {rows.filter((vacancy: any) => vacancy.status === 'active').map((vacancy: any, index: any) => (
            <div key={vacancy.key}>
              <span>
                <div className="max-h-max w-full px-16 flex items-center justify-center dark:bg-gray-900">
                  <div className="relative w-full px-10 my-8 md:my-8 flex flex-col items-start space-y-4 sm:flex-row sm:space-y-0 sm:space-x-6 py-8 border-gray-400 dark:border-gray-400 shadow-lg rounded-lg">
                    <span className="absolute text-xs font-medium top-0 left-0 rounded-br-lg rounded-tl-lg px-2 py-1 bg-green-100 dark:bg-green-300 dark:text-gray-300 border-green-400 dark:border-gray-400 border-b-2 border-r-2">
                      Vacancy {index + 1}
                    </span>
                    <div className="w-full flex justify-center sm:justify-start sm:w-auto">
                      <img className="mx-10 object-cover w-14 h-14" src="https://static.thenounproject.com/png/2043816-200.png" />
                    </div>
                    <div className="w-[40vw] flex flex-col items-start">
                      <p className="font-display mb-2 text-xl font-semibold dark:text-gray-200">
                        {vacancy.position}
                      </p>
                      <div className="mb-4 md:text-xl text-gray-400">
                        <p className="text-small text-default-500">
                          {vacancy.location.map((loc: any, index: any) => (
                            <span key={index}>
                              {loc}
                              {index < vacancy.location.length - 1 && " | "}
                            </span>
                          ))}
                        </p>
                      </div>
                      <div className="flex gap-4"></div>
                    </div>
                    <div className="flex justify-end">
                      <Link href={{ pathname: '/vacancy-data', query: { data: vacancy.key } }} className="bg-green-500 hover:bg-white hover:text-green-400 text-white px-3 py-1 border-2 rounded-md border-green-400">
                        Apply Now <FontAwesomeIcon icon={faArrowRight} />
                      </Link>
                      {/* <Button className="bg-transparent text-green-700 border-green-400 border-2" onClick={() => handleEdit(vacancy)} >Apply Now <FontAwesomeIcon icon={faArrowRight} /></Button> */}
                    </div>
                  </div>
                </div>
              </span>
            </div>
          ))}

        </div>
        <div className="absolute bg-green-200 px-20 w-[80vw] py-4 mt-4 bottom-10">
          <div className="flex">
            <h1 className="mt-1">Could not find the job position you're looking for? Apply here, and we'll contact you when new vacancies open up</h1>
            <Link href={{ pathname: '/apply-file' }} className="ms-2 bg-green-500 hover:bg-green-200 hover:text-green-700 text-black px-3 py-1 border-2 rounded-md border-green-400" >Apply Here  </Link>
            {/* <FontAwesomeIcon icon={faArrowRight} /> */}
          </div>
        </div>
      </div> {isSubmitting && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
          <Spinner size="lg" label="Loading..." color="success" labelColor="success" />
        </div>
      )}
      
    </main>
  );
}
