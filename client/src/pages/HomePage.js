import React from 'react'
import Layout from '../components/Layout/Layout'
import { useAuth } from '../context/auth'
function HomePage() {
  const[auth,setAuth]=useAuth();
  return (
    <div>
      <Layout title={"Shopcart-Home"}>
        <h1>HomePage</h1>
        
      </Layout>
    </div>
  )
}

export default HomePage
