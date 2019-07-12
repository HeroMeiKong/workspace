import React, { Component } from 'react'
import './videoCutter.scss'
import { Link } from 'react-router-dom'
import httpRequest from '@/utils/httpRequest'
import api from '@/config/api'
import tools from '@/utils/tools'

//pc端组件
import Header from '@/components/Header/Header'
import DropFile from '@/components/DropFile/DropFile'
import ControllerVideo from '@/components/ControllerVideo/ControllerVideo'
// import DownloadLists from '@/components/DownloadLists/DownloadLists'
import Upload from '@/components/Upload'
import Loading from '@/components/Loading/Loading'
import Toast from '@/components/Toast/Toast'
// import MyFileRecords from '@/components/MyFileRecords/MyFileRecords'

class Index extends Component {
  constructor () {
    super()
    this.state = {
      isLoading: false,
      isToast: false,
      toast_text: 'Error!',
      index: 0,
      percent: 0,
      uploadStart: false,
      isType: false,
      isTitle: false,//显示提示信息
      uploadSuccessList: [],
      openedWindow: null,//打开新窗口
      // newRecords: [],
      // records: [],//转码记录，一天计算
      open_myfile: false,//是否打开myfile
      fileMd5: 0,
      size: 0,
      time: [],
      cutterVideo: false,
      src: ''
    }
  }

  uploadSuccess = (fileName, fileSize, fileMd5, token)=> {
    if(this.state.isType){
      httpRequest({
        url: api.GetInFilePath,
        dataType: 'text',
        data: {
          MD5: fileMd5
        },
      }).done(res => {
        this.setState({
          src: res
        })
        httpRequest({
          url: api.qureyMeidiaInfo,
          data: {
            MD5: fileMd5
          },
        }).done(response => {
          if(response.status >= 0){
            this.state.uploadSuccessList.unshift({
              fileName,
              fileSize,
              fileMd5: fileMd5+this.state.index,
              token,
              videoInfo: response || {width: 0,height: 0},
              isTransing: -1,//100:转码成功,0等待转码，-1初始，-2失败
            })
            if(this.state.src === ''){
              this.showToast('Upload failure,please try again!')
            } else {
              this.setState({
                index: this.state.index+1,
                uploadSuccessList: this.state.uploadSuccessList,
                cutterVideo: true,
                fileMd5,
                isTitle: false,
              })
            }
          } else {
            this.showToast(response.err_str)
          }
        }).fail(resp => {
          this.showToast('connect server fail, please try to upload again!')
          this.setState({
            uploadStart: false,
            isType: false,
          })
        })
      }).fail(resp => {
        this.showToast(resp)
      })
    } else {
      this.showToast('File upload failed!')
    }
  }

  uploadChange = (e) => {
    const size = (e.size/(1024*1024)).toFixed(2)
    const arr = e.name.split('.')
    const type = arr[arr.length-1].toLowerCase()
    if(type === 'mp4' || type === 'ts' || type === 'avi' || type === 'mkv' || type === 'rmvb' || type === 'mov' || type === 'flv' || type === '3gp' || type === 'asf' || type === 'wmv'){
      const date = new Date()+''
      const arr = date.split(' ')
      this.setState({
        uploadStart: true,
        isType: true,
        size,
        time: arr[4],
        isTitle: true,
      })
      return true
    } else {
      // this.showToast('This media format is not supported!Yon can use mp4、ts、avi、mkv、rmvb、mov、flv、3gp、asf、wmv!')
      this.setState({
        uploadStart: false,
        isType: false,
        isTitle: false,
      })
      return false
    }
  }

  uploadError = (msg) => {
    this.showToast(msg)
    this.setState({
      uploadStart: false,
      isType: false,
      isTitle: false,
    })
  }

  uploadProgress = (percent) => {
    this.setState({
      percent,
    })
  }

  deleteDownloadRecord = (el) => {
    const arr = this.state.uploadSuccessList
    for(let i=0;i<this.state.uploadSuccessList.length;i++){
      if(arr[i].fileMd5 === el){
        arr.splice(i,1)
        this.setState({
          uploadSuccessList: arr,
        })
      }
    }
  }

  startCovert = (el,state) => {
    const arr = this.state.uploadSuccessList
    for(let i=0;i<this.state.uploadSuccessList.length;i++){
      if(arr[i].fileMd5 === el){
        arr[i].isTransing = state
        this.setState({
          uploadSuccessList: arr,
        })
      }
    }
  }

  reupload = () => {
    this.state.uploadSuccessList.shift()
    this.setState({
      cutterVideo: false,
      uploadSuccessList: this.state.uploadSuccessList,
      uploadStart: false
    })
  }

  showVideoCutter = () => {
    this.setState({
      cutterVideo: false
    })
  }

  showToast = (toast_text,openedWindow) => {
    this.setState({
      isToast: true,
      toast_text,
      openedWindow
    })
  }

  hiddenToast = () => {
    this.setState({
      isToast: false,
      openedWindow: null
    })
    if(this.state.openedWindow){
      window.open('about:blank').location.href = this.state.openedWindow
    }
  }

  change_myfile = () => {
    this.setState({
      open_myfile: !this.state.open_myfile
    })
  }

  moreFile = () => {
    if(tools.getCapacity_storage().capacity > 0){
      window.location.href = api.return_url_user
    } else {
      if (window.confirm("Non-member users can't view the record, please recharge it!") === true) {
        window.location.href = api.return_url_purchase
      }
    }
  }

  render () {
    const { percent, uploadStart, uploadSuccessList, size, time, cutterVideo, src, isTitle, isLoading, isToast, toast_text } = this.state;
    return(
      <div id='wrapper' className='wrapper'>
      <div className='backcolor' />
        {isLoading ? <Loading /> : ''}
        {isToast ? <Toast callBack={this.hiddenToast} text={toast_text} /> : ''}
        <Header showToast={this.showToast} />
        <div className='wrapper_content'>
          <div className='content index_div'>
            <div className='content_inner' style={{display: cutterVideo?'none':'flex'}}>
              <h1 className='content_header'>DOLPHIN VIEDEO CUTTER</h1>
              <h2 className='content_title'>Convert ANYTHING to Mp4 seamlessly, smoothly and speedily!</h2>
                <Upload disabled={false}
                        accept='video/mp4,video/x-m4v,video/*'
                        onChange={this.uploadChange}
                        onProgress={this.uploadProgress}
                        onSuccess={this.uploadSuccess}
                        onError={this.uploadError}>
                  <DropFile start={uploadStart} progress={percent} src={'path2'} />
                </Upload>
                {isTitle ? 
                <div className='videoCutter_bottom'>
                  <div className="videoCutter_bottom_notice">The video you uploaded is {time},{size}MB, After uploading, you can cut your video.</div>
                  {/* <div className="videoCutter_bottom_recommand">
                    <div className="recommand_top">
                      <div className="recommand_top_text">RECOMMAND</div>
                      <div className="recommand_top_line"></div>
                    </div>
                    <div className="recommand_bottom">
                      <div className="recommand_img"></div>
                      <div className="recommand_text">The video you uploaded is 1:00:00,30MB, After uploading, you can cut your video.</div>
                    </div>
                  </div> */}
                </div>
                : ''}
            </div>
            <div className='content_inner'>
              <div className='download_lists'>
                { uploadSuccessList.length < 1 ? 
                    <div className='download_lists_inner'>
                      <p className='download_lists_tip'>Want to convert more videos? Or beyond the 50MB limit?</p>
                      <Link to='./purchase'>GO PRO</Link>
                    </div>
                  :
                    <div className='download_lists_inner'>
                      {uploadSuccessList.filter((curr,index) => index<5).map((item, index) => {
                        return <ControllerVideo key={item.fileMd5} data={item} videoInfo={item.videoInfo} 
                          callBack={this.deleteDownloadRecord.bind(this,item.fileMd5)} src={src} 
                          reupload={this.reupload} isSuccess={this.showVideoCutter}
                          startCovert={this.startCovert.bind(this,item.fileMd5)}
                          isTransing={item.isTransing} showToast={this.showToast} />
                      })}
                      {uploadSuccessList.length > 5 ? <div className='download_lists_button' onClick={this.moreFile}>MY FILES</div> : ''}
                    </div>
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default Index