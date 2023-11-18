// @ts-nocheck
import JSZip  from "jszip";
// const zip = new JSZip();

class ZipFormat{
  constructor(option){
    this._zip = new JSZip();
    this._option = option;
    this._progress = {};
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
    this.emitProgress({status:'progress',percent:50})
    return await this._zip.generateAsync({type:"nodebuffer"})
  }

  onProgress(cb){
    if(Array.isArray(this._progress['progress'])){
      this._progress['progress'].push(cb);
    }else{
      this._progress['progress'] = [cb]
    }
  }

  emitProgress(data){
    if(Array.isArray(this._progress['progress'])){
      this._progress['progress'].forEach((item)=>{
        item.call(this,data)
      })
    }
  }
}

export {
  ZipFormat
}
