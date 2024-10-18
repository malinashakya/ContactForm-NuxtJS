import {useAsyncData} from '#app';

//Main method to handle all POST,GET,PUT,DELETE
export const apiData = async (key: string, url: string, method: string, body: any) => {
    const {data, pending, error} = await useAsyncData(key, async () => {
        return await $fetch(url, {
            method, body,
        })
    })
    if (error.value) {
        console.error(`Error submitting data to ${url}:`, error.value);
    }
    return {data, error, pending};
}
//GET method
export const getData = async (key: string, url: string) => {
    const {data, pending, error} = await apiData(key, url, 'GET', null);
    return {data, pending, error};
}

//POST method
export const postData = async (key: string, url: string, body: any) => {
    const {data, error} = await apiData(key, url, 'POST', body);
    return {data, error};
};

//PUT method
export const putData=async(key:string,url:string,body:any)=>{
    const {data,error}=await apiData(key,url,'PUT',body);
    return {data,error};
}

//DELETE method
export const deleteData=async (key:string,url:string)=>{
    const {data,error}=await apiData(key,url,'DELETE',null);
    return {data,error};
}



