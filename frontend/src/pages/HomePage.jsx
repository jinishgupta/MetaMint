import ScrollingLayout from "../components/ScrollingLayout";
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';

function HomePage() {
  return (
    <div>
      <Header/>
      This is home page.
      <ScrollingLayout/>
      <Footer/>
    </div>
  );
}

export default HomePage;