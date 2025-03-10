import React from 'react'
import Layout from '../components/Layout/Layout'

const About = () => {
  return (
   
    <div>
      <Layout title='About US'>
        <h4>About</h4>
      </Layout>
    </div>
  )
}
Layout.defaultProps = {
  title: "SHOPCART - shop now",
  description: "mern stack project ",
  keywords: "mern,react,node,mongodb,ECOMMERCE,SHOP,cart",
  author: "Frogie",
};
export default About
