
module.exports = {
    capitalizeAllWords: function(str) {
        let trimmedStr = str.trimLeft().trimRight().replace(/  +/g, ' ');
        return trimmedStr.split(' ').map(function (i) {
            return i.charAt(0).toUpperCase() + i.slice(1);
        }).join(' ');
    }
  

}