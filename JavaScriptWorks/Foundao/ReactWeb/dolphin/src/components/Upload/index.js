/**
 * Created by DELL on 2019/3/28.
 */
import React, {Component} from 'react'
import PropTypes from 'prop-types';
import './upload.scss';
import _api from '@/config/api';
/* eslint-disable */

const workers = [];
const workersLength = 1;  // 生成workers的数量
let file = null;          // 上传的文件

let g_filemd5 = '';       // 文件md5值

/*文件上传*/
export default
class Upload extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fileUrl: '',        // 上传文件返回的地址
      isUploading: false, // 是否文件上传中
      percent: 0,         // 上传进度
    }
  }

  componentWillMount() {

  }

  componentDidMount() {
    const dropbox = this.refs['upload-box'];
    dropbox.addEventListener("dragenter", this.dragenter, false);
    dropbox.addEventListener("dragover", this.dragover, false);
    dropbox.addEventListener("drop", this.drop, false);
    this.initWorker();

  }

  // 创建worker
  initWorker = () => {
    const _this = this;

    for (let i = 0; i < workersLength; i++) {
      const worker = new Worker('./uploadWorker.js');
      const {showStatus, showProgress} = this;
      worker.onmessage = function (message) {
        var jsonobj = message.data;

        if (jsonobj != null && jsonobj["msg"] != null) {
          switch (jsonobj["msg"]) {
            case "net":
              showStatus(jsonobj["data"]);
              break;
            case "partfinish":
              // console.log("part upload finished");
              break;
            case "finish":
              // console.log("file upload finished");
              _this.uploadSuccess();
              showStatus("file size:" + file.size + ", uploaded:" + file.size + ", 100%");
              showProgress("100");

              break;
            case "md5":
              g_filemd5 = jsonobj["data"];
              break;
            // 后端进度
            case "uploaded":
              // console.log("file uploaded size:" + jsonobj["data"]["writed"] + ", progress:" + jsonobj["data"]["progress"]);
              // showStatus("file size:" + file.size + ", uploaded:" + jsonobj["data"]["writed"] + ", percent:" + jsonobj["data"]["progress"] + "%");
              // showProgress(jsonobj["data"]["progress"]);
              break;
            // 前端进度
            case "progress":
              // console.log("file uploaded size:" + jsonobj["data"]["writed"] + ", progress:" + jsonobj["data"]["progress"]);
              showStatus("file size:" + file.size + ", uploaded:" + jsonobj["data"]["writed"] + ", percent:" + jsonobj["data"]["progress"] + "%");
              showProgress(jsonobj["data"]["progress"]);
              break;
            default:
              break;
          }
        }

        //worker.terminate();
      };

      worker.onerror = function (error) {
        // console.log(error.filename, error.lineno, error.message);
      }
      workers[i] = worker;
    }
  };
  // 上传各种提示
  showStatus = (msg) => {
    // console.log('uploadStatus --->', msg);
  };
  showProgress = (percent) => {
    // console.log(percent);
    const {onProgress} = this.props;
    if (onProgress && typeof onProgress === 'function') {
      onProgress(percent);
    }
  };

  dragenter = (e) => {
    e.stopPropagation();
    e.preventDefault();
  };
  dragover = (e) => {
    e.stopPropagation();
    e.preventDefault();
  };
  drop = (e) => {
    e.stopPropagation();
    e.preventDefault();

    const dt = e.dataTransfer;
    const files = dt.files;

    this.handleFiles(files);
  };

  handleFiles = (files) => {
    if (files && files.length > 0) {
      this.initFileItem(files[0], files);
    }
  };
  initFileItem = (fileItem, files) => {
    const {isUploading} = this.state;
    if (isUploading) {
      return false;
    } else {

    }
    const {onChange} = this.props;
    this.setState({
      isUploading: true
    });
    if (onChange && typeof onChange === 'function') {
      onChange(fileItem, files);
    }
    file = fileItem;
    for (let i = 0; i < workersLength; i++) {
      const worker = workers[i];
      worker.postMessage(
        {
          cmd: 'stop'
        }
      );
      worker.postMessage(
        {
          cmd: 'init',
          id: 0,
          usr: 'user',
          ps: 'Foundao.com',
          url: _api.webSorket,
          f: fileItem
        });
      worker.postMessage(
        {
          cmd: 'start'
        }
      );
    }
  };
  // 文件上传input框发生改变
  inputChange = (e) => {
    const files = e.target.files;
    this.handleFiles(files)
  };
  uploadClick = () => {
    const {isUploading} = this.state;
    if (!isUploading) {
      // 重置input框 否则选择相同的文件不会触发change 事件
      this.refs.input.value = '';
      this.refs.input.click()
    }
  };
  // 文件上传成功
  uploadSuccess = () => {
    const {isUploading} = this.state;
    // 确保成功回调只会触发一次
    if (isUploading) {
      const {onSuccess} = this.props;
      if (onSuccess && typeof onSuccess === 'function') {
        onSuccess(file.name, file.size, g_filemd5);
      }
    }
    this.setState({
      isUploading: false
    })
  };

  render() {
    const {accept, disabled} = this.props;
    const fileAccept = accept || 'video/*'; // 默认只能上传视频
    return (
      <div className="upload-box"
           ref='upload-box'
           onClick={this.uploadClick}>
        <input type="file"
               ref="input"
               disabled={disabled}
               hidden
               accept={fileAccept}
               onChange={this.inputChange.bind(this)}/>
        <div className="upload-box-inner">{this.props.children}</div>
      </div>
    )
  }
}
Upload.propTypes = {
  onSuccess: PropTypes.func.isRequired,  // 文件上传成功
  onChange: PropTypes.func,               // 可选参数, 文件状态改变时的钩子，上传成功或者失败时都会被调用
  onError: PropTypes.func,               // 文件上传失败
  onProgress: PropTypes.func,      // 文件上传时的进度
  disabled: PropTypes.bool,     // 是否不能点击按钮默认为false
  accept: PropTypes.string,     // 接受文件限制后缀
  uploadType: PropTypes.string, // 上传文件类型 image / audio / video
  maxSize: PropTypes.number, // 上传文件大小 M
};