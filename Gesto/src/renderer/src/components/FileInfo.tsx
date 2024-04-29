function FileInfo ({ uploadedInfo }):JSX.Element {
    //미리보기를 위한 컴포넌트, 추후 이미지로 변경예정

    return(
    <ul className="preview_info">

      {
      //Object.entries() 메서드는 for...in와 같은 순서로 주어진 객체 자체의 enumerable 속성 [key, value] 쌍의 배열을 반환한다. -mdn
      Object.entries(uploadedInfo).map(([key, value]) => (
        <li key={key}>
          <span className="info_key">{key}</span>
          <span className="info_value">{value}</span>
        </li>
      ))}
    </ul>
    )
};

export default FileInfo