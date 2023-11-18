// @ts-nocheck
import Seven from 'node-7z'
import sevenBin from '7zip-bin'
import { readFile,unlink } from 'node:fs/promises';
const pathTo7zip = sevenBin.path7za;

class Z7Format{
  constructor(option){
    this._z7 = Seven;
    this._option = option;
    this._progress = {};
  }
  // static
  static EXTENSION = '7z';

  getExtension(){
    return Z7Format.EXTENSION;
  }

  // method
  compression(fileList, option){ //  folder:[],fileName , content: ''
    const { password } = option;

    return new Promise((resolve,reject)=>{
      let filesStr = fileList.reduce((current,file)=>{
        current.push(file.path)
        return current
      },[])
      let targetDist = `${this._option['outputDir']}${this._option['archiveName']}.${this.getExtension()}`
      const stream = this._z7.add(targetDist, filesStr, {
        $progress: true,
        outputDir: this._option['outputDir'],
        $bin: pathTo7zip,
        password: password
      })

      stream.on('progress', (progress) => {
        this.emitProgress(progress)
        console.log("progress",progress)
      })

      stream.on('end',  () => {
        console.log("end",stream.info)
        setTimeout(()=>{
          unlink(targetDist)
        },800)
        resolve(readFile(targetDist))
      })

      stream.on('error', (err) => {
        console.log("error",err)
        reject(err)
      })
    })
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
  Z7Format
}
