import { useAsyncData } from '#app';

// For understanding the generic method
// const updateContact = async () => {
//     if (editedContact.value) {
//         const { error: updateError } = await useAsyncData(update-contact-${editedContact.value.id}, () =>
//             $fetch(/api/contacts/${editedContact.value!.id}, {
//             method: 'PUT',
//                 body: editedContact.value,
//         })
//     )

//GET method
export const fetchData=async(key: string, url: string)=>{
    const {data,pending,error}=await useAsyncData(key, async()=>{
        const response=await $fetch(url);
        return response;
    });
    if(error.value){
        console.error(`Error fetching data from ${url}`);
            }
    return {data, pending,error};
 }

//POST and PUT method
export const postData=async(key:string, url:string, method:string,body:any)=>{
    const {data,error}=await useAsyncData(key,async ()=>{
        return await $fetch(url,{
            method,body,
        })
    })
    if(error.value)
    {
        console.error(`Error submitting data to ${url}:`,error.value);
    }
    return {data,error};
}

//DELETE method
export const deleteData = async (key: string, id: number) => {
    const { data, error } = await useAsyncData(key, async () => {
        return await $fetch(`/api/contacts/${id}`, {
            method: 'DELETE',
        });
    });

    if (error.value) {
        console.error(`Error deleting data from /api/contacts/${id}:`, error.value);
    }

    return { data, error };
};


