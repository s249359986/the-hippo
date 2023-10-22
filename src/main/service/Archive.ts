// @ts-nocheck
import { readFile,writeFile } from 'node:fs/promises';
class Archive{
  constructor(archiveFormat,passwordPolicy){ //
    this._archiveFormat = archiveFormat;
    this._passwordPolicy = passwordPolicy;
  }

  // method
  async compression(fileList: Array,option){ //option:{size,fileName} - return array
    let size = +option['size'];
    let readFilePromises= []
    fileList.forEach((file)=>{
      readFilePromises.push(readFile(file.path))
    })
    let todoCompressionList = [];
    (await Promise.all(readFilePromises)).forEach((element,index) => {
      todoCompressionList.push({
        content:element,
        ...fileList[index]
      })
    });
    if(size){
      let filePromise = [];
      let content = await this._archiveFormat.compression(todoCompressionList)
      let count = 0;
      let len = content.length;
      for(let i =0;i< len ;i+=size ){
        count +=1;
        let suffix = (count+'').padStart(3,'0');
        let buf = content.subarray(i,i+size);
        filePromise.push(writeFile(`${option['path']}${option['fileName']}.${this._archiveFormat.getExtension()}.${suffix}`,buf));
      }
      return Promise.all(filePromise).then(()=>{
        return {fullFileName: `${option['path']}${option['fileName']}.${this._archiveFormat.getExtension()}.${suffix}`}
      });
    }
    let content = await this._archiveFormat.compression(todoCompressionList)
    const fullFileName = `${option['path']}${option['fileName']}.${this._archiveFormat.getExtension()}`
    return writeFile(fullFileName,content).then(()=>{
      return {fullFileName: fullFileName}
    });
  }

  decompression(){

  }
}

export {
  Archive
}
