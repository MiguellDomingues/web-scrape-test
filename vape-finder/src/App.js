
import Footer from './components/footer/Footer'
import Header from './components/header/Header'
import Body from './components/body/Body'

import './app.css'

function App() {
  return (
    <div className="page"> 
      <div className="app">
        <Header/>
        <Body/>
        <Footer/>
      </div>
    </div>
  );
}

export default App;
