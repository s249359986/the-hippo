// @ts-nocheck
import ProgressModal from './components/progressModal'
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import React, { useState } from 'react';
// import icon from '../../assets/icon.svg';
import './App.css';
import { InboxOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { message, Upload, Form, Modal, Switch, Select, Radio } from 'antd';
import { isMac } from './util';
const { Dragger } = Upload;
/**
 * params:{
 * filesList:[]
 * password:'',
 * packagesize:''
 *
 * }
 *
 */

// 1.选择页面
// 2.设置选项页面
// 3.处理页面
// 4.结果页面
//      - 失败
//      - 成功

function Index() {
  const defaultFileList = [];
  const [progressModalPercent,setProgressModalPercent] = useState(0);
  const [progressModalShow,setProgressModalShow] = useState(false)
  const [typeChecked, setTypeChecked] = useState('zip');
  const [fileList, setFileList] = useState(defaultFileList);
  const [isPackage, setIsPackage] = useState(false);
  const [packageSize, setPackageSize] = useState({
    value: 0,
    label: '10M',
    size: '10000000',
  });
  //const packageSizeList = [{value:0,label:'10M',size:"10485760"},{value:1,label:'40M',size:"41943040"},{value:2,label:'100M',size:"104857600"}] // win 1mb == 1024kb
  let packageSizeList = [
    { value: 0, label: '10M', size: '10000000' },
    { value: 1, label: '40M', size: '40000000' },
    { value: 2, label: '100M', size: '100000000' },
  ]; // mac 1mb == 1000kb
  if (!isMac()) {
    packageSizeList = [
      { value: 0, label: '10M', size: '10485760' },
      { value: 1, label: '40M', size: '41943040' },
      { value: 2, label: '100M', size: '104857600' },
    ]; // win 1mb == 1024kb
  }
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pageData, setPageData] = useState({
    size: 0,
    fileName: '',
    path: '', // 不带文件名
    type: typeChecked,
    fileList: [],
  });


  const props: UploadProps = {
    name: 'file',
    multiple: true,
    action: '', //'https://run.mocky.io/v3/435e224c-44fb-4773-9faf-380c5e6a2188',
    onChange(info) {
      console.log('onchange', info);
      const { fileList } = info;
      const { status } = info.file;

      if (fileList && fileList.length) {
        pageData.fileName = fileList[0]['name'];
        let tempPath = fileList[0].originFileObj.path;
        pageData.path = tempPath.replace(`${fileList[0]['name']}`, '');
        if (fileList.length > 1) {
          let fileNameArr = pageData.fileName.split('.');
          pageData.fileName =
            'thearchive.' + fileNameArr[fileNameArr.length - 1];
        }
        let tempFileList = fileList.map((item) => {
          return {
            path: item.originFileObj?.path,
            fileName:
              item.originFileObj?.webkitRelativePath ||
              item.originFileObj?.name,
          };
        });
        pageData.fileList = tempFileList;
        setPageData(pageData);
        setIsModalOpen(true);
      }
      if (status !== 'uploading') {
        console.log(info.file, info.fileList);
      }
      if (status === 'done') {
        message.success(`${info.file.name} file uploaded successfully.`);
      } else if (status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
    onDrop(e) {
      console.log('Dropped files', e.dataTransfer.files);
    },
    beforeUpload: (file) => {
      return false;
    },
    directory: true,
    showUploadList: true,
    defaultFileList: defaultFileList,
    fileList: fileList,
  };

  const openDialog = () => {
    window.electronAPI.openFile().then((file) => {
      console.log('openFile', file);
    });
  };

  const typeChange = (e) => {
    const { value } = e.target;
    console.log('typeChange', value);
    setTypeChecked(value);
    if(isPackage){
      pageData.size = packageSizeList[0]['size'];
    }else{
      pageData.size = 0;
    }
    pageData.type = value;
    setIsPackage(false);
    setPageData(pageData);
  };

  const handleOk = () => {
    console.log("handleOk",pageData)
    window.electronAPI.compression({ ...pageData });
    setIsModalOpen(false);
    setProgressModalShow(true)
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    // setFileList([]);
  };

  const switchOnChange = (checked) => {
    setIsPackage(checked);
    if (checked) {
      pageData.size = packageSize['size'];
      setPageData(pageData);
    }else{
      pageData.size = 0;
      setPageData(pageData);
    }
  };

  const packageSizeOnChange = (value) => {
    pageData.size = packageSizeList[value]['size'];
    setPageData(pageData);
  };
  let tempPercent = 0;
  window.electronAPI.handleCompression((event, data) => {
    console.log('handleCompression', data);
    if(data['status'] == 'suc'){
      setProgressModalPercent(100)
      setTimeout(()=>{
        setProgressModalShow(false)
      },200)
    }
    if(data['status'] == 'progress'){
      if(data['percent'] > tempPercent){
        tempPercent = data['percent'];
        setProgressModalPercent(data['percent'])
      }
    }
  });
  const optionHtml = packageSizeList.map((item) => {
    return (
      <Select.Option key={item.value} value={item.value}>
        {item.label}
      </Select.Option>
    );
  });

  return (
    <>
      <Dragger {...props} style={{ minHeight: '180px' }}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text" style={{ minWidth: '360px' }}>
          点击或者拖拽文件到选框中
        </p>
        <p className="ant-upload-hint"></p>
      </Dragger>

      <Modal
        title="压缩"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        cancelText="取消"
        okText="确认"
      >
        <Form.Item label="文件(大小)">
          {pageData.path}/{pageData.fileName}
        </Form.Item>
        <Form.Item label="压缩格式">
          <Radio.Group onChange={typeChange} value={typeChecked}>
            <Radio value={'zip'}>zip</Radio>
            <Radio value={'7z'}>7z</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item label="是否分卷">
          <Switch checked={isPackage} defaultChecked={isPackage} onChange={switchOnChange} />
        </Form.Item>

        {
          isPackage && <Form.Item
          label="大小"
        >
          <Select onChange={packageSizeOnChange} defaultValue={packageSize}>
            {optionHtml}
          </Select>
        </Form.Item>}


      </Modal>
      <ProgressModal show={progressModalShow} percent={progressModalPercent} />
    </>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
      </Routes>
    </Router>
  );
}
