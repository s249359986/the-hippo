// @ts-nocheck
import Seven from 'node-7z'
import sevenBin from '7zip-bin'
import { readFile,writeFile } from 'node:fs/promises';
const pathTo7zip = sevenBin.path7za;

class Z7Format{
  constructor(option){
    this._z7 = Seven;
    this._option = option;
  }
  // static
  static EXTENSION = '7z';

  getExtension(){
    return Z7Format.EXTENSION;
  }

  // method
  compression(fileList){ //  folder:[],fileName , content: ''
    console.log("7zcompression",fileList)

    return new Promise((resolve,reject)=>{
      let filesStr = fileList.reduce((current,file)=>{
        current.push(file.path)
        return current
      },[])
      console.log("7zcompression:filesStr",filesStr)
      const stream = this._z7.add(`${this._option['archiveName']}.7z`, filesStr, {
        outputDir: this._option['outputDir'],
        $bin: pathTo7zip
      })

      stream.on('end', function () {
        console.log("!!!--",stream.info)
        resolve(readFile(`${this._option['outputDir']}/${this._option['archiveName']}.7z`))
      })

      stream.on('error', (err) => {
        console.log("7zcompression:error",err)
        reject(err)
      })
    })
  }
}

export {
  Z7Format
}
