// utils/api.ts
import { useAsyncData } from '#app'; // Nuxt 3 specific hook for data fetching


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

//POST method
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

