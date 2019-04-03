import React, { Component } from 'react';
import './PayCard.scss'
import PayCardMethods from './PayCardMethods/PayCardMethods'
import PayCardNumbers from './PayCardNumbers/PayCardNumbers'
import PayCardHolder from './PayCardHolder/PayCardHolder'
import PayCardDate from './PayCardDate/PayCardDate'
const img = require('@/assets/images/card_image@2x.png')

class PayCard extends Component {
  render () {
    return (
      <div className='paycard'>
        <div className='paycard_inner'>
          <div className='paycard_inner_topimg'>
            <img alt='paycard' src={img}></img>
          </div>
          <PayCardMethods />
          <PayCardNumbers />
          <PayCardHolder />
          <PayCardDate />
          <div className="paycard_inner_button_box">
            <div className="paycard_inner_button">SUBMIT</div>
          </div>
        </div>
      </div>
    )
  }
}

export default PayCard