import {useState} from 'react'
import moment from 'moment'

import './vertifyAge.css'

import useVertifyAge from './useVertifyAge'

function VertifyAge( { enabled } ){

  const 
  [
    birth_date, show, error,
    { onChange, validateInput }
  ] = useVertifyAge(enabled)

    return (
      <>{show && <>
          <div className={`age_vertification_overlay show_overlay`}>
           <div className="date_input">
            <h1>You must be 19+ to view the content on this website!</h1>
            <h1>This website has material not intended for anyone under the age of 19</h1>
              <input type="text" name="day" placeholder="DD" required minlength="1" maxlength="2" size="2" value={birth_date.day} onChange={onChange}>
              </input>
              <input type="text" name="month" placeholder="MM" required minlength="1" maxlength="2" size="2" value={birth_date.month} onChange={onChange}>
              </input>
              <input type="text" name="year" placeholder="YYYY" required minlength="4" maxlength="4" size="2" value={birth_date.year} onChange={onChange}>
              </input>
              <input type="submit" name="enter" placeholder="Year" onClick={ validateInput }>
              </input><br/>
              {error}
            </div>
      </div>
    </>}</>)
  }

  export default VertifyAge