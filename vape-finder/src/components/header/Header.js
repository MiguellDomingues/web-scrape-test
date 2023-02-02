import './header.css'
import SearchBar from '../searchBar/SearchBar.js'

function Header() {
    return ( 
    <><div className="container_header">

      <div className="top">
        <span className="header_title">BC VAPE FINDER</span>
      </div>

      
     <div><hr/></div>
      
      <div className="container_search_bar">
        <SearchBar/>
      </div>

    </div></>);
  }
  
  export default Header;