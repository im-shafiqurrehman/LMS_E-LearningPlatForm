'use client'

import CourseDetailsPage from "../../components/Course/CourseDetailsPage"

type Props = {
    id : string;
}

const Page  = ({params}:any)=>{
    return(
        <div>
            <CourseDetailsPage id={params.id}/>
        </div>
    )
};
export default Page;