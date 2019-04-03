import React, { Component } from 'react';
import './DownloadLists.scss'
import { Link } from 'react-router-dom'
// import OutOption from './OutOption/OutOption'
import DownloadList from './DownloadList/DownloadList'

class DownloadLists extends Component {
  constructor () {
    super()
    this.state = {
      // downloadList: [],
      // showOutOption: true
    }
  }
  startCovert = (start) => {
    console.log('开始转码视频！2')
      this.setState({
        showOutOption: false
      })
    this.state.downloadList.push(this.props.file)
  }
  render () {
    const { uploadSuccessList, videoInfo } = this.props
    // const { downloadList, showOutOption } = this.state
    // if(!start){
      return (
        <div className='download_lists'>
          { uploadSuccessList.length < 1 ? 
              <div className='download_lists_inner'>
                <p className='download_lists_tip'>Want to convent more videos? Or beyond the 50MB limit?</p>
                <Link to='./purchase'>GO PRO</Link>
              </div>
            :
              <div className='download_lists_inner'>
                {uploadSuccessList.map((item, index) => {
                  return <DownloadList key={item.fileMd5} data={item} videoInfo={videoInfo} />
                })}
                <div className='download_lists_button'>MY FILES</div>
              </div>
          }
        </div>
      )
    // } else {
    //   return (
    //     <div className='download_lists'>
    //       {showOutOption ? <OutOption fileName={file.name} callBack={this.startCovert} /> : ''}
    //       {downloadList.map ( (item,i)=> <DownloadList key={i} file={{name: item.name,size: item.name,md5: item.md5}} />)}
    //       <div className='download_lists_button'>MY FILES</div>
    //     </div>
    //   )
    // }
  }
}

export default DownloadLists