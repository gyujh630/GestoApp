import * as pdfjsLib from "pdfjs-dist";
const pdfjsOptions = {
  disableFontFace: true,
  cMapUrl: 'cmaps/',
  cMapPacked: true
};
export const settingPdf =(file,callBack)=>{
    const loadingTask = pdfjsLib.getDocument({ url: file, ...pdfjsOptions });
    loadingTask.promise.then(
      (loadedPdf) => {
        callBack(loadedPdf);
      },
      function (error) {
        console.error('error: ',error);
      }
    );

}