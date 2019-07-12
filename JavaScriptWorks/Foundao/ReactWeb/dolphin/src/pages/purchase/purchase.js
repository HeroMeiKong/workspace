import React, { Component } from 'react'
import './purchase.scss'
import httpRequest from '@/utils/httpRequest'
import $ from 'jquery'
import api from '@/config/api'
import tools from '@/utils/tools'
// import { Link } from 'react-router-dom'
import Header from '@/components/Header/Header'
import Versions from './Versions/Versions'
// import PayCard from '@/components/PayCard/PayCard'
import SignUpOrLogin from '@/components/SignUpOrLogin/SignUpOrLogin'
import Loading from '@/components/Loading/Loading'
import Toast from '@/components/Toast/Toast'

class Purchase extends Component {
  constructor () {
    super()
    this.state = {
      isLoading: false,
      isToast: false,
      toast_text: 'Error!',
      version: 0,//套餐id
      showSignUpOrLogin: false,
    }
  }

  componentDidMount () {
    this.appendChildScript() // 添加统计srcipt
    const parameter = this.props.location.search
    if(parameter){
      const arr = this.changeToObject(parameter)
      httpRequest({
        type: 'POST',
        url: api.pay,
        data: {
          success: arr[0],
          paymentId: arr[1],
          token: tools.getUserData_storage().token,
          PayerID: arr[3]
        }
      }).done(res => {
        if(res.code === '0'){
          this.showToast('Thanks for your purchasing!')
          const order = JSON.parse(localStorage.getItem('order'))
          // const id = order ? order.order_id : 0
          const price = order ? order.price : 0
          window.gtag && window.gtag('event', 'click', {'event_category': 'pay_succeed','event_label': 'video','value': price})
          let time = setTimeout(() => {
            window.location.href = api.return_url
            clearTimeout(time)
          },1000)
        } else {
          this.showToast(res.msg)
        }
      }).fail(res => {
        this.showToast(res)
      })
    } else {
      // console.log('还未支付！')
    }
  }

  // 添加统计srcipt
  appendChildScript = () => {
    const pv = document.getElementById('pv')
    if(pv){
      pv.parentNode.removeChild(pv)
    }
    const api_url = api.statistics
    const script_dom = '<script id="pv" src="' + api_url + '" type="text/javascript"></script>'
    $('body').append(script_dom)
  }

  // 规范化字符
  changeToObject = (str) => {
    const arr = str.split('&')
    const length = arr.length
    let newArr = []
    for(let i=0;i<length;i++){
      newArr[i] = arr[i].split('=')[1]
    }
    return newArr
  }

  // 提交订单
  showPay = (el,text) => {
    this.setState({
      version: el
    })
    if(text === 'isLogin'){
      this.submitOrder(el)
    }
  }
  
  // 提交订单
  submitOrder = (version) => {
    this.setState({
      isLoading: true
    })
    httpRequest({
      type: 'POST',
      url: api.create_order,
      data: {
        goods_id: version,
        token: tools.getUserData_storage().token
      }
    }).done(res => {
      if(res.code === '0'){
        localStorage.setItem('order',JSON.stringify(res.data))
        httpRequest({
          type: 'POST',
          url: api.payment,
          data: {
            order_id: res.data.order_id,
            token: tools.getUserData_storage().token,
            return_url: api.return_url_purchase
            // return_url: api.return_url + '#/purchase' //预上线
            // return_url: api.return_url + 'purchase' //线上
          }
        }).done(res => {
          if(res.code === '0'){
            window.location.href = res.data
            this.setState({
              isLoading: false
            })
          } else {
            this.setState({
              isLoading: false
            })
            this.showToast(res.msg)
          }
        }).fail(res => {
          this.showToast(res)
        })
      } else {
        this.showToast(res.msg)
        this.setState({
          isLoading: false
        })
      }
    }).fail(resp => {
      this.showToast(resp)
    })
  }

  showToast = (toast_text) => {
    this.setState({
      isToast: true,
      toast_text
    })
  }

  hiddenToast = () => {
    this.setState({
      isToast: false
    })
  }

  hiddenLogin = (e) => {
    if(e.target && e.target.className && (e.target.className === 'sol_wrapper' || e.target.className === 'sol_content_create')){
      //如果点击外面或者登录成功就隐藏
      this.setState({
        showSignUpOrLogin: false
      })
    }
  }

  loginSuccess = () => {
    this.setState({
      showSignUpOrLogin: false,
    })
    let time = setTimeout(() => {
      this.submitOrder(this.state.version)
      clearTimeout(time)
    },1000)
    
  }

  // 切换登录注册
  showSignUpOrLogin = () => {
    this.setState({
      showSignUpOrLogin: true,
    })
  }

  // 发送邮件
  sendEmail = () => {
    var who = 'kefu@foundao.com'
    // var what = prompt("输入主题: ", "none");
    if (window.confirm("Do you want to send " + who + " an email?") === true) {
        window.location.href = 'mailto:' + who + '?subject='
    }
  }

  render () {
    const { isLoading, isToast, toast_text, showSignUpOrLogin } = this.state
    return(
      <div className='purchase'>
        {isLoading ? <Loading /> : ''}
        {isToast ? <Toast callBack={this.hiddenToast} text={toast_text} /> : ''}
        <Header showToast={this.showToast} />
        <div className='purchase_content'>
          <h1>Want to convert more videos?<br/>Or beyond the 50MB limit?</h1>
          <Versions callBack={this.showPay} showToast={this.showToast} showSigin={this.showSignUpOrLogin} />
          <p className='purchase_notes'>Need something custom? <strong  onClick={this.sendEmail}>Contact us.</strong></p>
          <p className='purchase_notes'>We also have additional plan providing capacity over 2T.</p>
        </div>
        <SignUpOrLogin show={showSignUpOrLogin} callBack={this.hiddenLogin} isLoginSuccess={this.loginSuccess} />
      </div>
    )
  }
}

export default Purchase