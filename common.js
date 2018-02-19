if (!Object.entries) {
    Object.entries = function( obj ){
        var ownProps = Object.keys( obj ),
            i = ownProps.length,
            resArray = new Array(i); // preallocate the Array

        while (i--)
            resArray[i] = [ownProps[i], obj[ownProps[i]]];
        return resArray;
    }
}


module.exports = {
    capitalizeAllWords: function(str) {
        let trimmedStr = str.trimLeft().trimRight().replace(/  +/g, ' ');
        return trimmedStr.split(' ').map(function (i) {
            return i.charAt(0).toUpperCase() + i.slice(1);
        }).join(' ');
    },
    convertObjectToArray: function (obj) {
        if(typeof obj !='undefined'){
            if (obj instanceof Array) {
                return obj;
            } else {
                let retVal = [];
                for (const [key, val] of Object.entries(obj))
                    retVal.push(val);
                return retVal;
            }
        }
    }
}
