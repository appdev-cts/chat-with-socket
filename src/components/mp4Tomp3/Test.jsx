import React, { useEffect, useState } from 'react'
import axios from 'axios'

const Test = () => {
    const [getData,setData] = useState()

    useEffect(()=>{
        const f=async ()=>{
            const response =  await axios.get('https://asset.cloudinary.com/dy9ale6ms/85812279d168d0155a51a47ba832e971')
            setData(response)
            console.log(response)
        }
        f();
    },[])
  return (
    <div>Test</div>
  )
}

export default Test