// @ts-nocheck
import JSZip  from "jszip";
// const zip = new JSZip();

class ZipFormat{
  constructor(){
    this._zip = new JSZip()
  }
  // static
  static EXTENSION = 'zip';

  getExtension(){
    return ZipFormat.EXTENSION;
  }

  // method
  async compression(fileList){ //  folder:[],fileName , content: ''

    fileList.forEach(element => {
      this._zip.file(element.fileName,element.content)
    });
    return await this._zip.generateAsync({type:"nodebuffer"})
  }
}

export {
  ZipFormat
}
