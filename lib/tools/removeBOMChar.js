var fs = require('fs');
var remove = {
	//删除UTF-8 BOM 头
	removeBOMChar : function(str) {
		return str.replace(/^\xef\xbb\xbf/,'');
	},
	//删除文件UTF-8 BOM 头
	removeFileBOMChar : function(str){
		return this.removeBOMChar(fs.readFileSync(filePath));
	}
}
module.exports = remove;