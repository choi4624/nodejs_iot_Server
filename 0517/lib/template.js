module.exports = {
    HTML:function(title, list, body, control){
        return `
        <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HTML temp - ${title}</title>
</head>
<body>
    <h1><a href="/"> MAIN </a><h1>
    ${list}
    ${control}
    ${body}
</body>
</html>
        `;
    
    },list:function(crop){
        var list = '<ul>';
        var i = 0;
        while(i <  crop.length){
            list = list + `<li><a href"/?id=${crop[i]}">${crop[i].작물}</a></li>`
            i = i+1;
        }
        list = list + '</ul>'
        return list;
    }
    
}