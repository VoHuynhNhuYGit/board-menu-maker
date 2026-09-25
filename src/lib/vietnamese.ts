/**
 * Loại bỏ dấu tiếng Việt để phục vụ tìm kiếm không dấu
 * Ví dụ: "Gà kho sả" -> "ga kho sa"
 */
export function removeVietnameseTones(str: string): string {
  if (!str) return '';
  let strClean = str.toString().trim();
  strClean = strClean.toLowerCase();

  strClean = strClean.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
  strClean = strClean.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
  strClean = strClean.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
  strClean = strClean.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
  strClean = strClean.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
  strClean = strClean.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
  strClean = strClean.replace(/đ/g, 'd');

  // Xóa các ký tự đặc biệt kết hợp dấu unicode
  strClean = strClean.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, '');
  strClean = strClean.replace(/\u02C6|\u0306|\u031B/g, ''); // Â, Ê, Ă, Ơ, Ư

  return strClean;
}

/**
 * Kiểm tra xem từ khóa tìm kiếm (có thể không dấu) có khớp với chuỗi đích hay không
 */
export function matchVietnamese(target: string, query: string): boolean {
  if (!target || !query) return false;
  const normTarget = removeVietnameseTones(target);
  const normQuery = removeVietnameseTones(query);
  return normTarget.includes(normQuery);
}
