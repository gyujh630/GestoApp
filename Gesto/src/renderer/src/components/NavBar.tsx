import { Link } from "react-router-dom"

function NavBar(): JSX.Element {

    return (
      <>
        <div className="topBar">
            <Link to="/" className ="homeBtn">Home</Link>
        </div>
        
      </>
    )
  }
  
  export default NavBar
  