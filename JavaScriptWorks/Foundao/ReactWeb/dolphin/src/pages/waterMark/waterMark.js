import React, { Component } from 'react'
import './waterMark.scss'
import { Link } from 'react-router-dom'
import httpRequest from '@/utils/httpRequest'
import api from '@/config/api'
//pc端组件
import Header from '@/components/Header/Header'
import DropFile from '@/components/DropFile/DropFile'
import WaterMark from '@/components/WaterMark/WaterMark'
import Upload from '@/components/Upload'
import Loading from '@/components/Loading/Loading'
//app端组件
import Menu from '@/components/App/Menu/Menu'

class Index extends Component {
  constructor () {
    super()
    this.state = {
      isLoading: false,
      index: 0,
      percent: 0,
      uploadStart: false,
      isType: false,
      uploadSuccessList: [],
      fileMd5: 0,
      size: 0,
      waterMark: false,
      src: '',
      screen: {},
    }
  }
  uploadSuccess = (fileName, fileSize, fileMd5)=> {
    if(this.state.isType){
      console.log('文件上传成功！')
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
          console.log('response:',response)
          this.state.uploadSuccessList.unshift({
            fileName,
            fileSize,
            fileMd5: fileMd5+this.state.index,
            videoInfo: response || {width: 0,height: 0},
          })
          const percent = response.width/response.height
          if(percent === 16/9){
            console.log('合适')
            this.setState({
              screen: {width: '480px',height: '270px'}
            })
          } else if(percent > 16/9){
            console.log('横屏')
            let height = 480/percent+'px'
            this.setState({
              screen: {width: '480px',height}
            })
          } else {
            console.log('竖屏')
            let width = 270*percent+'px'
            this.setState({
              screen: {width,height: '270px'}
            })
          }
          if(this.state.src === ''){
            alert('上传视频是吧！请重新上传！')
          } else {
            this.setState({
              index: this.state.index+1,
              uploadSuccessList: this.state.uploadSuccessList,
              waterMark: true,
              fileMd5
            })
          }
        })
      })
    } else {
      console.log('文件未上传！')
    }
  }
  uploadChange = (e) => {
    console.log('选择文件！')
    const size = (e.size/(1024*1024)).toFixed(2)
    const arr = e.name.split('.')
    const type = arr[arr.length-1].toLowerCase()
    if(type === 'mp4' || type === 'ts' || type === 'avi' || type === 'mkv' || type === 'rmvb' || type === 'mov' || type === 'flv' || type === '3gp' || type === 'asf' || type === 'wmv'){
      this.setState({
        uploadStart: true,
        isType: true,
        size
      })
    } else {
      alert('目前支持的视频格式为：mp4、ts、avi、mkv、rmvb、mov、flv、3gp、asf、wmv、MP4，请上传知道格式的视频文件！')
      this.setState({
        isType: false,
      })
    }
  }
  uploadProgress = (percent) => {
    this.setState({
      percent
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
  reupload = () => {
    console.log('reupload')
    this.setState({
      waterMark: false,
    })
  }
  showWaterMark = () => {
    this.setState({
      waterMark: false
    })
  }

  render () {
    const { percent, uploadStart, uploadSuccessList, screen, waterMark, src, isLoading } = this.state;
    return(
      <div id='wrapper' className='wrapper'>
      <div className='backcolor' />
        {isLoading ? <Loading /> : ''}
        <Header />
        <Menu />
        <div className='wrapper_content'>
          <div className='content index_div'>
            <div className='content_inner' style={{display: waterMark?'none':'flex'}}>
              <p className='content_header'>DOLPHIN WATERMARK</p>
              <p className='content_title'>Convert ANYTHING to Mp4 seamlessly, smoothly and speedily!</p>
                <Upload disabled={false}
                        accept='video/*'
                        onChange={this.uploadChange}
                        onProgress={this.uploadProgress}
                        onSuccess={this.uploadSuccess}>
                  <DropFile start={uploadStart} progress={percent} src={'path3'} />
                </Upload>
              {/* <DownloadLists uploadSuccessList={uploadSuccessList} callBack={this.deleteDownloadRecord} /> */}
            </div>
            <div className='content_inner'>
              <div className='download_lists'>
                { uploadSuccessList.length < 1 ? 
                    <div className='download_lists_inner'>
                      <p className='download_lists_tip'>Want to convent more videos? Or beyond the 50MB limit?</p>
                      <Link to='./purchase'>GO PRO</Link>
                    </div>
                  :
                    <div className='download_lists_inner'>
                      {uploadSuccessList.filter((curr,index) => index<5).map((item, index) => {
                        // return <DownloadList key={item.fileMd5} data={item} videoInfo={item.videoInfo} callBack={this.deleteDownloadRecord.bind(this,item.fileMd5)} />
                        return <WaterMark key={item.fileMd5} data={item} videoInfo={item.videoInfo} 
                        callBack={this.deleteDownloadRecord.bind(this,item.fileMd5)} src={src} 
                        reupload={this.reupload} screen={screen} isSuccess={this.showWaterMark} />
                      })}
                      {uploadSuccessList.length > 5 ? <div className='download_lists_button'>MY FILES</div> : ''}
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