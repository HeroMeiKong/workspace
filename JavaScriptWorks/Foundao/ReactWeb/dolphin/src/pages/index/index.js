import React, { Component } from 'react'
import './index.scss'
import httpRequest from '@/utils/httpRequest'
import api from '@/config/api'
//pc端组件
import Header from '@/components/Header/Header'
import DropFile from '@/components/DropFile/DropFile'
import DownloadLists from '@/components/DownloadLists/DownloadLists'
import BottomFold from '@/components/BottomFold/BottomFold'
import BottomContents from '@/components/BottomContents/BottomContents'
import BottomBar from '@/components/BottomBar/BottomBar'
import Upload from '@/components/Upload'
import Loading from '@/components/Loading/Loading'
//app端组件
import Menu from '@/components/App/Menu/Menu'
import AppDownloadLists from '@/components/App/DownloadLists/DownloadLists'

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
    }
  }
  uploadSuccess = (fileName, fileSize, fileMd5, token)=> {
    if(this.state.isType){
      httpRequest({
        url: api.qureyMeidiaInfo,
        data: {
          MD5: fileMd5
        },
      }).done(response => {
        this.state.uploadSuccessList.unshift({
          fileName,
          fileSize,
          fileMd5: fileMd5+this.state.index,
          token,
          videoInfo: response || {width: 0,height: 0},
          isTransing: -1,//100:转码成功,0等待转码，-1初始，-2失败
        })
        this.setState({
          index: this.state.index+1,
          uploadSuccessList: this.state.uploadSuccessList
        })
      }).fail(res => {
        console.log('connect server fail, please try to upload again!')
        this.setState({
          uploadStart: false,
          isType: false,
        })
      })
    } else {
      console.log('文件未上传！')
    }
  }
  uploadChange = (e) => {
    const arr = e.name.split('.')
    const type = arr[arr.length-1].toLowerCase()
    if(type === 'mp4' || type === 'ts' || type === 'avi' || type === 'mkv' || type === 'rmvb' || type === 'mov' || type === 'flv' || type === '3gp' || type === 'asf' || type === 'wmv'){
      this.setState({
        uploadStart: true,
        isType: true,
      })
    } else {
      alert('目前支持的视频格式为：mp4、ts、avi、mkv、rmvb、mov、flv、3gp、asf、wmv，请上传知道格式的视频文件！')
      this.setState({
        uploadStart: false,
        isType: false,
      })
    }
  }
  uploadError = (msg) => {
    alert(msg)
    this.setState({
      uploadStart: false,
      isType: false,
    })
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
  render () {
    const { percent, uploadStart, uploadSuccessList, isLoading } = this.state;
    return(
      <div id='wrapper' className='wrapper'>
        <div className='backcolor' />
        {isLoading ? <Loading /> : ''}
        <Header />
        <Menu />
        <div className='wrapper_content'>
          <div className='content index_div'>
            <div className='content_inner'>
              <p className='content_header'>DOLPHIN MP4 CONVERTOR</p>
              <p className='content_title'>Convert ANYTHING to Mp4 seamlessly, smoothly and speedily!</p>
              <Upload disabled={false}
                      accept='video/*'
                      onChange={this.uploadChange}
                      onProgress={this.uploadProgress}
                      onSuccess={this.uploadSuccess}
                      onError={this.uploadError}>
                <DropFile start={uploadStart} progress={percent} src={'path1'} />
              </Upload>
              <DownloadLists uploadSuccessList={uploadSuccessList} callBack={this.deleteDownloadRecord}
              startCovert={this.startCovert} />
              <AppDownloadLists uploadSuccessList={uploadSuccessList} callBack={this.deleteDownloadRecord} />
            </div>
          </div>
          <BottomFold />
          <BottomContents />
          <BottomBar />
        </div>
      </div>
    )
  }
}

export default Index