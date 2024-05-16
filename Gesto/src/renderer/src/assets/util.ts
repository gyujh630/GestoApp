import * as pdfjsLib from "pdfjs-dist";

export const settingPdf =(file,callBack)=>{
    const loadingTask = pdfjsLib.getDocument(file);
    loadingTask.promise.then(
      (loadedPdf) => {
        callBack(loadedPdf);
      },
      function (error) {
        console.error('error: ',error);
      }
    );

}